import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// PATCH update service - ADMIN ONLY
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
    const { name, description, basePrice, duration, icon } = await req.json();

    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Service not found.' },
        { status: 404 }
      );
    }

    const updateData: {
      name?: string;
      description?: string;
      basePrice?: number;
      duration?: string;
      icon?: string;
    } = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (basePrice !== undefined) updateData.basePrice = Number(basePrice);
    if (duration !== undefined) updateData.duration = duration;
    if (icon !== undefined) updateData.icon = icon;

    const updated = await prisma.service.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      service: updated,
    });
  } catch (error) {
    console.error('Update service error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE service - ADMIN ONLY
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

    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Service not found.' },
        { status: 404 }
      );
    }

    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully.',
    });
  } catch (error) {
    console.error('Delete service error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
