import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// GET all services - PUBLIC
export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      services,
    });
  } catch (error) {
    console.error('Fetch services error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create service - ADMIN ONLY
export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { name, description, basePrice, duration, icon } = await req.json();

    if (!name || !description || basePrice === undefined || !duration || !icon) {
      return NextResponse.json(
        { success: false, error: 'Missing required service fields.' },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        basePrice: Number(basePrice),
        duration,
        icon,
      },
    });

    return NextResponse.json({
      success: true,
      service,
    });
  } catch (error) {
    console.error('Create service error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
