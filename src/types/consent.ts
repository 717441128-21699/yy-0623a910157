import type { TreatmentItem, Appointment, PatientQuestion, SignatureRecord } from './appointment'

export interface ConsentStore {
  appointments: Appointment[]
  treatments: TreatmentItem[]
  questions: PatientQuestion[]
  signatureRecords: SignatureRecord[]
  updateConsentStatus: (appointmentId: string, status: Appointment['consentStatus']) => void
  addQuestion: (question: PatientQuestion) => void
  answerQuestion: (questionId: string, answer: string) => void
  addSignatureRecord: (record: SignatureRecord) => void
  getAppointment: (id: string) => Appointment | undefined
  getTreatment: (id: string) => TreatmentItem | undefined
  getQuestionsByAppointment: (appointmentId: string) => PatientQuestion[]
}
