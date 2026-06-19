import React, { useState, useRef, useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'

interface SignaturePadProps {
  onComplete: (signatureData: string) => void
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onComplete }) => {
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const paths = useRef<string[]>([])
  const currentPath = useRef<string[]>([])

  const handleTouchStart = useCallback((e) => {
    setIsDrawing(true)
    const touch = e.touches[0]
    currentPath.current = [`M${touch.x} ${touch.y}`]
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (!isDrawing) return
    const touch = e.touches[0]
    currentPath.current.push(`L${touch.x} ${touch.y}`)
    setHasDrawn(true)
  }, [isDrawing])

  const handleTouchEnd = useCallback(() => {
    if (currentPath.current.length > 0) {
      paths.current.push(currentPath.current.join(' '))
      currentPath.current = []
    }
    setIsDrawing(false)
  }, [])

  const handleConfirm = useCallback(() => {
    if (!hasDrawn) {
      Taro.showToast({ title: '请先签名', icon: 'none' })
      return
    }
    const signatureData = paths.current.join('|')
    console.info('[SignaturePad] signature completed')
    onComplete(signatureData)
  }, [hasDrawn, onComplete])

  const handleClear = useCallback(() => {
    paths.current = []
    currentPath.current = []
    setHasDrawn(false)
  }, [])

  return (
    <View className={styles.container}>
      <View className={styles.padHeader}>
        <Text className={styles.padTitle}>请在下方签名</Text>
        {hasDrawn && (
          <View className={styles.clearBtn} onClick={handleClear}>
            <Text className={styles.clearBtnText}>清除</Text>
          </View>
        )}
      </View>
      <View
        className={styles.pad}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {!hasDrawn && (
          <Text className={styles.placeholder}>在此区域签名确认</Text>
        )}
      </View>
      <View className={styles.btnRow}>
        <View className={styles.confirmBtn} onClick={handleConfirm}>
          <Text className={styles.confirmBtnText}>确认签名</Text>
        </View>
      </View>
    </View>
  )
}

export default SignaturePad
