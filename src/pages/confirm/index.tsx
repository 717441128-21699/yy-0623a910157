import React, { useState, useCallback, useMemo } from 'react'
import { View, Text, Textarea, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import SignaturePad from '@/components/SignaturePad'
import StatusBadge from '@/components/StatusBadge'
import { useConsentStore } from '@/store/useConsentStore'
import { QUESTION_CATEGORY_MAP } from '@/types/appointment'
import styles from './index.module.scss'

const PATIENT_NAME = '张女士'
const PATIENT_PHONE = '138****6789'

type VerifyStep = 'patient' | 'treatment' | 'questions' | 'done'

const ConfirmPage: React.FC = () => {
  const [showSignature, setShowSignature] = useState(false)
  const [replyMap, setReplyMap] = useState<Record<string, string>>({})
  const [verifyStep, setVerifyStep] = useState<VerifyStep>('patient')
  const [verifiedPatient, setVerifiedPatient] = useState(false)
  const [verifiedTreatment, setVerifiedTreatment] = useState(false)
  const [verifiedQuestions, setVerifiedQuestions] = useState(false)
  const [frontDeskNote, setFrontDeskNote] = useState('')
  const [, setTick] = useState(0)

  const {
    getAppointment, getTreatment, getQuestionsByAppointment,
    addSignatureRecord, updateConsentStatus, answerQuestion,
    getSignatureRecord
  } = useConsentStore()

  useDidShow(() => {
    setTick((t) => t + 1)
  })

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
    () => getSignatureRecord(appointmentId),
    [appointmentId, getSignatureRecord]
  )

  const hasPendingQuestions = pendingQuestions.length > 0
  const isRead = appointment?.consentStatus === 'read' || appointment?.consentStatus === 'confirmed'
  const isSigned = appointment?.consentStatus === 'signed'

  const allVerified = verifiedPatient && verifiedTreatment && verifiedQuestions
  const canSign = isRead && !hasPendingQuestions && allVerified

  const signatureSrc = currentSignature?.imageBase64 || currentSignature?.imageUrl || ''

  const handleReplyChange = useCallback((qId: string, val: string) => {
    setReplyMap((prev) => ({ ...prev, [qId]: val }))
  }, [])

  const handleMarkExplained = useCallback((qId: string) => {
    const reply = replyMap[qId]?.trim()
    answerQuestion(qId, reply || '前台已口头解释')
    console.info('[ConfirmPage] question answered', qId)
  }, [replyMap, answerQuestion])

  const handleNextStep = useCallback(() => {
    if (verifyStep === 'patient' && verifiedPatient) {
      setVerifyStep('treatment')
    } else if (verifyStep === 'treatment' && verifiedTreatment) {
      setVerifyStep('questions')
    } else if (verifyStep === 'questions' && verifiedQuestions) {
      setVerifyStep('done')
    }
  }, [verifyStep, verifiedPatient, verifiedTreatment, verifiedQuestions])

  const handleGoConsent = useCallback(() => {
    if (!appointment) return
    Taro.navigateTo({ url: `/pages/consent/index?id=${appointment.id}` })
  }, [appointment])

  const handleSign = useCallback(() => {
    if (!canSign) return
    setShowSignature(true)
  }, [canSign])

  const handleSignatureComplete = useCallback((payload: { imageUrl: string; imageBase64: string }) => {
    if (!appointment) return
    const record = {
      id: `s${Date.now()}`,
      appointmentId: appointment.id,
      treatmentName: appointment.treatmentName,
      patientName: PATIENT_NAME,
      patientPhone: PATIENT_PHONE,
      doctorName: appointment.doctorName,
      appointmentDate: appointment.date,
      appointmentTime: appointment.time,
      signedAt: new Date().toLocaleString('zh-CN'),
      imageUrl: payload.imageUrl,
      imageBase64: payload.imageBase64 || payload.imageUrl,
      frontDeskNote: frontDeskNote.trim()
    }
    addSignatureRecord(record)
    updateConsentStatus(appointment.id, 'signed')
    setShowSignature(false)
    console.info('[ConfirmPage] signature completed', record.id)
    Taro.showToast({ title: '到院确认完成', icon: 'success' })
  }, [appointment, addSignatureRecord, updateConsentStatus, frontDeskNote])

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
          {isSigned ? '到院确认已完成' : '前台核对信息后引导患者签名'}
        </Text>
      </View>

      {/* 基础预约信息 —— 始终展示 */}
      <View className={styles.appointmentCard}>
        <View className={styles.appointmentHeader}>
          <Text className={styles.treatmentName}>{treatment.name}</Text>
          <StatusBadge status={appointment.consentStatus} />
        </View>
        <View className={styles.appointmentInfo}>
          <Text className={styles.appointmentInfoText}>{appointment.doctorName}</Text>
          <Text className={styles.dot}>·</Text>
          <Text className={styles.appointmentInfoText}>{appointment.date} {appointment.time}</Text>
        </View>
      </View>

      {/* 已签名：展示完整到院确认单 */}
      {isSigned && currentSignature && (
        <View>
          <Text className={styles.sectionLabel}>到院确认单</Text>
          <View className={styles.confirmSheet}>
            <View className={styles.sheetRow}>
              <Text className={styles.sheetLabel}>患者姓名</Text>
              <Text className={styles.sheetValue}>{currentSignature.patientName || PATIENT_NAME}</Text>
            </View>
            <View className={styles.sheetRow}>
              <Text className={styles.sheetLabel}>联系电话</Text>
              <Text className={styles.sheetValue}>{currentSignature.patientPhone || PATIENT_PHONE}</Text>
            </View>
            <View className={styles.sheetRow}>
              <Text className={styles.sheetLabel}>治疗项目</Text>
              <Text className={styles.sheetValue}>{treatment.name}</Text>
            </View>
            <View className={styles.sheetRow}>
              <Text className={styles.sheetLabel}>就诊医生</Text>
              <Text className={styles.sheetValue}>{currentSignature.doctorName || appointment.doctorName}</Text>
            </View>
            <View className={styles.sheetRow}>
              <Text className={styles.sheetLabel}>预约时间</Text>
              <Text className={styles.sheetValue}>{currentSignature.appointmentDate || appointment.date} {currentSignature.appointmentTime || appointment.time}</Text>
            </View>
            <View className={styles.sheetRow}>
              <Text className={styles.sheetLabel}>同意书阅读</Text>
              <Text className={classnames(styles.sheetValue, styles.sheetSuccess)}>✓ 已阅读</Text>
            </View>
            <View className={styles.sheetRow}>
              <Text className={styles.sheetLabel}>疑问处理</Text>
              <Text className={classnames(styles.sheetValue, styles.sheetSuccess)}>
                {questions.length === 0 ? '无提问' : `${questions.length}条已处理`}
              </Text>
            </View>

            {questions.length > 0 && (
              <View className={styles.sheetQuestionBlock}>
                <Text className={styles.sheetQuestionTitle}>提问及回复</Text>
                {questions.map((q) => (
                  <View key={q.id} className={styles.sheetQuestionItem}>
                    <View className={styles.sheetQuestionMeta}>
                      <Text className={styles.sheetQuestionCategory}>{QUESTION_CATEGORY_MAP[q.category]}</Text>
                    </View>
                    <Text className={styles.sheetQuestionText}>问：{q.content}</Text>
                    {q.answer && (
                      <Text className={styles.sheetAnswerText}>答：{q.answer}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {currentSignature.frontDeskNote && (
              <View className={styles.sheetNoteBlock}>
                <Text className={styles.sheetNoteLabel}>前台备注</Text>
                <Text className={styles.sheetNoteText}>{currentSignature.frontDeskNote}</Text>
              </View>
            )}

            <View className={styles.sheetSignatureBlock}>
              <Text className={styles.sheetLabel}>患者签名</Text>
              {signatureSrc ? (
                <View className={styles.sheetSignatureImageBox}>
                  <Image
                    className={styles.sheetSignatureImage}
                    src={signatureSrc}
                    mode="aspectFit"
                  />
                </View>
              ) : (
                <View className={styles.signaturePreview}>
                  <Text className={styles.signaturePreviewText}>✍️ 签名已保存</Text>
                </View>
              )}
            </View>
            <View className={styles.sheetRow}>
              <Text className={styles.sheetLabel}>签名时间</Text>
              <Text className={styles.sheetValue}>{currentSignature.signedAt}</Text>
            </View>
          </View>
        </View>
      )}

      {/* 未签名：前台核对流程 */}
      {!isSigned && (
        <View>
          <Text className={styles.sectionLabel}>前台核对流程</Text>
          <View className={styles.verifyStepper}>
            <View className={classnames(styles.step, verifyStep === 'patient' && styles.stepActive)}>
              <Text className={styles.stepNum}>1</Text>
              <Text className={styles.stepLabel}>核对身份</Text>
            </View>
            <View className={styles.stepLine} />
            <View className={classnames(styles.step, verifyStep === 'treatment' && styles.stepActive)}>
              <Text className={styles.stepNum}>2</Text>
              <Text className={styles.stepLabel}>核对项目</Text>
            </View>
            <View className={styles.stepLine} />
            <View className={classnames(styles.step, verifyStep === 'questions' && styles.stepActive)}>
              <Text className={styles.stepNum}>3</Text>
              <Text className={styles.stepLabel}>核对疑问</Text>
            </View>
          </View>

          {/* Step 1: 核对身份 */}
          {verifyStep === 'patient' && (
            <View className={styles.verifyCard}>
              <Text className={styles.verifyTitle}>① 核对患者身份</Text>
              <View className={styles.patientInfoBox}>
                <View className={styles.patientInfoRow}>
                  <Text className={styles.patientInfoLabel}>姓名</Text>
                  <Text className={styles.patientInfoValue}>{PATIENT_NAME}</Text>
                </View>
                <View className={styles.patientInfoRow}>
                  <Text className={styles.patientInfoLabel}>手机号</Text>
                  <Text className={styles.patientInfoValue}>{PATIENT_PHONE}</Text>
                </View>
              </View>
              <View
                className={classnames(styles.checkRow, verifiedPatient && styles.checkRowChecked)}
                onClick={() => setVerifiedPatient(!verifiedPatient)}
              >
                <View className={classnames(styles.checkbox, verifiedPatient && styles.checkboxChecked)}>
                  {verifiedPatient && <Text className={styles.checkMark}>✓</Text>}
                </View>
                <Text className={styles.checkLabel}>已确认患者身份信息无误</Text>
              </View>
              <View
                className={classnames(styles.nextBtn, !verifiedPatient && styles.nextBtnDisabled)}
                onClick={handleNextStep}
              >
                <Text className={styles.nextBtnText}>下一步</Text>
              </View>
            </View>
          )}

          {/* Step 2: 核对项目 + 同意书状态 */}
          {verifyStep === 'treatment' && (
            <View className={styles.verifyCard}>
              <Text className={styles.verifyTitle}>② 核对治疗项目</Text>
              <View className={styles.treatmentCheckCard}>
                <Text className={styles.treatmentCheckName}>{treatment.name}</Text>
                <Text className={styles.treatmentCheckSub}>
                  {appointment.doctorName} · {appointment.date} {appointment.time}
                </Text>
              </View>
              {!isRead && (
                <View className={styles.consentWarn}>
                  <Text className={styles.consentWarnText}>
                    ⚠️ 患者尚未阅读知情同意书，建议先完成阅读再继续
                  </Text>
                  <View className={styles.consentWarnBtn} onClick={handleGoConsent}>
                    <Text className={styles.consentWarnBtnText}>打开同意书</Text>
                  </View>
                </View>
              )}
              {isRead && (
                <View className={styles.consentOk}>
                  <Text className={styles.consentOkText}>✓ 患者已阅读知情同意书</Text>
                </View>
              )}
              <View
                className={classnames(styles.checkRow, verifiedTreatment && styles.checkRowChecked)}
                onClick={() => setVerifiedTreatment(!verifiedTreatment)}
              >
                <View className={classnames(styles.checkbox, verifiedTreatment && styles.checkboxChecked)}>
                  {verifiedTreatment && <Text className={styles.checkMark}>✓</Text>}
                </View>
                <Text className={styles.checkLabel}>已确认治疗项目信息无误</Text>
              </View>
              <View className={styles.verifyBtnRow}>
                <View
                  className={styles.prevBtn}
                  onClick={() => setVerifyStep('patient')}
                >
                  <Text className={styles.prevBtnText}>上一步</Text>
                </View>
                <View
                  className={classnames(styles.nextBtn, !verifiedTreatment && styles.nextBtnDisabled)}
                  onClick={handleNextStep}
                >
                  <Text className={styles.nextBtnText}>下一步</Text>
                </View>
              </View>
            </View>
          )}

          {/* Step 3: 核对疑问 */}
          {verifyStep === 'questions' && (
            <View className={styles.verifyCard}>
              <Text className={styles.verifyTitle}>③ 核对疑问处理情况</Text>
              {questions.length === 0 && (
                <View className={styles.noQuestionTip2}>
                  <Text className={styles.noQuestionText2}>患者暂无疑问提交</Text>
                </View>
              )}
              {questions.length > 0 && questions.map((q) => (
                <View key={q.id} className={styles.questionCard}>
                  <View className={styles.questionHeader}>
                    <View className={styles.questionCategory}>
                      <Text className={styles.questionCategoryText}>
                        {QUESTION_CATEGORY_MAP[q.category]}
                      </Text>
                    </View>
                    {q.status === 'answered' ? (
                      <View className={classnames(styles.statusTag, styles.tagAnswered)}>
                        <Text className={styles.tagAnsweredText}>已处理</Text>
                      </View>
                    ) : (
                      <View className={classnames(styles.statusTag, styles.tagPending)}>
                        <Text className={styles.tagPendingText}>待处理</Text>
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
              <View
                className={classnames(styles.checkRow, verifiedQuestions && styles.checkRowChecked)}
                onClick={() => setVerifiedQuestions(!verifiedQuestions)}
              >
                <View className={classnames(styles.checkbox, verifiedQuestions && styles.checkboxChecked)}>
                  {verifiedQuestions && <Text className={styles.checkMark}>✓</Text>}
                </View>
                <Text className={styles.checkLabel}>
                  {hasPendingQuestions ? '我已知晓有待解答疑问' : '所有疑问均已处理完毕'}
                </Text>
              </View>
              <View className={styles.verifyBtnRow}>
                <View
                  className={styles.prevBtn}
                  onClick={() => setVerifyStep('treatment')}
                >
                  <Text className={styles.prevBtnText}>上一步</Text>
                </View>
                <View
                  className={classnames(styles.nextBtn, !verifiedQuestions && styles.nextBtnDisabled)}
                  onClick={handleNextStep}
                >
                  <Text className={styles.nextBtnText}>完成核对</Text>
                </View>
              </View>
            </View>
          )}

          {/* 核对完成：进入签名 + 前台备注 */}
          {verifyStep === 'done' && !showSignature && (
            <View className={styles.verifyCard}>
              <View className={styles.verifyDone}>
                <Text className={styles.verifyDoneIcon}>✅</Text>
                <Text className={styles.verifyDoneTitle}>前台核对完成</Text>
                <Text className={styles.verifyDoneSub}>请引导患者完成签名确认</Text>
              </View>
              <View className={styles.noteSection}>
                <Text className={styles.noteLabel}>前台备注（可选）</Text>
                <Textarea
                  className={styles.noteInput}
                  placeholder="记录患者当天特殊说明、已口头解释的重点等..."
                  placeholderClass={styles.replyPlaceholder}
                  value={frontDeskNote}
                  onInput={(e) => setFrontDeskNote(e.detail.value)}
                  maxlength={300}
                />
              </View>
            </View>
          )}

          {!isSigned && verifyStep === 'done' && showSignature && (
            <View className={styles.signatureSection}>
              <Text className={styles.sectionLabel}>患者签名</Text>
              <SignaturePad onComplete={handleSignatureComplete} />
            </View>
          )}

          {/* 底部操作栏 */}
          <View className={styles.bottomBar}>
            {verifyStep !== 'done' && (
              <View className={styles.bottomTip}>
                <Text className={styles.bottomTipText}>
                  请按步骤完成核对（{['patient', 'treatment', 'questions'].indexOf(verifyStep) + 1}/3）
                </Text>
              </View>
            )}
            {verifyStep === 'done' && !showSignature && (
              <View
                className={classnames(styles.signBtn, !canSign && styles.signBtnDisabled)}
                onClick={handleSign}
              >
                <Text className={styles.signBtnText}>
                  {!isRead ? '请先完成同意书阅读' : hasPendingQuestions ? '请先处理待解答疑问' : '开始签名'}
                </Text>
              </View>
            )}
            {verifyStep === 'done' && showSignature && (
              <View className={styles.signBtn} style={{ opacity: 0.5 }}>
                <Text className={styles.signBtnText}>请在上方签名区完成签名</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  )
}

export default ConfirmPage
