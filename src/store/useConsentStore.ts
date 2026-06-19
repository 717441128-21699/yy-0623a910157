import { create } from 'zustand'
import type { ConsentStore } from '@/types/consent'
import type { Appointment, PatientQuestion, SignatureRecord } from '@/types/appointment'
import { appointments as mockAppointments } from '@/data/appointments'
import { treatments as mockTreatments } from '@/data/treatments'
import { patientQuestions as mockQuestions, signatureRecords as mockSignatures } from '@/data/appointments'
import { loadPersistedState, persistState } from '@/utils/storage'

interface PersistedData {
  appointments: Appointment[]
  questions: PatientQuestion[]
  signatureRecords: SignatureRecord[]
}

const defaultData: PersistedData = {
  appointments: mockAppointments,
  questions: mockQuestions,
  signatureRecords: mockSignatures
}

const persisted = loadPersistedState<PersistedData>(defaultData)

export const useConsentStore = create<ConsentStore>((set, get) => ({
  appointments: persisted.appointments,
  treatments: mockTreatments,
  questions: persisted.questions,
  signatureRecords: persisted.signatureRecords,

  updateConsentStatus: (appointmentId: string, status: Appointment['consentStatus']) => {
    set((state) => {
      const next = {
        appointments: state.appointments.map((apt) =>
          apt.id === appointmentId ? { ...apt, consentStatus: status } : apt
        )
      }
      persistState({
        appointments: next.appointments,
        questions: state.questions,
        signatureRecords: state.signatureRecords
      })
      return next
    })
  },

  addQuestion: (question: PatientQuestion) => {
    set((state) => {
      const next = {
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
      }
      persistState({
        appointments: next.appointments,
        questions: next.questions,
        signatureRecords: state.signatureRecords
      })
      return next
    })
  },

  answerQuestion: (questionId: string, answer: string) => {
    set((state) => {
      const updatedQuestions = state.questions.map((q) =>
        q.id === questionId ? { ...q, status: 'answered' as const, answer } : q
      )
      const updatedAppointments = state.appointments.map((apt) => {
        const question = state.questions.find((q) => q.id === questionId)
        if (question && question.appointmentId === apt.id) {
          return {
            ...apt,
            pendingQuestionCount: Math.max(0, apt.pendingQuestionCount - 1)
          }
        }
        return apt
      })
      persistState({
        appointments: updatedAppointments,
        questions: updatedQuestions,
        signatureRecords: state.signatureRecords
      })
      return { questions: updatedQuestions, appointments: updatedAppointments }
    })
  },

  addSignatureRecord: (record: SignatureRecord) => {
    set((state) => {
      const next = {
        signatureRecords: [...state.signatureRecords, record],
        appointments: state.appointments.map((apt) =>
          apt.id === record.appointmentId
            ? { ...apt, consentStatus: 'signed' as const }
            : apt
        )
      }
      persistState({
        appointments: next.appointments,
        questions: state.questions,
        signatureRecords: next.signatureRecords
      })
      return next
    })
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
