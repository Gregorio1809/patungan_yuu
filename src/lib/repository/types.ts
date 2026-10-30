import type {
  ItemAssignment,
  ItemWithAssignments,
  NewItemInput,
  NewSessionInput,
  Participant,
  Session,
  SessionSettingsPatch,
  SessionSnapshot,
} from '../../types/database'

export interface SessionRepository {
  fetchRecentTitles(slugs: string[]): Promise<Record<string, string>>
  loadBySlug(slug: string): Promise<SessionSnapshot | null>
  loadById(id: string): Promise<SessionSnapshot | null>
  createSession(input: NewSessionInput): Promise<Session>
  addParticipant(sessionId: string, name: string): Promise<Participant>
  renameParticipant(participantId: string, name: string): Promise<Participant>
  removeParticipant(participantId: string): Promise<void>
  setPayer(sessionId: string, participantId: string | null): Promise<void>
  setParticipantPaid(
    participantId: string,
    paid: boolean,
    amount: number,
  ): Promise<Participant>
  updateSession(sessionId: string, patch: SessionSettingsPatch): Promise<Session>
  addItem(sessionId: string, input: NewItemInput): Promise<ItemWithAssignments>
  updateItem(itemId: string, input: NewItemInput): Promise<ItemWithAssignments>
  deleteItem(itemId: string): Promise<void>
  setClaim(
    sessionId: string,
    itemId: string,
    participantId: string,
    quantity: number | null,
  ): Promise<ItemAssignment | null>
  setClaimsForItems(
    sessionId: string,
    itemIds: string[],
    participantIds: string[],
  ): Promise<ItemAssignment[]>
  subscribe(
    session: Session,
    onChange: () => void,
    onStatus: (connected: boolean) => void,
  ): () => void
}
