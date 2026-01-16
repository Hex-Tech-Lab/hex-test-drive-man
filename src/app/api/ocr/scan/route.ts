import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock valid result
  const mockResult = {
    valid: true,
    extracted: {
      name: 'Ahmed Mohamed',
      idNumber: '29001011234567',
      licenseNumber: '123456'
    },
    imageUrl: '', // Will be overridden by client service
    confidence: 0.95
  };

  return NextResponse.json(mockResult);
}
