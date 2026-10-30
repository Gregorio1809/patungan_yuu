import { useMemo } from 'react'
import { useSessionStore } from '../store/session'
import { calcSession, emptyCalcResult } from '../lib/sessionCalc'

export function useSessionResult() {
  const session = useSessionStore(state => state.session)
  const participants = useSessionStore(state => state.participants)
  const items = useSessionStore(state => state.items)

  return useMemo(
    () =>
      session
        ? calcSession(session, participants, items)
        : emptyCalcResult(),
    [session, participants, items],
  )
}
