import Taro from '@tarojs/taro'

const STORAGE_KEY = 'consent_store_data'

export function loadPersistedState<T>(defaultValue: T): T {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw) as T
    }
  } catch (e) {
    console.error('[Storage] load failed', e)
  }
  return defaultValue
}

export function persistState<T>(state: T): void {
  try {
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('[Storage] persist failed', e)
  }
}
