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
  
  // Clear users (to reset with new credentials)
  await prisma.user.deleteMany({})
  
  // Clear societies
  await prisma.society.deleteMany({})
  
  console.log('✓ Cleared all data')

  // Create the four societies: URJA, TVC, CCS, Mudra
  const societies = await Promise.all([
    prisma.society.create({
      data: {
        name: 'URJA',
        type: 'Fest',
        domain: 'FEST',
        joinCode: 'URJA2024',
        description: 'URJA - Annual Tech Fest',
      },
    }),
    prisma.society.create({
      data: {
        name: 'TVC',
        type: 'Media',
        domain: 'SOCIETY',
        joinCode: 'TVC2024',
        description: 'TIET Video Club - Media & Production Society',
      },
    }),
    prisma.society.create({
      data: {
        name: 'CCS',
        type: 'Tech',
        domain: 'SOCIETY',
        joinCode: 'CCS2024',
        description: 'Creative Computing Society - Tech Society',
      },
    }),
    prisma.society.create({
      data: {
        name: 'Mudra',
        type: 'Cultural',
        domain: 'SOCIETY',
        joinCode: 'MUDRA2024',
        description: 'Mudra - Dance Society',
      },
    }),
  ])

  const [urja, tvc, ccs, mudra] = societies
  console.log('✓ Seeded societies:', societies.map(s => s.name).join(', '))

  // Create multiple EBs for each society
  // EB password format: eb(societyname)@tiet1 (NOT changeable)
  const ebData = [
    // URJA EBs (3 members)
    { email: 'harsh.shrivas@thapar.edu', name: 'Harsh Shrivas', societyId: urja.id, rollNo: '102103101', year: '3', branch: 'CSE', hostel: 'Hostel A', gender: 'Male', password: 'eburja@tiet1' },
    { email: 'aditya.kapoor@thapar.edu', name: 'Aditya Kapoor', societyId: urja.id, rollNo: '102103102', year: '3', branch: 'ECE', hostel: 'Hostel B', gender: 'Male', password: 'eburja@tiet1' },
    { email: 'sneha.malik@thapar.edu', name: 'Sneha Malik', societyId: urja.id, rollNo: '102103103', year: '4', branch: 'CSE', hostel: 'Hostel J', gender: 'Female', password: 'eburja@tiet1' },
    
    // TVC EBs (2 members)
    { email: 'varun.bhardwaj@thapar.edu', name: 'Varun Bhardwaj', societyId: tvc.id, rollNo: '102103201', year: '3', branch: 'CSE', hostel: 'Hostel C', gender: 'Male', password: 'ebtvc@tiet1' },
    { email: 'ishita.sharma@thapar.edu', name: 'Ishita Sharma', societyId: tvc.id, rollNo: '102103202', year: '2', branch: 'IT', hostel: 'Hostel K', gender: 'Female', password: 'ebtvc@tiet1' },
    
    // CCS EBs (3 members)
    { email: 'manish.tiwari@thapar.edu', name: 'Manish Tiwari', societyId: ccs.id, rollNo: '102103301', year: '4', branch: 'CSE', hostel: 'Hostel D', gender: 'Male', password: 'ebccs@tiet1' },
    { email: 'pooja.agarwal@thapar.edu', name: 'Pooja Agarwal', societyId: ccs.id, rollNo: '102103302', year: '3', branch: 'CSE', hostel: 'Hostel L', gender: 'Female', password: 'ebccs@tiet1' },
    { email: 'ravi.shankar@thapar.edu', name: 'Ravi Shankar', societyId: ccs.id, rollNo: '102103303', year: '3', branch: 'ECE', hostel: 'Hostel E', gender: 'Male', password: 'ebccs@tiet1' },
    
    // Mudra EBs (2 members)
    { email: 'divya.kapoor@thapar.edu', name: 'Divya Kapoor', societyId: mudra.id, rollNo: '102103401', year: '2', branch: 'EE', hostel: 'Hostel M', gender: 'Female', password: 'ebmudra@tiet1' },
    { email: 'karan.singh@thapar.edu', name: 'Karan Singh', societyId: mudra.id, rollNo: '102103402', year: '3', branch: 'MECH', hostel: 'Hostel F', gender: 'Male', password: 'ebmudra@tiet1' },
  ]

  const ebUsers = await Promise.all(
    ebData.map(eb => {
      return prisma.user.create({
        data: {
          email: eb.email,
          name: eb.name,
          rollNo: eb.rollNo,
          year: eb.year,
          branch: eb.branch,
          hostel: eb.hostel,
          gender: eb.gender,
          password: eb.password,
          role: 'SOCIETY_EB',
          societyId: eb.societyId,
        },
      })
    })
  )
  console.log('✓ Seeded EB users:', ebUsers.length)

  // Create Presidents for each society
  // Password format: eb(societyname)@tiet1
  const presidentData = [
    { email: 'mohit.arora@thapar.edu', name: 'Mohit Arora', societyId: urja.id, password: 'eburja@tiet1' },
    { email: 'nidhi.saxena@thapar.edu', name: 'Nidhi Saxena', societyId: tvc.id, password: 'ebtvc@tiet1' },
    { email: 'aniket.jain@thapar.edu', name: 'Aniket Jain', societyId: ccs.id, password: 'ebccs@tiet1' },
    { email: 'shreya.bhatia@thapar.edu', name: 'Shreya Bhatia', societyId: mudra.id, password: 'ebmudra@tiet1' },
  ]

  const presidentUsers = await Promise.all(
    presidentData.map(pres => {
      return prisma.user.create({
        data: {
          email: pres.email,
          name: pres.name,
          password: pres.password,
          role: 'SOCIETY_PRESIDENT',
          societyId: pres.societyId,
        },
      })
    })
  )
  console.log('✓ Seeded President users:', presidentUsers.length)

  // Create Faculty Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@thapar.edu',
      name: 'Faculty Admin',
      password: 'admin@tiet1',
      role: 'FACULTY_ADMIN',
    },
  })
  console.log('✓ Seeded admin:', admin.email)

  // Create Guards
  const guard1 = await prisma.user.create({
    data: {
      email: 'guard1@thapar.edu',
      name: 'Guard One',
      password: 'guard@tiet1',
      role: 'GUARD',
    },
  })
  
  const guard2 = await prisma.user.create({
    data: {
      email: 'guard2@thapar.edu',
      name: 'Guard Two',
      password: 'guard@tiet1',
      role: 'GUARD',
    },
  })
  console.log('✓ Seeded guards:', guard1.email, guard2.email)

  // Add EB members as approved members of their respective societies
  // This ensures they appear in member lists and can be included in bulk requests
  const membershipPromises: Promise<any>[] = []
  
  ebUsers.forEach(eb => {
    membershipPromises.push(
      prisma.membership.create({
        data: {
          userId: eb.id,
          societyId: eb.societyId!,
          status: 'APPROVED',
        },
      })
    )
  })
  
  await Promise.all(membershipPromises)
  console.log('✓ Seeded memberships for EB members')

  console.log('\n✅ Database seeding complete!')
  console.log('\n📋 Credentials:')
  console.log('═══════════════════════════════════════════════════════════════')
  
  console.log('\n👥 EB MEMBERS (password: eb<societyname>@tiet1):')
  console.log('─────────────────────────────────────────────────────────────')
  console.log('URJA:')
  ebUsers.filter(e => e.societyId === urja.id).forEach(e => {
    console.log(`   ${e.email} / eburja@tiet1`)
  })
  console.log('TVC:')
  ebUsers.filter(e => e.societyId === tvc.id).forEach(e => {
    console.log(`   ${e.email} / ebtvc@tiet1`)
  })
  console.log('CCS:')
  ebUsers.filter(e => e.societyId === ccs.id).forEach(e => {
    console.log(`   ${e.email} / ebccs@tiet1`)
  })
  console.log('Mudra:')
  ebUsers.filter(e => e.societyId === mudra.id).forEach(e => {
    console.log(`   ${e.email} / ebmudra@tiet1`)
  })
  
  console.log('\n👑 PRESIDENTS:')
  presidentUsers.forEach(p => {
    const societyName = societies.find(s => s.id === p.societyId)?.name?.toLowerCase()
    console.log(`   ${p.email} / eb${societyName}@tiet1`)
  })
  
  console.log('\n🔐 ADMIN:')
  console.log(`   ${admin.email} / admin@tiet1`)
  
  console.log('\n🛡️ GUARDS:')
  console.log(`   ${guard1.email} / guard@tiet1`)
  console.log(`   ${guard2.email} / guard@tiet1`)
  
  console.log('\n📌 Society Join Codes:')
  societies.forEach(s => {
    console.log(`   ${s.name}: ${s.joinCode}`)
  })
  
  console.log('\n📝 STUDENTS: Must register via /signup page')
  console.log('   Password format: (firstname)@tiet1')
  console.log('═══════════════════════════════════════════════════════════════')
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
