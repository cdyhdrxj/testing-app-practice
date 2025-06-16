export interface TestReadPreview {
  id: number
  category: Category
  name: string
}

export interface TestResult {
  id: number
  time_start: string
  time_end: string
  score: number
  full_score: number
  test: TestReadPreview
  user: User
}

export interface Category {
  id: number
  name: string
}

export interface User {
  id: number
  name: string
  is_admin: boolean
}

export interface UserAdmin {
  id: number
  name: string
  is_admin: boolean
  is_blocked: boolean
}

export interface UserCreate {
  name: string
  password: string
}

export interface AdminCreate {
  name: string
  password: string
}

export enum QuestionType {
  SINGLE = 0,
  MULTIPLE = 1,
  TEXT = 2,
}

export interface AnswerCreate {
  id: number | undefined
  text: string
  is_correct: boolean
}

export interface Answer {
  id: number
  text: string
}

export interface QuestionCreate {
  id: number | undefined
  text: string
  type: QuestionType
  answers: AnswerCreate[]
}

export interface Question {
  id: number
  text: string
  type: QuestionType
  answers: Answer[]
}

export interface Test {
  id: number
  name: string
  category: Category
  questions: Question[]
}

export interface TestCreate {
  id: number | undefined
  name: string
  category_id: number | undefined
  questions: QuestionCreate[]
}
