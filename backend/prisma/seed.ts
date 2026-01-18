import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { config } from 'dotenv'

config()

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // Clear operational data
  await prisma.notification.deleteMany({})
  await prisma.academicPermission.deleteMany({})
  await prisma.permissionRequest.deleteMany({})
  await prisma.bulkRequest.deleteMany({})
  await prisma.roomBooking.deleteMany({})
  await prisma.venueBooking.deleteMany({})
  await prisma.membership.deleteMany({})
  
  console.log('✓ Cleared operational data')

  // Create societies with domains and join codes
  const societies = await Promise.all([
    prisma.society.upsert({
      where: { name: 'CSS' },
      update: { domain: 'SOCIETY', joinCode: 'CSS2024' },
      create: {
        name: 'CSS',
        type: 'Tech',
        domain: 'SOCIETY',
        joinCode: 'CSS2024',
        description: 'Computer Science Society',
      },
    }),
    prisma.society.upsert({
      where: { name: 'URJA' },
      update: { domain: 'FEST', joinCode: 'URJA2024' },
      create: {
        name: 'URJA',
        type: 'Fest',
        domain: 'FEST',
        joinCode: 'URJA2024',
        description: 'College Fest Team',
      },
    }),
    prisma.society.upsert({
      where: { name: 'MLSC' },
      update: { domain: 'SOCIETY', joinCode: 'MLSC2024' },
      create: {
        name: 'MLSC',
        type: 'Tech',
        domain: 'SOCIETY',
        joinCode: 'MLSC2024',
        description: 'Microsoft Learn Student Club',
      },
    }),
    prisma.society.upsert({
      where: { name: 'ECHOES' },
      update: { domain: 'SOCIETY', joinCode: 'ECHOES2024' },
      create: {
        name: 'ECHOES',
        type: 'Cultural',
        domain: 'SOCIETY',
        joinCode: 'ECHOES2024',
        description: 'Music Society',
      },
    }),
    prisma.society.upsert({
      where: { name: 'OASIS' },
      update: { domain: 'FEST', joinCode: 'OASIS2024' },
      create: {
        name: 'OASIS',
        type: 'Annual Fest',
        domain: 'FEST',
        joinCode: 'OASIS2024',
        description: 'Annual Cultural Fest',
      },
    }),
  ])

  console.log('✓ Seeded societies:', societies.map(s => s.name).join(', '))

  // Create student user
  const student = await prisma.user.upsert({
    where: { email: 'arjun.kumar@university.edu' },
    update: {},
    create: {
      email: 'arjun.kumar@university.edu',
      name: 'Arjun Kumar',
      rollNo: '2021CS1234',
      year: '3',
      branch: 'CSE',
      password: 'password123',
      role: 'STUDENT',
    },
  })
  console.log('✓ Seeded student:', student.email)

  // Create additional students
  const student1 = await prisma.user.upsert({
    where: { email: 'student.one@university.edu' },
    update: {},
    create: {
      email: 'student.one@university.edu',
      name: 'Student One',
      rollNo: '2024ST01',
      year: '2',
      branch: 'ECE',
      password: 'password123',
      role: 'STUDENT',
    },
  })
  console.log('✓ Seeded student 1:', student1.email)

  const student2 = await prisma.user.upsert({
    where: { email: 'student.two@university.edu' },
    update: {},
    create: {
      email: 'student.two@university.edu',
      name: 'Student Two',
      rollNo: '2024ST02',
      year: '2',
      branch: 'MECH',
      password: 'password123',
      role: 'STUDENT',
    },
  })
  console.log('✓ Seeded student 2:', student2.email)

  // Create EB users for each society
  const ebUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'eb.css@university.edu' },
      update: { societyId: societies[0].id },
      create: {
        email: 'eb.css@university.edu',
        name: 'CSS EB Member',
        password: 'password123',
        role: 'SOCIETY_EB',
        societyId: societies[0].id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'eb.urja@university.edu' },
      update: { societyId: societies[1].id },
      create: {
        email: 'eb.urja@university.edu',
        name: 'URJA EB Member',
        password: 'password123',
        role: 'SOCIETY_EB',
        societyId: societies[1].id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'eb.mlsc@university.edu' },
      update: { societyId: societies[2].id },
      create: {
        email: 'eb.mlsc@university.edu',
        name: 'MLSC EB Member',
        password: 'password123',
        role: 'SOCIETY_EB',
        societyId: societies[2].id,
      },
    }),
  ])
  console.log('✓ Seeded EB users:', ebUsers.map(u => u.email).join(', '))

  // Create President users for each society
  const presidentUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'president.css@university.edu' },
      update: { societyId: societies[0].id },
      create: {
        email: 'president.css@university.edu',
        name: 'CSS President',
        password: 'password123',
        role: 'SOCIETY_PRESIDENT',
        societyId: societies[0].id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'president.urja@university.edu' },
      update: { societyId: societies[1].id },
      create: {
        email: 'president.urja@university.edu',
        name: 'URJA President',
        password: 'password123',
        role: 'SOCIETY_PRESIDENT',
        societyId: societies[1].id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'president.mlsc@university.edu' },
      update: { societyId: societies[2].id },
      create: {
        email: 'president.mlsc@university.edu',
        name: 'MLSC President',
        password: 'password123',
        role: 'SOCIETY_PRESIDENT',
        societyId: societies[2].id,
      },
    }),
  ])
  console.log('✓ Seeded President users:', presidentUsers.map(u => u.email).join(', '))

  // Create Faculty Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@university.edu' },
    update: {},
    create: {
      email: 'admin@university.edu',
      name: 'Faculty Admin',
      password: 'password123',
      role: 'FACULTY_ADMIN',
    },
  })
  console.log('✓ Seeded admin:', admin.email)

  // Create Guard
  const guard = await prisma.user.upsert({
    where: { email: 'guard@university.edu' },
    update: {},
    create: {
      email: 'guard@university.edu',
      name: 'Security Guard',
      password: 'password123',
      role: 'GUARD',
    },
  })
  console.log('✓ Seeded guard:', guard.email)

  // NOTE: No pre-created memberships - students must join societies manually
  console.log('ℹ️  No memberships seeded - students must join via society code')

  console.log('\n✅ Database seeding complete!')
  console.log('\n📋 Test Credentials:')
  console.log('─────────────────────────────────────────────')
  console.log('Student:    arjun.kumar@university.edu / password123')
  console.log('EB (CSS):   eb.css@university.edu / password123')
  console.log('EB (URJA):  eb.urja@university.edu / password123')
  console.log('President:  president.css@university.edu / password123')
  console.log('Admin:      admin@university.edu / password123')
  console.log('Guard:      guard@university.edu / password123')
  console.log('─────────────────────────────────────────────')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
