import React, { useState, useMemo, useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import StatusBadge from '@/components/StatusBadge'
import { useConsentStore } from '@/store/useConsentStore'
import type { ConsentStatus } from '@/types/appointment'
import styles from './index.module.scss'

type LedgerGroup = 'pending' | 'ready' | 'done'

const GROUP_LABEL: Record<LedgerGroup, string> = {
  pending: '未核对',
  ready: '待签名',
  done: '已完成'
}

const GROUP_COLOR: Record<LedgerGroup, string> = {
  pending: '#F7BA1E',
  ready: '#4EA3A0',
  done: '#00B42A'
}

const classify = (status: ConsentStatus, pendingQCount: number): LedgerGroup => {
  if (status === 'signed') return 'done'
  if (status === 'read' || status === 'confirmed') {
    return pendingQCount > 0 ? 'pending' : 'ready'
  }
  return 'pending'
}

const FrontDeskPage: React.FC = () => {
  const { getTodayAppointments, getQuestionsByAppointment, getSignatureRecord } = useConsentStore()
  const [, setTick] = useState(0)

  useDidShow(() => {
    setTick((t) => t + 1)
  })

  const groups = useMemo(() => {
    const today = getTodayAppointments()
    const buckets: Record<LedgerGroup, typeof today> = {
      pending: [],
      ready: [],
      done: []
    }
    for (const apt of today) {
      const qs = getQuestionsByAppointment(apt.id)
      const pendingCount = qs.filter((q) => q.status === 'pending').length
      buckets[classify(apt.consentStatus, pendingCount)].push(apt)
    }
    return buckets
  }, [getTodayAppointments, getQuestionsByAppointment])

  const handleTap = useCallback((appointmentId: string) => {
    Taro.navigateTo({ url: `/pages/confirm/index?id=${appointmentId}` })
  }, [])

  const handleTapDetail = useCallback((appointmentId: string) => {
    const record = getSignatureRecord(appointmentId)
    if (record) {
      Taro.navigateTo({ url: `/pages/signature-detail/index?id=${appointmentId}` })
    } else {
      Taro.navigateTo({ url: `/pages/confirm/index?id=${appointmentId}` })
    }
  }, [getSignatureRecord])

  const order: LedgerGroup[] = ['pending', 'ready', 'done']
  const totalCount = groups.pending.length + groups.ready.length + groups.done.length

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>前台到院台账 🏥</Text>
        <Text className={styles.subtitle}>今日共 {totalCount} 条预约，待处理 {groups.pending.length + groups.ready.length} 条</Text>
      </View>

      <View className={styles.summaryRow}>
        {order.map((key) => (
          <View key={key} className={styles.summaryCard} style={{ borderTopColor: GROUP_COLOR[key] }}>
            <Text className={styles.summaryNumber} style={{ color: GROUP_COLOR[key] }}>
              {groups[key].length}
            </Text>
            <Text className={styles.summaryLabel}>{GROUP_LABEL[key]}</Text>
          </View>
        ))}
      </View>

      {order.map((groupKey) => {
        const list = groups[groupKey]
        return (
          <View key={groupKey} className={styles.groupBlock}>
            <View className={styles.groupHeader}>
              <View className={styles.groupTitleBar} style={{ backgroundColor: GROUP_COLOR[groupKey] }} />
              <Text className={styles.groupTitle}>
                {GROUP_LABEL[groupKey]}（{list.length}）
              </Text>
            </View>
            {list.length === 0 ? (
              <View className={styles.groupEmpty}>
                <Text className={styles.groupEmptyText}>暂无{GROUP_LABEL[groupKey]}记录</Text>
              </View>
            ) : (
              list.map((apt) => {
                const qs = getQuestionsByAppointment(apt.id)
                const pendingCount = qs.filter((q) => q.status === 'pending').length
                const isSigned = apt.consentStatus === 'signed'
                return (
                  <View
                    key={apt.id}
                    className={styles.itemCard}
                    onClick={() => (isSigned ? handleTapDetail(apt.id) : handleTap(apt.id))}
                  >
                    <View className={styles.itemRow}>
                      <Text className={styles.itemTime}>{apt.time}</Text>
                      <View className={styles.itemMain}>
                        <View className={styles.itemTop}>
                          <Text className={styles.itemName}>{apt.treatmentName}</Text>
                          <StatusBadge status={apt.consentStatus} />
                        </View>
                        <View className={styles.itemSub}>
                          <Text className={styles.itemSubText}>{apt.doctorName}</Text>
                          <Text className={styles.itemSubDot}>·</Text>
                          <Text className={styles.itemSubText}>张女士</Text>
                          {apt.date && apt.date !== new Date().toISOString().slice(0, 10) && (
                            <>
                              <Text className={styles.itemSubDot}>·</Text>
                              <Text className={styles.itemSubText}>{apt.date}</Text>
                            </>
                          )}
                        </View>
                        {pendingCount > 0 && (
                          <View className={styles.itemBadge}>
                            <Text className={styles.itemBadgeText}>{pendingCount} 条待解答</Text>
                          </View>
                        )}
                      </View>
                      <Text className={styles.itemArrow}>›</Text>
                    </View>
                  </View>
                )
              })
            )}
          </View>
        )
      })}
    </View>
  )
}

export default FrontDeskPage
