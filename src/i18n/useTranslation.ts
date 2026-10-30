import { useCallback } from 'react'
import { usePreferencesStore } from '../store/preferences'
import {
  translate,
  type Params,
  type TranslationKey,
} from './translations'

export function useTranslation() {
  const language = usePreferencesStore(state => state.language)
  const t = useCallback(
    (key: TranslationKey, params?: Params) =>
      translate(language, key, params),
    [language],
  )

  return { t, language }
}
