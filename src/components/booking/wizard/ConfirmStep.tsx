'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

interface Models {
  name: string;
  brands: { name: string };
  hero_image_url: string | null;
}

interface VehicleDataRaw {
  id: string;
  trim_name: string;
  model_year: number;
  models: Models | null;
}

interface VehicleData {
  id: string;
  model_name: string;
  brand_name: string;
  year: number;
  hero_image_url: string | null;
  trim_name: string;
}

/**
 *
 */
export default function ConfirmStep({ vehicleId }: { vehicleId: string }) {
  const [vehicle, setVehicle] = useState<VehicleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from('vehicle_trims')
          .select('id, trim_name, model_year, models(name, brands(name), hero_image_url)')
          .eq('id', vehicleId)
          .single() as { data: VehicleDataRaw | null; error: any };

/**
 * Confirm booking step (Step 3)
 * Displays vehicle summary for confirmation
 */
export default function ConfirmStep({ vehicleId }: { vehicleId: string }) {
        const flatVehicle: VehicleData = {
          id: data.id,
          model_name: data.models.name,
          brand_name: data.models.brands.name,
          year: data.model_year,
          hero_image_url: data.models.hero_image_url,
          trim_name: data.trim_name,
        };

        setVehicle(flatVehicle);
      } catch (err: any) {
        console.error('Failed to fetch vehicle:', err);
        setError('Failed to load vehicle details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (vehicleId) fetchVehicle();
  }, [vehicleId]);

  if (loading) return <div>Loading...</div>;
  if (error || !vehicle) return <div>{error || 'Vehicle not found'}</div>;

  return (
    <div>
      <h2>Confirm Your Booking</h2>
      <div>
        <strong>Vehicle:</strong> {vehicle.brand_name} {vehicle.model_name} {vehicle.trim_name}
        <p>Year: {vehicle.year}</p>
        {vehicle.hero_image_url && (
          <img 
            src={vehicle.hero_image_url} 
            alt={`${vehicle.brand_name} ${vehicle.model_name}`} 
            style={{ maxWidth: '200px' }}
          />
        )}
      </div>
      {/* Confirmation form here */}
    </div>
  );
}
