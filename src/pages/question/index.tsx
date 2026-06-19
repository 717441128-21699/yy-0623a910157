import React, { useState, useCallback, useMemo } from 'react'
import { View, Text, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import QuestionCategory from '@/components/QuestionCategory'
import { useConsentStore } from '@/store/useConsentStore'
import { QUESTION_CATEGORY_MAP } from '@/types/appointment'
import type { QuestionCategory as QCategory } from '@/types/appointment'
import styles from './index.module.scss'

const QuestionPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<QCategory | null>(null)
  const [content, setContent] = useState('')

  const { getAppointment, getQuestionsByAppointment, addQuestion } = useConsentStore()

  const params = useMemo(() => {
    const instance = Taro.getCurrentInstance()
    return instance?.router?.params || {}
  }, [])

  const appointmentId = params.appointmentId || ''

  const appointment = useMemo(
    () => getAppointment(appointmentId),
    [appointmentId, getAppointment]
  )

  const existingQuestions = useMemo(
    () => getQuestionsByAppointment(appointmentId),
    [appointmentId, getQuestionsByAppointment]
  )

  const canSubmit = selectedCategory && content.trim().length > 0

  const handleSubmit = useCallback(() => {
    if (!canSubmit || !selectedCategory) return
    const newQuestion = {
      id: `q${Date.now()}`,
      appointmentId,
      category: selectedCategory,
      content: content.trim(),
      status: 'pending' as const,
      createdAt: new Date().toLocaleString('zh-CN')
    }
    addQuestion(newQuestion)
    console.info('[QuestionPage] question submitted', newQuestion.id)
    Taro.showToast({ title: '提问已提交', icon: 'success' })
    setTimeout(() => {
      Taro.navigateBack()
    }, 1500)
  }, [canSubmit, selectedCategory, content, appointmentId, addQuestion])

  return (
    <View className={styles.questionPage}>
      <View className={styles.header}>
        <Text className={styles.title}>提交疑问 💬</Text>
        <Text className={styles.subtitle}>
          {appointment ? `${appointment.treatmentName} - 选择分类提交您的问题` : '选择分类提交您的问题'}
        </Text>
      </View>

      <Text className={styles.sectionLabel}>选择问题分类</Text>
      <QuestionCategory selected={selectedCategory} onSelect={setSelectedCategory} />

      <View style={{ marginTop: '32rpx' }}>
        <Text className={styles.sectionLabel}>描述您的疑问</Text>
        <View className={styles.inputCard}>
          <Textarea
            className={styles.textArea}
            placeholderClass={styles.textAreaPlaceholder}
            placeholder="请详细描述您的疑问，咨询师会尽快回复..."
            value={content}
            onInput={(e) => setContent(e.detail.value)}
            maxlength={500}
          />
          <View className={styles.charCount}>
            <Text className={styles.charCountText}>{content.length}/500</Text>
          </View>
        </View>
      </View>

      {existingQuestions.length > 0 && (
        <View>
          <Text className={styles.sectionLabel}>历史提问</Text>
          {existingQuestions.map((q) => (
            <View key={q.id} className={styles.existingCard}>
              <View className={styles.existingHeader}>
                <View className={styles.existingCategory}>
                  <Text className={styles.existingCategoryText}>
                    {QUESTION_CATEGORY_MAP[q.category]}
                  </Text>
                </View>
                {q.status === 'pending' ? (
                  <View className={classnames(styles.statusTag, styles.statusPending)}>
                    <Text className={styles.statusPendingText}>待解答</Text>
                  </View>
                ) : (
                  <View className={classnames(styles.statusTag, styles.statusAnswered)}>
                    <Text className={styles.statusAnsweredText}>已解答</Text>
                  </View>
                )}
              </View>
              <Text className={styles.existingContent}>{q.content}</Text>
              {q.status === 'answered' && q.answer && (
                <View className={styles.answerBox}>
                  <Text className={styles.answerLabel}>咨询师回复：</Text>
                  <Text className={styles.answerContent}>{q.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      <View className={styles.bottomBar}>
        <View
          className={classnames(styles.submitBtn, canSubmit && styles.submitBtnActive)}
          onClick={handleSubmit}
        >
          <Text className={styles.submitBtnText}>提交疑问</Text>
        </View>
      </View>
    </View>
  )
}

export default QuestionPage
