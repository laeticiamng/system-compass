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
      analytics_events: {
        Row: {
          created_at: string
          event_category: string
          event_name: string
          id: string
          metadata: Json | null
          page_path: string | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_category: string
          event_name: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_category?: string
          event_name?: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_sessions: {
        Row: {
          first_seen_at: string
          id: string
          last_seen_at: string
          session_id: string
          user_id: string | null
          visit_count: number
        }
        Insert: {
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          session_id: string
          user_id?: string | null
          visit_count?: number
        }
        Update: {
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          session_id?: string
          user_id?: string | null
          visit_count?: number
        }
        Relationships: []
      }
      country_generation_batches: {
        Row: {
          completed_at: string | null
          completed_countries: number
          concurrency: number
          created_at: string
          created_by: string | null
          failed_countries: number
          id: string
          name: string
          status: string
          total_countries: number
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          completed_countries?: number
          concurrency?: number
          created_at?: string
          created_by?: string | null
          failed_countries?: number
          id?: string
          name: string
          status?: string
          total_countries?: number
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          completed_countries?: number
          concurrency?: number
          created_at?: string
          created_by?: string | null
          failed_countries?: number
          id?: string
          name?: string
          status?: string
          total_countries?: number
          updated_at?: string
        }
        Relationships: []
      }
      country_generation_jobs: {
        Row: {
          completed_at: string | null
          confidence_score: number | null
          country_id: string
          country_name: string
          created_at: string
          error_message: string | null
          id: string
          iso2: string
          json_payload: Json | null
          primary_pyramid: string
          region: string
          specificity_score: number | null
          started_at: string | null
          status: string
          stereotype_flag: boolean | null
          updated_at: string
          version: number
        }
        Insert: {
          completed_at?: string | null
          confidence_score?: number | null
          country_id: string
          country_name: string
          created_at?: string
          error_message?: string | null
          id?: string
          iso2: string
          json_payload?: Json | null
          primary_pyramid: string
          region: string
          specificity_score?: number | null
          started_at?: string | null
          status?: string
          stereotype_flag?: boolean | null
          updated_at?: string
          version?: number
        }
        Update: {
          completed_at?: string | null
          confidence_score?: number | null
          country_id?: string
          country_name?: string
          created_at?: string
          error_message?: string | null
          id?: string
          iso2?: string
          json_payload?: Json | null
          primary_pyramid?: string
          region?: string
          specificity_score?: number | null
          started_at?: string | null
          status?: string
          stereotype_flag?: boolean | null
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      country_intelligence: {
        Row: {
          adaptive_behaviors: Json
          authority_relation: string | null
          backfiring_behaviors: Json
          conflict_approach: string | null
          country_id: string
          created_at: string
          cycle_status: string | null
          dependencies: Json
          historical_traces: Json
          id: string
          is_complete: boolean
          legacy_implications: Json
          macro_risks: Json
          mental_cost: string | null
          mental_cost_reason: string | null
          mobility_elevators: Json
          mobility_speed: string | null
          mobility_speed_reason: string | null
          newcomer_mistakes: Json
          power_formal: Json
          power_informal: Json
          power_keys_ranking: Json
          risk_attitude: string | null
          social_norms: string | null
          strategies_punished: Json
          strategies_rewarded: Json
          system_produces: Json
          updated_at: string
        }
        Insert: {
          adaptive_behaviors?: Json
          authority_relation?: string | null
          backfiring_behaviors?: Json
          conflict_approach?: string | null
          country_id: string
          created_at?: string
          cycle_status?: string | null
          dependencies?: Json
          historical_traces?: Json
          id?: string
          is_complete?: boolean
          legacy_implications?: Json
          macro_risks?: Json
          mental_cost?: string | null
          mental_cost_reason?: string | null
          mobility_elevators?: Json
          mobility_speed?: string | null
          mobility_speed_reason?: string | null
          newcomer_mistakes?: Json
          power_formal?: Json
          power_informal?: Json
          power_keys_ranking?: Json
          risk_attitude?: string | null
          social_norms?: string | null
          strategies_punished?: Json
          strategies_rewarded?: Json
          system_produces?: Json
          updated_at?: string
        }
        Update: {
          adaptive_behaviors?: Json
          authority_relation?: string | null
          backfiring_behaviors?: Json
          conflict_approach?: string | null
          country_id?: string
          created_at?: string
          cycle_status?: string | null
          dependencies?: Json
          historical_traces?: Json
          id?: string
          is_complete?: boolean
          legacy_implications?: Json
          macro_risks?: Json
          mental_cost?: string | null
          mental_cost_reason?: string | null
          mobility_elevators?: Json
          mobility_speed?: string | null
          mobility_speed_reason?: string | null
          newcomer_mistakes?: Json
          power_formal?: Json
          power_informal?: Json
          power_keys_ranking?: Json
          risk_attitude?: string | null
          social_norms?: string | null
          strategies_punished?: Json
          strategies_rewarded?: Json
          system_produces?: Json
          updated_at?: string
        }
        Relationships: []
      }
      country_tags: {
        Row: {
          admin_speed: number
          authority_verticality: number
          compliance_sensitivity: number
          country_id: string
          created_at: string
          diploma_weight: number
          id: string
          mental_friction: number
          network_weight: number
          predictability: number
          reputation_requirement: number
          risk_tolerance: number
          social_mobility: number
          updated_at: string
        }
        Insert: {
          admin_speed?: number
          authority_verticality?: number
          compliance_sensitivity?: number
          country_id: string
          created_at?: string
          diploma_weight?: number
          id?: string
          mental_friction?: number
          network_weight?: number
          predictability?: number
          reputation_requirement?: number
          risk_tolerance?: number
          social_mobility?: number
          updated_at?: string
        }
        Update: {
          admin_speed?: number
          authority_verticality?: number
          compliance_sensitivity?: number
          country_id?: string
          created_at?: string
          diploma_weight?: number
          id?: string
          mental_friction?: number
          network_weight?: number
          predictability?: number
          reputation_requirement?: number
          risk_tolerance?: number
          social_mobility?: number
          updated_at?: string
        }
        Relationships: []
      }
      country_variants: {
        Row: {
          country_id: string
          created_at: string
          daily_life: Json
          entrepreneurship: Json
          example_trajectories: Json
          id: string
          institutions: Json
          is_complete: boolean
          labor_market: Json
          networks: Json
          profiles_struggle: Json
          profiles_succeed: Json
          surprises: Json
          updated_at: string
        }
        Insert: {
          country_id: string
          created_at?: string
          daily_life?: Json
          entrepreneurship?: Json
          example_trajectories?: Json
          id?: string
          institutions?: Json
          is_complete?: boolean
          labor_market?: Json
          networks?: Json
          profiles_struggle?: Json
          profiles_succeed?: Json
          surprises?: Json
          updated_at?: string
        }
        Update: {
          country_id?: string
          created_at?: string
          daily_life?: Json
          entrepreneurship?: Json
          example_trajectories?: Json
          id?: string
          institutions?: Json
          is_complete?: boolean
          labor_market?: Json
          networks?: Json
          profiles_struggle?: Json
          profiles_succeed?: Json
          surprises?: Json
          updated_at?: string
        }
        Relationships: []
      }
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
      generated_translations: {
        Row: {
          country_id: string
          created_at: string
          created_by: string | null
          id: string
          is_approved: boolean | null
          target_lang: string
          translation: Json
          updated_at: string
        }
        Insert: {
          country_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_approved?: boolean | null
          target_lang: string
          translation: Json
          updated_at?: string
        }
        Update: {
          country_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_approved?: boolean | null
          target_lang?: string
          translation?: Json
          updated_at?: string
        }
        Relationships: []
      }
      irreversa_audit_log: {
        Row: {
          action: string
          actor_name: string
          actor_role: string
          created_at: string
          details: Json
          id: string
          ip_hash: string | null
          threshold_id: string
        }
        Insert: {
          action: string
          actor_name: string
          actor_role: string
          created_at?: string
          details?: Json
          id?: string
          ip_hash?: string | null
          threshold_id: string
        }
        Update: {
          action?: string
          actor_name?: string
          actor_role?: string
          created_at?: string
          details?: Json
          id?: string
          ip_hash?: string | null
          threshold_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "irreversa_audit_log_threshold_id_fkey"
            columns: ["threshold_id"]
            isOneToOne: false
            referencedRelation: "irreversa_thresholds"
            referencedColumns: ["id"]
          },
        ]
      }
      irreversa_thresholds: {
        Row: {
          alternatives_before: Json
          compass_country_id: string | null
          context: string
          created_at: string
          detection_date: string
          detection_source: string
          domain: string
          id: string
          irreversibility_reason: string
          organization_name: string | null
          sealed_at: string | null
          status: string
          threshold_nature: string
          title: string
          updated_at: string
          user_id: string
          validated_by: string
          validation_date: string | null
          validation_statement: string | null
          validator_role: string
        }
        Insert: {
          alternatives_before?: Json
          compass_country_id?: string | null
          context: string
          created_at?: string
          detection_date?: string
          detection_source: string
          domain: string
          id?: string
          irreversibility_reason: string
          organization_name?: string | null
          sealed_at?: string | null
          status?: string
          threshold_nature: string
          title: string
          updated_at?: string
          user_id: string
          validated_by: string
          validation_date?: string | null
          validation_statement?: string | null
          validator_role: string
        }
        Update: {
          alternatives_before?: Json
          compass_country_id?: string | null
          context?: string
          created_at?: string
          detection_date?: string
          detection_source?: string
          domain?: string
          id?: string
          irreversibility_reason?: string
          organization_name?: string | null
          sealed_at?: string | null
          status?: string
          threshold_nature?: string
          title?: string
          updated_at?: string
          user_id?: string
          validated_by?: string
          validation_date?: string | null
          validation_statement?: string | null
          validator_role?: string
        }
        Relationships: []
      }
      irreversa_witnesses: {
        Row: {
          id: string
          signature_hash: string | null
          threshold_id: string
          witness_name: string
          witness_role: string
          witness_statement: string | null
          witnessed_at: string
        }
        Insert: {
          id?: string
          signature_hash?: string | null
          threshold_id: string
          witness_name: string
          witness_role: string
          witness_statement?: string | null
          witnessed_at?: string
        }
        Update: {
          id?: string
          signature_hash?: string | null
          threshold_id?: string
          witness_name?: string
          witness_role?: string
          witness_statement?: string | null
          witnessed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "irreversa_witnesses_threshold_id_fkey"
            columns: ["threshold_id"]
            isOneToOne: false
            referencedRelation: "irreversa_thresholds"
            referencedColumns: ["id"]
          },
        ]
      }
      latent_zone_history: {
        Row: {
          action: string
          created_at: string
          id: string
          new_status: string | null
          notes: string | null
          previous_status: string | null
          user_id: string
          zone_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_status?: string | null
          notes?: string | null
          previous_status?: string | null
          user_id: string
          zone_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_status?: string | null
          notes?: string | null
          previous_status?: string | null
          user_id?: string
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "latent_zone_history_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "latent_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      latent_zone_tensions: {
        Row: {
          content: string
          created_at: string
          id: string
          tension_type: string
          zone_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          tension_type: string
          zone_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          tension_type?: string
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "latent_zone_tensions_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "latent_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      latent_zones: {
        Row: {
          created_at: string
          description: string | null
          id: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          title?: string
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
      partner_applications: {
        Row: {
          company_name: string | null
          created_at: string
          ethics_charter_accepted: boolean
          ethics_charter_accepted_at: string | null
          id: string
          motivation: string
          partner_type: Database["public"]["Enums"]["partner_type"]
          platform_experience: string | null
          professional_profile: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["partner_application_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          ethics_charter_accepted?: boolean
          ethics_charter_accepted_at?: string | null
          id?: string
          motivation: string
          partner_type: Database["public"]["Enums"]["partner_type"]
          platform_experience?: string | null
          professional_profile?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["partner_application_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          ethics_charter_accepted?: boolean
          ethics_charter_accepted_at?: string | null
          id?: string
          motivation?: string
          partner_type?: Database["public"]["Enums"]["partner_type"]
          platform_experience?: string | null
          professional_profile?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["partner_application_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      partner_benefits: {
        Row: {
          active: boolean
          awarded_at: string
          benefit_type: string
          description: string
          expires_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          active?: boolean
          awarded_at?: string
          benefit_type: string
          description: string
          expires_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          active?: boolean
          awarded_at?: string
          benefit_type?: string
          description?: string
          expires_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      partner_contributions: {
        Row: {
          contribution_type: string
          created_at: string
          credits_awarded: number | null
          description: string
          id: string
          impact_metric: string | null
          user_id: string
          verified: boolean
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          contribution_type: string
          created_at?: string
          credits_awarded?: number | null
          description: string
          id?: string
          impact_metric?: string | null
          user_id: string
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          contribution_type?: string
          created_at?: string
          credits_awarded?: number | null
          description?: string
          id?: string
          impact_metric?: string | null
          user_id?: string
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
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
      saved_analyses: {
        Row: {
          constraint_type: string
          created_at: string
          decision_type: string
          horizon: string
          id: string
          results: Json
          risk_tolerance: string
          updated_at: string
          user_id: string
        }
        Insert: {
          constraint_type: string
          created_at?: string
          decision_type: string
          horizon: string
          id?: string
          results: Json
          risk_tolerance: string
          updated_at?: string
          user_id: string
        }
        Update: {
          constraint_type?: string
          created_at?: string
          decision_type?: string
          horizon?: string
          id?: string
          results?: Json
          risk_tolerance?: string
          updated_at?: string
          user_id?: string
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
      traceos_approvals: {
        Row: {
          approved_at: string | null
          approver_id: string | null
          approver_name: string | null
          comment: string | null
          created_at: string
          decision_id: string
          id: string
          signature_hash: string | null
          status: string
          step_name: string
          step_order: number
          workflow_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approver_id?: string | null
          approver_name?: string | null
          comment?: string | null
          created_at?: string
          decision_id: string
          id?: string
          signature_hash?: string | null
          status?: string
          step_name: string
          step_order?: number
          workflow_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approver_id?: string | null
          approver_name?: string | null
          comment?: string | null
          created_at?: string
          decision_id?: string
          id?: string
          signature_hash?: string | null
          status?: string
          step_name?: string
          step_order?: number
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "traceos_approvals_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "traceos_decisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "traceos_approvals_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "traceos_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      traceos_comments: {
        Row: {
          author_name: string
          content: string
          created_at: string
          decision_id: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author_name: string
          content: string
          created_at?: string
          decision_id: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string
          decision_id?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "traceos_comments_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "traceos_decisions"
            referencedColumns: ["id"]
          },
        ]
      }
      traceos_decision_history: {
        Row: {
          action: string
          author_name: string
          changes: Json
          created_at: string
          decision_id: string
          id: string
          user_id: string
        }
        Insert: {
          action: string
          author_name: string
          changes?: Json
          created_at?: string
          decision_id: string
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          author_name?: string
          changes?: Json
          created_at?: string
          decision_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "traceos_decision_history_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "traceos_decisions"
            referencedColumns: ["id"]
          },
        ]
      }
      traceos_decision_tags: {
        Row: {
          created_at: string
          decision_id: string
          id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          decision_id: string
          id?: string
          tag_id: string
        }
        Update: {
          created_at?: string
          decision_id?: string
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "traceos_decision_tags_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "traceos_decisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "traceos_decision_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "traceos_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      traceos_decisions: {
        Row: {
          abandoned_branches: Json
          alternative_hypotheses: Json
          author: string
          constraints: Json
          context: string
          created_at: string
          decision: string
          decision_date: string
          id: string
          main_hypothesis: string
          parent_id: string | null
          scope: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          abandoned_branches?: Json
          alternative_hypotheses?: Json
          author: string
          constraints?: Json
          context: string
          created_at?: string
          decision: string
          decision_date?: string
          id?: string
          main_hypothesis: string
          parent_id?: string | null
          scope: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          abandoned_branches?: Json
          alternative_hypotheses?: Json
          author?: string
          constraints?: Json
          context?: string
          created_at?: string
          decision?: string
          decision_date?: string
          id?: string
          main_hypothesis?: string
          parent_id?: string | null
          scope?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "traceos_decisions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "traceos_decisions"
            referencedColumns: ["id"]
          },
        ]
      }
      traceos_export_schedules: {
        Row: {
          created_at: string
          frequency: string
          id: string
          include_history: boolean
          is_active: boolean
          last_export_at: string | null
          next_export_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          frequency?: string
          id?: string
          include_history?: boolean
          is_active?: boolean
          last_export_at?: string | null
          next_export_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          frequency?: string
          id?: string
          include_history?: boolean
          is_active?: boolean
          last_export_at?: string | null
          next_export_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      traceos_tags: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      traceos_webhooks: {
        Row: {
          created_at: string
          events: Json
          headers: Json | null
          id: string
          is_active: boolean
          last_triggered_at: string | null
          name: string
          platform: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          events?: Json
          headers?: Json | null
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          name: string
          platform?: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          events?: Json
          headers?: Json | null
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          name?: string
          platform?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      traceos_workflows: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          steps: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          steps?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          steps?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_project_analyses: {
        Row: {
          alternative_scenarios: Json
          blind_spots: Json
          constraints: Json
          country_id: string
          created_at: string
          frequent_risks: Json
          horizon: string
          id: string
          project_type: string
          relevant_exit_keys: Json
          risk_tolerance: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alternative_scenarios?: Json
          blind_spots?: Json
          constraints?: Json
          country_id: string
          created_at?: string
          frequent_risks?: Json
          horizon: string
          id?: string
          project_type: string
          relevant_exit_keys?: Json
          risk_tolerance: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alternative_scenarios?: Json
          blind_spots?: Json
          constraints?: Json
          country_id?: string
          created_at?: string
          frequent_risks?: Json
          horizon?: string
          id?: string
          project_type?: string
          relevant_exit_keys?: Json
          risk_tolerance?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      analytics_daily_stats: {
        Row: {
          date: string | null
          event_category: string | null
          event_count: number | null
          event_name: string | null
          unique_sessions: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      game_mode: "solo" | "race" | "points_duel" | "cooperative"
      partner_application_status:
        | "pending"
        | "approved"
        | "rejected"
        | "suspended"
      partner_type: "ambassador" | "b2b_partner"
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
      partner_application_status: [
        "pending",
        "approved",
        "rejected",
        "suspended",
      ],
      partner_type: ["ambassador", "b2b_partner"],
    },
  },
} as const
