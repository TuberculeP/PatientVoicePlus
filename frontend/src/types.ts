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

export type AdminCenter = Center & {
  isActive: boolean
  specialtyIds: number[]
}

export type CenterFormData = {
  name: string
  description: string
  city: string
  postalCode: string
  address: string
  specialtyIds: number[]
}

export type AnalysisStatus = 'PENDING' | 'DONE' | 'ERROR'

export type FormAnalysis = {
  status: AnalysisStatus
  analyse: string | null
  tags: string[]
  needsHumanReview: boolean
  auditLevel: string | null
  inQuota: boolean | null
  hasPii: boolean | null
}

export type AdminFormListItem = {
  id: string
  centerId: string
  centerName: string
  createdAt: string
  isActive: boolean
  answersCount: number
  averageRating: number | null
  analysisStatus: AnalysisStatus | null
}

export type AdminFormDetail = {
  id: string
  centerId: string
  centerName: string
  createdAt: string
  isActive: boolean
  answers: {
    questionId: number
    themeName: string
    value: string
    content: string | null
  }[]
  analysis: FormAnalysis | null
}

/** Un thème = une note 1–5 + commentaire, ou commentaire seul si commentOnly */
export type Theme = {
  name: string
  questionId: string
  commentOnly?: boolean
}
