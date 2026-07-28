import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// GET contact messages - ADMIN ONLY
export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const messages = await prisma.contactMessage.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error('Fetch contact messages error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create contact message - PUBLIC
export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, email and message are required.' },
        { status: 400 }
      );
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address format.' },
        { status: 400 }
      );
    }

    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email: email.toLowerCase(),
        subject: subject || 'General Inquiry',
        message,
        read: false,
      },
    });

    // Send notifications (Mock / Logged for demonstration)
    console.log(`[CONTACT EMAIL NOTIFICATION] To Admin | From: ${name} (${email}) | Subject: ${subject}`);
    console.log(`Message Content: ${message}`);

    return NextResponse.json({
      success: true,
      contactMessage,
      message: 'Your message has been sent successfully. We will get in touch with you shortly!',
    });
  } catch (error) {
    console.error('Create contact message error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
