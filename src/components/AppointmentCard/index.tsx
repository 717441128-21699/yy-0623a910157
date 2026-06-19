import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import StatusBadge from '@/components/StatusBadge'
import type { Appointment } from '@/types/appointment'
import styles from './index.module.scss'

interface AppointmentCardProps {
  appointment: Appointment
  onTap: (id: string) => void
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onTap }) => {
  return (
    <View
      className={styles.card}
      onClick={() => onTap(appointment.id)}
    >
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
          {appointment.consentStatus === 'unread' ? '点击阅读知情同意书' : '点击查看详情'}
        </Text>
      </View>
    </View>
  )
}

export default AppointmentCard
