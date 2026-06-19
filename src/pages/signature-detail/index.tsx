import React, { useMemo } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useConsentStore } from '@/store/useConsentStore'
import { QUESTION_CATEGORY_MAP } from '@/types/appointment'
import styles from './index.module.scss'

const PATIENT_NAME = '张女士'
const PATIENT_PHONE = '138****6789'

const SignatureDetailPage: React.FC = () => {
  const storeAppointments = useConsentStore((s) => s.appointments)
  const storeTreatments = useConsentStore((s) => s.treatments)
  const storeQuestions = useConsentStore((s) => s.questions)
  const storeSignatureRecords = useConsentStore((s) => s.signatureRecords)

  const [, setTick] = React.useState(0)
  useDidShow(() => { setTick((t) => t + 1) })

  const params = useMemo(() => {
    const instance = Taro.getCurrentInstance()
    return instance?.router?.params || {}
  }, [])

  const appointmentId = params.id || ''

  const appointment = useMemo(
    () => storeAppointments.find((a) => a.id === appointmentId),
    [appointmentId, storeAppointments]
  )

  const treatment = useMemo(
    () => (appointment ? storeTreatments.find((t) => t.id === appointment.treatmentId) : undefined),
    [appointment, storeTreatments]
  )

  const questions = useMemo(
    () => storeQuestions.filter((q) => q.appointmentId === appointmentId),
    [appointmentId, storeQuestions]
  )

  const signature = useMemo(
    () => storeSignatureRecords.find((r) => r.appointmentId === appointmentId),
    [appointmentId, storeSignatureRecords]
  )

  if (!appointment || !treatment || !signature) {
    return (
      <View className={styles.page}>
        <View className={styles.notFound}>
          <Text className={styles.notFoundIcon}>📄</Text>
          <Text className={styles.notFoundText}>未找到该确认单</Text>
        </View>
      </View>
    )
  }

  const patientName = signature.patientName || PATIENT_NAME
  const patientPhone = signature.patientPhone || PATIENT_PHONE
  const doctorName = signature.doctorName || appointment.doctorName || '-'
  const apptDate = signature.appointmentDate || appointment.date || '-'
  const apptTime = signature.appointmentTime || appointment.time || '-'
  const signatureSrc = signature.imageBase64 || signature.imageUrl || ''

  return (
    <View className={styles.page}>
      <View className={styles.banner}>
        <Text className={styles.bannerTitle}>{treatment.name}</Text>
        <Text className={styles.bannerSub}>
          {doctorName} · {apptDate} {apptTime} · 到院确认已完成
        </Text>
      </View>

      <Text className={styles.sectionLabel}>到院确认单</Text>
      <View className={styles.sheet}>
        <View className={styles.sheetRow}>
          <Text className={styles.sheetLabel}>患者姓名</Text>
          <Text className={styles.sheetValue}>{patientName}</Text>
        </View>
        <View className={styles.sheetRow}>
          <Text className={styles.sheetLabel}>联系电话</Text>
          <Text className={styles.sheetValue}>{patientPhone}</Text>
        </View>
        <View className={styles.sheetRow}>
          <Text className={styles.sheetLabel}>治疗项目</Text>
          <Text className={styles.sheetValue}>{treatment.name}</Text>
        </View>
        <View className={styles.sheetRow}>
          <Text className={styles.sheetLabel}>就诊医生</Text>
          <Text className={styles.sheetValue}>{doctorName}</Text>
        </View>
        <View className={styles.sheetRow}>
          <Text className={styles.sheetLabel}>预约时间</Text>
          <Text className={styles.sheetValue}>{apptDate} {apptTime}</Text>
        </View>
        <View className={styles.sheetRow}>
          <Text className={styles.sheetLabel}>同意书阅读</Text>
          <Text className={`${styles.sheetValue} ${styles.sheetSuccess}`}>✓ 已阅读</Text>
        </View>
        <View className={styles.sheetRow}>
          <Text className={styles.sheetLabel}>疑问处理</Text>
          <Text className={`${styles.sheetValue} ${styles.sheetSuccess}`}>
            {questions.length === 0 ? '无提问' : `${questions.length}条已处理`}
          </Text>
        </View>

        {questions.length > 0 && (
          <View className={styles.sheetQuestionBlock}>
            <Text className={styles.sheetQuestionTitle}>提问及回复</Text>
            {questions.map((q) => (
              <View key={q.id} className={styles.sheetQuestionItem}>
                <View className={styles.sheetQuestionCategory}>
                  {QUESTION_CATEGORY_MAP[q.category]}
                </View>
                <Text className={styles.sheetQuestionText}>问：{q.content}</Text>
                {q.answer && (
                  <Text className={styles.sheetAnswerText}>答：{q.answer}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {signature.frontDeskNote && (
          <View className={styles.sheetNoteBlock}>
            <Text className={styles.sheetNoteLabel}>前台备注</Text>
            <Text className={styles.sheetNoteText}>{signature.frontDeskNote}</Text>
          </View>
        )}

        <View className={styles.sheetSignatureBlock}>
          <Text className={styles.sheetSignatureLabel}>患者签名</Text>
          {signatureSrc ? (
            <View className={styles.sheetSignatureImageBox}>
              <Image
                className={styles.sheetSignatureImage}
                src={signatureSrc}
                mode="aspectFit"
              />
            </View>
          ) : (
            <View className={styles.sheetSignatureImageBox}>
              <Text className={styles.sheetSignatureFallback}>✍️ 签名已保存</Text>
            </View>
          )}
        </View>
        <View className={styles.sheetRow}>
          <Text className={styles.sheetLabel}>签名时间</Text>
          <Text className={styles.sheetValue}>{signature.signedAt}</Text>
        </View>
      </View>
    </View>
  )
}

export default SignatureDetailPage
