import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

  // Step 1: Vehicle + Appointment (vehicle inherited from URL)
  vehicleId: string | null;
  setVehicleId: (id: string) => void;

  appointment: {
    date: string; // ISO 8601 date
    time: string; // HH:mm format
    venue: string; // Location name
  };
  setAppointment: (
    appointment: Partial<BookingWizardState['appointment']>
  ) => void;

  // Step 2: Documents
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

/**
 * Booking wizard store
 * Persists only step and vehicleId to localStorage
 * Sensitive data (documents, phone, OTP) not persisted for security
 */
export const useBookingWizardStore = create<BookingWizardState>()(
  persist(
    (set, get) => ({
      // Initial state
      step: 1,
      vehicleId: null,
      appointment: {
        date: '',
        time: '',
        venue: 'Cairo Showroom', // Default
      },
      documents: {
        nationalId: null,
        driversLicense: null,
        extractedData: {
          nationalIdNumber: null,
          name: null,
          dateOfBirth: null,
        },
      },
      customer: {
        phone: '',
      },
      otp: {
        sent: false,
        code: '',
        verified: false,
        attempts: 0,
        expiresAt: null,
      },
      booking: {
        id: null,
        confirmed: false,
      },

      // Setters
      setStep: (step) => set({ step }),
      setVehicleId: (id) => set({ vehicleId: id }),
      setAppointment: (appointment) =>
        set((state) => ({
          appointment: { ...state.appointment, ...appointment },
        })),
      setDocuments: (documents) =>
        set((state) => ({
          documents: { ...state.documents, ...documents },
        })),
      setCustomer: (customer) =>
        set((state) => ({
          customer: { ...state.customer, ...customer },
        })),
      setOtp: (otp) =>
        set((state) => ({
          otp: { ...state.otp, ...otp },
        })),
      setBooking: (booking) =>
        set((state) => ({
          booking: { ...state.booking, ...booking },
        })),

      // Validation
      /**
       * Check if can proceed to Step 2 (ID Upload)
       * Requires: date, time, and venue filled
       */
      canProceedToStep2: () => {
        const { appointment } = get();
        console.log("Store appointment:", appointment);
        console.log("canProceedToStep2 checks:", {
          dateLen: appointment.date?.length || 0,
          timeLen: appointment.time?.length || 0,
          venueLen: appointment.venue?.length || 0
        });
        return (
          appointment.date?.length > 0 && appointment.date.trim().length > 0 &&
          appointment.time?.length > 0 && appointment.time.trim().length > 0 &&
          appointment.venue?.length > 0 && appointment.venue.trim().length > 0
        );
      },

      /**
       * Check if can proceed to Step 3 (Confirm)
       * Requires: both documents uploaded
       */
      canProceedToStep3: () => {
        const { documents } = get();
        return (
          documents.nationalId !== null && documents.driversLicense !== null
        );
      },

      /**
       * Reset all state to initial values
       * Called after successful booking or cancellation
       */
      reset: () =>
        set({
          step: 1,
          vehicleId: null,
          appointment: {
            date: '',
            time: '',
            venue: 'Cairo Showroom',
          },
          documents: {
            nationalId: null,
            driversLicense: null,
            extractedData: {
              nationalIdNumber: null,
              name: null,
              dateOfBirth: null,
            },
          },
          customer: {
            phone: '',
          },
          otp: {
            sent: false,
            code: '',
            verified: false,
            attempts: 0,
            expiresAt: null,
          },
          booking: {
            id: null,
            confirmed: false,
          },
        }),
    }),
    {
      name: 'booking-wizard-storage',
      partialize: (state) => ({
        // Only persist step and vehicleId
        step: state.step,
        vehicleId: state.vehicleId,
        // Don't persist sensitive data (phone, documents, OTP)
      }),
    }
  )
);
