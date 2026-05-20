import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.theme.count();
  if (existing > 0) {
    console.log('Database already seeded, skipping.');
    return;
  }

  const themes = await prisma.$transaction(async (tx) => {
    const created = await Promise.all([
      tx.theme.create({ data: { name: 'Accueil au centre' } }),
      tx.theme.create({ data: { name: 'Qualité des soins' } }),
      tx.theme.create({
        data: { name: 'Traitement de la part du personnel non-soignant' },
      }),
      tx.theme.create({ data: { name: 'Bien-être et sécurité' } }),
      tx.theme.create({ data: { name: 'Propreté et confort' } }),
      tx.theme.create({ data: { name: 'Alimentation' } }),
    ]);
    return created;
  });

  const themeId = (name: string) => themes.find((t) => t.name === name)!.id;

  await prisma.question.createMany({
    data: [
      {
        content: 'Votre avis global sur l’accueil au centre',
        themeId: themeId('Accueil au centre'),
        isActive: true,
      },
      {
        content: 'Votre avis global sur la qualité des soins',
        themeId: themeId('Qualité des soins'),
        isActive: true,
      },
      {
        content: 'Votre avis global sur le personnel non-soignant',
        themeId: themeId('Traitement de la part du personnel non-soignant'),
        isActive: true,
      },
      {
        content: 'Votre avis global sur le bien-être et la sécurité',
        themeId: themeId('Bien-être et sécurité'),
        isActive: true,
      },
      {
        content: 'Votre avis global sur la propreté et le confort',
        themeId: themeId('Propreté et confort'),
        isActive: true,
      },
      {
        content: 'Votre avis global sur l’alimentation',
        themeId: themeId('Alimentation'),
        isActive: true,
      },
    ],
  });

  const specialties = await prisma.$transaction(async (tx) => {
    return Promise.all([
      tx.specialty.create({ data: { name: 'Kinésithérapie' } }),
      tx.specialty.create({ data: { name: 'Rééducation neurologique' } }),
      tx.specialty.create({ data: { name: 'Rééducation orthopédique' } }),
      tx.specialty.create({ data: { name: 'Ergothérapie' } }),
      tx.specialty.create({ data: { name: 'Balnéothérapie' } }),
      tx.specialty.create({ data: { name: "Réentrainement à l'effort" } }),
      tx.specialty.create({ data: { name: 'Suivi post-opératoire' } }),
    ]);
  });

  const centersData = [
    {
      name: 'Centre de Rééducation du Louvre',
      description: 'Centre spécialisé en rééducation fonctionnelle.',
      city: 'Lyon',
      postalCode: '69006',
      address: '22 avenue du Parc',
    },
    {
      name: 'Clinique du Parc',
      description: 'Clinique de réadaptation au cœur de Paris.',
      city: 'Paris',
      postalCode: '75001',
      address: '15 rue du Louvre',
    },
    {
      name: 'Centre Saint-Charles',
      description: 'Centre de soins de suite et de réadaptation.',
      city: 'Marseille',
      postalCode: '13002',
      address: '8 rue Saint-Charles',
    },
    {
      name: 'Institut de Réadaptation Atlantique',
      description: 'Institut dédié à la réadaptation post-opératoire.',
      city: 'Nantes',
      postalCode: '44000',
      address: '3 allée des Dunes',
    },
    {
      name: "Centre Val d'Oise Santé",
      description: 'Centre de rééducation pluridisciplinaire.',
      city: 'Cergy',
      postalCode: '95000',
      address: '12 rue des Lilas',
    },
    {
      name: 'Clinique du Littoral',
      description: "Clinique de rééducation sur la Côte d'Azur.",
      city: 'Nice',
      postalCode: '06000',
      address: '5 promenade des Plages',
    },
    {
      name: 'Centre de Rééducation Pasteur',
      description:
        'Centre de soins de rééducation neurologique et orthopédique.',
      city: 'Strasbourg',
      postalCode: '67000',
      address: '10 avenue Pasteur',
    },
    {
      name: 'Centre Sud Santé',
      description: 'Centre de réadaptation cardiovasculaire et respiratoire.',
      city: 'Montpellier',
      postalCode: '34000',
      address: '18 rue du Midi',
    },
    {
      name: 'Centre de Réadaptation Victor Hugo',
      description: 'Centre de rééducation motrice et fonctionnelle.',
      city: 'Bordeaux',
      postalCode: '33000',
      address: '7 rue Victor Hugo',
    },
    {
      name: 'Centre Normandie Mouvement',
      description: 'Centre spécialisé en rééducation orthopédique.',
      city: 'Caen',
      postalCode: '14000',
      address: '2 rue de la Liberté',
    },
  ];

  const specialtyIds = specialties.map((s) => s.id);

  for (const data of centersData) {
    const center = await prisma.center.create({ data });
    const shuffled = [...specialtyIds].sort(() => 0.5 - Math.random());
    const count = Math.floor(Math.random() * (specialtyIds.length - 2 + 1)) + 2;
    const selected = shuffled.slice(0, count);
    await prisma.centerSpecialty.createMany({
      data: selected.map((specialtyId) => ({
        centerId: center.id,
        specialtyId,
      })),
    });
  }

  console.log('Seeding complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
