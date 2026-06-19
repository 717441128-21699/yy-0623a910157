import React from 'react'
import { View, Text } from '@tarojs/components'
import { knowledgeList, categoryIconMap } from '@/data/knowledge'
import { QUESTION_CATEGORY_MAP } from '@/types/appointment'
import styles from './index.module.scss'

const KnowledgePage: React.FC = () => {
  return (
    <View className={styles.knowledgePage}>
      <View className={styles.header}>
        <Text className={styles.title}>治疗须知 📖</Text>
        <Text className={styles.subtitle}>了解治疗项目，来诊更安心</Text>
      </View>

      <View className={styles.searchBox}>
        <Text className={styles.searchPlaceholder}>🔍 搜索治疗项目...</Text>
      </View>

      {knowledgeList.map((item) => (
        <View key={item.id} className={styles.card}>
          <View className={styles.cardHeader}>
            <View className={styles.categoryTag}>
              <Text className={styles.categoryTagText}>
                {categoryIconMap[item.category] || ''} {item.category}
              </Text>
            </View>
            <Text className={styles.cardTitle}>{item.title}</Text>
          </View>
          <Text className={styles.cardSummary}>{item.summary}</Text>
          <View className={styles.tagRow}>
            {item.tags.map((tag) => (
              <View key={tag} className={styles.miniTag}>
                <Text className={styles.miniTagText}>{QUESTION_CATEGORY_MAP[tag]}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  )
}

export default KnowledgePage
