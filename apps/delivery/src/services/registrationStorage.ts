export interface PartnerRegistrationStoragePayload {
  deliveryPartnerId: string;
  profilePhotoReference?: string;
  selectedVehicleCategory: string;
  vehicleRegistrationNumber: string;
  brand: string;
  model: string;
  fuelType: string;
  aadhaarDocumentReference?: string;
  panDocumentReference?: string;
  bankPassbookDocumentReference?: string;
  rcDocumentReference?: string;
  dlDocumentReference?: string;
  vehiclePhotoReference?: string;
  vehiclePhotoVerified?: boolean;
  isRcUnavailable?: boolean;
  isDlUnavailable?: boolean;
  isRegNumberUnavailable?: boolean;
  documentUploadStatus: Record<string, 'UPLOADED' | 'EXEMPT' | 'PENDING'>;
  registrationStepCompletionStatus: {
    step3Completed: boolean;
    step4Completed: boolean;
    step5Completed?: boolean;
    currentStep: number;
  };
}

const VAULT_KEY = 'feedo_partner_registration_vault';

export const registrationStorage = {
  /**
   * Saves partner registration vehicle details, captured photo, and uploaded document references
   * in persistent local vault storage.
   */
  saveRegistrationData(
    payload: PartnerRegistrationStoragePayload
  ): { success: boolean; message: string } {
    try {
      localStorage.setItem(
        VAULT_KEY,
        JSON.stringify({
          ...payload,
          savedAt: new Date().toISOString(),
        })
      );
      return { success: true, message: 'Saved successfully.' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to save registration data.' };
    }
  },

  /**
   * Retrieves saved partner registration details and document references from persistent vault.
   */
  getSavedRegistrationData(): PartnerRegistrationStoragePayload | null {
    try {
      const data = localStorage.getItem(VAULT_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
};

