import { dataMode } from '../dataMode'
import { localRepository } from './localRepository'
import { supabaseRepository } from './supabaseRepository'
import type { SessionRepository } from './types'

export const sessionRepository: SessionRepository =
  dataMode === 'local' ? localRepository : supabaseRepository

export type { SessionRepository }
