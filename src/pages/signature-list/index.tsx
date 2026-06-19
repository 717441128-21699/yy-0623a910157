import React, { useState, useMemo, useCallback } from 'react'
import { View, Text, Image } from '@tarojs/components'
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
        const thumb = record.imageBase64 || record.imageUrl || ''
        return {
          record,
          thumb,
          patientName: record.patientName || apt?.patientName || '张女士',
          patientPhone: record.patientPhone || apt?.patientPhone || '138****6789',
          doctorName: record.doctorName || apt?.doctorName || '-',
          date: record.appointmentDate || apt?.date || '-',
          time: record.appointmentTime || apt?.time || '-',
          questionCount: questions.length,
          frontDeskNote: record.frontDeskNote
        }
      })
  }, [signatureRecords, getAppointment, getQuestionsByAppointment])

  const handleTapRecord = useCallback((appointmentId: string) => {
    Taro.navigateTo({ url: `/pages/signature-detail/index?id=${appointmentId}` })
  }, [])

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>签署档案 �</Text>
        <Text className={styles.subtitle}>可翻阅的到院确认记录，共 {enrichedRecords.length} 份</Text>
      </View>

      {enrichedRecords.length > 0 ? (
        enrichedRecords.map(({ record, thumb, patientName, patientPhone, doctorName, date, time, questionCount }) => (
          <View
            key={record.id}
            className={styles.recordCard}
            onClick={() => handleTapRecord(record.appointmentId)}
          >
            <View className={styles.recordMain}>
              <View className={styles.recordInfo}>
                <View className={styles.recordTop}>
                  <Text className={styles.recordName}>{record.treatmentName}</Text>
                  <View className={styles.recordStatus}>
                    <Text className={styles.recordStatusText}>✓ 已确认</Text>
                  </View>
                </View>
                <View className={styles.recordInfoRow}>
                  <Text className={styles.recordInfoLabel}>患者</Text>
                  <Text className={styles.recordInfoValue}>{patientName} · {patientPhone}</Text>
                </View>
                <View className={styles.recordInfoRow}>
                  <Text className={styles.recordInfoLabel}>医生</Text>
                  <Text className={styles.recordInfoValue}>{doctorName}</Text>
                </View>
                <View className={styles.recordInfoRow}>
                  <Text className={styles.recordInfoLabel}>就诊</Text>
                  <Text className={styles.recordInfoValue}>{date} {time}</Text>
                </View>
                <View className={styles.recordInfoRow}>
                  <Text className={styles.recordInfoLabel}>提问</Text>
                  <Text className={styles.recordInfoValue}>
                    {questionCount === 0 ? '无' : `${questionCount}条已处理`}
                  </Text>
                </View>
                <View className={styles.recordInfoRow}>
                  <Text className={styles.recordInfoLabel}>签名</Text>
                  <Text className={styles.recordInfoValue}>{record.signedAt}</Text>
                </View>
              </View>
              <View className={styles.recordThumb}>
                {thumb ? (
                  <Image
                    className={styles.thumbImage}
                    src={thumb}
                    mode="aspectFit"
                  />
                ) : (
                  <View className={styles.thumbFallback}>
                    <Text className={styles.thumbFallbackText}>✍️</Text>
                  </View>
                )}
              </View>
            </View>
            <View className={styles.recordMeta}>
              <Text className={styles.recordTime}>已归档 · 到院确认单</Text>
              <Text className={styles.recordArrow}>查看详情 ›</Text>
            </View>
          </View>
        ))
      ) : (
        <View className={styles.emptyTip}>
          <Text className={styles.emptyIcon}>📋</Text>
          <Text className={styles.emptyText}>暂无签署档案</Text>
          <Text className={styles.emptySub}>完成到院确认后会自动归档在这里</Text>
        </View>
      )}
    </View>
  )
}

export default SignatureListPage
