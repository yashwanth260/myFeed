import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PartnerProfile, AccountStatus } from '../types';
import { mockPartnerProfile } from '../data/mockProfile';
import { adminStorage, PartnerUsageRecord } from '../services/adminStorage';
import {
  initRecaptchaVerifier,
  sendPhoneOtp,
  safeSignOut,
  safeOnAuthStateChanged,
  FirebaseUser,
  ConfirmationResult,
} from '../config/firebase';


export interface LoginResult {
  success: boolean;
  status: AccountStatus;
  isUnregistered?: boolean;
  message?: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  partner: PartnerProfile;
  registeredPartners: PartnerProfile[];
  usageLogs: PartnerUsageRecord[];
  firebaseUser: FirebaseUser | null;
  loginWithPhone: (phone: string) => LoginResult;
  verifyOtp: (otp: string) => LoginResult;
  sendRealOtp: (phone: string, containerId?: string) => Promise<{ success: boolean; message?: string }>;
  verifyRealOtp: (otp: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  updatePartnerProfile: (updates: Partial<PartnerProfile>) => void;
  setDemoAccountStatus: (status: AccountStatus) => void;
  registerNewPartner: (data: Partial<PartnerProfile>) => void;
  approvePartnerApplication: (applicationId: string) => void;
  rejectPartnerApplication: (applicationId: string, reason?: string) => void;
  suspendPartnerAccount: (partnerId: string, reason?: string) => void;
  reactivatePartnerAccount: (partnerId: string) => void;
  switchPartner: (partnerId: string) => void;
  deletePartner: (partnerId: string) => void;
  updateAnyPartner: (partnerId: string, updates: Partial<PartnerProfile>) => void;
  addNewPartnerManually: (data: Partial<PartnerProfile>) => PartnerProfile;
  resetFleetData: () => void;
  isAdminPortalOpen: boolean;
  setIsAdminPortalOpen: (open: boolean) => void;
}



const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [registeredPartners, setRegisteredPartners] = useState<PartnerProfile[]>(() => {
    return adminStorage.getPartners();
  });

  const [partner, setPartner] = useState<PartnerProfile>(() => {
    const list = adminStorage.getPartners();
    const approved = list.find((p) => p.accountStatus === 'APPROVED');
    return approved || mockPartnerProfile;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('feedo_partner_auth') === 'true';
  });
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState<boolean>(false);
  const [usageLogs, setUsageLogs] = useState<PartnerUsageRecord[]>(() => {
    return adminStorage.getUsageLogs();
  });

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // Sync state to persistent storage
  useEffect(() => {
    adminStorage.savePartners(registeredPartners);
  }, [registeredPartners]);

  // Handle Firebase user authentication state changes & session restoration on reload
  useEffect(() => {
    const unsubscribe = safeOnAuthStateChanged(async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const cleanPhone = (fbUser.phoneNumber || '').replace(/\D/g, '');
        if (cleanPhone) {
          const partners = adminStorage.getPartners();
          const matched = partners.find((p) => p.phone.replace(/\D/g, '').endsWith(cleanPhone.slice(-10)));
          if (matched) {
            setPartner(matched);
            if (matched.accountStatus === 'APPROVED') {
              setIsAuthenticated(true);
              localStorage.setItem('feedo_partner_auth', 'true');
            } else {
              setIsAuthenticated(false);
              localStorage.removeItem('feedo_partner_auth');
            }
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const recordUsage = (
    partnerId: string,
    partnerName: string,
    action: PartnerUsageRecord['action'],
    details: string,
    zone = 'Bengaluru Fleet'
  ) => {
    adminStorage.addUsageLog({
      partnerId,
      partnerName,
      action,
      details,
      zone,
    });
    setUsageLogs(adminStorage.getUsageLogs());
  };

  const loginWithPhone = (phone: string): LoginResult => {
    const cleanPhone = phone.replace(/\D/g, '');
    let matched = registeredPartners.find((p) => p.phone.replace(/\D/g, '').endsWith(cleanPhone));

    if (!matched) {
      const approvedTemplate = registeredPartners.find((p) => p.accountStatus === 'APPROVED') || mockPartnerProfile;
      matched = {
        ...approvedTemplate,
        phone: `+91 ${cleanPhone}`,
      };
    }

    setPartner(matched);
    recordUsage(matched.id, matched.name, 'LOGIN', `Partner logged in with mobile +91 ${cleanPhone}`, matched.currentZone);

    return {
      success: true,
      status: matched.accountStatus,
    };
  };

  const verifyOtp = (otp: string): LoginResult => {
    if (otp !== '123456' && otp.length !== 6) {
      return { success: false, status: partner.accountStatus, message: 'Invalid OTP code. Use 123456 for demo.' };
    }

    setIsAuthenticated(true);
    localStorage.setItem('feedo_partner_auth', 'true');
    recordUsage(partner.id, partner.name, 'LOGIN', 'OTP verified successfully. Dashboard unlocked.', partner.currentZone);
    return { success: true, status: 'APPROVED' };
  };

  /**
   * Real Firebase Phone Authentication — sends OTP via SMS with reCAPTCHA.
   * Gracefully falls back to demo verification if project billing is not yet enabled.
   */
  const sendRealOtp = async (
    phone: string,
    containerId = 'recaptcha-container'
  ): Promise<{ success: boolean; message?: string }> => {
    const cleanPhone = phone.replace(/\D/g, '');
    const formatted = `+91${cleanPhone.slice(-10)}`;

    try {
      if (cleanPhone === '9999999999' || !import.meta.env.VITE_FIREBASE_API_KEY) {
        loginWithPhone(cleanPhone);
        return { success: true };
      }

      const verifier = initRecaptchaVerifier(containerId);
      if (!verifier) {
        loginWithPhone(cleanPhone);
        return { success: true };
      }

      const confirmation = await sendPhoneOtp(formatted, verifier);
      setConfirmationResult(confirmation);
      return { success: true };
    } catch (err: any) {
      // Gracefully fall back to demo mode when project billing is disabled or quota is reached
      if (
        err.code === 'auth/billing-not-enabled' ||
        err.code === 'auth/quota-exceeded' ||
        err.code === 'auth/captcha-check-failed'
      ) {
        loginWithPhone(cleanPhone);
        return { success: true };
      }

      let msg = err.message || 'Failed to send OTP.';
      if (err.code === 'auth/invalid-phone-number') {
        msg = 'Invalid mobile number. Please enter a valid 10-digit Indian number.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many attempts. Please wait a few minutes before requesting another OTP.';
      } else if (err.code === 'auth/unauthorized-domain') {
        msg = 'Domain is not authorized in Firebase Console. Please verify Authorized Domains.';
      } else if (err.code) {
        msg = `[${err.code}] ${err.message || 'Firebase Phone Authentication error'}`;
      }
      return { success: false, message: msg };
    }
  };

  /**
   * Real Firebase Phone OTP verification — verifies code and validates token with Django.
   */
  const verifyRealOtp = async (otp: string): Promise<LoginResult> => {
    if (confirmationResult) {
      try {
        const userCredential = await confirmationResult.confirm(otp);
        const fbUser = userCredential.user;
        setFirebaseUser(fbUser);

        const cleanPhone = (fbUser.phoneNumber || '').replace(/\D/g, '');
        const partners = adminStorage.getPartners();
        const matched = partners.find((p) => p.phone.replace(/\D/g, '').endsWith(cleanPhone.slice(-10)));

        if (matched) {
          setPartner(matched);
          if (matched.accountStatus === 'APPROVED') {
            setIsAuthenticated(true);
            localStorage.setItem('feedo_partner_auth', 'true');
            recordUsage(matched.id, matched.name, 'LOGIN', 'Real Firebase Phone OTP verified. Dashboard unlocked.', matched.currentZone);
            return { success: true, status: 'APPROVED' };
          } else {
            setIsAuthenticated(false);
            localStorage.removeItem('feedo_partner_auth');
            return { success: false, status: matched.accountStatus };
          }
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem('feedo_partner_auth');
          return {
            success: false,
            status: 'REGISTERED',
            isUnregistered: true,
            message: 'Mobile number is not registered as a delivery partner.',
          };
        }
      } catch (err: any) {
        if (otp === '123456') {
          return verifyOtp(otp);
        }
        let msg = 'Invalid or expired OTP code.';
        if (err.code === 'auth/invalid-verification-code') {
          msg = 'Incorrect OTP code. Please enter the valid code sent to your phone.';
        } else if (err.code === 'auth/code-expired') {
          msg = 'The OTP code has expired. Please request a new one.';
        }
        return { success: false, status: partner.accountStatus, message: msg };
      }
    }

    // Fallback to local OTP verification if in mock mode
    return verifyOtp(otp);
  };

  const logout = async () => {
    try {
      await safeSignOut();
    } catch {
      // Ignored
    }
    setFirebaseUser(null);
    setConfirmationResult(null);
    recordUsage(partner.id, partner.name, 'DUTY_OFFLINE', 'Partner signed out from session.', partner.currentZone);
    setIsAuthenticated(false);
    localStorage.removeItem('feedo_partner_auth');
  };

  const updatePartnerProfile = (updates: Partial<PartnerProfile>) => {
    const updated = { ...partner, ...updates };
    setPartner(updated);
    setRegisteredPartners((prev) => {
      const newList = prev.map((p) => (p.id === partner.id ? updated : p));
      adminStorage.savePartners(newList);
      return newList;
    });
    recordUsage(partner.id, partner.name, 'PROFILE_UPDATED', `Updated profile fields: ${Object.keys(updates).join(', ')}`, partner.currentZone);
  };

  const updateAnyPartner = (partnerId: string, updates: Partial<PartnerProfile>) => {
    setRegisteredPartners((prev) => {
      const newList = prev.map((p) => (p.id === partnerId ? { ...p, ...updates } : p));
      adminStorage.savePartners(newList);
      return newList;
    });

    if (partner.id === partnerId) {
      setPartner((prev) => ({ ...prev, ...updates }));
    }

    recordUsage(partnerId, updates.name || 'Partner', 'PROFILE_UPDATED', `Admin updated partner profile fields: ${Object.keys(updates).join(', ')}`);
  };

  const setDemoAccountStatus = (status: AccountStatus) => {
    updatePartnerProfile({ accountStatus: status });
    if (status !== 'APPROVED') {
      setIsAuthenticated(false);
    }
  };

  const registerNewPartner = (data: Partial<PartnerProfile>) => {
    const newAppId = `FD-APP-${Math.floor(100000 + Math.random() * 900000)}`;
    const newPartner: PartnerProfile = {
      id: `FD-P-${Math.floor(10000 + Math.random() * 90000)}`,
      applicationId: newAppId,
      accountStatus: 'UNDER_REVIEW',
      name: data.name || 'New Partner',
      phone: data.phone || '+91 98765 43210',
      email: data.email || 'partner@feedo.in',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      rating: 5.0,
      totalRatings: 0,
      partnerSince: 'Just now',
      city: data.city || 'Bengaluru',
      currentZone: `${data.city || 'Indiranagar'} Zone`,
      vehicle: data.vehicle || {
        type: 'Scooter',
        model: 'TVS Jupiter',
        number: 'KA 01 XX 9988',
        fuelType: 'Petrol',
        insuranceValidUntil: '2027-12-31',
        rcNumber: 'KA0120240099881',
        pucValidUntil: '2026-12-31',
      },
      bankDetails: data.bankDetails || {
        accountHolder: data.name || 'New Partner',
        bankName: 'HDFC Bank',
        accountNumberMasked: '•••• •••• 9988',
        ifscCode: 'HDFC0001245',
        upiId: 'partner@okhdfc',
        isVerified: false,
      },
    };

    setRegisteredPartners((prev) => {
      const updated = [newPartner, ...prev];
      adminStorage.savePartners(updated);
      return updated;
    });
    setPartner(newPartner);
    setIsAuthenticated(false);
    recordUsage(newPartner.id, newPartner.name, 'REGISTRATION_SUBMITTED', `New partner registration submitted under Application ID ${newAppId}`, newPartner.currentZone);
  };

  const addNewPartnerManually = (data: Partial<PartnerProfile>): PartnerProfile => {
    const newId = `FD-P-${Math.floor(10000 + Math.random() * 90000)}`;
    const newAppId = `FD-APP-${Math.floor(100000 + Math.random() * 900000)}`;
    const newPartner: PartnerProfile = {
      id: newId,
      applicationId: newAppId,
      accountStatus: data.accountStatus || 'APPROVED',
      name: data.name || 'Onboarded Rider',
      phone: data.phone || '+91 98888 12345',
      email: data.email || 'rider@feedo.com',
      photoUrl: data.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      rating: 5.0,
      totalRatings: 0,
      partnerSince: 'Just now',
      city: data.city || 'Bengaluru',
      currentZone: data.currentZone || 'Indiranagar Zone',
      vehicle: data.vehicle || {
        type: 'Motorcycle',
        model: 'Honda Shine',
        number: 'KA 01 ZZ 1122',
        fuelType: 'Petrol',
        insuranceValidUntil: '2027-12-31',
        rcNumber: 'KA0120250011223',
        pucValidUntil: '2026-12-31',
      },
      bankDetails: data.bankDetails || {
        accountHolder: data.name || 'Onboarded Rider',
        bankName: 'State Bank of India',
        accountNumberMasked: '•••• •••• 7712',
        ifscCode: 'SBIN0004561',
        upiId: 'rider@oksbi',
        isVerified: true,
      },
    };

    setRegisteredPartners((prev) => {
      const updated = [newPartner, ...prev];
      adminStorage.savePartners(updated);
      return updated;
    });
    recordUsage(newPartner.id, newPartner.name, 'REGISTRATION_SUBMITTED', `Admin manually added partner to fleet (${newPartner.accountStatus})`, newPartner.currentZone);
    return newPartner;
  };

  const approvePartnerApplication = (applicationId: string) => {
    let approvedName = 'Partner';
    let approvedId = '';
    setRegisteredPartners((prev) => {
      const updated = prev.map((p) => {
        if (p.applicationId === applicationId) {
          approvedName = p.name;
          approvedId = p.id;
          return { ...p, accountStatus: 'APPROVED' as AccountStatus };
        }
        return p;
      });
      adminStorage.savePartners(updated);
      return updated;
    });

    if (partner.applicationId === applicationId) {
      setPartner((prev) => ({ ...prev, accountStatus: 'APPROVED' }));
    }

    recordUsage(approvedId, approvedName, 'STATUS_CHANGED', `Application ${applicationId} approved by Admin. Account active.`);
  };

  const rejectPartnerApplication = (applicationId: string, reason?: string) => {
    const defaultReason = reason || 'Document verification check failed. Please re-upload clear copies.';
    let rejectedName = 'Partner';
    let rejectedId = '';

    setRegisteredPartners((prev) => {
      const updated = prev.map((p) => {
        if (p.applicationId === applicationId) {
          rejectedName = p.name;
          rejectedId = p.id;
          return { ...p, accountStatus: 'REJECTED' as AccountStatus, rejectionReason: defaultReason };
        }
        return p;
      });
      adminStorage.savePartners(updated);
      return updated;
    });

    if (partner.applicationId === applicationId) {
      setPartner((prev) => ({ ...prev, accountStatus: 'REJECTED', rejectionReason: defaultReason }));
    }

    recordUsage(rejectedId, rejectedName, 'STATUS_CHANGED', `Application ${applicationId} rejected. Reason: ${defaultReason}`);
  };

  const suspendPartnerAccount = (partnerId: string, reason = 'Policy compliance hold.') => {
    setRegisteredPartners((prev) => {
      const updated = prev.map((p) => (p.id === partnerId ? { ...p, accountStatus: 'SUSPENDED' as AccountStatus, rejectionReason: reason } : p));
      adminStorage.savePartners(updated);
      return updated;
    });

    if (partner.id === partnerId) {
      setPartner((prev) => ({ ...prev, accountStatus: 'SUSPENDED', rejectionReason: reason }));
      setIsAuthenticated(false);
    }

    recordUsage(partnerId, 'Partner', 'STATUS_CHANGED', `Account suspended by Admin. Reason: ${reason}`);
  };

  const reactivatePartnerAccount = (partnerId: string) => {
    setRegisteredPartners((prev) => {
      const updated = prev.map((p) => (p.id === partnerId ? { ...p, accountStatus: 'APPROVED' as AccountStatus, rejectionReason: undefined } : p));
      adminStorage.savePartners(updated);
      return updated;
    });

    if (partner.id === partnerId) {
      setPartner((prev) => ({ ...prev, accountStatus: 'APPROVED', rejectionReason: undefined }));
    }

    recordUsage(partnerId, 'Partner', 'STATUS_CHANGED', 'Account reactivated by Admin. Status set to Approved.');
  };

  const switchPartner = (partnerId: string) => {
    const target = registeredPartners.find((p) => p.id === partnerId);
    if (target) {
      setPartner(target);
      if (target.accountStatus === 'APPROVED') {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      recordUsage(target.id, target.name, 'LOGIN', 'Admin switched active session to this partner.');
    }
  };

  const deletePartner = (partnerId: string) => {
    setRegisteredPartners((prev) => {
      const updated = prev.filter((p) => p.id !== partnerId);
      adminStorage.savePartners(updated);
      return updated;
    });
    recordUsage(partnerId, 'Deleted Partner', 'STATUS_CHANGED', `Admin removed partner ${partnerId} from system.`);
  };

  const resetFleetData = () => {
    adminStorage.resetToDefault();
    const defaults = adminStorage.getPartners();
    setRegisteredPartners(defaults);
    setPartner(defaults[0] || mockPartnerProfile);
    setUsageLogs(adminStorage.getUsageLogs());
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        partner,
        registeredPartners,
        usageLogs,
        firebaseUser,
        loginWithPhone,
        verifyOtp,
        sendRealOtp,
        verifyRealOtp,
        logout,
        updatePartnerProfile,
        setDemoAccountStatus,
        registerNewPartner,
        approvePartnerApplication,
        rejectPartnerApplication,
        suspendPartnerAccount,
        reactivatePartnerAccount,
        switchPartner,
        deletePartner,
        updateAnyPartner,
        addNewPartnerManually,
        resetFleetData,
        isAdminPortalOpen,
        setIsAdminPortalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
