/**
 * Ajoute le thème « Autre aspect » (commentaire libre) sur une base déjà seedée.
 */
import { PrismaClient } from '@prisma/client'

const THEME_NAME = 'Autre aspect de votre expérience'
const QUESTION_LABEL =
  'Un autre aspect de votre séjour que vous souhaitez partager'

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.theme.findFirst({ where: { name: THEME_NAME } })
  if (existing) {
    const active = await prisma.question.findFirst({
      where: { themeId: existing.id, isActive: true },
    })
    if (active) {
      console.log('Le thème « Autre aspect » existe déjà.')
      return
    }
    await prisma.question.create({
      data: { themeId: existing.id, content: QUESTION_LABEL, isActive: true },
    })
    console.log('Question active créée pour le thème existant.')
    return
  }

  const theme = await prisma.theme.create({ data: { name: THEME_NAME } })
  await prisma.question.create({
    data: { themeId: theme.id, content: QUESTION_LABEL, isActive: true },
  })
  console.log(`✓ Thème ajouté : ${THEME_NAME}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
