import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ocrService, ScanResult } from '@/services/ocr/ocrService';

/**
 * Booking wizard state interface
 * Manages 3-step booking flow:
 * 1. Date/Time/Venue (vehicle inherited from URL)
 * 2. ID + Driver's License upload
 * 3. Confirm + OTP verification
 */
export interface BookingWizardState {
  // Navigation
  step: 1 | 2 | 3;
  setStep: (step: 1 | 2 | 3) => void;

  // Step 1: Vehicle + Appointment
  vehicleId: string | null;
  setVehicleId: (id: string) => void;

  appointment: {
    date: string;
    time: string;
    venue: string;
  };
  setAppointment: (appointment: Partial<BookingWizardState['appointment']>) => void;

  // Step 2: Documents (Legacy & OCR)
  documents: {
    nationalId: File | null;
    driversLicense: File | null;
    extractedData: {
      nationalIdNumber: string | null;
      name: string | null;
      dateOfBirth: string | null;
    };
  };
  setDocuments: (documents: Partial<BookingWizardState['documents']>) => void;

  // New OCR Slots
  idFront: ScanResult | null;
  idBack: ScanResult | null;
  licenseFront: ScanResult | null;
  licenseBack: ScanResult | null;
  scanDocument: (image: Blob, type: 'id'|'license', side: 'front'|'back') => Promise<void>;
  allDocumentsValid: () => boolean;

  // Step 3: Customer + OTP
  customer: {
    phone: string;
  };
  setCustomer: (customer: Partial<BookingWizardState['customer']>) => void;

  otp: {
    sent: boolean;
    code: string;
    verified: boolean;
    attempts: number;
    expiresAt: string | null;
  };
  setOtp: (otp: Partial<BookingWizardState['otp']>) => void;

  // Booking result
  booking: {
    id: string | null;
    confirmed: boolean;
  };
  setBooking: (booking: Partial<BookingWizardState['booking']>) => void;

  // Actions
  reset: () => void;
  canProceedToStep2: () => boolean;
  canProceedToStep3: () => boolean;
}

export const useBookingWizardStore = create<BookingWizardState>()(
  persist(
    (set, get) => ({
      // Initial state
      step: 1,
      vehicleId: null,
      appointment: { date: '', time: '', venue: 'Cairo Showroom' },
      documents: {
        nationalId: null,
        driversLicense: null,
        extractedData: { nationalIdNumber: null, name: null, dateOfBirth: null },
      },
      idFront: null, idBack: null, licenseFront: null, licenseBack: null,
      customer: { phone: '' },
      otp: { sent: false, code: '', verified: false, attempts: 0, expiresAt: null },
      booking: { id: null, confirmed: false },

      // Setters
      setStep: (step) => set({ step }),
      setVehicleId: (id) => set({ vehicleId: id }),
      setAppointment: (appointment) => set((state) => ({ appointment: { ...state.appointment, ...appointment } })),
      setDocuments: (documents) => set((state) => ({ documents: { ...state.documents, ...documents } })),
      setCustomer: (customer) => set((state) => ({ customer: { ...state.customer, ...customer } })),
      setOtp: (otp) => set((state) => ({ otp: { ...state.otp, ...otp } })),
      setBooking: (booking) => set((state) => ({ booking: { ...state.booking, ...booking } })),

      // OCR Action
      scanDocument: async (image, type, side) => {
        try {
          const result = await ocrService.scanImage(image, type, side);
          const key = `${type}${side.charAt(0).toUpperCase() + side.slice(1)}` as 'idFront' | 'idBack' | 'licenseFront' | 'licenseBack';
          
          set((state) => {
             const updates: Partial<BookingWizardState> = { [key]: result };
             
             if (result.valid && result.extracted) {
               updates.documents = {
                 ...state.documents,
                 extractedData: {
                   ...state.documents.extractedData,
                   name: result.extracted.name || state.documents.extractedData.name,
                   nationalIdNumber: result.extracted.idNumber || state.documents.extractedData.nationalIdNumber,
                 }
               };
             }
             return updates;
          });
        } catch (error) {
          console.error('OCR failed:', error);
        }
      },

      allDocumentsValid: () => {
        const state = get();
        return ocrService.validateAllSlots({
            id: { front: state.idFront, back: state.idBack },
            license: { front: state.licenseFront, back: state.licenseBack }
        });
      },

      // Validation
      canProceedToStep2: () => {
        const { appointment } = get();
        return (
          appointment.date.trim().length > 0 &&
          appointment.time.trim().length > 0 &&
          appointment.venue.trim().length > 0
        );
      },

      canProceedToStep3: () => {
        return get().allDocumentsValid();
      },

      reset: () =>
        set({
          step: 1,
          vehicleId: null,
          appointment: { date: '', time: '', venue: 'Cairo Showroom' },
          documents: {
            nationalId: null,
            driversLicense: null,
            extractedData: { nationalIdNumber: null, name: null, dateOfBirth: null },
          },
          idFront: null, idBack: null, licenseFront: null, licenseBack: null,
          customer: { phone: '' },
          otp: { sent: false, code: '', verified: false, attempts: 0, expiresAt: null },
          booking: { id: null, confirmed: false },
        }),
    }),
    {
      name: 'booking-wizard-storage',
      partialize: (state) => ({
        step: state.step,
        vehicleId: state.vehicleId,
      }),
    },
  ),
);