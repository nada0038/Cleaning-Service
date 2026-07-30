import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/db';

// POST /api/auth/forgot-password - Request password reset token
export async function POST(req: Request) {
  try {
    // CSRF Protection Check
    const origin = req.headers.get('origin');
    const host = req.headers.get('host');
    if (origin && host && !origin.includes(host)) {
      return NextResponse.json(
        { success: false, error: 'Cross-Site Request Forgery check failed' },
        { status: 403 }
      );
    }

    const { email } = await req.json();

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    const emailLower = email.trim().toLowerCase();

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    // Always respond with success to prevent user enumeration attacks
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with that email, reset instructions have been generated.',
      });
    }

    // Clean up any old reset tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: emailLower },
    });

    // Generate secure 32-byte hex token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // Valid for 1 hour

    // Save token to database
    await prisma.passwordResetToken.create({
      data: {
        email: emailLower,
        token,
        expiresAt,
      },
    });

    // Construct reset link URL
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const reqHost = req.headers.get('host') || 'localhost:3000';
    const resetUrl = `${protocol}://${reqHost}/admin/reset-password?token=${token}`;

    console.log(`[PASSWORD RESET LINK] For ${emailLower}: ${resetUrl}`);

    return NextResponse.json({
      success: true,
      message: 'Password reset link generated successfully.',
      resetUrl, // Return resetUrl for easy demonstration / fallback logging
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
