/**
 * Passe à une seule question active par thème (avis global + note 1–5).
 * À lancer une fois sur une base déjà seedée avec l’ancien questionnaire détaillé.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const THEME_SUMMARY: Record<string, string> = {
  'Accueil au centre': 'Votre avis global sur l’accueil au centre',
  'Qualité des soins': 'Votre avis global sur la qualité des soins',
  'Traitement de la part du personnel non-soignant':
    'Votre avis global sur le personnel non-soignant',
  'Bien-être et sécurité': 'Votre avis global sur le bien-être et la sécurité',
  'Propreté et confort': 'Votre avis global sur la propreté et le confort',
  Alimentation: 'Votre avis global sur l’alimentation',
};

async function main() {
  const themes = await prisma.theme.findMany({ orderBy: { id: 'asc' } });

  for (const theme of themes) {
    const label = THEME_SUMMARY[theme.name] ?? `Votre avis sur : ${theme.name}`;

    await prisma.question.updateMany({
      where: { themeId: theme.id },
      data: { isActive: false },
    });

    await prisma.question.create({
      data: {
        themeId: theme.id,
        content: label,
        isActive: true,
      },
    });

    console.log(`✓ ${theme.name}`);
  }

  console.log('Normalisation terminée : 1 question active par thème.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
