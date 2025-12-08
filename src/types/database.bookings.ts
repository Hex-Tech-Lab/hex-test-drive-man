// Generated TypeScript types for bookings table
// Auto-generated from Supabase migration: 20251208_create_bookings_table.sql
// DO NOT EDIT MANUALLY - Regenerate using: supabase gen types typescript

export interface Database {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: string;
          customer_name: string;
          customer_phone: string;
          customer_email: string | null;
          vehicle_trim_id: string;
          preferred_date: string; // date
          preferred_time_slot: string | null;
          notes: string | null;
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'converted_to_session';
          converted_to_session_id: string | null;
          created_at: string; // timestamptz
          updated_at: string; // timestamptz
        };
        Insert: {
          id?: string;
          customer_name: string;
          customer_phone: string;
          customer_email?: string | null;
          vehicle_trim_id: string;
          preferred_date: string;
          preferred_time_slot?: string | null;
          notes?: string | null;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'converted_to_session';
          converted_to_session_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string | null;
          vehicle_trim_id?: string;
          preferred_date?: string;
          preferred_time_slot?: string | null;
          notes?: string | null;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'converted_to_session';
          converted_to_session_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'bookings_vehicle_trim_id_fkey';
            columns: ['vehicle_trim_id'];
            isOneToOne: false;
            referencedRelation: 'vehicle_trims';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bookings_converted_to_session_id_fkey';
            columns: ['converted_to_session_id'];
            isOneToOne: false;
            referencedRelation: 'test_drive_sessions';
            referencedColumns: ['id'];
          }
        ];
      };
    };
  };
}
