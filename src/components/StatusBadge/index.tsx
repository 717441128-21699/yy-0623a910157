import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import type { ConsentStatus } from '@/types/appointment'
import styles from './index.module.scss'

interface StatusBadgeProps {
  status: ConsentStatus
}

const STATUS_CONFIG: Record<ConsentStatus, { label: string; styleKey: string }> = {
  unread: { label: '未阅读', styleKey: 'unread' },
  read: { label: '已阅读', styleKey: 'read' },
  confirmed: { label: '待签名', styleKey: 'confirmed' },
  signed: { label: '已签名', styleKey: 'signed' }
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = STATUS_CONFIG[status]
  return (
    <View className={classnames(styles.badge, styles[config.styleKey])}>
      <Text className={styles.text}>{config.label}</Text>
    </View>
  )
}

export default StatusBadge
