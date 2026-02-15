import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Categories
  console.log('Creating categories...');
  const categories = [
    { name: 'Network Issue', department: 'IT' },
    { name: 'Lab Equipment', department: 'IT' },
    { name: 'Power Outage', department: 'Electrical' },
    { name: 'Lighting Problem', department: 'Electrical' },
    { name: 'Building Maintenance', department: 'Civil' },
    { name: 'Classroom Facility', department: 'Civil' },
    { name: 'Equipment Repair', department: 'Mechanical' },
    { name: 'HVAC Issue', department: 'Mechanical' },
    { name: 'Document Request', department: 'Administration' },
    { name: 'General Inquiry', department: 'Administration' }
  ];

  for (const category of categories) {
    await db.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  console.log('Categories created');

  // Create Default Admin
  const hashedPassword = await bcrypt.hash('haseeb123', 10);
  
  await db.user.upsert({
    where: { email: 'haseeb123@gmail.com' },
    update: {},
    create: {
      name: 'Haseeb Admin',
      email: 'haseeb123@gmail.com',
      password: hashedPassword,
      role: 'ADMIN',
      department: 'Administration',
    },
  });

  console.log('Default admin created');

  // Create Sample Technicians
  console.log('Creating sample technicians...');
  
  await db.user.upsert({
    where: { email: 'tech.it@scfms.com' },
    update: {},
    create: {
      name: 'John IT',
      email: 'tech.it@scfms.com',
      password: hashedPassword,
      role: 'TECHNICIAN',
      department: 'IT',
    },
  });

  await db.user.upsert({
    where: { email: 'tech.electrical@scfms.com' },
    update: {},
    create: {
      name: 'Sarah Electrical',
      email: 'tech.electrical@scfms.com',
      password: hashedPassword,
      role: 'TECHNICIAN',
      department: 'Electrical',
    },
  });

  await db.user.upsert({
    where: { email: 'tech.civil@scfms.com' },
    update: {},
    create: {
      name: 'Mike Civil',
      email: 'tech.civil@scfms.com',
      password: hashedPassword,
      role: 'TECHNICIAN',
      department: 'Civil',
    },
  });

  console.log('Sample technicians created');

  // Create Sample Students
  await db.user.upsert({
    where: { email: 'student1@university.edu' },
    update: {},
    create: {
      name: 'Alice Student',
      email: 'student1@university.edu',
      password: hashedPassword,
      role: 'STUDENT',
      studentId: 'STU2024001',
      department: 'Computer Science',
    },
  });

  await db.user.upsert({
    where: { email: 'student2@university.edu' },
    update: {},
    create: {
      name: 'Bob Student',
      email: 'student2@university.edu',
      password: hashedPassword,
      role: 'STUDENT',
      studentId: 'STU2024002',
      department: 'Engineering',
    },
  });

  console.log('Sample students created');
  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
