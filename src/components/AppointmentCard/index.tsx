import React from 'react'
import { View, Text } from '@tarojs/components'
import StatusBadge from '@/components/StatusBadge'
import type { Appointment } from '@/types/appointment'
import styles from './index.module.scss'

interface AppointmentCardProps {
  appointment: Appointment
  onTapConsent: (id: string) => void
  onTapConfirm: (id: string) => void
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onTapConsent, onTapConfirm }) => {
  const isSigned = appointment.consentStatus === 'signed'
  const isUnread = appointment.consentStatus === 'unread'

  return (
    <View className={styles.card}>
      <View className={styles.mainArea} onClick={() => onTapConsent(appointment.id)}>
        <View className={styles.header}>
          <Text className={styles.treatmentName}>{appointment.treatmentName}</Text>
          <StatusBadge status={appointment.consentStatus} />
        </View>
        <View className={styles.info}>
          <Text className={styles.infoText}>{appointment.doctorName}</Text>
          <Text className={styles.dot}>·</Text>
          <Text className={styles.infoText}>{appointment.date}</Text>
          <Text className={styles.dot}>·</Text>
          <Text className={styles.infoText}>{appointment.time}</Text>
        </View>
        {appointment.hasQuestions && appointment.pendingQuestionCount > 0 && (
          <View className={styles.questionTip}>
            <Text className={styles.questionTipText}>
              {appointment.pendingQuestionCount}条疑问待解答
            </Text>
          </View>
        )}
        <View className={styles.actionHint}>
          <Text className={styles.actionHintText}>
            {isUnread ? '点击阅读知情同意书' : '查看知情同意书'}
          </Text>
        </View>
      </View>

      <View className={styles.confirmEntry} onClick={() => onTapConfirm(appointment.id)}>
        <Text className={styles.confirmEntryText}>
          {isSigned ? '✅ 已签名 · 查看到院确认单' : '🏥 到院确认'}
        </Text>
      </View>
    </View>
  )
}

export default AppointmentCard
