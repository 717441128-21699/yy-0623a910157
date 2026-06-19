import type { Appointment, PatientQuestion, SignatureRecord } from '@/types/appointment'

export const appointments: Appointment[] = [
  {
    id: 'a1',
    treatmentId: 't1',
    treatmentName: '隐形矫治附件粘接',
    doctorName: '王明医生',
    date: '2026-06-22',
    time: '09:30',
    consentStatus: 'unread',
    hasQuestions: false,
    pendingQuestionCount: 0
  },
  {
    id: 'a2',
    treatmentId: 't3',
    treatmentName: '儿童窝沟封闭',
    doctorName: '李芳医生',
    date: '2026-06-23',
    time: '14:00',
    consentStatus: 'read',
    hasQuestions: true,
    pendingQuestionCount: 1
  },
  {
    id: 'a3',
    treatmentId: 't2',
    treatmentName: '种植二期手术',
    doctorName: '张伟医生',
    date: '2026-06-25',
    time: '10:00',
    consentStatus: 'confirmed',
    hasQuestions: true,
    pendingQuestionCount: 0
  },
  {
    id: 'a4',
    treatmentId: 't5',
    treatmentName: '全瓷牙冠修复',
    doctorName: '陈静医生',
    date: '2026-06-28',
    time: '15:30',
    consentStatus: 'signed',
    hasQuestions: false,
    pendingQuestionCount: 0
  },
  {
    id: 'a5',
    treatmentId: 't6',
    treatmentName: '智齿拔除',
    doctorName: '王明医生',
    date: '2026-06-30',
    time: '11:00',
    consentStatus: 'unread',
    hasQuestions: false,
    pendingQuestionCount: 0
  },
  {
    id: 'a6',
    treatmentId: 't4',
    treatmentName: '根管治疗',
    doctorName: '张伟医生',
    date: '2026-07-02',
    time: '09:00',
    consentStatus: 'unread',
    hasQuestions: false,
    pendingQuestionCount: 0
  },
  {
    id: 'a7',
    treatmentId: 't7',
    treatmentName: '牙齿美白',
    doctorName: '陈静医生',
    date: '2026-07-05',
    time: '16:00',
    consentStatus: 'read',
    hasQuestions: false,
    pendingQuestionCount: 0
  },
  {
    id: 'a8',
    treatmentId: 't8',
    treatmentName: '牙周基础治疗',
    doctorName: '李芳医生',
    date: '2026-07-08',
    time: '10:30',
    consentStatus: 'unread',
    hasQuestions: false,
    pendingQuestionCount: 0
  },
  {
    id: 'a9',
    treatmentId: 't9',
    treatmentName: '活动义齿修复',
    doctorName: '张伟医生',
    date: '2026-07-10',
    time: '14:30',
    consentStatus: 'unread',
    hasQuestions: false,
    pendingQuestionCount: 0
  },
  {
    id: 'a10',
    treatmentId: 't10',
    treatmentName: '正畸初诊方案设计',
    doctorName: '陈静医生',
    date: '2026-07-15',
    time: '11:00',
    consentStatus: 'unread',
    hasQuestions: false,
    pendingQuestionCount: 0
  }
]

export const patientQuestions: PatientQuestion[] = [
  {
    id: 'q1',
    appointmentId: 'a2',
    category: 'pain',
    content: '窝沟封闭孩子会不会觉得疼？6岁小孩能配合吗？',
    status: 'pending',
    createdAt: '2026-06-20 10:30'
  },
  {
    id: 'q2',
    appointmentId: 'a3',
    category: 'care',
    content: '种植二期术后能不能正常上班？需要注意什么？',
    status: 'answered',
    answer: '术后当天建议休息，第二天可正常上班，避免剧烈运动即可。注意不要用手触碰术区，按时服用消炎药。',
    createdAt: '2026-06-21 09:15'
  },
  {
    id: 'q3',
    appointmentId: 'a3',
    category: 'duration',
    content: '整个种植修复还需要多久才能完成？',
    status: 'answered',
    answer: '二期手术后约2-4周取模，再1-2周戴冠，预计7月中旬前可以完成全部修复。',
    createdAt: '2026-06-21 09:20'
  }
]

export const signatureRecords: SignatureRecord[] = [
  {
    id: 's1',
    appointmentId: 'a4',
    treatmentName: '全瓷牙冠修复',
    signedAt: '2026-06-20 15:45',
    imageUrl: ''
  }
]
