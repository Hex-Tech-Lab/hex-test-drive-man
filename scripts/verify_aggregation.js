const vehicles = [
  // Brand 1: Nissan (id: b1)
  {
    model_id: 'm1', // FIXED: model_id present
    model_year: 2025,
    price_egp: 1000000,
    trim_name: 'X-Trail Trim 1',
    models: { name: 'X-Trail', brands: { id: 'b1', name: 'Nissan' } }
  },
  {
    model_id: 'm2', // FIXED: Distinct model_id
    model_year: 2025,
    price_egp: 800000,
    trim_name: 'Sunny Trim 1',
    models: { name: 'Sunny', brands: { id: 'b1', name: 'Nissan' } }
  },
  // Brand 2: Toyota (id: b2)
  {
    model_id: 'm3', // FIXED: Distinct model_id
    model_year: 2025,
    price_egp: 1500000,
    trim_name: 'Corolla Trim 1',
    models: { name: 'Corolla', brands: { id: 'b2', name: 'Toyota' } }
  }
];

const aggregated = vehicles.reduce((acc, vehicle) => {
  // Logic from page.tsx
  const groupKey = `${vehicle.models.brands.id}_${vehicle.model_id}_${vehicle.model_year}`;
  
  if (!acc[groupKey]) {
    acc[groupKey] = {
      ...vehicle,
      trimCount: 1,
      trimNames: vehicle.trim_name,
    };
  } else {
    acc[groupKey].trimCount++;
    acc[groupKey].trimNames += `, ${vehicle.trim_name}`;
  }
  
  return acc;
}, {});

const results = Object.values(aggregated);

console.log(`Input vehicles: ${vehicles.length}`);
console.log(`Aggregated groups: ${results.length}`);

results.forEach((group, i) => {
  console.log(`Group ${i+1}: Key=${group.models.brands.id}_${group.model_id}_${group.model_year}`);
  console.log(`  Brand: ${group.models.brands.name}`);
  console.log(`  Models/Trims in group: ${group.trimNames}`);
  console.log(`  Count: ${group.trimCount}`);
});

if (results.length === 3) {
    console.log("\n✅  VERIFIED: Adding model_id fixes the aggregation!");
} else {
    console.log("\n❌  FAILED: Still merging incorrectly.");
}
