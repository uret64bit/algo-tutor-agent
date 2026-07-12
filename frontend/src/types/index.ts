export interface User {
  id: number
  email: string
  username: string
  avatar?: string
  role: 'student' | 'coach' | 'admin'
  created_at: string
}

export interface KnowledgePoint {
  id: number
  name: string
  description: string
  difficulty: 1 | 2 | 3 | 4 | 5
  prerequisites: number[]
  parent_id?: number
  children?: KnowledgePoint[]
  mastery_level?: number
  status: 'not_started' | 'learning' | 'mastered'
}

export interface Problem {
  id: number
  title: string
  description: string
  difficulty: 1 | 2 | 3 | 4 | 5
  knowledge_points: number[]
  acceptance_rate: number
  total_submissions: number
  time_limit: number
  memory_limit: number
  sample_input?: string
  sample_output?: string
  created_at: string
}

export interface ProblemListResponse {
  items: Problem[]
  total: number
  page: number
  page_size: number
}

export interface Lecture {
  id: number
  knowledge_point_id: number
  level: 1 | 2 | 3
  title: string
  content: string
  template_code?: Record<string, string>
}

export interface Submission {
  id: number
  problem_id: number
  user_id: number
  code: string
  language: 'cpp' | 'java' | 'python'
  status: 'pending' | 'judging' | 'AC' | 'WA' | 'TLE' | 'RE' | 'CE'
  time_used?: number
  memory_used?: number
  complexity_analysis?: string
  code_review?: string
  created_at: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  references?: { title: string; source: string }[]
  created_at: string
}

export interface WrongAnswer {
  id: number
  problem: Problem
  error_type: 'WA' | 'TLE' | 'RE'
  error_message?: string
  submission_id: number
  created_at: string
  similar_problems?: Problem[]
}

export interface Notification {
  id: number
  type: 'review' | 'push' | 'system'
  title: string
  content: string
  is_read: boolean
  created_at: string
  link?: string
}

export interface ReviewItem {
  id: number
  knowledge_point: KnowledgePoint
  next_review_date: string
  stage: number
  problem?: Problem
}

export interface Solution {
  id: number
  problem_id: number
  user: User
  title: string
  content: string
  language: string
  likes: number
  is_featured: boolean
  comments_count: number
  created_at: string
}

export interface Comment {
  id: number
  solution_id: number
  user: User
  content: string
  likes: number
  created_at: string
}

export interface Progress {
  total_knowledge_points: number
  mastered_knowledge_points: number
  total_problems: number
  solved_problems: number
  acceptance_rate: number
  streak_days: number
  mastery_by_category: { name: string; value: number }[]
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export interface Hint {
  level: 1 | 2 | 3
  content: string
}

export interface JudgeResult {
  status: 'AC' | 'WA' | 'TLE' | 'RE' | 'CE'
  time_used: number
  memory_used: number
  test_case_results?: {
    status: 'AC' | 'WA' | 'TLE' | 'RE'
    input: string
    expected_output: string
    actual_output?: string
    time_used: number
  }[]
  complexity_analysis: string
  code_review: string
}
