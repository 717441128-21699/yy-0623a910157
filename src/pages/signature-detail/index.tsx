import React, { useMemo } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useConsentStore } from '@/store/useConsentStore'
import { QUESTION_CATEGORY_MAP } from '@/types/appointment'
import styles from './index.module.scss'

const PATIENT_NAME = '张女士'
const PATIENT_PHONE = '138****6789'

const SignatureDetailPage: React.FC = () => {
  const { getAppointment, getTreatment, getQuestionsByAppointment, signatureRecords } = useConsentStore()

  const params = useMemo(() => {
    const instance = Taro.getCurrentInstance()
    return instance?.router?.params || {}
  }, [])

  const appointmentId = params.id || ''

  const appointment = useMemo(
    () => getAppointment(appointmentId),
    [appointmentId, getAppointment]
  )

  const treatment = useMemo(
    () => (appointment ? getTreatment(appointment.treatmentId) : undefined),
    [appointment, getTreatment]
  )

  const questions = useMemo(
    () => getQuestionsByAppointment(appointmentId),
    [appointmentId, getQuestionsByAppointment]
  )

  const signature = useMemo(
    () => signatureRecords.find((r) => r.appointmentId === appointmentId),
    [appointmentId, signatureRecords]
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

  return (
    <View className={styles.page}>
      <View className={styles.banner}>
        <Text className={styles.bannerTitle}>{treatment.name}</Text>
        <Text className={styles.bannerSub}>
          {appointment.doctorName} · {appointment.date} {appointment.time} · 到院确认已完成
        </Text>
      </View>

      <Text className={styles.sectionLabel}>到院确认单</Text>
      <View className={styles.sheet}>
        <View className={styles.sheetRow}>
          <Text className={styles.sheetLabel}>患者姓名</Text>
          <Text className={styles.sheetValue}>{PATIENT_NAME}</Text>
        </View>
        <View className={styles.sheetRow}>
          <Text className={styles.sheetLabel}>联系电话</Text>
          <Text className={styles.sheetValue}>{PATIENT_PHONE}</Text>
        </View>
        <View className={styles.sheetRow}>
          <Text className={styles.sheetLabel}>治疗项目</Text>
          <Text className={styles.sheetValue}>{treatment.name}</Text>
        </View>
        <View className={styles.sheetRow}>
          <Text className={styles.sheetLabel}>就诊医生</Text>
          <Text className={styles.sheetValue}>{appointment.doctorName}</Text>
        </View>
        <View className={styles.sheetRow}>
          <Text className={styles.sheetLabel}>预约时间</Text>
          <Text className={styles.sheetValue}>{appointment.date} {appointment.time}</Text>
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

        <View className={styles.sheetSignatureBlock}>
          <Text className={styles.sheetSignatureLabel}>患者签名</Text>
          {signature.imageUrl ? (
            <View className={styles.sheetSignatureImageBox}>
              <Image
                className={styles.sheetSignatureImage}
                src={signature.imageUrl}
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
