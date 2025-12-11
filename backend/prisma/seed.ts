import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create societies
  const societies = await Promise.all([
    prisma.society.upsert({
      where: { name: 'CSS' },
      update: {},
      create: {
        name: 'CSS',
        type: 'Tech',
        description: 'Computer Science Society',
      },
    }),
    prisma.society.upsert({
      where: { name: 'URJA' },
      update: {},
      create: {
        name: 'URJA',
        type: 'Fest',
        description: 'College Fest Team',
      },
    }),
    prisma.society.upsert({
      where: { name: 'MLSC' },
      update: {},
      create: {
        name: 'MLSC',
        type: 'Tech',
        description: 'Microsoft Learn Student Club',
      },
    }),
    prisma.society.upsert({
      where: { name: 'ECHOES' },
      update: {},
      create: {
        name: 'ECHOES',
        type: 'Cultural',
        description: 'Music Society',
      },
    }),
    prisma.society.upsert({
      where: { name: 'ECON' },
      update: {},
      create: {
        name: 'ECON',
        type: 'Academic',
        description: 'Economics Society',
      },
    }),
  ])

  console.log('Seeded societies:', societies)

  // Create a sample student user
  const student = await prisma.user.upsert({
    where: { email: 'arjun.kumar@university.edu' },
    update: {},
    create: {
      email: 'arjun.kumar@university.edu',
      name: 'Arjun Kumar',
      rollNo: '2021CS1234',
      year: '3',
      branch: 'CSE',
      password: 'hashedpassword123', // In production, this should be hashed
      role: 'STUDENT',
    },
  })

  console.log('Seeded student:', student)

  // Create a sample EB user
  const eb = await prisma.user.upsert({
    where: { email: 'eb.tech@university.edu' },
    update: {},
    create: {
      email: 'eb.tech@university.edu',
      name: 'Tech Club EB',
      password: 'hashedpassword123',
      role: 'SOCIETY_EB',
    },
  })

  console.log('Seeded EB:', eb)

  // Create a sample president
  const president = await prisma.user.upsert({
    where: { email: 'president.tech@university.edu' },
    update: {},
    create: {
      email: 'president.tech@university.edu',
      name: 'Tech Club President',
      password: 'hashedpassword123',
      role: 'SOCIETY_PRESIDENT',
    },
  })

  console.log('Seeded president:', president)

  // Create sample memberships
  const membership = await prisma.membership.upsert({
    where: {
      userId_societyId: {
        userId: student.id,
        societyId: societies[0].id, // CSS
      },
    },
    update: {},
    create: {
      userId: student.id,
      societyId: societies[0].id,
      status: 'APPROVED',
      proofUrl: 'https://example.com/proof.jpg',
    },
  })

  console.log('Seeded membership:', membership)
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
