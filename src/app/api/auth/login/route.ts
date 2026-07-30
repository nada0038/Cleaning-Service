import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import { signToken } from '@/lib/auth';

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

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Sign token
    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    // Set cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    const isDbUninitialized = error?.code === 'P2021' || error?.message?.includes('does not exist');
    return NextResponse.json(
      { 
        success: false, 
        error: isDbUninitialized 
          ? 'Database tables not initialized. Please run database migrations.' 
          : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
