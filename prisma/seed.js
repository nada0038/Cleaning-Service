const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clear existing data to avoid duplicates on re-run
  await prisma.booking.deleteMany({});
  await prisma.contactMessage.deleteMany({});
  await prisma.testimonial.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Admin User
  const hashedPassword = await bcrypt.hash('adminpassword123!', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@luxeshine.com',
      password: hashedPassword,
      name: 'LuxeShine Admin',
      role: 'admin',
    },
  });
  console.log(`Created admin user: ${admin.email}`);

  // 3. Services
  const services = [
    {
      name: 'Regular Maintenance Clean',
      description: 'Standard upkeep clean covering thorough dusting, vacuuming, mopping, kitchen sanitizing, and sparkling bathrooms.',
      basePrice: 90,
      duration: '2 hours',
      icon: 'Home',
    },
    {
      name: 'Deep Cleaning Special',
      description: 'Comprehensive top-to-bottom scrub down including baseboards, door frames, light switches, outside appliances, and heavy dusting.',
      basePrice: 160,
      duration: '4 hours',
      icon: 'Sparkles',
    },
    {
      name: 'End of Lease Cleaning',
      description: 'Agency-approved cleaning designed to secure your bond. Includes inside ovens, windows, tracks, sills, and complete sanitation.',
      basePrice: 290,
      duration: '6 hours',
      icon: 'Key',
    },
    {
      name: 'Commercial & Office Clean',
      description: 'Tailored workspace sanitization, trash recycling, desk disinfection, restroom deep clean, and common room dusting.',
      basePrice: 220,
      duration: '3 hours',
      icon: 'Briefcase',
    },
  ];

  for (const s of services) {
    const created = await prisma.service.create({ data: s });
    console.log(`Created service: ${created.name} (${created.id})`);
  }

  // Get service IDs for reference if needed
  const dbServices = await prisma.service.findMany();
  const regularService = dbServices.find(s => s.name.includes('Regular'));

  // 4. Testimonials
  const testimonials = [
    {
      author: 'Sarah Jenkins',
      company: 'Homeowner',
      rating: 5,
      text: 'LuxeShine is in a class of their own! The attention to detail is remarkable. My house looks and smells like a 5-star hotel every single time they clean.',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
      approved: true,
    },
    {
      author: 'Michael Chen',
      company: 'Zenith Tech Group',
      rating: 5,
      text: 'We hired them for our office deep clean and were so impressed that we signed up for weekly service. Highly professional, punctual, and trust-worthy.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
      approved: true,
    },
    {
      author: 'Emily Rodriguez',
      company: 'Tenant Client',
      rating: 5,
      text: 'The end of lease clean was absolutely spotless! Got my full rental bond back without a single issue. The booking wizard online was super intuitive to use.',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
      approved: true,
    },
  ];

  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }
  console.log('Created testimonials.');

  // 5. Create 2 Sample Bookings for Admin display
  if (regularService) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);

    await prisma.booking.create({
      data: {
        customerName: 'Johnathan Smith',
        customerEmail: 'john@example.com',
        customerPhone: '+1 (555) 234-5678',
        serviceId: regularService.id,
        date: tomorrow.toISOString().split('T')[0],
        time: '10:00',
        notes: 'Please pay extra attention to the master bathroom shower tiles.',
        status: 'PENDING',
        totalCost: regularService.basePrice,
      },
    });

    await prisma.booking.create({
      data: {
        customerName: 'Alice Henderson',
        customerEmail: 'alice@example.com',
        customerPhone: '+1 (555) 876-5432',
        serviceId: regularService.id,
        date: dayAfter.toISOString().split('T')[0],
        time: '14:30',
        notes: 'Access key is in the lockbox next to the front door. Code is 4829.',
        status: 'APPROVED',
        totalCost: regularService.basePrice,
      },
    });
    console.log('Created sample bookings.');
  }

  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
