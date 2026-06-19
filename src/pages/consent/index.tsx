import React, { useState, useCallback, useMemo } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import ConsentSection from '@/components/ConsentSection'
import StatusBadge from '@/components/StatusBadge'
import { useConsentStore } from '@/store/useConsentStore'
import styles from './index.module.scss'

const ConsentPage: React.FC = () => {
  const [agreed, setAgreed] = useState(false)
  const { getAppointment, getTreatment, updateConsentStatus } = useConsentStore()

  const params = useMemo(() => {
    const instance = Taro.getCurrentInstance()
    return instance?.router?.params || {}
  }, [])

  const appointment = useMemo(
    () => getAppointment(params.id || ''),
    [params.id, getAppointment]
  )

  const treatment = useMemo(
    () => (appointment ? getTreatment(appointment.treatmentId) : undefined),
    [appointment, getTreatment]
  )

  const handleQuestion = useCallback(() => {
    if (!appointment) return
    Taro.navigateTo({ url: `/pages/question/index?appointmentId=${appointment.id}` })
  }, [appointment])

  const handleConfirm = useCallback(() => {
    if (!agreed || !appointment) return
    updateConsentStatus(appointment.id, 'confirmed')
    console.info('[ConsentPage] consent confirmed', appointment.id)
    Taro.showToast({ title: '已确认阅读', icon: 'success' })
    setTimeout(() => {
      Taro.navigateBack()
    }, 1500)
  }, [agreed, appointment, updateConsentStatus])

  if (!appointment || !treatment) {
    return (
      <View className={styles.consentPage}>
        <View className={styles.body}>
          <Text>未找到预约信息</Text>
        </View>
      </View>
    )
  }

  return (
    <View className={styles.consentPage}>
      <View className={styles.topBanner}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text className={styles.bannerTitle}>{treatment.name}</Text>
          <StatusBadge status={appointment.consentStatus} />
        </View>
        <View className={styles.bannerInfo}>
          <Text className={styles.bannerInfoText}>{appointment.doctorName}</Text>
          <Text className={styles.bannerInfoText}>·</Text>
          <Text className={styles.bannerInfoText}>{appointment.date} {appointment.time}</Text>
        </View>
      </View>

      <View className={styles.body}>
        <ConsentSection
          title="治疗目的"
          content={treatment.purpose}
          icon="🎯"
        />
        <ConsentSection
          title="常见不适"
          content={treatment.discomfort}
          icon="⚠️"
        />
        <ConsentSection
          title="费用范围"
          content={treatment.costRange}
          icon="💰"
          highlight
        />
        <ConsentSection
          title="可选择方案"
          content={treatment.alternatives}
          icon="🔄"
        />

        <View className={styles.faqCard}>
          <Text className={styles.faqTitle}>❓ 常见问答</Text>
          {treatment.faqItems.map((faq, idx) => (
            <View key={idx} className={styles.faqItem}>
              <Text className={styles.faqQuestion}>Q: {faq.question}</Text>
              <Text className={styles.faqAnswer}>A: {faq.answer}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.checkboxRow} onClick={() => setAgreed(!agreed)}>
          <View className={classnames(styles.checkbox, agreed && styles.checkboxChecked)}>
            {agreed && <Text className={styles.checkMark}>✓</Text>}
          </View>
          <Text className={styles.checkboxLabel}>我已阅读并理解以上治疗说明</Text>
        </View>
        <View className={styles.btnRow}>
          <View className={styles.questionBtn} onClick={handleQuestion}>
            <Text className={styles.questionBtnText}>我有疑问</Text>
          </View>
          <View
            className={classnames(styles.confirmBtn, agreed && styles.confirmBtnActive)}
            onClick={handleConfirm}
          >
            <Text className={styles.confirmBtnText}>确认阅读</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default ConsentPage
