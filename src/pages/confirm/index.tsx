import React, { useState, useCallback, useMemo } from 'react'
import { View, Text, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import SignaturePad from '@/components/SignaturePad'
import { useConsentStore } from '@/store/useConsentStore'
import { QUESTION_CATEGORY_MAP } from '@/types/appointment'
import styles from './index.module.scss'

const ConfirmPage: React.FC = () => {
  const [showSignature, setShowSignature] = useState(false)
  const [replyMap, setReplyMap] = useState<Record<string, string>>({})

  const {
    getAppointment, getTreatment, getQuestionsByAppointment,
    addSignatureRecord, updateConsentStatus, answerQuestion,
    signatureRecords
  } = useConsentStore()

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

  const currentSignature = useMemo(
    () => signatureRecords.find((r) => r.appointmentId === appointmentId),
    [appointmentId, signatureRecords]
  )

  const hasPendingQuestions = pendingQuestions.length > 0
  const isRead = appointment?.consentStatus === 'read' || appointment?.consentStatus === 'confirmed'
  const isSigned = appointment?.consentStatus === 'signed'

  const canSign = isRead && !hasPendingQuestions

  const handleReplyChange = useCallback((qId: string, val: string) => {
    setReplyMap((prev) => ({ ...prev, [qId]: val }))
  }, [])

  const handleMarkExplained = useCallback((qId: string) => {
    const reply = replyMap[qId]?.trim()
    answerQuestion(qId, reply || '前台已口头解释')
    console.info('[ConfirmPage] question answered', qId)
  }, [replyMap, answerQuestion])

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

  return (
    <View className={styles.confirmPage}>
      <View className={styles.header}>
        <Text className={styles.title}>到院确认 ✅</Text>
        <Text className={styles.subtitle}>
          {isSigned ? '签名已完成，可查看确认记录' : '确认信息无误后完成签名'}
        </Text>
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
          {isRead || isSigned ? (
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
        <View className={styles.statusItem}>
          <Text className={styles.statusLabel}>患者签名</Text>
          {isSigned ? (
            <View className={classnames(styles.statusValue, styles.statusDone)}>
              <Text className={styles.statusDoneText}>✓ 已签名</Text>
            </View>
          ) : (
            <View className={classnames(styles.statusValue, styles.statusPending)}>
              <Text className={styles.statusPendingText}>待签名</Text>
            </View>
          )}
        </View>
      </View>

      {questions.length > 0 && (
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
                {q.status === 'answered' ? (
                  <View className={classnames(styles.statusTag, styles.tagAnswered)}>
                    <Text className={styles.tagAnsweredText}>已解答</Text>
                  </View>
                ) : (
                  <View className={classnames(styles.statusTag, styles.tagPending)}>
                    <Text className={styles.tagPendingText}>待解答</Text>
                  </View>
                )}
              </View>
              <Text className={styles.questionContent}>{q.content}</Text>

              {q.status === 'answered' && q.answer && (
                <View className={styles.answerBox}>
                  <Text className={styles.answerLabel}>回复：</Text>
                  <Text className={styles.answerText}>{q.answer}</Text>
                </View>
              )}

              {q.status === 'pending' && (
                <View className={styles.replyArea}>
                  <Textarea
                    className={styles.replyInput}
                    placeholder="填写简短回复（可选）..."
                    placeholderClass={styles.replyPlaceholder}
                    value={replyMap[q.id] || ''}
                    onInput={(e) => handleReplyChange(q.id, e.detail.value)}
                    maxlength={200}
                  />
                  <View className={styles.replyBtnRow}>
                    <View
                      className={styles.markBtn}
                      onClick={() => handleMarkExplained(q.id)}
                    >
                      <Text className={styles.markBtnText}>
                        {replyMap[q.id]?.trim() ? '提交回复' : '标记已解释'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {questions.length === 0 && (
        <View>
          <Text className={styles.sectionLabel}>提问记录</Text>
          <View className={styles.noQuestionTip}>
            <Text className={styles.noQuestionText}>暂无提问</Text>
          </View>
        </View>
      )}

      {isSigned && currentSignature && (
        <View>
          <Text className={styles.sectionLabel}>签名结果</Text>
          <View className={styles.signatureResultCard}>
            <View className={styles.signatureImageRow}>
              <Text className={styles.signatureLabel}>患者签名：</Text>
            </View>
            {currentSignature.imageUrl ? (
              <View className={styles.signaturePreview}>
                <Text className={styles.signaturePreviewText}>✍️ 签名已保存</Text>
              </View>
            ) : null}
            <View className={styles.signatureMeta}>
              <Text className={styles.signatureMetaText}>
                签名时间：{currentSignature.signedAt}
              </Text>
            </View>
          </View>
        </View>
      )}

      {!isSigned && showSignature && (
        <View className={styles.signatureSection}>
          <Text className={styles.sectionLabel}>患者签名</Text>
          <SignaturePad onComplete={handleSignatureComplete} />
        </View>
      )}

      {!isSigned && (
        <View className={styles.bottomBar}>
          {!showSignature ? (
            <View
              className={classnames(styles.signBtn, !canSign && styles.signBtnDisabled)}
              onClick={handleSign}
            >
              <Text className={styles.signBtnText}>
                {hasPendingQuestions ? '请先处理待解答疑问' : !isRead ? '请先阅读同意书' : '确认签名'}
              </Text>
            </View>
          ) : (
            <View className={styles.signBtn} style={{ opacity: 0.5 }}>
              <Text className={styles.signBtnText}>请在上方签名区完成签名</Text>
            </View>
          )}
        </View>
      )}
    </View>
  )
}

export default ConfirmPage
