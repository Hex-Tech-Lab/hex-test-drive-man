// Vehicles by IDs API endpoint
// Created: 2026-01-07
// Agent: BB
// Phase 0: Favorites Feature

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { Vehicle, AggregatedVehicle } from '@/types/vehicle';

const VEHICLE_SELECT = `
  id,
  trim_name,
  model_year,
  price_egp,
  model_id,
  category_id,
  transmission_id,
  fuel_type_id,
  body_style_id,
  segment_id,
  country_of_origin_id,
  agent_id,
  engine,
  seats,
  horsepower,
  torque_nm,
  acceleration_0_100,
  top_speed,
  fuel_consumption,
  features,
  placeholder_image_url,
  trim_count,
  is_imported,
  is_electric,
  is_hybrid,
  models!inner(
    name,
    hero_image_url,
    hover_image_url,
    brands!inner(
      id,
      name,
      logo_url
    )
  ),
  categories(name),
  transmissions(name),
  fuel_types(name),
  body_styles(name_en, name_ar, icon_url),
  segments(code, name_en, name_local),
  countries(name_en, name_ar, flag_url),
  agents(name_en, name_ar, logo_url),
  venue_trims(
    venues(id, name)
  ),
  vehicle_images(
    image_url,
    display_order,
    is_primary,
    image_type
  )
`;

/**
 * POST /api/vehicles/by-ids - Get vehicles by array of IDs
 * Body: { ids: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: ids array is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from('vehicle_trims')
      .select(VEHICLE_SELECT)
      .in('id', ids);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Aggregate vehicles by model (same logic as catalog page)
    const vehicles = data as unknown as Vehicle[];
    const aggregatedMap = new Map<string, AggregatedVehicle>();

    vehicles.forEach((vehicle) => {
      const key = `${vehicle.model_id}-${vehicle.model_year}`;
      
      if (!aggregatedMap.has(key)) {
        // First trim for this model-year combination
        aggregatedMap.set(key, {
          ...vehicle,
          modelId: vehicle.model_id,
          trims: [vehicle],
          minPrice: vehicle.price_egp,
          maxPrice: vehicle.price_egp,
          trimCount: 1,
          trimNames: vehicle.trim_name,
        });
      } else {
        // Add trim to existing aggregated vehicle
        const existing = aggregatedMap.get(key)!;
        existing.trims.push(vehicle);
        existing.minPrice = Math.min(existing.minPrice, vehicle.price_egp);
        existing.maxPrice = Math.max(existing.maxPrice, vehicle.price_egp);
        existing.trimCount = existing.trims.length;
        existing.trimNames = existing.trims.map((t) => t.trim_name).join(', ');
      }
    });

    const aggregatedVehicles = Array.from(aggregatedMap.values());

    return NextResponse.json(aggregatedVehicles);
  } catch (error) {
    console.error('POST /api/vehicles/by-ids error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
