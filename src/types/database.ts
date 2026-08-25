export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      problems: {
        Row: {
          id: string
          slug: string
          title: string
          description: string | null
          topic: string
          difficulty: 'Easy' | 'Medium' | 'Hard' | null
          source: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['problems']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['problems']['Insert']>
      }
      solutions: {
        Row: {
          id: string
          problem_id: string
          user_id: string
          language: string
          github_path: string
          current_code: string
          latest_commit_sha: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['solutions']['Row'], 'id' | 'is_active' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['solutions']['Insert']>
      }
      solution_revisions: {
        Row: {
          id: string
          solution_id: string
          commit_sha: string
          code: string
          commit_message: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['solution_revisions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['solution_revisions']['Insert']>
      }
      flashcards: {
        Row: {
          id: string
          problem_id: string
          user_id: string
          question: string
          answer: string
          next_review_at: string
          review_count: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['flashcards']['Row'], 'id' | 'next_review_at' | 'review_count' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['flashcards']['Insert']>
      }
      notes: {
        Row: {
          id: string
          problem_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['notes']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['notes']['Insert']>
      }
      ai_conversations: {
        Row: {
          id: string
          user_id: string
          problem_id: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['ai_conversations']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['ai_conversations']['Insert']>
      }
      ai_messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant'
          content: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['ai_messages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['ai_messages']['Insert']>
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          problem_id: string
          status: 'not_started' | 'attempted' | 'solved' | 'review' | null
          attempts: number
          solved_at: string | null
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_progress']['Row'], 'id' | 'status' | 'attempts' | 'solved_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_progress']['Insert']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
