import React, { useState, useCallback, useMemo } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import SignaturePad from '@/components/SignaturePad'
import { useConsentStore } from '@/store/useConsentStore'
import { QUESTION_CATEGORY_MAP } from '@/types/appointment'
import styles from './index.module.scss'

const ConfirmPage: React.FC = () => {
  const [showSignature, setShowSignature] = useState(false)
  const [signed, setSigned] = useState(false)

  const { getAppointment, getTreatment, getQuestionsByAppointment, addSignatureRecord, updateConsentStatus } = useConsentStore()

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

  const pendingQuestions = useMemo(
    () => questions.filter((q) => q.status === 'pending'),
    [questions]
  )

  const hasPendingQuestions = pendingQuestions.length > 0
  const isRead = appointment?.consentStatus === 'read' || appointment?.consentStatus === 'confirmed'

  const canSign = isRead && !hasPendingQuestions

  const handleSign = useCallback(() => {
    if (!canSign) return
    setShowSignature(true)
  }, [canSign])

  const handleSignatureComplete = useCallback((signatureData: string) => {
    if (!appointment) return
    const record = {
      id: `s${Date.now()}`,
      appointmentId: appointment.id,
      treatmentName: appointment.treatmentName,
      signedAt: new Date().toLocaleString('zh-CN'),
      imageUrl: signatureData
    }
    addSignatureRecord(record)
    updateConsentStatus(appointment.id, 'signed')
    setSigned(true)
    console.info('[ConfirmPage] signature completed', record.id)
    Taro.showToast({ title: '签名确认成功', icon: 'success' })
  }, [appointment, addSignatureRecord, updateConsentStatus])

  if (!appointment || !treatment) {
    return (
      <View className={styles.confirmPage}>
        <View className={styles.header}>
          <Text className={styles.title}>到院确认 ✅</Text>
          <Text className={styles.subtitle}>未找到预约信息</Text>
        </View>
      </View>
    )
  }

  if (signed) {
    return (
      <View className={styles.confirmPage}>
        <View className={styles.header}>
          <Text className={styles.title}>到院确认 ✅</Text>
        </View>
        <View className={styles.signedBanner}>
          <Text className={styles.signedText}>🎉 签名确认已完成</Text>
        </View>
        <View className={styles.appointmentCard}>
          <Text className={styles.treatmentName}>{treatment.name}</Text>
          <View className={styles.appointmentInfo}>
            <Text className={styles.appointmentInfoText}>{appointment.doctorName}</Text>
            <Text className={styles.appointmentInfoText}>·</Text>
            <Text className={styles.appointmentInfoText}>{appointment.date} {appointment.time}</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className={styles.confirmPage}>
      <View className={styles.header}>
        <Text className={styles.title}>到院确认 ✅</Text>
        <Text className={styles.subtitle}>确认信息无误后完成签名</Text>
      </View>

      <View className={styles.appointmentCard}>
        <View className={styles.appointmentHeader}>
          <Text className={styles.treatmentName}>{treatment.name}</Text>
        </View>
        <View className={styles.appointmentInfo}>
          <Text className={styles.appointmentInfoText}>{appointment.doctorName}</Text>
          <Text className={styles.appointmentInfoText}>·</Text>
          <Text className={styles.appointmentInfoText}>{appointment.date} {appointment.time}</Text>
        </View>
      </View>

      <Text className={styles.sectionLabel}>确认状态</Text>
      <View className={styles.statusCard}>
        <View className={styles.statusItem}>
          <Text className={styles.statusLabel}>知情同意书阅读</Text>
          {isRead ? (
            <View className={classnames(styles.statusValue, styles.statusDone)}>
              <Text className={styles.statusDoneText}>✓ 已阅读</Text>
            </View>
          ) : (
            <View className={classnames(styles.statusValue, styles.statusPending)}>
              <Text className={styles.statusPendingText}>未阅读</Text>
            </View>
          )}
        </View>
        <View className={styles.statusItem}>
          <Text className={styles.statusLabel}>疑问解答</Text>
          {hasPendingQuestions ? (
            <View className={classnames(styles.statusValue, styles.statusPending)}>
              <Text className={styles.statusPendingText}>{pendingQuestions.length}条待解答</Text>
            </View>
          ) : (
            <View className={classnames(styles.statusValue, styles.statusDone)}>
              <Text className={styles.statusDoneText}>✓ 无待解答</Text>
            </View>
          )}
        </View>
      </View>

      {questions.length > 0 ? (
        <View>
          <Text className={styles.sectionLabel}>提问记录</Text>
          {questions.map((q) => (
            <View key={q.id} className={styles.questionCard}>
              <View className={styles.questionHeader}>
                <View className={styles.questionCategory}>
                  <Text className={styles.questionCategoryText}>
                    {QUESTION_CATEGORY_MAP[q.category]}
                  </Text>
                </View>
              </View>
              <Text className={styles.questionContent}>{q.content}</Text>
              {q.status === 'answered' && q.answer && (
                <View className={styles.questionAnswer}>
                  <Text className={styles.answerLabel}>咨询师回复：</Text>
                  <Text className={styles.answerText}>{q.answer}</Text>
                </View>
              )}
              {q.status === 'pending' && (
                <View className={styles.questionAnswer} style={{ backgroundColor: '#FFF7E6' }}>
                  <Text className={styles.answerLabel} style={{ color: '#D48806' }}>等待咨询师回复...</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      ) : (
        <View>
          <Text className={styles.sectionLabel}>提问记录</Text>
          <View className={styles.noQuestionTip}>
            <Text className={styles.noQuestionText}>暂无提问</Text>
          </View>
        </View>
      )}

      {showSignature && (
        <View className={styles.signatureSection}>
          <Text className={styles.sectionLabel}>患者签名</Text>
          <SignaturePad onComplete={handleSignatureComplete} />
        </View>
      )}

      <View className={styles.bottomBar}>
        {!showSignature ? (
          <View
            className={classnames(styles.signBtn, !canSign && styles.signBtnDisabled)}
            onClick={handleSign}
          >
            <Text className={styles.signBtnText}>
              {hasPendingQuestions ? '请先解答疑问' : !isRead ? '请先阅读同意书' : '确认签名'}
            </Text>
          </View>
        ) : (
          <View className={styles.signBtn} style={{ opacity: 0.5 }}>
            <Text className={styles.signBtnText}>请在上方签名区完成签名</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default ConfirmPage
