import { useState, type FormEvent } from 'react'
import { RiAddLine } from '@remixicon/react'
import { useTranslation } from '../i18n/useTranslation'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'

interface CreateSessionFormProps {
  pending?: boolean
  disabled?: boolean
  localMode?: boolean
  onCreate: (title: string) => void
}

export function CreateSessionForm({
  pending,
  disabled,
  localMode,
  onCreate,
}: CreateSessionFormProps) {
  const { t } = useTranslation()
  const [title, setTitle] = useState('')
  const [invalid, setInvalid] = useState(false)

  function submit(event: FormEvent) {
    event.preventDefault()
    const value = title.trim()
    if (!value) {
      setInvalid(true)
      return
    }
    setInvalid(false)
    onCreate(value)
  }

  return (
    <Card className="p-4 sm:p-5">
      <form onSubmit={submit}>
        <div>
          <Label htmlFor="patungan-new-session-title">
            {t('create.name')}
          </Label>
          <Input
            id="patungan-new-session-title"
            value={title}
            onChange={event => setTitle(event.target.value)}
            maxLength={80}
            placeholder={t('create.placeholder')}
            autoComplete="off"
          />
          <p className="mt-2 text-[11px] text-text-soft-400">
            {t('create.hint')}
          </p>
        </div>

        {invalid && (
          <p className="mt-2 text-label-sm text-error-base" role="alert">
            {t('create.required')}
          </p>
        )}

        <Button
          type="submit"
          className="mt-4 w-full"
          disabled={pending || disabled}
        >
          {!pending && !disabled && <RiAddLine className="size-4" />}
          {disabled
            ? t('create.disabled')
            : pending
              ? t('create.pending')
              : t('create.submit')}
        </Button>

        <p className="mt-3 text-center text-[11px] text-text-soft-400">
          {localMode ? t('create.localHint') : t('create.remoteHint')}
        </p>
      </form>
    </Card>
  )
}
