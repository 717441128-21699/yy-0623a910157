import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

interface ConsentSectionProps {
  title: string
  content: string
  icon?: string
  highlight?: boolean
}

const ConsentSection: React.FC<ConsentSectionProps> = ({ title, content, icon, highlight }) => {
  return (
    <View className={styles.section}>
      <View className={styles.titleRow}>
        {icon && <Text className={styles.icon}>{icon}</Text>}
        <Text className={styles.title}>{title}</Text>
      </View>
      <Text className={highlight ? styles.highlightContent : styles.content}>{content}</Text>
    </View>
  )
}

export default ConsentSection
