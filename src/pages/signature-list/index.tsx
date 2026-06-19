import React, { useState, useMemo, useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useConsentStore } from '@/store/useConsentStore'
import styles from './index.module.scss'

const SignatureListPage: React.FC = () => {
  const { signatureRecords, getAppointment, getQuestionsByAppointment } = useConsentStore()
  const [, setTick] = useState(0)

  useDidShow(() => {
    setTick((t) => t + 1)
  })

  const enrichedRecords = useMemo(() => {
    return [...signatureRecords]
      .sort((a, b) => (a.signedAt < b.signedAt ? 1 : -1))
      .map((record) => {
        const apt = getAppointment(record.appointmentId)
        const questions = getQuestionsByAppointment(record.appointmentId)
        return {
          record,
          doctorName: apt?.doctorName || '-',
          date: apt?.date || '-',
          time: apt?.time || '-',
          questionCount: questions.length
        }
      })
  }, [signatureRecords, getAppointment, getQuestionsByAppointment])

  const handleTapRecord = useCallback((appointmentId: string) => {
    Taro.navigateTo({ url: `/pages/signature-detail/index?id=${appointmentId}` })
  }, [])

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>签名记录 📋</Text>
        <Text className={styles.subtitle}>所有已完成的到院确认记录</Text>
      </View>

      {enrichedRecords.length > 0 ? (
        enrichedRecords.map(({ record, doctorName, date, time, questionCount }) => (
          <View
            key={record.id}
            className={styles.recordCard}
            onClick={() => handleTapRecord(record.appointmentId)}
          >
            <View className={styles.recordTop}>
              <Text className={styles.recordName}>{record.treatmentName}</Text>
              <View className={styles.recordStatus}>
                <Text className={styles.recordStatusText}>✓ 已确认</Text>
              </View>
            </View>
            <View className={styles.recordInfo}>
              <Text className={styles.recordInfoText}>{doctorName}</Text>
              <Text className={styles.recordInfoText}>·</Text>
              <Text className={styles.recordInfoText}>{date} {time}</Text>
              {questionCount > 0 && (
                <>
                  <Text className={styles.recordInfoText}>·</Text>
                  <Text className={styles.recordInfoText}>{questionCount}条提问</Text>
                </>
              )}
            </View>
            <View className={styles.recordMeta}>
              <Text className={styles.recordTime}>签名时间：{record.signedAt}</Text>
              <Text className={styles.recordArrow}>›</Text>
            </View>
          </View>
        ))
      ) : (
        <View className={styles.emptyTip}>
          <Text className={styles.emptyIcon}>📋</Text>
          <Text className={styles.emptyText}>暂无签名记录</Text>
        </View>
      )}
    </View>
  )
}

export default SignatureListPage
