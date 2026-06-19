import React from 'react'
import { View, Text } from '@tarojs/components'
import { useConsentStore } from '@/store/useConsentStore'
import styles from './index.module.scss'

const MinePage: React.FC = () => {
  const { appointments, signatureRecords, questions } = useConsentStore()

  const signedCount = appointments.filter((a) => a.consentStatus === 'signed').length
  const pendingQuestionCount = questions.filter((q) => q.status === 'pending').length

  return (
    <View className={styles.minePage}>
      <View className={styles.profileHeader}>
        <View className={styles.avatar}>
          <Text className={styles.avatarText}>张</Text>
        </View>
        <Text className={styles.userName}>张女士</Text>
        <Text className={styles.userPhone}>138****6789</Text>
      </View>

      <View className={styles.content}>
        <View className={styles.statRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{appointments.length}</Text>
            <Text className={styles.statLabel}>总预约</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{signedCount}</Text>
            <Text className={styles.statLabel}>已签名</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{pendingQuestionCount}</Text>
            <Text className={styles.statLabel}>待解答</Text>
          </View>
        </View>

        <Text className={styles.sectionTitle}>功能</Text>
        <View className={styles.menuCard}>
          <View className={styles.menuItem}>
            <View className={styles.menuLeft}>
              <Text className={styles.menuIcon}>📋</Text>
              <Text className={styles.menuLabel}>签名记录</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem}>
            <View className={styles.menuLeft}>
              <Text className={styles.menuIcon}>💬</Text>
              <Text className={styles.menuLabel}>我的提问</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem}>
            <View className={styles.menuLeft}>
              <Text className={styles.menuIcon}>📞</Text>
              <Text className={styles.menuLabel}>联系诊所</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem}>
            <View className={styles.menuLeft}>
              <Text className={styles.menuIcon}>⚙️</Text>
              <Text className={styles.menuLabel}>设置</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default MinePage
