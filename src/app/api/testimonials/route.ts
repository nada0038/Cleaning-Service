import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// GET testimonials - PUBLIC (approved only) or ADMIN (all)
export async function GET() {
  try {
    const user = await getAuthUser();
    const isAdmin = user && user.role === 'admin';

    const testimonials = await prisma.testimonial.findMany({
      where: isAdmin ? {} : { approved: true },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      testimonials,
    });
  } catch (error) {
    console.error('Fetch testimonials error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create testimonial - PUBLIC (pending approval)
export async function POST(req: Request) {
  try {
    const { author, company, rating, text, image } = await req.json();

    if (!author || !rating || !text) {
      return NextResponse.json(
        { success: false, error: 'Author, rating and review text are required.' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5.' },
        { status: 400 }
      );
    }

    // Default placeholder image if none provided
    const avatarUrl = image || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop`;

    const testimonial = await prisma.testimonial.create({
      data: {
        author,
        company,
        rating: Number(rating),
        text,
        image: avatarUrl,
        approved: false, // Must be approved by admin
      },
    });

    return NextResponse.json({
      success: true,
      testimonial,
      message: 'Testimonial submitted successfully. It will be visible once approved by our administrator.',
    });
  } catch (error) {
    console.error('Create testimonial error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
