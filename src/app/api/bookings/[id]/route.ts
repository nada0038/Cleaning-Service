import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// PATCH update booking - ADMIN ONLY
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { status, date, time, notes, totalCost } = body;

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { service: true },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found.' },
        { status: 404 }
      );
    }

    // Build update object
    const updateData: {
      status?: string;
      date?: string;
      time?: string;
      notes?: string;
      totalCost?: number;
    } = {};

    if (status !== undefined) updateData.status = status;
    if (date !== undefined) updateData.date = date;
    if (time !== undefined) updateData.time = time;
    if (notes !== undefined) updateData.notes = notes;
    if (totalCost !== undefined) updateData.totalCost = Number(totalCost);

    // Perform update
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: { service: true },
    });

    // Send notifications if status or date/time changed
    if (status && status !== booking.status) {
      console.log(`[EMAIL NOTIFICATION SENT] To: ${updatedBooking.customerEmail} | Subject: Booking Status Update - ${status}`);
      console.log(`Dear ${updatedBooking.customerName}, your cleaning booking for ${updatedBooking.date} is now ${status}.`);
    } else if ((date && date !== booking.date) || (time && time !== booking.time)) {
      console.log(`[EMAIL NOTIFICATION SENT] To: ${updatedBooking.customerEmail} | Subject: Booking Rescheduled`);
      console.log(`Dear ${updatedBooking.customerName}, your cleaning booking has been rescheduled to ${updatedBooking.date} at ${updatedBooking.time}.`);
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE booking - ADMIN ONLY
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found.' },
        { status: 404 }
      );
    }

    await prisma.booking.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully.',
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
