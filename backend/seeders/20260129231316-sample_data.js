'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const themesCount = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM themes;',
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (themesCount[0].count > 0) {
      console.log('Database already has data. Skipping seeder.');
      return;
    }

    const now = new Date();

    await queryInterface.bulkInsert('themes', [
      { name: 'Accueil au centre', createdAt: now, updatedAt: now },
      { name: 'Qualité des soins', createdAt: now, updatedAt: now },
      { name: 'Traitement de la part du personnel non-soignant', createdAt: now, updatedAt: now },
      { name: 'Bien-être et sécurité', createdAt: now, updatedAt: now },
      { name: 'Propreté et confort', createdAt: now, updatedAt: now },
      { name: 'Alimentation', createdAt: now, updatedAt: now },
    ]);

    const themes = await queryInterface.sequelize.query(
      'SELECT id, name FROM themes ORDER BY id;',
      { type: Sequelize.QueryTypes.SELECT }
    );
    const themeId = (name) => themes.find(t => t.name === name).id;

    await queryInterface.bulkInsert('questions', [
      { content: 'A combien noteriez-vous l\'accueil lors de votre arrivée au centre, sur une échelle de 1 à 5 ?', theme_id: themeId('Accueil au centre'), is_active: true, createdAt: now, updatedAt: now },
      { content: 'A combien noteriez-vous la clarté des informations fournies lors de l\'admission, sur une échelle de 1 à 5 ?', theme_id: themeId('Accueil au centre'), is_active: true, createdAt: now, updatedAt: now },
      { content: 'A combien noteriez-vous le temps entre votre demande d\'admission et votre entrée, sur une échelle de 1 à 5 ?', theme_id: themeId('Accueil au centre'), is_active: true, createdAt: now, updatedAt: now },

      { content: 'A combien noteriez-vous la qualité globale des soins de rééducation, sur une échelle de 1 à 5 ?', theme_id: themeId('Qualité des soins'), is_active: true, createdAt: now, updatedAt: now },
      { content: 'A combien noteriez-vous les compétences des thérapeutes (kinésithérapeutes, ergothérapeutes, etc.), sur une échelle de 1 à 5 ?', theme_id: themeId('Qualité des soins'), is_active: true, createdAt: now, updatedAt: now },
      { content: 'A combien noteriez-vous l\'adaptation des exercices à votre état de santé, sur une échelle de 1 à 5 ?', theme_id: themeId('Qualité des soins'), is_active: true, createdAt: now, updatedAt: now },
      { content: 'A combien noteriez-vous le suivi de votre progression par l\'équipe, sur une échelle de 1 à 5 ?', theme_id: themeId('Qualité des soins'), is_active: true, createdAt: now, updatedAt: now },
      { content: 'A combien noteriez-vous la préparation à votre sortie (conseils, documents, suivi), sur une échelle de 1 à 5 ?', theme_id: themeId('Qualité des soins'), is_active: true, createdAt: now, updatedAt: now },

      { content: 'A combien noteriez-vous la disponibilité du personnel soignant lorsque vous en aviez besoin, sur une échelle de 1 à 5 ?', theme_id: themeId('Traitement de la part du personnel non-soignant'), is_active: true, createdAt: now, updatedAt: now },
      { content: 'A combien noteriez-vous l\'amabilité et courtoisie du personnel, sur une échelle de 1 à 5 ?', theme_id: themeId('Traitement de la part du personnel non-soignant'), is_active: true, createdAt: now, updatedAt: now },

      { content: 'A combien noteriez-vous l\'écoute de vos besoins et prise en compte de vos remarques durant votre séjour, sur une échelle de 1 à 5 ?', theme_id: themeId('Bien-être et sécurité'), is_active: true, createdAt: now, updatedAt: now },
      { content: 'A combien noteriez-vous le respect de votre dignité et de votre intimité, sur une échelle de 1 à 5 ?', theme_id: themeId('Bien-être et sécurité'), is_active: true, createdAt: now, updatedAt: now },

      { content: 'A combien noteriez-vous le confort de votre chambre, sur une échelle de 1 à 5 ?', theme_id: themeId('Propreté et confort'), is_active: true, createdAt: now, updatedAt: now },
      { content: 'A combien noteriez-vous la propreté de votre chambre et des locaux, sur une échelle de 1 à 5 ?', theme_id: themeId('Propreté et confort'), is_active: true, createdAt: now, updatedAt: now },

      { content: 'A combien noteriez-vous la qualité des repas servis, sur une échelle de 1 à 5 ?', theme_id: themeId('Alimentation'), is_active: true, createdAt: now, updatedAt: now },
    ]);

    await queryInterface.bulkInsert('centers', [
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'Centre de Rééducation du Louvre',
        description: 'Centre spécialisé en rééducation fonctionnelle.',
        city: 'Lyon',
        postal_code: '69006',
        address: '22 avenue du Parc',
        createdAt: now, updatedAt: now,
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'Clinique du Parc',
        description: 'Clinique de réadaptation au cœur de Paris.',
        city: 'Paris',
        postal_code: '75001',
        address: '15 rue du Louvre',
        createdAt: now, updatedAt: now,
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'Centre Saint-Charles',
        description: 'Centre de soins de suite et de réadaptation.',
        city: 'Marseille',
        postal_code: '13002',
        address: '8 rue Saint-Charles',
        createdAt: now, updatedAt: now,
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'Institut de Réadaptation Atlantique',
        description: 'Institut dédié à la réadaptation post-opératoire.',
        city: 'Nantes',
        postal_code: '44000',
        address: '3 allée des Dunes',
        createdAt: now, updatedAt: now,
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: "Centre Val d'Oise Santé",
        description: 'Centre de rééducation pluridisciplinaire.',
        city: 'Cergy',
        postal_code: '95000',
        address: '12 rue des Lilas',
        createdAt: now, updatedAt: now,
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'Clinique du Littoral',
        description: 'Clinique de rééducation sur la Côte d\'Azur.',
        city: 'Nice',
        postal_code: '06000',
        address: '5 promenade des Plages',
        createdAt: now, updatedAt: now,
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'Centre de Rééducation Pasteur',
        description: 'Centre de soins de rééducation neurologique et orthopédique.',
        city: 'Strasbourg',
        postal_code: '67000',
        address: '10 avenue Pasteur',
        createdAt: now, updatedAt: now,
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'Centre Sud Santé',
        description: 'Centre de réadaptation cardiovasculaire et respiratoire.',
        city: 'Montpellier',
        postal_code: '34000',
        address: '18 rue du Midi',
        createdAt: now, updatedAt: now,
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'Centre de Réadaptation Victor Hugo',
        description: 'Centre de rééducation motrice et fonctionnelle.',
        city: 'Bordeaux',
        postal_code: '33000',
        address: '7 rue Victor Hugo',
        createdAt: now, updatedAt: now,
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'Centre Normandie Mouvement',
        description: 'Centre spécialisé en rééducation orthopédique.',
        city: 'Caen',
        postal_code: '14000',
        address: '2 rue de la Liberté',
        createdAt: now, updatedAt: now,
      },
    ]);

    await queryInterface.bulkInsert('specialties', [
      { name: 'Kinésithérapie', createdAt: now, updatedAt: now },
      { name: 'Rééducation neurologique', createdAt: now, updatedAt: now },
      { name: 'Rééducation orthopédique', createdAt: now, updatedAt: now },
      { name: 'Ergothérapie', createdAt: now, updatedAt: now },
      { name: 'Balnéothérapie', createdAt: now, updatedAt: now },
      { name: 'Réentrainement à l\'effort', createdAt: now, updatedAt: now },
      { name: 'Suivi post-opératoire', createdAt: now, updatedAt: now },
    ]);

    const specialties = await queryInterface.sequelize.query(
      'SELECT id FROM specialties;',
      { type: Sequelize.QueryTypes.SELECT }
    );
    const specialtyIds = specialties.map(s => s.id);
    const maxSpecialties = specialtyIds.length;

    const centers = await queryInterface.sequelize.query(
      'SELECT id FROM centers;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const centerSpecialties = [];
    centers.forEach(center => {
      const minSpecialties = 2;
      const numSpecialties = maxSpecialties < minSpecialties 
        ? maxSpecialties 
        : Math.floor(Math.random() * (maxSpecialties - minSpecialties + 1)) + minSpecialties;
      const shuffled = [...specialtyIds].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, numSpecialties);
      selected.forEach(specialtyId => {
        centerSpecialties.push({
          center_id: center.id,
          specialty_id: specialtyId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });
    });

    const existing = await queryInterface.sequelize.query(
      'SELECT center_id, specialty_id FROM center_specialties;',
      { type: Sequelize.QueryTypes.SELECT }
    );
    const existingKeys = new Set(existing.map(e => `${e.center_id}-${e.specialty_id}`));

    const filteredCenterSpecialties = centerSpecialties.filter(
      cs => !existingKeys.has(`${cs.center_id}-${cs.specialty_id}`)
    );

    await queryInterface.bulkInsert('center_specialties', filteredCenterSpecialties);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('TRUNCATE TABLE center_specialties, specialties, centers, questions, themes RESTART IDENTITY CASCADE;');
  }
};