import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import { QUESTION_CATEGORY_MAP } from '@/types/appointment'
import type { QuestionCategory as QCategory } from '@/types/appointment'
import styles from './index.module.scss'

interface QuestionCategoryProps {
  selected: QCategory | null
  onSelect: (category: QCategory) => void
}

const CATEGORIES: QCategory[] = ['pain', 'duration', 'refund', 'care']

const CATEGORY_ICONS: Record<QCategory, string> = {
  pain: '😣',
  duration: '⏱️',
  refund: '💰',
  care: '🩹'
}

const QuestionCategory: React.FC<QuestionCategoryProps> = ({ selected, onSelect }) => {
  return (
    <View className={styles.container}>
      {CATEGORIES.map((cat) => (
        <View
          key={cat}
          className={classnames(styles.chip, selected === cat && styles.chipActive)}
          onClick={() => onSelect(cat)}
        >
          <Text className={styles.chipIcon}>{CATEGORY_ICONS[cat]}</Text>
          <Text className={classnames(styles.chipText, selected === cat && styles.chipTextActive)}>
            {QUESTION_CATEGORY_MAP[cat]}
          </Text>
        </View>
      ))}
    </View>
  )
}

export default QuestionCategory
