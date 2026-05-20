export type Specialty = {
  id: number
  name: string
}

export type Center = {
  id: string
  name: string
  address: string
  city: string
  postalCode: string
  description: string
  specialties: Specialty[]
}

/** Un thème = une note 1–5 + commentaire, ou commentaire seul si commentOnly */
export type Theme = {
  name: string
  questionId: string
  commentOnly?: boolean
}
