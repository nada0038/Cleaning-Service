import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// PATCH update testimonial (e.g. approve) - ADMIN ONLY
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
    const { approved, author, company, rating, text } = await req.json();

    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!testimonial) {
      return NextResponse.json(
        { success: false, error: 'Testimonial not found.' },
        { status: 404 }
      );
    }

    const updateData: {
      approved?: boolean;
      author?: string;
      company?: string;
      rating?: number;
      text?: string;
    } = {};

    if (approved !== undefined) updateData.approved = Boolean(approved);
    if (author !== undefined) updateData.author = author;
    if (company !== undefined) updateData.company = company;
    if (rating !== undefined) updateData.rating = Number(rating);
    if (text !== undefined) updateData.text = text;

    const updated = await prisma.testimonial.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      testimonial: updated,
    });
  } catch (error) {
    console.error('Update testimonial error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE testimonial - ADMIN ONLY
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

    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!testimonial) {
      return NextResponse.json(
        { success: false, error: 'Testimonial not found.' },
        { status: 404 }
      );
    }

    await prisma.testimonial.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Testimonial deleted successfully.',
    });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
