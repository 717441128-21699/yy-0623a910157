import React, { useMemo } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import AppointmentCard from '@/components/AppointmentCard'
import { useConsentStore } from '@/store/useConsentStore'
import styles from './index.module.scss'

const HomePage: React.FC = () => {
  const { appointments } = useConsentStore()

  const pendingCount = useMemo(
    () => appointments.filter((a) => a.consentStatus !== 'signed').length,
    [appointments]
  )

  const unreadCount = useMemo(
    () => appointments.filter((a) => a.consentStatus === 'unread').length,
    [appointments]
  )

  const handleTapConsent = (id: string) => {
    Taro.navigateTo({ url: `/pages/consent/index?id=${id}` })
  }

  const handleTapConfirm = (id: string) => {
    Taro.navigateTo({ url: `/pages/confirm/index?id=${id}` })
  }

  return (
    <View className={styles.homePage}>
      <View className={styles.header}>
        <Text className={styles.greeting}>您好，张女士 👋</Text>
        <Text className={styles.subGreeting}>请提前阅读知情同意书，到院更省时</Text>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statCard}>
          <Text className={styles.statNumber}>{pendingCount}</Text>
          <Text className={styles.statLabel}>待处理预约</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statNumber}>{unreadCount}</Text>
          <Text className={styles.statLabel}>未阅读同意书</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statNumber}>{appointments.length}</Text>
          <Text className={styles.statLabel}>全部预约</Text>
        </View>
      </View>

      <Text className={styles.sectionTitle}>预约列表</Text>

      {appointments.length > 0 ? (
        appointments.map((apt) => (
          <AppointmentCard
            key={apt.id}
            appointment={apt}
            onTapConsent={handleTapConsent}
            onTapConfirm={handleTapConfirm}
          />
        ))
      ) : (
        <View className={styles.emptyTip}>
          <Text className={styles.emptyIcon}>📋</Text>
          <Text className={styles.emptyText}>暂无预约记录</Text>
        </View>
      )}
    </View>
  )
}

export default HomePage
