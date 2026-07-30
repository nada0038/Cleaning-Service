import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// POST /api/auth/forgot-email - Recover registered admin email address
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

    const { name } = await req.json();

    // Query all admin users
    const adminUsers = await prisma.user.findMany({
      where: { role: 'admin' },
      select: { email: true, name: true, createdAt: true },
    });

    if (adminUsers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No admin accounts found in the system.' },
        { status: 444 }
      );
    }

    // Filter by name if provided, otherwise return default admin emails
    let matchedAdmins = adminUsers;
    if (name && name.trim()) {
      const nameQuery = name.trim().toLowerCase();
      const filtered = adminUsers.filter(a => a.name.toLowerCase().includes(nameQuery));
      if (filtered.length > 0) {
        matchedAdmins = filtered;
      }
    }

    const emailsList = matchedAdmins.map(a => a.email);

    return NextResponse.json({
      success: true,
      message: `Found ${matchedAdmins.length} registered admin account(s).`,
      emails: emailsList,
      primaryEmail: emailsList[0],
    });
  } catch (error: any) {
    console.error('Forgot email error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to recover admin email' },
      { status: 500 }
    );
  }
}
