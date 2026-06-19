export type ConsentStatus = 'unread' | 'read' | 'confirmed' | 'signed'

export type QuestionCategory = 'pain' | 'duration' | 'refund' | 'care'

export type QuestionStatus = 'pending' | 'answered'

export interface TreatmentItem {
  id: string
  name: string
  icon: string
  purpose: string
  discomfort: string
  costRange: string
  alternatives: string
  faqItems: FaqItem[]
}

export interface FaqItem {
  question: string
  answer: string
}

export interface Appointment {
  id: string
  treatmentId: string
  treatmentName: string
  doctorName: string
  date: string
  time: string
  consentStatus: ConsentStatus
  hasQuestions: boolean
  pendingQuestionCount: number
}

export interface PatientQuestion {
  id: string
  appointmentId: string
  category: QuestionCategory
  content: string
  status: QuestionStatus
  answer?: string
  createdAt: string
}

export interface SignatureRecord {
  id: string
  appointmentId: string
  treatmentName: string
  signedAt: string
  imageUrl: string
}

export const QUESTION_CATEGORY_MAP: Record<QuestionCategory, string> = {
  pain: '疼不疼',
  duration: '要多久',
  refund: '是否可退款',
  care: '术后怎么护理'
}
