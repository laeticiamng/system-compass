export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      dashboard_progress: {
        Row: {
          created_at: string
          exit_key_id: string
          id: string
          phase_notes: Json
          started_at: string
          steps_progress: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exit_key_id: string
          id?: string
          phase_notes?: Json
          started_at?: string
          steps_progress?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          exit_key_id?: string
          id?: string
          phase_notes?: Json
          started_at?: string
          steps_progress?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      game_statistics: {
        Row: {
          archetypes_used: Json | null
          best_score_race: number | null
          best_score_solo: number | null
          countries_visited: string[] | null
          created_at: string
          favorite_actions: Json | null
          id: string
          risk_failures: number | null
          risk_successes: number | null
          total_games_played: number
          total_health_lost: number | null
          total_money_earned: number | null
          total_money_lost: number | null
          total_risk_events: number | null
          total_turns_played: number
          updated_at: string
          user_id: string
        }
        Insert: {
          archetypes_used?: Json | null
          best_score_race?: number | null
          best_score_solo?: number | null
          countries_visited?: string[] | null
          created_at?: string
          favorite_actions?: Json | null
          id?: string
          risk_failures?: number | null
          risk_successes?: number | null
          total_games_played?: number
          total_health_lost?: number | null
          total_money_earned?: number | null
          total_money_lost?: number | null
          total_risk_events?: number | null
          total_turns_played?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          archetypes_used?: Json | null
          best_score_race?: number | null
          best_score_solo?: number | null
          countries_visited?: string[] | null
          created_at?: string
          favorite_actions?: Json | null
          id?: string
          risk_failures?: number | null
          risk_successes?: number | null
          total_games_played?: number
          total_health_lost?: number | null
          total_money_earned?: number | null
          total_money_lost?: number | null
          total_risk_events?: number | null
          total_turns_played?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      music_cache: {
        Row: {
          audio_url: string
          country_id: string
          created_at: string
          expires_at: string
          id: string
          pyramid_type: string
          stream_url: string | null
          task_id: string | null
        }
        Insert: {
          audio_url: string
          country_id: string
          created_at?: string
          expires_at?: string
          id?: string
          pyramid_type: string
          stream_url?: string | null
          task_id?: string | null
        }
        Update: {
          audio_url?: string
          country_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          pyramid_type?: string
          stream_url?: string | null
          task_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          birth_country: string | null
          created_at: string
          current_country: string | null
          desired_life: string | null
          display_name: string | null
          education_level: string | null
          id: string
          motor_profile: string | null
          nationalities: string[] | null
          profession_id: string | null
          risk_tolerance: string | null
          updated_at: string
        }
        Insert: {
          birth_country?: string | null
          created_at?: string
          current_country?: string | null
          desired_life?: string | null
          display_name?: string | null
          education_level?: string | null
          id: string
          motor_profile?: string | null
          nationalities?: string[] | null
          profession_id?: string | null
          risk_tolerance?: string | null
          updated_at?: string
        }
        Update: {
          birth_country?: string | null
          created_at?: string
          current_country?: string | null
          desired_life?: string | null
          display_name?: string | null
          education_level?: string | null
          id?: string
          motor_profile?: string | null
          nationalities?: string[] | null
          profession_id?: string | null
          risk_tolerance?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      saved_comparisons: {
        Row: {
          country_ids: string[]
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          country_ids: string[]
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          country_ids?: string[]
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_games: {
        Row: {
          created_at: string
          current_player: number
          game_mode: Database["public"]["Enums"]["game_mode"]
          game_name: string
          game_state: Json
          id: string
          is_finished: boolean
          player_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_player?: number
          game_mode?: Database["public"]["Enums"]["game_mode"]
          game_name: string
          game_state: Json
          id?: string
          is_finished?: boolean
          player_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_player?: number
          game_mode?: Database["public"]["Enums"]["game_mode"]
          game_name?: string
          game_state?: Json
          id?: string
          is_finished?: boolean
          player_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      game_mode: "solo" | "race" | "points_duel" | "cooperative"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      game_mode: ["solo", "race", "points_duel", "cooperative"],
    },
  },
} as const
