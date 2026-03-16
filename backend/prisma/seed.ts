import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌊 Seeding Sagar Darpan database...');

  // 1. Create demo users
  const passwordHash = await bcrypt.hash('admin123', 12);
  const researcherHash = await bcrypt.hash('research123', 12);
  const fishermanHash = await bcrypt.hash('fish123', 12);
  const userHash = await bcrypt.hash('user123', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@sagardarpan.in' },
    update: {},
    create: { email: 'admin@sagardarpan.in', passwordHash, fullName: 'Dr. Arjun Nair', role: 'ADMIN' },
  });

  const researcherUser = await prisma.user.upsert({
    where: { email: 'researcher@sagardarpan.in' },
    update: {},
    create: { email: 'researcher@sagardarpan.in', passwordHash: researcherHash, fullName: 'Dr. Priya Menon', role: 'RESEARCHER' },
  });

  const fishermanUser = await prisma.user.upsert({
    where: { email: 'fisher@sagardarpan.in' },
    update: {},
    create: { email: 'fisher@sagardarpan.in', passwordHash: fishermanHash, fullName: 'Rajan Pillai', role: 'FISHERMAN' },
  });

  const generalUser = await prisma.user.upsert({
    where: { email: 'user@sagardarpan.in' },
    update: {},
    create: { email: 'user@sagardarpan.in', passwordHash: userHash, fullName: 'Ananya Sharma', role: 'GENERAL' },
  });

  console.log('✅ Users created');

  // 2. Create IoT Sensors
  const sensor1 = await prisma.ioTSensor.upsert({
    where: { id: 'sensor-b-101' },
    update: {},
    create: {
      id: 'sensor-b-101',
      sensorName: 'Buoy B-101',
      latitude: 15.4,
      longitude: 73.8,
      deploymentDate: new Date('2023-01-15'),
      status: 'ACTIVE',
    },
  });

  const sensor2 = await prisma.ioTSensor.upsert({
    where: { id: 'sensor-b-102' },
    update: {},
    create: {
      id: 'sensor-b-102',
      sensorName: 'Buoy B-102',
      latitude: 12.9,
      longitude: 74.8,
      deploymentDate: new Date('2023-03-20'),
      status: 'ACTIVE',
    },
  });

  const sensor3 = await prisma.ioTSensor.upsert({
    where: { id: 'sensor-d-201' },
    update: {},
    create: {
      id: 'sensor-d-201',
      sensorName: 'Drone D-201',
      latitude: 13.8,
      longitude: 74.2,
      deploymentDate: new Date('2024-06-10'),
      status: 'MAINTENANCE',
    },
  });

  console.log('✅ Sensors created');

  // 3. Create sensor readings (12 readings per sensor)
  const baseDate = new Date('2025-01-01');
  const makeSensorData = (sensorId: string, tempBase: number, salBase: number, phBase: number) =>
    Array.from({ length: 12 }, (_, i) => ({
      sensorId,
      timestamp: new Date(baseDate.getTime() + i * 7 * 24 * 60 * 60 * 1000),
      temperature: parseFloat((tempBase + Math.sin(i) * 0.5).toFixed(2)),
      salinity: parseFloat((salBase + Math.cos(i) * 0.2).toFixed(2)),
      pH_level: parseFloat((phBase - i * 0.002).toFixed(3)),
      dissolvedOxygen: parseFloat((7.2 - i * 0.05).toFixed(2)),
      depth: parseFloat((50 + Math.sin(i * 0.5) * 10).toFixed(1)),
    }));

  await prisma.sensorReading.createMany({
    data: [
      ...makeSensorData(sensor1.id, 28, 35, 8.1),
      ...makeSensorData(sensor2.id, 29, 34.5, 8.0),
      ...makeSensorData(sensor3.id, 27.5, 35.5, 8.15),
    ],
    skipDuplicates: true,
  });

  console.log('✅ Sensor readings created');

  // 4. Create biodiversity records
  await prisma.biodiversityRecord.createMany({
    data: [
      {
        researcherId: researcherUser.id,
        speciesName: 'Indian Mackerel (Rastrelliger kanagurta)',
        molecularDataSequence: { geneMarker: '16S rRNA', sequence: 'ATCGGATCGATCGCTAGCTAGCTA...', gcContent: '42.3%' },
        observationLat: 15.4,
        observationLon: 73.8,
        dateRecorded: new Date('2025-02-14'),
        isApproved: true,
      },
      {
        researcherId: researcherUser.id,
        speciesName: 'Silver Pomfret (Pampus argenteus)',
        molecularDataSequence: { geneMarker: 'COI', sequence: 'CGTACGATCGATCGCTAGCTAGCTA...', gcContent: '44.1%' },
        observationLat: 12.9,
        observationLon: 74.8,
        dateRecorded: new Date('2025-03-01'),
        isApproved: true,
      },
      {
        researcherId: researcherUser.id,
        speciesName: 'Acropora millepora (Staghorn Coral)',
        molecularDataSequence: { geneMarker: '28S rDNA', sequence: 'TTGCTAGCTAGCGATCGATCGA...', gcContent: '38.7%' },
        observationLat: 11.2,
        observationLon: 72.5,
        dateRecorded: new Date('2025-03-10'),
        isApproved: false,
      },
      {
        researcherId: adminUser.id,
        speciesName: 'Yellowfin Tuna (Thunnus albacares)',
        molecularDataSequence: { geneMarker: 'Cytochrome b', sequence: 'GCTAGCTAGCGATCGATCGATCG...', gcContent: '46.2%' },
        observationLat: 10.5,
        observationLon: 76.2,
        dateRecorded: new Date('2025-03-12'),
        isApproved: true,
      },
      {
        researcherId: researcherUser.id,
        speciesName: 'Sea Turtle (Chelonia mydas)',
        molecularDataSequence: { geneMarker: 'D-Loop', sequence: 'ATCGATCGATCGCTAGCTAGCTA...', gcContent: '40.5%' },
        observationLat: 14.1,
        observationLon: 74.5,
        dateRecorded: new Date('2025-03-15'),
        isApproved: false,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Biodiversity records created');

  // 5. Create Matsya chatbot interactions
  await prisma.chatbotInteraction.createMany({
    data: [
      {
        fishermanId: fishermanUser.id,
        userMessage: 'What fish is this? [Image attached]',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Rastrelliger_kanagurta.jpg/220px-Rastrelliger_kanagurta.jpg',
        matsyaResponse: 'Based on the dorsal fin and coloration, this is an Indian Mackerel (Rastrelliger kanagurta). Current market rate is ₹200/kg. Status: Least Concern.',
        identifiedSpecies: 'Indian Mackerel (Rastrelliger kanagurta)',
        marketValue: 200,
      },
      {
        fishermanId: fishermanUser.id,
        userMessage: 'What is the weather like today?',
        matsyaResponse: 'Namaste! Based on current data, a cyclone is approaching. Wind speed is 45 knots. It is advised NOT to venture into the sea today. Please stay safe on shore.',
        identifiedSpecies: null,
        marketValue: null,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Chatbot interactions created');

  // 6. Create data modification requests
  const bioRecords = await prisma.biodiversityRecord.findMany({ take: 2 });
  if (bioRecords.length >= 2) {
    await prisma.dataModificationRequest.createMany({
      data: [
        {
          researcherId: researcherUser.id,
          targetRecordId: bioRecords[0].id,
          modificationType: 'UPDATE',
          requestReason: 'The GC content value needs to be corrected from 42.3% to 43.1% based on repeat sequencing.',
          status: 'PENDING',
        },
        {
          researcherId: researcherUser.id,
          targetRecordId: bioRecords[1].id,
          modificationType: 'DELETE',
          requestReason: 'Duplicate entry. A more complete record was submitted under ID BIO-2025-003.',
          status: 'PENDING',
        },
      ],
      skipDuplicates: true,
    });
  }

  console.log('✅ Data modification requests created');
  console.log('\n🎉 Sagar Darpan database seeded successfully!');
  console.log('\n📋 Demo Credentials:');
  console.log('  Admin:      admin@sagardarpan.in / admin123');
  console.log('  Researcher: researcher@sagardarpan.in / research123');
  console.log('  Fisherman:  fisher@sagardarpan.in / fish123');
  console.log('  General:    user@sagardarpan.in / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
