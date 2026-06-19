import type { QuestionCategory } from '@/types/appointment'

export interface KnowledgeItem {
  id: string
  category: string
  title: string
  summary: string
  tags: QuestionCategory[]
}

export const knowledgeList: KnowledgeItem[] = [
  {
    id: 'k1',
    category: '正畸',
    title: '隐形矫正治疗须知',
    summary: '了解隐形矫正的基本流程、注意事项和常见问题，帮助您更好地配合治疗。',
    tags: ['duration', 'care']
  },
  {
    id: 'k2',
    category: '种植',
    title: '种植牙手术前后须知',
    summary: '种植手术各阶段的注意事项，术前准备和术后护理要点。',
    tags: ['pain', 'care']
  },
  {
    id: 'k3',
    category: '儿童',
    title: '儿童口腔保健指南',
    summary: '从涂氟到窝沟封闭，全面了解儿童口腔预防保健知识。',
    tags: ['pain', 'care']
  },
  {
    id: 'k4',
    category: '修复',
    title: '牙冠修复后注意事项',
    summary: '牙冠修复后的饮食、清洁和定期复查建议。',
    tags: ['care', 'duration']
  },
  {
    id: 'k5',
    category: '拔牙',
    title: '拔牙术后护理指南',
    summary: '智齿拔除后的肿胀处理、饮食建议和复查安排。',
    tags: ['pain', 'care']
  },
  {
    id: 'k6',
    category: '根管',
    title: '根管治疗全流程解析',
    summary: '了解根管治疗各步骤、疼痛管理和术后注意事项。',
    tags: ['pain', 'duration']
  },
  {
    id: 'k7',
    category: '美白',
    title: '牙齿美白效果与维护',
    summary: '冷光美白的原理、效果预期和日常维护方法。',
    tags: ['duration', 'care']
  },
  {
    id: 'k8',
    category: '牙周',
    title: '牙周治疗与日常维护',
    summary: '牙周基础治疗的过程、不适感和长期维护方案。',
    tags: ['pain', 'care']
  },
  {
    id: 'k9',
    category: '修复',
    title: '活动义齿使用指南',
    summary: '初戴义齿的适应期、日常清洁和维护方法。',
    tags: ['care', 'duration']
  },
  {
    id: 'k10',
    category: '费用',
    title: '门诊退费与调整政策',
    summary: '了解治疗过程中方案调整和退费的相关规定。',
    tags: ['refund']
  }
]

export const categoryIconMap: Record<string, string> = {
  '正畸': '🦷',
  '种植': '🌿',
  '儿童': '👶',
  '修复': '🔧',
  '拔牙': '💉',
  '根管': '🔬',
  '美白': '✨',
  '牙周': '🛡️',
  '费用': '💰'
}
