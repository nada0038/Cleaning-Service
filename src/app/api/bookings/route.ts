import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// GET all bookings - ADMIN ONLY
export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const bookings = await prisma.booking.findMany({
      include: {
        service: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error('Fetch bookings error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create booking - PUBLIC
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

    const body = await req.json();
    const { customerName, customerEmail, customerPhone, serviceId, date, time, notes } = body;

    // Validation
    if (!customerName || !customerEmail || !customerPhone || !serviceId || !date || !time) {
      return NextResponse.json(
        { success: false, error: 'Missing required booking fields.' },
        { status: 400 }
      );
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address format.' },
        { status: 400 }
      );
    }

    // Lookup service to verify existence and retrieve price
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Selected service does not exist.' },
        { status: 404 }
      );
    }

    // Calculate cost (in production, complex pricing engines could reside here)
    const totalCost = service.basePrice;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        customerName,
        customerEmail: customerEmail.toLowerCase(),
        customerPhone,
        serviceId,
        date,
        time,
        notes,
        totalCost,
        status: 'PENDING',
      },
      include: {
        service: true,
      },
    });

    // Send email notification (Mock / Logged for demonstration)
    console.log(`[EMAIL NOTIFICATION SENT] To: ${customerEmail} | Subject: Booking Confirmation for ${service.name}`);
    console.log(`Dear ${customerName}, your cleaning booking has been received for ${date} at ${time}. Status: PENDING approval.`);
    console.log(`[ADMIN ALERT] New booking received from ${customerName} (${customerEmail}) for ${service.name}.`);

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
