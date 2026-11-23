import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { registrationStorage, PartnerRegistrationStoragePayload } from '../../services/registrationStorage';
import {
  ArrowLeft,
  CheckCircle2,
  Camera,
  Upload,
  FileText,
  ShieldCheck,
  Building,
  CreditCard,
  AlertTriangle,
  Lock,
  Clock,
  User,
  Bike,
  Sparkles,
  X,
  RefreshCw,
  Check,
  AlertCircle,
  Car,
  Zap,
} from 'lucide-react';

interface PartnerRegistrationWizardProps {
  onBackToLogin: () => void;
  onCompletedRegistration: (appId: string) => void;
}

interface UploadedDocument {
  file?: File | null;
  fileName: string;
  fileSize: string;
  fileType: string;
  fileData?: string;
  uploadedAt: string;
}

export const PartnerRegistrationWizard: React.FC<PartnerRegistrationWizardProps> = ({
  onBackToLogin,
  onCompletedRegistration,
}) => {
  const { registerNewPartner } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [formData, setFormData] = useState({
    mobile: '9876543210',
    otp: '123456',
    isMobileVerified: false,
    // Personal Info
    fullName: 'Ramesh Reddy',
    dob: '1996-08-14',
    gender: 'Male',
    email: 'ramesh.reddy@gmail.com',
    city: 'Bengaluru',
    address: '14th Cross, HSR Layout Sector 1, Bengaluru',
    emergencyContactName: 'Sunita Reddy',
    emergencyContactPhone: '9845012345',
    // Photo (Step 3) - initially empty until captured
    photoUrl: '',
    isPhotoUploaded: false,
    // Vehicle (Step 4) - Scooter, Motorcycle, Electric Vehicle, Car
    vehicleType: 'Scooter' as 'Scooter' | 'Motorcycle' | 'Electric Vehicle' | 'Car',
    vehicleNumber: 'KA 05 AB 5678',
    vehicleBrand: 'TVS',
    vehicleModel: 'Ntorq 125',
    vehicleYear: '2023',
    fuelType: 'Petrol',
    isRegNumberExempt: false,
    isRcExempt: false,
    isDlExempt: false,
    // DL
    dlNumber: 'KA05 20210089123',
    dlExpiry: '2036-05-20',
    isDlUploaded: false,
    // Identity
    isAadhaarUploaded: false,
    isPanUploaded: false,
    // Vehicle Docs
    isRcUploaded: false,
    isInsuranceUploaded: true,
    isPucUploaded: true,
    // Bank Details
    accountHolder: 'Ramesh Reddy',
    bankName: 'Axis Bank Ltd.',
    accountNumber: '918020044521321',
    confirmAccountNumber: '918020044521321',
    ifscCode: 'UTIB0000845',
    upiId: 'ramesh96@okaxis',
    // Agreement
    agreedTerms: false,
    agreedPrivacy: false,
  });

  const [step9Error, setStep9Error] = useState<string | null>(null);

  // Step 3 Camera State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [step3Error, setStep3Error] = useState<string | null>(null);
  const [isSavingPhoto, setIsSavingPhoto] = useState<boolean>(false);

  // Step 4 Documents State
  const [documents, setDocuments] = useState<{
    aadhaar: UploadedDocument | null;
    pan: UploadedDocument | null;
    bank_passbook: UploadedDocument | null;
    rc: UploadedDocument | null;
    dl: UploadedDocument | null;
  }>({
    aadhaar: null,
    pan: null,
    bank_passbook: null,
    rc: null,
    dl: null,
  });

  const [missingDocKeys, setMissingDocKeys] = useState<string[]>([]);
  const [step4Error, setStep4Error] = useState<string | null>(null);
  const [isSavingVehicleDocs, setIsSavingVehicleDocs] = useState<boolean>(false);

  // Hidden file input refs for Step 4
  const docInputRefs = {
    aadhaar: useRef<HTMLInputElement | null>(null),
    pan: useRef<HTMLInputElement | null>(null),
    bank_passbook: useRef<HTMLInputElement | null>(null),
    rc: useRef<HTMLInputElement | null>(null),
    dl: useRef<HTMLInputElement | null>(null),
  };

  // Step 5 Vehicle Camera & Photo Verification State
  const vehicleVideoRef = useRef<HTMLVideoElement | null>(null);
  const vehicleCameraInputRef = useRef<HTMLInputElement | null>(null);
  const [isVehicleCameraActive, setIsVehicleCameraActive] = useState<boolean>(false);
  const [vehicleCameraStream, setVehicleCameraStream] = useState<MediaStream | null>(null);
  const [vehiclePhotoUrl, setVehiclePhotoUrl] = useState<string>('');
  const [vehiclePhotoStatus, setVehiclePhotoStatus] = useState<'IDLE' | 'ANALYZING' | 'VERIFIED' | 'FAILED'>('IDLE');
  const [step5Error, setStep5Error] = useState<string | null>(null);
  const [isSavingStep5, setIsSavingStep5] = useState<boolean>(false);

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [generatedAppId, setGeneratedAppId] = useState<string>('');

  // Restore previously saved photo, vehicle, and document state from vault
  useEffect(() => {
    try {
      const savedVault = registrationStorage.getSavedRegistrationData();
      if (savedVault) {
        if (savedVault.profilePhotoReference) {
          setFormData((prev) => ({
            ...prev,
            photoUrl: savedVault.profilePhotoReference || prev.photoUrl,
            isPhotoUploaded: true,
          }));
        }
        if (savedVault.selectedVehicleCategory) {
          setFormData((prev) => ({
            ...prev,
            vehicleType: (savedVault.selectedVehicleCategory as any) || prev.vehicleType,
            vehicleNumber:
              savedVault.vehicleRegistrationNumber === 'EXEMPT'
                ? prev.vehicleNumber
                : savedVault.vehicleRegistrationNumber || prev.vehicleNumber,
            vehicleBrand: savedVault.brand || prev.vehicleBrand,
            vehicleModel: savedVault.model || prev.vehicleModel,
            fuelType: savedVault.fuelType || prev.fuelType,
            isRegNumberExempt: savedVault.isRegNumberUnavailable || false,
            isRcExempt: savedVault.isRcUnavailable || false,
            isDlExempt: savedVault.isDlUnavailable || false,
          }));
        }
        if (savedVault.vehiclePhotoReference) {
          setVehiclePhotoUrl(savedVault.vehiclePhotoReference);
          setVehiclePhotoStatus('VERIFIED');
        }
      }

      const savedVehiclePhoto = localStorage.getItem('feedo_partner_vehicle_photo');
      if (savedVehiclePhoto) {
        setVehiclePhotoUrl(savedVehiclePhoto);
        setVehiclePhotoStatus('VERIFIED');
      }

      const savedDocs = localStorage.getItem('feedo_partner_registration_documents_meta');
      if (savedDocs) {
        const parsed = JSON.parse(savedDocs);
        setDocuments(parsed);
      }
    } catch (e) {
      console.error('Failed to restore saved registration documents:', e);
    }
  }, []);

  const updateField = (field: string, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleNextStep = () => {
    if (currentStep < 9) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    // Stop cameras if active
    stopCamera();
    stopVehicleCamera();
    setStep3Error(null);
    setStep4Error(null);
    setStep5Error(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // --- Step 3 Camera Functions ---
  const startCamera = async (facing: 'user' | 'environment' = 'user') => {
    setStep3Error(null);
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        nativeCameraInputRef.current?.click();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      });

      setCameraStream(stream);
      setCameraFacing(facing);
      setIsCameraActive(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err: any) {
      console.warn('Live WebRTC camera unavailable, using direct camera device capture:', err);
      // Clean fallback to native camera device capture
      nativeCameraInputRef.current?.click();
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const captureLivePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Mirror front selfie camera
      if (cameraFacing === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      updateField('photoUrl', dataUrl);
      updateField('isPhotoUploaded', true);
      setStep3Error(null);
      stopCamera();
    }
  };

  const switchCameraFacing = () => {
    const next = cameraFacing === 'user' ? 'environment' : 'user';
    startCamera(next);
  };

  const handleNativeCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStep3Error('Please capture a valid image using your camera.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      updateField('photoUrl', dataUrl);
      updateField('isPhotoUploaded', true);
      setStep3Error(null);
    };
    reader.onerror = () => {
      setStep3Error('Profile photo upload failed. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmPhoto = async () => {
    if (!formData.photoUrl || !formData.isPhotoUploaded) {
      setStep3Error('Please take your profile photo before continuing.');
      return;
    }

    setIsSavingPhoto(true);
    setStep3Error(null);

    try {
      // Save photo to persistent vault
      const res = await registrationStorage.saveRegistrationData({
        deliveryPartnerId: 'DP0001',
        profilePhotoReference: formData.photoUrl,
        selectedVehicleCategory: formData.vehicleType,
        vehicleRegistrationNumber: formData.vehicleNumber,
        brand: formData.vehicleBrand,
        model: formData.vehicleModel,
        fuelType: formData.fuelType,
        documentUploadStatus: {},
        registrationStepCompletionStatus: {
          step3Completed: true,
          step4Completed: false,
          currentStep: 3,
        },
      });

      if (!res.success) {
        setIsSavingPhoto(false);
        setStep3Error('Profile photo upload failed. Please try again.');
        return;
      }

      setIsSavingPhoto(false);
      handleNextStep();
    } catch {
      setIsSavingPhoto(false);
      setStep3Error('Profile photo upload failed. Please try again.');
    }
  };

  // --- Step 4 Vehicle & Documentation Functions ---
  const handleVehicleCategorySelect = (v: 'Scooter' | 'Motorcycle' | 'Electric Vehicle' | 'Car') => {
    updateField('vehicleType', v);
    if (v === 'Electric Vehicle') {
      updateField('fuelType', 'Electric');
    } else if (formData.fuelType === 'Electric') {
      updateField('fuelType', 'Petrol');
    }
    setStep4Error(null);
    setMissingDocKeys([]);
  };

  const handleDocumentFileUpload = (
    docKey: 'aadhaar' | 'pan' | 'bank_passbook' | 'rc' | 'dl',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate format: JPG, JPEG, PNG, PDF
    const validExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
    const fileExt = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    const validMimes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

    if (!validExtensions.includes(fileExt) && !validMimes.includes(file.type)) {
      setStep4Error('Invalid file format. Please upload JPG, PNG, or PDF.');
      return;
    }

    // Validate size: max 10MB
    if (file.size > 10 * 1024 * 1024) {
      setStep4Error('File size exceeds 10MB limit.');
      return;
    }

    const formattedSize =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const uploadedItem: UploadedDocument = {
        fileName: file.name,
        fileSize: formattedSize,
        fileType: file.type || fileExt,
        fileData: dataUrl,
        uploadedAt: new Date().toISOString(),
      };

      setDocuments((prev) => {
        const updated = { ...prev, [docKey]: uploadedItem };
        try {
          localStorage.setItem('feedo_partner_registration_documents_meta', JSON.stringify(updated));
        } catch (err) {
          console.error('Failed to cache document metadata:', err);
        }
        return updated;
      });

      setMissingDocKeys((prev) => prev.filter((k) => k !== docKey));
      setStep4Error(null);
    };

    reader.onerror = () => {
      setStep4Error('Document upload failed. Please try again.');
    };

    reader.readAsDataURL(file);
  };

  const handleSaveVehicleAndDocuments = async () => {
    const missing: string[] = [];

    // 1. Aadhaar Card (strictly required)
    if (!documents.aadhaar) missing.push('aadhaar');

    // 2. PAN Card (strictly required)
    if (!documents.pan) missing.push('pan');

    // 3. Bank Passbook (strictly required)
    if (!documents.bank_passbook) missing.push('bank_passbook');

    // 4. RC (required UNLESS Electric Vehicle and marked exempt)
    const isRcRequired = !(formData.vehicleType === 'Electric Vehicle' && formData.isRcExempt);
    if (isRcRequired && !documents.rc) {
      missing.push('rc');
    }

    // 5. DL (required UNLESS Electric Vehicle and marked exempt)
    const isDlRequired = !(formData.vehicleType === 'Electric Vehicle' && formData.isDlExempt);
    if (isDlRequired && !documents.dl) {
      missing.push('dl');
    }

    // 6. Registration Number (required UNLESS Electric Vehicle and marked exempt)
    const isRegRequired = !(formData.vehicleType === 'Electric Vehicle' && formData.isRegNumberExempt);
    if (isRegRequired && !formData.vehicleNumber.trim()) {
      missing.push('vehicleNumber');
    }

    if (missing.length > 0) {
      setMissingDocKeys(missing);
      setStep4Error('Please upload all required documents before continuing.');
      return;
    }

    setIsSavingVehicleDocs(true);
    setStep4Error(null);

    try {
      const payload: PartnerRegistrationStoragePayload = {
        deliveryPartnerId: 'DP0001',
        profilePhotoReference: formData.photoUrl,
        selectedVehicleCategory: formData.vehicleType,
        vehicleRegistrationNumber: formData.isRegNumberExempt ? 'EXEMPT' : formData.vehicleNumber,
        brand: formData.vehicleBrand,
        model: formData.vehicleModel,
        fuelType: formData.fuelType,
        aadhaarDocumentReference: documents.aadhaar?.fileName || 'aadhaar_doc',
        panDocumentReference: documents.pan?.fileName || 'pan_doc',
        bankPassbookDocumentReference: documents.bank_passbook?.fileName || 'bank_passbook_doc',
        rcDocumentReference: documents.rc?.fileName || (formData.isRcExempt ? 'EXEMPT' : ''),
        dlDocumentReference: documents.dl?.fileName || (formData.isDlExempt ? 'EXEMPT' : ''),
        isRcUnavailable: formData.isRcExempt,
        isDlUnavailable: formData.isDlExempt,
        isRegNumberUnavailable: formData.isRegNumberExempt,
        documentUploadStatus: {
          aadhaar: 'UPLOADED',
          pan: 'UPLOADED',
          bank_passbook: 'UPLOADED',
          rc: formData.isRcExempt ? 'EXEMPT' : 'UPLOADED',
          dl: formData.isDlExempt ? 'EXEMPT' : 'UPLOADED',
        },
        registrationStepCompletionStatus: {
          step3Completed: true,
          step4Completed: true,
          currentStep: 4,
        },
      };

      const res = await registrationStorage.saveRegistrationData(payload);
      if (!res.success) {
        setIsSavingVehicleDocs(false);
        setStep4Error('Document upload failed. Please try again.');
        return;
      }

      // Sync formData flags
      updateField('isAadhaarUploaded', true);
      updateField('isPanUploaded', true);
      updateField('isRcUploaded', !formData.isRcExempt);
      updateField('isDlUploaded', !formData.isDlExempt);

      setIsSavingVehicleDocs(false);
      handleNextStep();
    } catch {
      setIsSavingVehicleDocs(false);
      setStep4Error('Document upload failed. Please try again.');
    }
  };

  // --- Step 5 Vehicle Camera & Verification Functions ---
  const startVehicleCamera = async () => {
    setStep5Error(null);
    if (vehicleCameraStream) {
      vehicleCameraStream.getTracks().forEach((track) => track.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        vehicleCameraInputRef.current?.click();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setVehicleCameraStream(stream);
      setIsVehicleCameraActive(true);

      setTimeout(() => {
        if (vehicleVideoRef.current) {
          vehicleVideoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err: any) {
      console.warn('Vehicle camera getUserMedia unavailable, using device camera capture:', err);
      vehicleCameraInputRef.current?.click();
    }
  };

  const stopVehicleCamera = () => {
    if (vehicleCameraStream) {
      vehicleCameraStream.getTracks().forEach((track) => track.stop());
      setVehicleCameraStream(null);
    }
    setIsVehicleCameraActive(false);
  };

  const captureLiveVehiclePhoto = () => {
    if (!vehicleVideoRef.current) return;
    const video = vehicleVideoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setVehiclePhotoUrl(dataUrl);
      stopVehicleCamera();
      analyzeNumberPlateVisibility(dataUrl, formData.vehicleNumber);
    }
  };

  const handleNativeVehicleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStep5Error('Please capture an image using your device camera.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setVehiclePhotoUrl(dataUrl);
      analyzeNumberPlateVisibility(dataUrl, formData.vehicleNumber);
    };
    reader.onerror = () => {
      setStep5Error('Failed to process vehicle photo. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const analyzeNumberPlateVisibility = (dataUrl: string, regNumber: string) => {
    setVehiclePhotoStatus('ANALYZING');
    setStep5Error(null);

    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 640;
        canvas.height = img.height || 480;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setVehiclePhotoStatus('FAILED');
          setStep5Error(
            'Vehicle number plate is not clearly visible. Please retake the photo with the complete number plate visible.'
          );
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Image brightness & contrast analysis
        let totalBrightness = 0;
        let minBright = 255;
        let maxBright = 0;
        let sampledCount = 0;
        const sampleStep = 8;

        for (let i = 0; i < data.length; i += 4 * sampleStep) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          totalBrightness += brightness;
          if (brightness < minBright) minBright = brightness;
          if (brightness > maxBright) maxBright = brightness;
          sampledCount++;
        }

        const avgBrightness = totalBrightness / sampledCount;
        const contrast = maxBright - minBright;

        // Reject if pitch black, completely blown out white, or lacking contrast
        if (avgBrightness < 20 || avgBrightness > 245 || contrast < 40) {
          setVehiclePhotoStatus('FAILED');
          setStep5Error(
            'Vehicle number plate is not clearly visible. Please retake the photo with the complete number plate visible.'
          );
          return;
        }

        // Validate vehicle registration number is entered
        const cleanedReg = regNumber ? regNumber.replace(/[^A-Za-z0-9]/g, '') : '';
        if (!cleanedReg || cleanedReg.length < 5) {
          setVehiclePhotoStatus('FAILED');
          setStep5Error(
            'Vehicle number plate is not clearly visible. Please retake the photo with the complete number plate visible.'
          );
          return;
        }

        // Successfully verified
        setVehiclePhotoStatus('VERIFIED');
        setStep5Error(null);
      } catch {
        setVehiclePhotoStatus('FAILED');
        setStep5Error(
          'Vehicle number plate is not clearly visible. Please retake the photo with the complete number plate visible.'
        );
      }
    };

    img.onerror = () => {
      setVehiclePhotoStatus('FAILED');
      setStep5Error(
        'Vehicle number plate is not clearly visible. Please retake the photo with the complete number plate visible.'
      );
    };
  };

  const handleConfirmStep5 = async () => {
    setStep5Error(null);

    // 1. Mandatory Vehicle Registration Number
    if (!formData.vehicleNumber.trim()) {
      setStep5Error('Please enter your vehicle registration number.');
      return;
    }

    // 2. Mandatory Vehicle Photo
    if (!vehiclePhotoUrl) {
      setStep5Error('Please take a clear vehicle photo showing the number plate before continuing.');
      return;
    }

    // 3. Number Plate Visibility Verification
    if (vehiclePhotoStatus !== 'VERIFIED') {
      setStep5Error(
        'Vehicle number plate is not clearly visible. Please retake the photo with the complete number plate visible.'
      );
      return;
    }

    // 4. DL details required for non-exempt vehicles
    const isDlRequired = !(formData.vehicleType === 'Electric Vehicle' && formData.isDlExempt);
    if (isDlRequired) {
      if (!formData.dlNumber.trim()) {
        setStep5Error('Please enter your Driving Licence (DL) number before continuing.');
        return;
      }
    }

    setIsSavingStep5(true);

    try {
      localStorage.setItem('feedo_partner_vehicle_photo', vehiclePhotoUrl);
      localStorage.setItem('feedo_partner_vehicle_photo_verified', 'true');

      const savedVault = registrationStorage.getSavedRegistrationData();
      await registrationStorage.saveRegistrationData({
        deliveryPartnerId: savedVault?.deliveryPartnerId || 'DP0001',
        profilePhotoReference: formData.photoUrl,
        selectedVehicleCategory: formData.vehicleType,
        vehicleRegistrationNumber: formData.vehicleNumber,
        brand: formData.vehicleBrand,
        model: formData.vehicleModel,
        fuelType: formData.fuelType,
        vehiclePhotoReference: vehiclePhotoUrl,
        vehiclePhotoVerified: true,
        isRcUnavailable: formData.isRcExempt,
        isDlUnavailable: formData.isDlExempt,
        isRegNumberUnavailable: formData.isRegNumberExempt,
        documentUploadStatus: {
          ...(savedVault?.documentUploadStatus || {}),
          vehiclePhoto: 'UPLOADED',
          numberPlate: 'UPLOADED',
        },
        registrationStepCompletionStatus: {
          step3Completed: true,
          step4Completed: true,
          step5Completed: true,
          currentStep: 5,
        },
      });

      setIsSavingStep5(false);
      handleNextStep();
    } catch {
      setIsSavingStep5(false);
      setStep5Error('Failed to save vehicle verification. Please try again.');
    }
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreedTerms || !formData.agreedPrivacy) {
      setStep9Error('Please accept the Terms & Conditions and acknowledge the Privacy Policy to continue.');
      return;
    }

    setStep9Error(null);
    const appId = `FD-APP-${Math.floor(100000 + Math.random() * 900000)}`;
    setGeneratedAppId(appId);

    const agreementRecord = {
      agreementVersion: 'v1.0',
      termsAccepted: true,
      privacyAcknowledged: true,
      acceptedAt: new Date().toISOString(),
      partnerPhone: `+91 ${formData.mobile}`,
    };

    try {
      localStorage.setItem('feedo_partner_agreement_acceptance', JSON.stringify(agreementRecord));
      const savedVault = registrationStorage.getSavedRegistrationData();
      if (savedVault) {
        await registrationStorage.saveRegistrationData({
          ...savedVault,
          documentUploadStatus: {
            ...savedVault.documentUploadStatus,
            termsAndConditions: 'UPLOADED',
          },
          registrationStepCompletionStatus: {
            step3Completed: true,
            step4Completed: true,
            currentStep: 9,
          },
        });
      }
    } catch (err) {
      console.error('Failed to save agreement record:', err);
    }

    registerNewPartner({
      name: formData.fullName,
      phone: `+91 ${formData.mobile}`,
      email: formData.email,
      city: formData.city,
      photoUrl: formData.photoUrl || undefined,
      vehicle: {
        type: formData.vehicleType,
        model: `${formData.vehicleBrand} ${formData.vehicleModel}`,
        number: formData.isRegNumberExempt ? 'EXEMPT' : formData.vehicleNumber,
        fuelType: formData.fuelType,
        insuranceValidUntil: '2027-08-31',
        rcNumber: formData.isRcExempt ? 'EXEMPT' : formData.vehicleNumber,
        pucValidUntil: '2026-12-31',
      },
      bankDetails: {
        accountHolder: formData.accountHolder,
        bankName: formData.bankName,
        accountNumberMasked: `•••• •••• ${formData.accountNumber.slice(-4)}`,
        ifscCode: formData.ifscCode,
        upiId: formData.upiId,
      },
    });

    setIsSubmitted(true);
  };

  // Outcome Screen after submission
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-xl relative text-center text-slate-900">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center justify-center mx-auto mb-4 animate-bounce shadow-xs">
            <CheckCircle2 size={36} />
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-widest mb-2">
            APPLICATION SUBMITTED
          </span>

          <h2 className="text-xl font-extrabold text-slate-900 mb-1">Registration Successfully Submitted!</h2>
          <p className="text-xs text-slate-500 mb-5">
            Thank you for applying to become a Feedo delivery partner. Your documents have been uploaded for verification.
          </p>

          <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl mb-5 text-left space-y-2 text-xs">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-semibold">Partner Application ID</span>
              <span className="font-mono font-bold text-amber-900">{generatedAppId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Account Status</span>
              <span className="font-bold text-amber-800">⏳ UNDER REVIEW</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 mb-6 text-left">
            🔒 Account access will be unlocked as soon as Feedo admin completes background document verification.
          </div>

          <button
            onClick={onBackToLogin}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-200/60 cursor-pointer"
          >
            BACK TO LOGIN SCREEN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="w-full max-w-lg bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-xl relative text-slate-900">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <button
                onClick={handlePrevStep}
                className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:text-slate-950 border border-slate-200/80 cursor-pointer"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <div>
              <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">
                STEP {currentStep} OF 9
              </span>
              <h2 className="text-base font-extrabold text-slate-900">
                {currentStep === 1 && 'Mobile Verification'}
                {currentStep === 2 && 'Personal Information'}
                {currentStep === 3 && 'Profile Photo Upload'}
                {currentStep === 4 && 'Vehicle Details & Documentation'}
                {currentStep === 5 && 'Driving Licence'}
                {currentStep === 6 && 'Identity Verification'}
                {currentStep === 7 && 'Vehicle Documents'}
                {currentStep === 8 && 'Bank Account & UPI'}
                {currentStep === 9 && 'Feedo Partner Agreement'}
              </h2>
            </div>
          </div>

          <button
            onClick={onBackToLogin}
            className="text-xs font-semibold text-slate-400 hover:text-slate-800 cursor-pointer"
          >
            Cancel
          </button>
        </div>

        {/* Wizard Progress Line */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-6">
          <div
            className="bg-[#FACC15] h-full transition-all duration-300"
            style={{ width: `${(currentStep / 9) * 100}%` }}
          />
        </div>

        {/* Step 1: Mobile & OTP */}
        {currentStep === 1 && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[#A1A1A1] font-semibold mb-1">MOBILE NUMBER</label>
              <input
                type="text"
                value={formData.mobile}
                onChange={(e) => updateField('mobile', e.target.value)}
                className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-[#A1A1A1] font-semibold mb-1">ENTER 6-DIGIT OTP (Demo: 123456)</label>
              <input
                type="text"
                value={formData.otp}
                onChange={(e) => updateField('otp', e.target.value)}
                className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3.5 py-2.5 text-[#F5D76E] font-mono font-bold tracking-widest text-center text-lg focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <button
              onClick={handleNextStep}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] text-[#080808] font-black text-xs shadow-md mt-4 cursor-pointer"
            >
              VERIFY OTP & CONTINUE
            </button>
          </div>
        )}

        {/* Step 2: Personal Information */}
        {currentStep === 2 && (
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[#A1A1A1] font-semibold mb-1">FULL NAME (AS PER AADHAAR)</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3.5 py-2 text-white font-bold focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[#A1A1A1] font-semibold mb-1">DATE OF BIRTH</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => updateField('dob', e.target.value)}
                  className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-[#A1A1A1] font-semibold mb-1">GENDER</label>
                <select
                  value={formData.gender}
                  onChange={(e) => updateField('gender', e.target.value)}
                  className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[#A1A1A1] font-semibold mb-1">EMAIL ADDRESS</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-[#A1A1A1] font-semibold mb-1">CURRENT OPERATING CITY</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => updateField('city', e.target.value)}
                className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3.5 py-2 text-white font-bold focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-[#A1A1A1] font-semibold mb-1">RESIDENTIAL ADDRESS</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-[#252525] pt-2">
              <div>
                <label className="block text-[#A1A1A1] font-semibold mb-1">EMERGENCY CONTACT NAME</label>
                <input
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) => updateField('emergencyContactName', e.target.value)}
                  className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-[#A1A1A1] font-semibold mb-1">EMERGENCY PHONE</label>
                <input
                  type="text"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => updateField('emergencyContactPhone', e.target.value)}
                  className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
            <button
              onClick={handleNextStep}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] text-[#080808] font-black text-xs shadow-md mt-4 cursor-pointer"
            >
              CONTINUE TO PROFILE PHOTO
            </button>
          </div>
        )}

        {/* Step 3: Profile Photo Upload (Strictly Take Photo Only - No File Upload) */}
        {currentStep === 3 && (
          <div className="space-y-4 text-xs text-center">
            {/* Live Camera Viewfinder Overlay */}
            {isCameraActive ? (
              <div className="bg-black rounded-2xl p-4 border border-[#D4AF37]/50 relative overflow-hidden space-y-3">
                <div className="relative w-full max-w-[280px] h-64 mx-auto rounded-2xl overflow-hidden bg-slate-900 border border-[#252525]">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Circular Face Guide Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-44 h-44 rounded-full border-2 border-dashed border-[#F5D76E] shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
                  </div>
                  <div className="absolute bottom-2 left-0 right-0 text-[10px] text-amber-200 font-bold tracking-wide drop-shadow-md">
                    Position your face within the circle
                  </div>
                </div>

                {/* Camera Actions */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={switchCameraFacing}
                    className="py-2 px-3 rounded-xl bg-[#1C1C1C] text-[#A1A1A1] hover:text-white border border-[#252525] flex items-center gap-1.5 text-[11px] font-bold cursor-pointer"
                  >
                    <RefreshCw size={13} />
                    <span>Switch Camera</span>
                  </button>
                  <button
                    type="button"
                    onClick={captureLivePhoto}
                    className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] text-[#080808] font-black text-xs shadow-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Camera size={15} />
                    <span>CAPTURE PHOTO</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="py-2 px-3 rounded-xl bg-[#1C1C1C] text-red-400 hover:text-red-300 border border-red-500/30 flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                  >
                    <X size={13} />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Existing Circular Photo Preview */}
                <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border-2 border-[#D4AF37] relative shadow-xl shadow-[#D4AF37]/20 flex items-center justify-center bg-[#141414]">
                  {formData.photoUrl ? (
                    <img
                      src={formData.photoUrl}
                      alt="Captured Profile Photo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <User size={46} className="text-[#666]" />
                    </div>
                  )}
                </div>

                {formData.photoUrl && (
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#35B879]/20 text-[#35B879]">
                    <Check size={12} />
                    <span>Photo Captured & Ready</span>
                  </div>
                )}

                <p className="text-[#A1A1A1] max-w-xs mx-auto">
                  Clear front-facing photo without sunglasses or cap. Needed for customer delivery identification.
                </p>

                {/* Only TAKE PHOTO button - UPLOAD FILE completely removed */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => startCamera('user')}
                    className="py-2.5 px-6 rounded-xl bg-[#1C1C1C] text-white border border-[#252525] flex items-center gap-2 font-bold hover:border-[#D4AF37]/60 transition-all cursor-pointer shadow-sm"
                  >
                    <Camera size={16} className="text-[#D4AF37]" />
                    <span>{formData.photoUrl ? 'RETAKE PHOTO' : 'TAKE PHOTO'}</span>
                  </button>
                </div>
              </>
            )}

            {/* Hidden Native Camera Input Fallback for Mobile Devices */}
            <input
              ref={nativeCameraInputRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={handleNativeCameraCapture}
            />

            {/* Step 3 Error Notification */}
            {step3Error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2 text-left">
                <AlertCircle size={15} className="shrink-0" />
                <span>{step3Error}</span>
              </div>
            )}

            {/* Confirm Photo Button */}
            <button
              onClick={handleConfirmPhoto}
              disabled={isSavingPhoto}
              className={`w-full py-3 rounded-xl font-black text-xs shadow-md mt-4 transition-all cursor-pointer ${
                formData.photoUrl
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] text-[#080808] hover:brightness-105'
                  : 'bg-slate-200 text-slate-500 opacity-60 cursor-not-allowed'
              }`}
            >
              {isSavingPhoto ? 'SAVING PHOTO...' : 'CONFIRM PHOTO & CONTINUE'}
            </button>
          </div>
        )}

        {/* Step 4: Vehicle Details & Documentation */}
        {currentStep === 4 && (
          <div className="space-y-3.5 text-xs">
            {/* 1. Vehicle Categories (Scooter, Motorcycle, Electric Vehicle, Car) */}
            <div>
              <label className="block text-[#A1A1A1] font-semibold mb-1">VEHICLE CATEGORY</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Scooter', 'Motorcycle', 'Electric Vehicle', 'Car'] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => handleVehicleCategorySelect(v)}
                    className={`py-2.5 px-2 rounded-xl font-bold border text-[11px] cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
                      formData.vehicleType === v
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] text-[#080808] border-[#D4AF37] shadow-sm'
                        : 'bg-[#1C1C1C] text-[#A1A1A1] border-[#252525] hover:border-white/20'
                    }`}
                  >
                    <span>{v}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Vehicle Information */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[#A1A1A1] font-semibold mb-1">REGISTRATION NUMBER</label>
                <input
                  type="text"
                  disabled={formData.vehicleType === 'Electric Vehicle' && formData.isRegNumberExempt}
                  value={
                    formData.vehicleType === 'Electric Vehicle' && formData.isRegNumberExempt
                      ? 'EXEMPT / NOT APPLICABLE'
                      : formData.vehicleNumber
                  }
                  onChange={(e) => updateField('vehicleNumber', e.target.value)}
                  placeholder="e.g. KA 05 AB 5678"
                  className={`w-full bg-[#1C1C1C] border ${
                    missingDocKeys.includes('vehicleNumber') ? 'border-red-500' : 'border-[#2A2A2A]'
                  } rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-[#D4AF37] disabled:opacity-60`}
                />
                {formData.vehicleType === 'Electric Vehicle' && (
                  <label className="flex items-center gap-1.5 text-[10px] text-[#A1A1A1] mt-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isRegNumberExempt}
                      onChange={(e) => updateField('isRegNumberExempt', e.target.checked)}
                      className="accent-[#D4AF37]"
                    />
                    <span>Not Available / Exemption for this EV</span>
                  </label>
                )}
              </div>
              <div>
                <label className="block text-[#A1A1A1] font-semibold mb-1">BRAND</label>
                <input
                  type="text"
                  value={formData.vehicleBrand}
                  onChange={(e) => updateField('vehicleBrand', e.target.value)}
                  className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[#A1A1A1] font-semibold mb-1">MODEL</label>
                <input
                  type="text"
                  value={formData.vehicleModel}
                  onChange={(e) => updateField('vehicleModel', e.target.value)}
                  className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-[#A1A1A1] font-semibold mb-1">FUEL TYPE</label>
                <input
                  type="text"
                  readOnly={formData.vehicleType === 'Electric Vehicle'}
                  value={formData.fuelType}
                  onChange={(e) => updateField('fuelType', e.target.value)}
                  className={`w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] ${
                    formData.vehicleType === 'Electric Vehicle' ? 'font-bold text-[#F5D76E]' : ''
                  }`}
                />
              </div>
            </div>

            {/* 3. Documentation Section */}
            <div className="border-t border-[#252525] pt-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="text-[#D4AF37] font-black uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <FileText size={14} />
                  <span>DOCUMENTATION</span>
                </div>
                <span className="text-[10px] text-[#A1A1A1]">JPG, PNG or PDF (Max 10MB)</span>
              </div>

              {/* Document 1: Aadhaar Card */}
              <div
                className={`p-3 rounded-xl bg-[#1C1C1C] border transition-all ${
                  missingDocKeys.includes('aadhaar')
                    ? 'border-red-500 bg-red-950/20'
                    : 'border-[#252525]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-white text-xs">1. Aadhaar Card (Front & Back)</span>
                  {documents.aadhaar ? (
                    <span className="text-[10px] bg-[#35B879]/20 text-[#35B879] px-2 py-0.5 rounded font-bold flex items-center gap-1">
                      <Check size={11} /> UPLOADED
                    </span>
                  ) : (
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold">
                      REQUIRED
                    </span>
                  )}
                </div>
                {documents.aadhaar ? (
                  <div className="flex items-center justify-between text-[11px] text-slate-300 bg-[#161616] p-2 rounded-lg border border-[#2A2A2A]">
                    <span className="truncate max-w-[200px] text-white font-medium">
                      📄 {documents.aadhaar.fileName} ({documents.aadhaar.fileSize})
                    </span>
                    <button
                      type="button"
                      onClick={() => docInputRefs.aadhaar.current?.click()}
                      className="text-[#D4AF37] hover:underline font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      <Upload size={11} /> Replace
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => docInputRefs.aadhaar.current?.click()}
                    className="w-full py-2 px-3 rounded-lg bg-[#252525] hover:bg-[#2e2e2e] text-white border border-[#333] hover:border-[#D4AF37]/50 flex items-center justify-center gap-1.5 text-[11px] font-bold cursor-pointer transition-all"
                  >
                    <Upload size={13} className="text-[#D4AF37]" />
                    <span>UPLOAD AADHAAR CARD</span>
                  </button>
                )}
                <input
                  ref={docInputRefs.aadhaar}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                  className="hidden"
                  onChange={(e) => handleDocumentFileUpload('aadhaar', e)}
                />
              </div>

              {/* Document 2: PAN Card */}
              <div
                className={`p-3 rounded-xl bg-[#1C1C1C] border transition-all ${
                  missingDocKeys.includes('pan')
                    ? 'border-red-500 bg-red-950/20'
                    : 'border-[#252525]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-white text-xs">2. PAN Card</span>
                  {documents.pan ? (
                    <span className="text-[10px] bg-[#35B879]/20 text-[#35B879] px-2 py-0.5 rounded font-bold flex items-center gap-1">
                      <Check size={11} /> UPLOADED
                    </span>
                  ) : (
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold">
                      REQUIRED
                    </span>
                  )}
                </div>
                {documents.pan ? (
                  <div className="flex items-center justify-between text-[11px] text-slate-300 bg-[#161616] p-2 rounded-lg border border-[#2A2A2A]">
                    <span className="truncate max-w-[200px] text-white font-medium">
                      📄 {documents.pan.fileName} ({documents.pan.fileSize})
                    </span>
                    <button
                      type="button"
                      onClick={() => docInputRefs.pan.current?.click()}
                      className="text-[#D4AF37] hover:underline font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      <Upload size={11} /> Replace
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => docInputRefs.pan.current?.click()}
                    className="w-full py-2 px-3 rounded-lg bg-[#252525] hover:bg-[#2e2e2e] text-white border border-[#333] hover:border-[#D4AF37]/50 flex items-center justify-center gap-1.5 text-[11px] font-bold cursor-pointer transition-all"
                  >
                    <Upload size={13} className="text-[#D4AF37]" />
                    <span>UPLOAD PAN CARD</span>
                  </button>
                )}
                <input
                  ref={docInputRefs.pan}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                  className="hidden"
                  onChange={(e) => handleDocumentFileUpload('pan', e)}
                />
              </div>

              {/* Document 3: Bank Passbook */}
              <div
                className={`p-3 rounded-xl bg-[#1C1C1C] border transition-all ${
                  missingDocKeys.includes('bank_passbook')
                    ? 'border-red-500 bg-red-950/20'
                    : 'border-[#252525]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-white text-xs">3. Bank Passbook / Cheque Copy</span>
                  {documents.bank_passbook ? (
                    <span className="text-[10px] bg-[#35B879]/20 text-[#35B879] px-2 py-0.5 rounded font-bold flex items-center gap-1">
                      <Check size={11} /> UPLOADED
                    </span>
                  ) : (
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold">
                      REQUIRED
                    </span>
                  )}
                </div>
                {documents.bank_passbook ? (
                  <div className="flex items-center justify-between text-[11px] text-slate-300 bg-[#161616] p-2 rounded-lg border border-[#2A2A2A]">
                    <span className="truncate max-w-[200px] text-white font-medium">
                      📄 {documents.bank_passbook.fileName} ({documents.bank_passbook.fileSize})
                    </span>
                    <button
                      type="button"
                      onClick={() => docInputRefs.bank_passbook.current?.click()}
                      className="text-[#D4AF37] hover:underline font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      <Upload size={11} /> Replace
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => docInputRefs.bank_passbook.current?.click()}
                    className="w-full py-2 px-3 rounded-lg bg-[#252525] hover:bg-[#2e2e2e] text-white border border-[#333] hover:border-[#D4AF37]/50 flex items-center justify-center gap-1.5 text-[11px] font-bold cursor-pointer transition-all"
                  >
                    <Upload size={13} className="text-[#D4AF37]" />
                    <span>UPLOAD BANK PASSBOOK</span>
                  </button>
                )}
                <input
                  ref={docInputRefs.bank_passbook}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                  className="hidden"
                  onChange={(e) => handleDocumentFileUpload('bank_passbook', e)}
                />
              </div>

              {/* Document 4: RC (Registration Certificate) */}
              <div
                className={`p-3 rounded-xl bg-[#1C1C1C] border transition-all ${
                  missingDocKeys.includes('rc')
                    ? 'border-red-500 bg-red-950/20'
                    : 'border-[#252525]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-white text-xs">4. RC (Vehicle Registration Certificate)</span>
                  {documents.rc ? (
                    <span className="text-[10px] bg-[#35B879]/20 text-[#35B879] px-2 py-0.5 rounded font-bold flex items-center gap-1">
                      <Check size={11} /> UPLOADED
                    </span>
                  ) : formData.vehicleType === 'Electric Vehicle' && formData.isRcExempt ? (
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold">
                      NOT APPLICABLE / EXEMPT
                    </span>
                  ) : (
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold">
                      REQUIRED
                    </span>
                  )}
                </div>

                {documents.rc ? (
                  <div className="flex items-center justify-between text-[11px] text-slate-300 bg-[#161616] p-2 rounded-lg border border-[#2A2A2A]">
                    <span className="truncate max-w-[200px] text-white font-medium">
                      📄 {documents.rc.fileName} ({documents.rc.fileSize})
                    </span>
                    <button
                      type="button"
                      onClick={() => docInputRefs.rc.current?.click()}
                      className="text-[#D4AF37] hover:underline font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      <Upload size={11} /> Replace
                    </button>
                  </div>
                ) : !formData.isRcExempt ? (
                  <button
                    type="button"
                    onClick={() => docInputRefs.rc.current?.click()}
                    className="w-full py-2 px-3 rounded-lg bg-[#252525] hover:bg-[#2e2e2e] text-white border border-[#333] hover:border-[#D4AF37]/50 flex items-center justify-center gap-1.5 text-[11px] font-bold cursor-pointer transition-all"
                  >
                    <Upload size={13} className="text-[#D4AF37]" />
                    <span>UPLOAD VEHICLE RC</span>
                  </button>
                ) : null}

                {/* Electric Vehicle "If Available" Option */}
                {formData.vehicleType === 'Electric Vehicle' && (
                  <label className="flex items-center gap-2 mt-2 pt-2 border-t border-[#252525] cursor-pointer text-[10px] text-[#A1A1A1] hover:text-white">
                    <input
                      type="checkbox"
                      checked={formData.isRcExempt}
                      onChange={(e) => updateField('isRcExempt', e.target.checked)}
                      className="accent-[#D4AF37]"
                    />
                    <span>RC not available / exemption for this Electric Vehicle</span>
                  </label>
                )}

                <input
                  ref={docInputRefs.rc}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                  className="hidden"
                  onChange={(e) => handleDocumentFileUpload('rc', e)}
                />
              </div>

              {/* Document 5: DL (Driving Licence) */}
              <div
                className={`p-3 rounded-xl bg-[#1C1C1C] border transition-all ${
                  missingDocKeys.includes('dl')
                    ? 'border-red-500 bg-red-950/20'
                    : 'border-[#252525]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-white text-xs">5. DL (Driving Licence)</span>
                  {documents.dl ? (
                    <span className="text-[10px] bg-[#35B879]/20 text-[#35B879] px-2 py-0.5 rounded font-bold flex items-center gap-1">
                      <Check size={11} /> UPLOADED
                    </span>
                  ) : formData.vehicleType === 'Electric Vehicle' && formData.isDlExempt ? (
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold">
                      NOT APPLICABLE / EXEMPT
                    </span>
                  ) : (
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold">
                      REQUIRED
                    </span>
                  )}
                </div>

                {documents.dl ? (
                  <div className="flex items-center justify-between text-[11px] text-slate-300 bg-[#161616] p-2 rounded-lg border border-[#2A2A2A]">
                    <span className="truncate max-w-[200px] text-white font-medium">
                      📄 {documents.dl.fileName} ({documents.dl.fileSize})
                    </span>
                    <button
                      type="button"
                      onClick={() => docInputRefs.dl.current?.click()}
                      className="text-[#D4AF37] hover:underline font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      <Upload size={11} /> Replace
                    </button>
                  </div>
                ) : !formData.isDlExempt ? (
                  <button
                    type="button"
                    onClick={() => docInputRefs.dl.current?.click()}
                    className="w-full py-2 px-3 rounded-lg bg-[#252525] hover:bg-[#2e2e2e] text-white border border-[#333] hover:border-[#D4AF37]/50 flex items-center justify-center gap-1.5 text-[11px] font-bold cursor-pointer transition-all"
                  >
                    <Upload size={13} className="text-[#D4AF37]" />
                    <span>UPLOAD DRIVING LICENCE</span>
                  </button>
                ) : null}

                {/* Electric Vehicle "If Available" Option */}
                {formData.vehicleType === 'Electric Vehicle' && (
                  <label className="flex items-center gap-2 mt-2 pt-2 border-t border-[#252525] cursor-pointer text-[10px] text-[#A1A1A1] hover:text-white">
                    <input
                      type="checkbox"
                      checked={formData.isDlExempt}
                      onChange={(e) => updateField('isDlExempt', e.target.checked)}
                      className="accent-[#D4AF37]"
                    />
                    <span>Driving Licence not available / exemption for low-speed EV</span>
                  </label>
                )}

                <input
                  ref={docInputRefs.dl}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                  className="hidden"
                  onChange={(e) => handleDocumentFileUpload('dl', e)}
                />
              </div>

              {/* Item 6: Vehicle Registration Number (Text Field - Reused From Vehicle Details) */}
              <div className="bg-[#181818] border border-[#252525] p-3 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[#A1A1A1] text-[10px] font-bold uppercase tracking-wider">
                    6. VEHICLE REGISTRATION NUMBER
                  </div>
                  <div className="font-mono font-bold text-white text-xs mt-0.5">
                    {formData.vehicleType === 'Electric Vehicle' && formData.isRegNumberExempt
                      ? 'EXEMPT / NOT APPLICABLE'
                      : formData.vehicleNumber || 'Enter above in Vehicle Details'}
                  </div>
                </div>
                <span className="text-[10px] bg-[#35B879]/20 text-[#35B879] px-2 py-0.5 rounded font-bold">
                  ✓ LINKED FROM VEHICLE DETAILS
                </span>
              </div>
            </div>

            {/* Step 4 Missing Documents Warning */}
            {step4Error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2 text-left">
                <AlertCircle size={16} className="shrink-0" />
                <span className="font-semibold">{step4Error}</span>
              </div>
            )}

            {/* Save Vehicle & Continue Button */}
            <button
              onClick={handleSaveVehicleAndDocuments}
              disabled={isSavingVehicleDocs}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] text-[#080808] font-black text-xs shadow-md mt-4 cursor-pointer disabled:opacity-50 transition-all hover:brightness-105"
            >
              {isSavingVehicleDocs ? 'SAVING VEHICLE & DOCUMENTS...' : 'SAVE VEHICLE & CONTINUE'}
            </button>
          </div>
        )}

        {/* Step 5: Driving Licence & Mandatory Vehicle Photo Verification */}
        {currentStep === 5 && (
          <div className="space-y-3.5 text-xs text-left">
            {/* A. Mandatory Vehicle Registration Number (All vehicles) */}
            <div>
              <label className="block text-[#A1A1A1] font-semibold mb-1">
                VEHICLE REGISTRATION NUMBER <span className="text-[#D4AF37]">*</span>
              </label>
              <input
                type="text"
                value={formData.vehicleNumber}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  updateField('vehicleNumber', val);
                  if (vehiclePhotoUrl) {
                    analyzeNumberPlateVisibility(vehiclePhotoUrl, val);
                  }
                }}
                placeholder="e.g. KA 05 AB 5678"
                className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3.5 py-2 text-white font-mono font-bold focus:outline-none focus:border-[#D4AF37]"
              />
              <p className="text-[10px] text-[#A1A1A1] mt-1">
                Reused from Step 4. Must match the physical number plate on your vehicle.
              </p>
            </div>

            {/* B. Driving Licence Section: Hidden for License-Exempt Electric Vehicles Only */}
            {formData.vehicleType === 'Electric Vehicle' && formData.isDlExempt ? (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap size={15} className="text-[#D4AF37] shrink-0" />
                  <span>Electric Vehicle: Exempt from Driving Licence requirements</span>
                </div>
                <button
                  type="button"
                  onClick={() => updateField('isDlExempt', false)}
                  className="text-[10px] text-[#D4AF37] underline font-bold cursor-pointer hover:text-white"
                >
                  Add DL if required
                </button>
              </div>
            ) : (
              <div className="space-y-3 border-t border-[#252525] pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                    DRIVING LICENCE DETAILS
                  </span>
                  {formData.vehicleType === 'Electric Vehicle' && (
                    <button
                      type="button"
                      onClick={() => updateField('isDlExempt', true)}
                      className="text-[10px] text-slate-400 hover:text-[#D4AF37] underline cursor-pointer"
                    >
                      Exempt (Low-speed EV)
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[#A1A1A1] font-semibold mb-1">DRIVING LICENCE (DL) NUMBER</label>
                  <input
                    type="text"
                    value={formData.dlNumber}
                    onChange={(e) => updateField('dlNumber', e.target.value)}
                    placeholder="e.g. KA05 20210089123"
                    className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3.5 py-2 text-white font-mono font-bold focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-[#A1A1A1] font-semibold mb-1">DL EXPIRY DATE</label>
                  <input
                    type="date"
                    value={formData.dlExpiry}
                    onChange={(e) => updateField('dlExpiry', e.target.value)}
                    className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div className="bg-[#1C1C1C] p-2.5 rounded-xl border border-[#252525] flex items-center justify-between text-[#35B879] font-bold text-[11px]">
                  <span>✓ DL Document {documents.dl ? `(${documents.dl.fileName})` : ''}</span>
                  <span className="text-[10px] bg-[#35B879]/20 px-2 py-0.5 rounded">
                    {documents.dl ? 'UPLOADED IN STEP 4' : 'VERIFIED'}
                  </span>
                </div>
              </div>
            )}

            {/* C. Mandatory Vehicle Photo & Number Plate Verification (All Vehicles) */}
            <div className="border-t border-[#252525] pt-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Camera size={14} className="text-[#D4AF37]" />
                  <span>MANDATORY VEHICLE & NUMBER PLATE PHOTO</span>
                </div>
                <span className="text-[10px] text-amber-400 font-bold">ALL VEHICLES</span>
              </div>

              {/* Live Vehicle Camera Viewfinder */}
              {isVehicleCameraActive ? (
                <div className="bg-black rounded-2xl p-3 border border-[#D4AF37]/50 relative overflow-hidden space-y-2.5">
                  <div className="relative w-full h-56 rounded-xl overflow-hidden bg-slate-900 border border-[#252525]">
                    <video
                      ref={vehicleVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {/* Number Plate Alignment Guide */}
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
                      <div className="w-56 h-20 rounded-lg border-2 border-dashed border-[#F5D76E] shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] flex items-center justify-center text-center">
                        <span className="text-[10px] text-amber-200 font-mono font-bold tracking-widest drop-shadow">
                          {formData.vehicleNumber || 'NUMBER PLATE HERE'}
                        </span>
                      </div>
                    </div>
                    <div className="absolute bottom-1.5 left-0 right-0 text-center text-[10px] text-amber-200 font-bold drop-shadow">
                      Ensure vehicle and number plate are sharp & clearly legible
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={captureLiveVehiclePhoto}
                      className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] text-[#080808] font-black text-xs shadow-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera size={14} />
                      <span>CAPTURE VEHICLE PHOTO</span>
                    </button>
                    <button
                      type="button"
                      onClick={stopVehicleCamera}
                      className="py-2 px-3 rounded-xl bg-[#1C1C1C] text-red-400 hover:text-red-300 border border-red-500/30 flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                    >
                      <X size={13} />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Photo Preview Card */}
                  {vehiclePhotoUrl ? (
                    <div className="w-full rounded-2xl overflow-hidden border-2 border-[#2A2A2A] relative bg-[#141414] p-2 space-y-2">
                      <div className="w-full h-44 rounded-xl overflow-hidden relative bg-black">
                        <img
                          src={vehiclePhotoUrl}
                          alt="Captured Vehicle"
                          className="w-full h-full object-cover"
                        />
                        {/* Verification Overlay Badge */}
                        <div className="absolute top-2 right-2">
                          {vehiclePhotoStatus === 'ANALYZING' && (
                            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-500/90 text-black flex items-center gap-1 animate-pulse">
                              <RefreshCw size={11} className="animate-spin" /> Verifying Plate...
                            </span>
                          )}
                          {vehiclePhotoStatus === 'VERIFIED' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#35B879] text-white flex items-center gap-1 shadow-md">
                              <Check size={12} /> Number Plate Verified
                            </span>
                          )}
                          {vehiclePhotoStatus === 'FAILED' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-600 text-white flex items-center gap-1 shadow-md">
                              <AlertCircle size={12} /> Plate Unclear
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between px-1">
                        <div className="text-[11px] text-slate-300">
                          {vehiclePhotoStatus === 'VERIFIED' ? (
                            <span className="text-[#35B879] font-bold">
                              ✓ Number plate matches: <span className="font-mono text-white">{formData.vehicleNumber}</span>
                            </span>
                          ) : (
                            <span className="text-red-400 font-semibold">Plate visibility check required</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={startVehicleCamera}
                          className="py-1.5 px-3 rounded-lg bg-[#252525] hover:bg-[#2f2f2f] text-white border border-[#333] hover:border-[#D4AF37]/50 flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                        >
                          <Camera size={13} className="text-[#D4AF37]" />
                          <span>RETAKE PHOTO</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-[#141414] border-2 border-dashed border-[#2A2A2A] text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-[#1C1C1C] flex items-center justify-center mx-auto text-[#D4AF37] border border-[#252525]">
                        <Camera size={22} />
                      </div>
                      <div className="font-bold text-white text-xs">
                        Vehicle & Number Plate Photo Required
                      </div>
                      <p className="text-[10px] text-[#A1A1A1] max-w-xs mx-auto">
                        Photograph your vehicle from the front or rear so the license plate number{' '}
                        <span className="font-mono text-[#F5D76E]">{formData.vehicleNumber || ''}</span> is clearly
                        visible.
                      </p>
                      <button
                        type="button"
                        onClick={startVehicleCamera}
                        className="py-2.5 px-5 rounded-xl bg-[#1C1C1C] hover:bg-[#252525] text-white border border-[#333] hover:border-[#D4AF37]/60 font-black text-xs flex items-center justify-center gap-2 mx-auto cursor-pointer shadow-sm transition-all"
                      >
                        <Camera size={15} className="text-[#D4AF37]" />
                        <span>TAKE VEHICLE PHOTO</span>
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Native Camera input fallback */}
              <input
                ref={vehicleCameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleNativeVehicleCameraCapture}
              />
            </div>

            {/* Step 5 Error Banner */}
            {step5Error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2 text-left">
                <AlertCircle size={16} className="shrink-0" />
                <span className="font-semibold">{step5Error}</span>
              </div>
            )}

            {/* Confirm Button */}
            <button
              onClick={handleConfirmStep5}
              disabled={isSavingStep5}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] text-[#080808] font-black text-xs shadow-md mt-4 cursor-pointer disabled:opacity-50 transition-all hover:brightness-105"
            >
              {isSavingStep5 ? 'VERIFYING & SAVING...' : 'CONFIRM LICENCE & CONTINUE'}
            </button>
          </div>
        )}

        {/* Step 6: Identity (Aadhaar/PAN) */}
        {currentStep === 6 && (
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#1C1C1C] border border-[#252525] space-y-2">
              <div className="flex items-center justify-between text-[#35B879] font-bold">
                <span>Aadhaar Card {documents.aadhaar ? `(${documents.aadhaar.fileName})` : ''}</span>
                <span className="text-[10px] bg-[#35B879]/20 px-2 py-0.5 rounded">✓ UPLOADED IN STEP 4</span>
              </div>
              <p className="text-[11px] text-[#A1A1A1]">Government identity verification</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#1C1C1C] border border-[#252525] space-y-2">
              <div className="flex items-center justify-between text-[#35B879] font-bold">
                <span>PAN Card {documents.pan ? `(${documents.pan.fileName})` : ''}</span>
                <span className="text-[10px] bg-[#35B879]/20 px-2 py-0.5 rounded">✓ UPLOADED IN STEP 4</span>
              </div>
              <p className="text-[11px] text-[#A1A1A1]">Tax compliance document</p>
            </div>
            <button
              onClick={handleNextStep}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] text-[#080808] font-black text-xs shadow-md mt-4 cursor-pointer"
            >
              CONTINUE TO VEHICLE DOCS
            </button>
          </div>
        )}

        {/* Step 7: Vehicle Docs */}
        {currentStep === 7 && (
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-[#1C1C1C] border border-[#252525] flex justify-between items-center text-[#35B879] font-bold">
              <span>Vehicle RC Copy {documents.rc ? `(${documents.rc.fileName})` : ''}</span>
              <span className="text-[10px] bg-[#35B879]/20 px-2 py-0.5 rounded">
                {formData.isRcExempt ? 'EXEMPT' : '✓ UPLOADED IN STEP 4'}
              </span>
            </div>
            <button
              onClick={handleNextStep}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] text-[#080808] font-black text-xs shadow-md mt-4 cursor-pointer"
            >
              SAVE DOCS & CONTINUE TO BANK DETAILS
            </button>
          </div>
        )}

        {/* Step 8: Bank Details */}
        {currentStep === 8 && (
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[#A1A1A1] font-semibold mb-1">ACCOUNT HOLDER NAME</label>
              <input
                type="text"
                value={formData.accountHolder}
                onChange={(e) => updateField('accountHolder', e.target.value)}
                className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3.5 py-2 text-white font-bold focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-[#A1A1A1] font-semibold mb-1">BANK NAME</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => updateField('bankName', e.target.value)}
                className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[#A1A1A1] font-semibold mb-1">ACCOUNT NUMBER</label>
                <input
                  type="password"
                  value={formData.accountNumber}
                  onChange={(e) => updateField('accountNumber', e.target.value)}
                  className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-[#A1A1A1] font-semibold mb-1">IFSC CODE</label>
                <input
                  type="text"
                  value={formData.ifscCode}
                  onChange={(e) => updateField('ifscCode', e.target.value)}
                  className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
            <div>
              <label className="block text-[#A1A1A1] font-semibold mb-1">UPI ID FOR INSTANT PAYOUTS</label>
              <input
                type="text"
                value={formData.upiId}
                onChange={(e) => updateField('upiId', e.target.value)}
                className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3.5 py-2 text-[#F5D76E] font-mono font-bold focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div className="text-[11px] text-[#A1A1A1] bg-[#1C1C1C] p-2.5 rounded-xl border border-[#252525]">
              Saved Account Preview:{' '}
              <span className="text-white font-mono font-bold">XXXX XXXX {formData.accountNumber.slice(-4)}</span>
            </div>
            <button
              onClick={handleNextStep}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] text-[#080808] font-black text-xs shadow-md mt-4 cursor-pointer"
            >
              SAVE BANK DETAILS & GO TO AGREEMENT
            </button>
          </div>
        )}

        {/* Step 9: Partner Agreement */}
        {currentStep === 9 && (
          <form onSubmit={handleSubmitRegistration} className="space-y-4 text-xs">
            {/* Scrollable Terms & Conditions Section */}
            <div className="bg-[#1C1C1C] p-4 rounded-2xl border border-[#252525] max-h-64 overflow-y-auto text-[11px] text-[#A1A1A1] space-y-3.5 text-left">
              <div className="font-extrabold text-[#D4AF37] text-xs tracking-wide border-b border-[#2A2A2A] pb-2 uppercase">
                FEEDO DELIVERY PARTNER — TERMS & CONDITIONS
              </div>

              <div>
                <div className="font-bold text-white mb-0.5">1. Registration and Verification</div>
                <p>
                  Delivery partners must provide accurate personal information, valid identity documents,
                  applicable vehicle documents, and correct bank details. Feedo may verify submitted
                  information before activating a delivery partner account.
                </p>
              </div>

              <div>
                <div className="font-bold text-white mb-0.5">2. Delivery Partner Responsibilities</div>
                <p>
                  Delivery partners must collect assigned orders from restaurants, deliver them to the
                  correct customers, handle food packages carefully, maintain professional conduct, and
                  follow applicable traffic and road safety regulations.
                </p>
              </div>

              <div>
                <div className="font-bold text-white mb-0.5">3. Restaurant Pickup Verification</div>
                <p>
                  Every order has a separate Order ID and Pickup Code. The restaurant provides the Pickup
                  Code to the delivery partner during order handover. The delivery partner must enter the
                  correct Pickup Code to confirm successful pickup.
                </p>
              </div>

              <div>
                <div className="font-bold text-white mb-0.5">4. Customer Delivery Verification</div>
                <p>
                  Delivery partners must complete deliveries using the verification method provided by
                  Feedo. Orders must not be marked as delivered before successful handover and required
                  confirmation.
                </p>
              </div>

              <div>
                <div className="font-bold text-white mb-0.5">5. Earnings and Payments</div>
                <p>
                  Delivery earnings are calculated according to Feedo's applicable delivery payment rules.
                  Eligible payments are processed automatically every Wednesday to the delivery partner's
                  registered bank account, subject to verification and payment processing requirements.
                </p>
                <p className="mt-1 text-slate-300 font-semibold">
                  There is no instant cashout or manual withdrawal option.
                </p>
              </div>

              <div>
                <div className="font-bold text-white mb-0.5">6. Customer Tips and Rain / Surge Bonuses</div>
                <p>
                  Delivery partners may receive customer tips and applicable rain or surge bonuses. These
                  amounts will be recorded according to Feedo's payment rules. No milestone or weekly
                  incentive programs are offered.
                </p>
              </div>

              <div>
                <div className="font-bold text-white mb-0.5">7. Account Safety and Conduct</div>
                <p>
                  Delivery partners must protect their login credentials, use their own authorized
                  account, follow food handling and hygiene requirements, and treat restaurant staff and
                  customers respectfully.
                </p>
              </div>

              <div>
                <div className="font-bold text-white mb-0.5">8. Location and Delivery Tracking</div>
                <p>
                  When the delivery partner is online or handling an active delivery, Feedo may process
                  necessary location and trip information for order assignment, navigation, delivery
                  tracking, safety, and operational purposes, as explained in the applicable Privacy Policy.
                </p>
              </div>

              <div>
                <div className="font-bold text-white mb-0.5">9. Account Suspension</div>
                <p>
                  Feedo may restrict or suspend accounts for fraudulent activity, serious safety
                  violations, misuse of the platform, or violations of applicable partner terms,
                  subject to relevant policies and legal requirements.
                </p>
              </div>

              <div>
                <div className="font-bold text-white mb-0.5">10. Partner Agreement</div>
                <p>
                  By submitting the application, the delivery partner confirms that the information
                  provided is accurate and agrees to follow the applicable Feedo Delivery Partner Terms &
                  Conditions and Privacy Policy.
                </p>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-2.5 pt-1 text-left">
              <label className="flex items-start gap-2.5 cursor-pointer text-white/90">
                <input
                  type="checkbox"
                  checked={formData.agreedTerms}
                  onChange={(e) => {
                    updateField('agreedTerms', e.target.checked);
                    if (e.target.checked && formData.agreedPrivacy) setStep9Error(null);
                  }}
                  className="mt-0.5 accent-[#D4AF37] cursor-pointer"
                />
                <span className="text-[11px] leading-snug">
                  I have read and agree to the Feedo Delivery Partner Terms & Conditions.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer text-white/90">
                <input
                  type="checkbox"
                  checked={formData.agreedPrivacy}
                  onChange={(e) => {
                    updateField('agreedPrivacy', e.target.checked);
                    if (e.target.checked && formData.agreedTerms) setStep9Error(null);
                  }}
                  className="mt-0.5 accent-[#D4AF37] cursor-pointer"
                />
                <span className="text-[11px] leading-snug">
                  I acknowledge that I have read the Feedo Privacy Policy.
                </span>
              </label>
            </div>

            {/* Warning when either checkbox is not checked */}
            {step9Error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2 text-left">
                <AlertCircle size={16} className="shrink-0" />
                <span className="font-semibold">{step9Error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] hover:brightness-110 text-[#080808] font-black text-xs transition-all shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck size={18} />
              <span>SUBMIT APPLICATION FOR VERIFICATION</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
