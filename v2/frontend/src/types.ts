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

export type Question = {
  id: string
  name: string
}

export type Theme = {
  name: string
  questions: Question[]
}
