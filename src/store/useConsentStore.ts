import { create } from 'zustand'
import type { ConsentStore } from '@/types/consent'
import type { Appointment, PatientQuestion, SignatureRecord } from '@/types/appointment'
import { appointments as mockAppointments } from '@/data/appointments'
import { treatments as mockTreatments } from '@/data/treatments'
import { patientQuestions as mockQuestions, signatureRecords as mockSignatures } from '@/data/appointments'

export const useConsentStore = create<ConsentStore>((set, get) => ({
  appointments: mockAppointments,
  treatments: mockTreatments,
  questions: mockQuestions,
  signatureRecords: mockSignatures,

  updateConsentStatus: (appointmentId: string, status: Appointment['consentStatus']) => {
    set((state) => ({
      appointments: state.appointments.map((apt) =>
        apt.id === appointmentId ? { ...apt, consentStatus: status } : apt
      )
    }))
  },

  addQuestion: (question: PatientQuestion) => {
    set((state) => ({
      questions: [...state.questions, question],
      appointments: state.appointments.map((apt) =>
        apt.id === question.appointmentId
          ? {
              ...apt,
              hasQuestions: true,
              pendingQuestionCount: apt.pendingQuestionCount + 1
            }
          : apt
      )
    }))
  },

  answerQuestion: (questionId: string, answer: string) => {
    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === questionId ? { ...q, status: 'answered' as const, answer } : q
      ),
      appointments: state.appointments.map((apt) => {
        const question = state.questions.find((q) => q.id === questionId)
        if (question && question.appointmentId === apt.id) {
          return {
            ...apt,
            pendingQuestionCount: Math.max(0, apt.pendingQuestionCount - 1)
          }
        }
        return apt
      })
    }))
  },

  addSignatureRecord: (record: SignatureRecord) => {
    set((state) => ({
      signatureRecords: [...state.signatureRecords, record],
      appointments: state.appointments.map((apt) =>
        apt.id === record.appointmentId
          ? { ...apt, consentStatus: 'signed' as const }
          : apt
      )
    }))
  },

  getAppointment: (id: string) => {
    return get().appointments.find((apt) => apt.id === id)
  },

  getTreatment: (id: string) => {
    return get().treatments.find((t) => t.id === id)
  },

  getQuestionsByAppointment: (appointmentId: string) => {
    return get().questions.filter((q) => q.appointmentId === appointmentId)
  }
}))
