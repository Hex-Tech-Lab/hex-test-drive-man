import { NextResponse } from 'next/server';

/**
 * GET /api/health
 * Health check endpoint for production deployment verification
 */
export async function GET() {
  const deploymentInfo = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
    commit: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
    branch: process.env.VERCEL_GIT_COMMIT_REF || 'unknown',
  };

  return NextResponse.json(deploymentInfo, { status: 200 });
}
