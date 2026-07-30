import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import { getAuthUser, signToken } from '@/lib/auth';

// PATCH /api/admin/profile - Update admin name, email, or password
export async function PATCH(req: Request) {
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

    // Authenticate Admin User
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const { currentPassword, newName, newEmail, newPassword } = await req.json();

    if (!currentPassword) {
      return NextResponse.json(
        { success: false, error: 'Current password is required to verify identity' },
        { status: 400 }
      );
    }

    // Retrieve full user record
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Validate email uniqueness if email is changing
    let targetEmail = user.email;
    if (newEmail && newEmail.toLowerCase() !== user.email.toLowerCase()) {
      const emailLower = newEmail.toLowerCase().trim();
      const existingUser = await prisma.user.findUnique({
        where: { email: emailLower },
      });

      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json(
          { success: false, error: 'Email address is already in use by another account' },
          { status: 400 }
        );
      }
      targetEmail = emailLower;
    }

    // Prepare update fields
    const dataToUpdate: { name?: string; email?: string; password?: string } = {};
    if (newName && newName.trim()) dataToUpdate.name = newName.trim();
    if (targetEmail !== user.email) dataToUpdate.email = targetEmail;

    if (newPassword && newPassword.trim()) {
      if (newPassword.trim().length < 6) {
        return NextResponse.json(
          { success: false, error: 'New password must be at least 6 characters long' },
          { status: 400 }
        );
      }
      dataToUpdate.password = await bcrypt.hash(newPassword.trim(), 10);
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No changes provided to update' },
        { status: 400 }
      );
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: dataToUpdate,
    });

    // Create fresh JWT token with updated credentials
    const token = signToken({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
    });

    // Send success response with new auth cookie
    const response = NextResponse.json({
      success: true,
      message: 'Account credentials updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update credentials' },
      { status: 500 }
    );
  }
}
