const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function runTests() {
  console.log('--- STARTING DATABASE & API MODEL VERIFICATION ---');

  try {
    // 1. Verify Prisma Connection
    console.log('Testing Prisma connection...');
    const userCount = await prisma.user.count();
    console.log(`✓ Database accessible. Admin count: ${userCount}`);

    // 2. Validate Service Fetching
    console.log('Testing Service schema retrieval...');
    const services = await prisma.service.findMany();
    if (services.length > 0) {
      console.log(`✓ Services loaded. Total: ${services.length}`);
      console.log(`  First Package: ${services[0].name} ($${services[0].basePrice})`);
    } else {
      throw new Error('No services found in database! Seed might be missing.');
    }

    // 3. Test Booking Creation & Cost logic
    console.log('Testing Booking model creation validation...');
    const testBooking = await prisma.booking.create({
      data: {
        customerName: 'Test Verify Client',
        customerEmail: 'verify@example.com',
        customerPhone: '+1 (555) 999-0000',
        serviceId: services[0].id,
        date: '2026-08-15',
        time: '11:00',
        notes: 'Verification test booking',
        totalCost: services[0].basePrice,
      },
    });
    console.log(`✓ Booking successfully written to SQLite database: ${testBooking.id}`);

    // 4. Test ContactMessage Creation
    console.log('Testing ContactMessage model creation...');
    const testMessage = await prisma.contactMessage.create({
      data: {
        name: 'Test Sender',
        email: 'sender@example.com',
        subject: 'API Verification Inquiry',
        message: 'This message verifies database inbox schema integrity.',
      },
    });
    console.log(`✓ Contact message written to SQLite database: ${testMessage.id}`);

    // 5. Cleanup test data
    console.log('Cleaning up verification records...');
    await prisma.booking.delete({ where: { id: testBooking.id } });
    await prisma.contactMessage.delete({ where: { id: testMessage.id } });
    console.log('✓ Cleanup complete.');

    console.log('--- ALL MODEL INTEGRITY CHECKS COMPLETED SUCCESSFULLY ---');
  } catch (error) {
    console.error('✗ VERIFICATION FAILED WITH ERROR:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
