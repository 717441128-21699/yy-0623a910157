import React, { useState, useRef, useCallback, useEffect } from 'react'
import { View, Text, Canvas } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'

interface SignaturePadProps {
  onComplete: (payload: { imageUrl: string; imageBase64: string }) => void
  onClear?: () => void
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onComplete, onClear }) => {
  const [hasDrawn, setHasDrawn] = useState(false)
  const canvasId = 'signatureCanvas'
  const ctxRef = useRef<ReturnType<typeof Taro.createCanvasContext> | null>(null)
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    ctxRef.current = Taro.createCanvasContext(canvasId)
    if (ctxRef.current) {
      ctxRef.current.setStrokeStyle('#1d2129')
      ctxRef.current.setLineWidth(3)
      ctxRef.current.setLineCap('round')
      ctxRef.current.setLineJoin('round')
    }
  }, [])

  const handleTouchStart = useCallback((e) => {
    if (!ctxRef.current) return
    const touch = e.touches[0]
    lastPos.current = { x: touch.x, y: touch.y }
    ctxRef.current.beginPath()
    ctxRef.current.moveTo(touch.x, touch.y)
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (!ctxRef.current || !lastPos.current) return
    const touch = e.touches[0]
    ctxRef.current.lineTo(touch.x, touch.y)
    ctxRef.current.stroke()
    ctxRef.current.draw(true)
    ctxRef.current.beginPath()
    ctxRef.current.moveTo(touch.x, touch.y)
    lastPos.current = { x: touch.x, y: touch.y }
    if (!hasDrawn) {
      setHasDrawn(true)
    }
  }, [hasDrawn])

  const handleTouchEnd = useCallback(() => {
    lastPos.current = null
  }, [])

  const handleConfirm = useCallback(() => {
    if (!hasDrawn) {
      Taro.showToast({ title: '请先签名', icon: 'none' })
      return
    }
    Taro.canvasToTempFilePath({
      canvasId,
      success: (res) => {
        console.info('[SignaturePad] signature completed, tempFilePath:', res.tempFilePath)
        let imageBase64 = ''
        try {
          const fs = Taro.getFileSystemManager()
          const data = fs.readFileSync(res.tempFilePath, 'base64')
          imageBase64 = typeof data === 'string' ? data : ''
          if (imageBase64) {
            imageBase64 = 'data:image/png;base64,' + imageBase64
          }
        } catch (err) {
          console.warn('[SignaturePad] readFileSync to base64 failed, fallback to tempPath', err)
        }
        onComplete({
          imageUrl: res.tempFilePath,
          imageBase64
        })
      },
      fail: (err) => {
        console.error('[SignaturePad] canvasToTempFilePath failed', err)
        onComplete({
          imageUrl: 'signature_data_' + Date.now(),
          imageBase64: ''
        })
      }
    })
  }, [hasDrawn, onComplete])

  const handleClear = useCallback(() => {
    if (!ctxRef.current) return
    ctxRef.current.draw()
    setHasDrawn(false)
    if (onClear) {
      onClear()
    }
  }, [onClear])

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
      <View className={styles.canvasWrap}>
        <Canvas
          canvasId={canvasId}
          className={styles.canvas}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
        {!hasDrawn && (
          <View className={styles.placeholderWrap}>
            <Text className={styles.placeholder}>在此区域签名确认</Text>
          </View>
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
