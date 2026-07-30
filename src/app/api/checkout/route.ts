import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/db';

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
    const { customerName, customerEmail, customerPhone, serviceId, date, time, notes, paymentMethod } = body;

    if (!customerName || !customerEmail || !customerPhone || !serviceId || !date || !time) {
      return NextResponse.json(
        { success: false, error: 'Missing required booking details' },
        { status: 400 }
      );
    }

    // Verify service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Selected clean service package not found' },
        { status: 404 }
      );
    }

    // Create booking record in database
    const booking = await prisma.booking.create({
      data: {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        customerPhone: customerPhone.trim(),
        serviceId,
        date,
        time,
        notes: notes ? notes.trim() : null,
        totalCost: service.basePrice,
        status: 'PENDING',
        paymentMethod: paymentMethod || 'CASH',
        paymentStatus: 'UNPAID',
      },
      include: {
        service: true,
      },
    });

    // Check if Stripe is configured
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (paymentMethod === 'STRIPE' && stripeSecretKey) {
      const stripe = new Stripe(stripeSecretKey);
      const appProtocol = req.headers.get('x-forwarded-proto') || 'http';
      const appHost = req.headers.get('host') || 'localhost:3000';
      const appOrigin = `${appProtocol}://${appHost}`;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `LuxeShine Service: ${service.name}`,
                description: `Scheduled Date: ${date} at ${time}. Customer: ${customerName}`,
              },
              unit_amount: Math.round(service.basePrice * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${appOrigin}/?booking=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appOrigin}/?booking=cancel`,
        customer_email: customerEmail,
        metadata: {
          bookingId: booking.id,
        },
      });

      // Save Stripe session ID to booking
      await prisma.booking.update({
        where: { id: booking.id },
        data: { stripeSessionId: session.id },
      });

      return NextResponse.json({
        success: true,
        url: session.url,
        booking,
      });
    }

    // If Cash or Stripe secret key not set yet, return standard confirmation
    return NextResponse.json({
      success: true,
      booking,
      message: paymentMethod === 'STRIPE'
        ? 'Booking created! Stripe test mode active.'
        : 'Booking submitted successfully! Our concierge team will confirm your appointment.',
    });
  } catch (error: any) {
    console.error('Checkout creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process checkout request' },
      { status: 500 }
    );
  }
}
