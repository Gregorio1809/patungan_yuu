export type DiscountType = 'percent' | 'amount'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Session {
  id: string
  slug: string
  title: string
  bill_discount_type: DiscountType
  bill_discount_value: number
  tax_percent: number
  created_at: string
}

export interface Participant {
  id: string
  session_id: string
  name: string
  created_at: string
}

export interface Item {
  id: string
  session_id: string
  name: string
  price: number
  quantity: number
  discount_type: DiscountType
  discount_value: number
  created_at: string
}

export interface ItemAssignment {
  item_id: string
  participant_id: string
  session_id: string
  quantity: number
}

export interface ItemWithAssignments extends Item {
  item_assignments: ItemAssignment[]
}

export interface SessionSnapshot extends Session {
  participants: Participant[]
  items: ItemWithAssignments[]
}

export interface SessionSettingsPatch {
  title: string
  billDiscountType: DiscountType
  billDiscountValue: number
  taxPercent: number
}

export interface NewSessionInput {
  title: string
  billDiscountType: DiscountType
  billDiscountValue: number
  taxPercent: number
}

export interface NewItemInput {
  name: string
  price: number
  quantity: number
  discountType: DiscountType
  discountValue: number
}

export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string
          slug: string
          title: string
          bill_discount_type: string
          bill_discount_value: number
          tax_percent: number
          created_at: string
        }
        Insert: {
          id?: string
          slug?: string
          title: string
          bill_discount_type?: string
          bill_discount_value?: number
          tax_percent?: number
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          bill_discount_type?: string
          bill_discount_value?: number
          tax_percent?: number
          created_at?: string
        }
        Relationships: []
      }
      participants: {
        Row: {
          id: string
          session_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          name?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'participants_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'sessions'
            referencedColumns: ['id']
          },
        ]
      }
      items: {
        Row: {
          id: string
          session_id: string
          name: string
          price: number
          quantity: number
          discount_type: string
          discount_value: number
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          name: string
          price: number
          quantity?: number
          discount_type?: string
          discount_value?: number
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          name?: string
          price?: number
          quantity?: number
          discount_type?: string
          discount_value?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'items_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'sessions'
            referencedColumns: ['id']
          },
        ]
      }
      item_assignments: {
        Row: {
          item_id: string
          participant_id: string
          session_id: string
          quantity: number
        }
        Insert: {
          item_id: string
          participant_id: string
          session_id: string
          quantity?: number
        }
        Update: {
          item_id?: string
          participant_id?: string
          session_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: 'item_assignments_item_id_session_id_fkey'
            columns: ['item_id', 'session_id']
            isOneToOne: false
            referencedRelation: 'items'
            referencedColumns: ['id', 'session_id']
          },
          {
            foreignKeyName: 'item_assignments_participant_id_session_id_fkey'
            columns: ['participant_id', 'session_id']
            isOneToOne: false
            referencedRelation: 'participants'
            referencedColumns: ['id', 'session_id']
          },
        ]
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
