import { RiMoonLine, RiSunLine, RiTranslate2 } from '@remixicon/react'
import { useTranslation } from '../i18n/useTranslation'
import { usePreferencesStore } from '../store/preferences'
import { Button } from '../ui/Button'
import { cn } from '../ui/cn'

interface PreferencesControlsProps {
  className?: string
}

export function PreferencesControls({
  className,
}: PreferencesControlsProps) {
  const { t } = useTranslation()
  const language = usePreferencesStore(state => state.language)
  const theme = usePreferencesStore(state => state.theme)
  const toggleLanguage = usePreferencesStore(state => state.toggleLanguage)
  const toggleTheme = usePreferencesStore(state => state.toggleTheme)

  const languageLabel =
    language === 'id'
      ? t('preferences.switchToEnglish')
      : t('preferences.switchToIndonesian')
  const themeLabel =
    theme === 'dark'
      ? t('preferences.lightMode')
      : t('preferences.darkMode')

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Button
        variant="neutral"
        mode="ghost"
        size="sm"
        onClick={toggleLanguage}
        aria-label={languageLabel}
        title={languageLabel}
      >
        <RiTranslate2 className="size-4" />
        <span className="text-[10px] font-semibold tracking-wide">
          {language.toUpperCase()}
        </span>
      </Button>

      <Button
        variant="neutral"
        mode="ghost"
        size="icon"
        onClick={toggleTheme}
        aria-label={themeLabel}
        title={themeLabel}
      >
        {theme === 'dark' ? (
          <RiSunLine className="size-5" />
        ) : (
          <RiMoonLine className="size-5" />
        )}
      </Button>
    </div>
  )
}
