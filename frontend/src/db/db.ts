import Dexie, { type Table } from 'dexie'
import type { ChatMessage, Conversation } from '../types'

/**
 * IndexedDB 持久化层（Dexie.js）。
 *
 * 当前承载 AI 聊天记录；wrong_answers / review_items 表已预注册，
 * 供后续错题本（Task 11）与复习系统（Task 13）直接复用。
 *
 * 所有表按 user_id 分区：未登录用户使用 'local' 占位。
 */
export interface WrongAnswerRecord {
  id: string
  user_id: string
  problem_id: string
  error_type: 'WA' | 'TLE' | 'RE'
  error_message?: string
  submission_id?: string
  created_at: string
}

export interface ReviewItemRecord {
  id: string
  user_id: string
  knowledge_point_id: string
  stage: number
  next_review_date: string
  last_reviewed_at?: string
  created_at: string
}

export class AppDB extends Dexie {
  conversations!: Table<Conversation, string>
  messages!: Table<ChatMessage, string>
  wrong_answers!: Table<WrongAnswerRecord, string>
  review_items!: Table<ReviewItemRecord, string>

  constructor() {
    super('algo-tutor-db')
    this.version(1).stores({
      conversations: 'id, user_id, updated_at',
      messages: 'id, conversation_id, user_id, created_at',
      wrong_answers: 'id, user_id, created_at',
      review_items: 'id, user_id, next_review_date',
    })
  }
}

export const db = new AppDB()
