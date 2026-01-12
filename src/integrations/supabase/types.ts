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
      ai_activity_log: {
        Row: {
          action_type: string
          completed_at: string | null
          context: Json | null
          created_at: string
          id: string
          model_used: string | null
          module: string
          processing_time_ms: number | null
          request_summary: string | null
          response_summary: string | null
          session_id: string | null
          status: string
          tokens_used: number | null
          units_consumed: number | null
          user_decision: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          completed_at?: string | null
          context?: Json | null
          created_at?: string
          id?: string
          model_used?: string | null
          module: string
          processing_time_ms?: number | null
          request_summary?: string | null
          response_summary?: string | null
          session_id?: string | null
          status?: string
          tokens_used?: number | null
          units_consumed?: number | null
          user_decision?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          completed_at?: string | null
          context?: Json | null
          created_at?: string
          id?: string
          model_used?: string | null
          module?: string
          processing_time_ms?: number | null
          request_summary?: string | null
          response_summary?: string | null
          session_id?: string | null
          status?: string
          tokens_used?: number | null
          units_consumed?: number | null
          user_decision?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_usage_metering: {
        Row: {
          agent_runs_count: number | null
          ai_actions_count: number | null
          ai_tokens_used: number | null
          alert_100_sent: boolean | null
          alert_70_sent: boolean | null
          alert_90_sent: boolean | null
          created_at: string
          dossier_items_added: number | null
          dossiers_created: number | null
          exports_generated: number | null
          id: string
          period_end: string
          period_start: string
          quota_limit: number | null
          total_case_units: number | null
          updated_at: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          agent_runs_count?: number | null
          ai_actions_count?: number | null
          ai_tokens_used?: number | null
          alert_100_sent?: boolean | null
          alert_70_sent?: boolean | null
          alert_90_sent?: boolean | null
          created_at?: string
          dossier_items_added?: number | null
          dossiers_created?: number | null
          exports_generated?: number | null
          id?: string
          period_end: string
          period_start: string
          quota_limit?: number | null
          total_case_units?: number | null
          updated_at?: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          agent_runs_count?: number | null
          ai_actions_count?: number | null
          ai_tokens_used?: number | null
          alert_100_sent?: boolean | null
          alert_70_sent?: boolean | null
          alert_90_sent?: boolean | null
          created_at?: string
          dossier_items_added?: number | null
          dossiers_created?: number | null
          exports_generated?: number | null
          id?: string
          period_end?: string
          period_start?: string
          quota_limit?: number | null
          total_case_units?: number | null
          updated_at?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: []
      }
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
      b2b_usage_metering: {
        Row: {
          alert_100_sent: boolean | null
          alert_80_sent: boolean | null
          cases_active: number | null
          cases_created: number | null
          cases_quota: number | null
          created_at: string
          exports_deep: number | null
          exports_light: number | null
          exports_quota: number | null
          governance_actors: number | null
          id: string
          milestones_created: number | null
          partners_vetted: number | null
          period_end: string
          period_start: string
          risk_register_items: number | null
          updated_at: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          alert_100_sent?: boolean | null
          alert_80_sent?: boolean | null
          cases_active?: number | null
          cases_created?: number | null
          cases_quota?: number | null
          created_at?: string
          exports_deep?: number | null
          exports_light?: number | null
          exports_quota?: number | null
          governance_actors?: number | null
          id?: string
          milestones_created?: number | null
          partners_vetted?: number | null
          period_end: string
          period_start: string
          risk_register_items?: number | null
          updated_at?: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          alert_100_sent?: boolean | null
          alert_80_sent?: boolean | null
          cases_active?: number | null
          cases_created?: number | null
          cases_quota?: number | null
          created_at?: string
          exports_deep?: number | null
          exports_light?: number | null
          exports_quota?: number | null
          governance_actors?: number | null
          id?: string
          milestones_created?: number | null
          partners_vetted?: number | null
          period_end?: string
          period_start?: string
          risk_register_items?: number | null
          updated_at?: string
          user_id?: string
          workspace_id?: string | null
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
      country_governance: {
        Row: {
          attractiveness: Json | null
          capture_risk_notes: string | null
          capture_risk_score: number
          competition: Json | null
          country_id: string
          created_at: string
          customs_logistics: Json | null
          ecosystem_notes: string | null
          ecosystem_score: number
          fiscal_checklist: Json | null
          friction_notes: string | null
          friction_risks: Json | null
          friction_score: number
          id: string
          operational_notes: string | null
          operational_score: number
          stability_notes: string | null
          stability_score: number
          state_of_art: Json | null
          updated_at: string
        }
        Insert: {
          attractiveness?: Json | null
          capture_risk_notes?: string | null
          capture_risk_score?: number
          competition?: Json | null
          country_id: string
          created_at?: string
          customs_logistics?: Json | null
          ecosystem_notes?: string | null
          ecosystem_score?: number
          fiscal_checklist?: Json | null
          friction_notes?: string | null
          friction_risks?: Json | null
          friction_score?: number
          id?: string
          operational_notes?: string | null
          operational_score?: number
          stability_notes?: string | null
          stability_score?: number
          state_of_art?: Json | null
          updated_at?: string
        }
        Update: {
          attractiveness?: Json | null
          capture_risk_notes?: string | null
          capture_risk_score?: number
          competition?: Json | null
          country_id?: string
          created_at?: string
          customs_logistics?: Json | null
          ecosystem_notes?: string | null
          ecosystem_score?: number
          fiscal_checklist?: Json | null
          friction_notes?: string | null
          friction_risks?: Json | null
          friction_score?: number
          id?: string
          operational_notes?: string | null
          operational_score?: number
          stability_notes?: string | null
          stability_score?: number
          state_of_art?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      country_intelligence: {
        Row: {
          adaptive_behaviors: Json
          authority_relation: string | null
          backfiring_behaviors: Json
          career_ceiling_by_profile: Json | null
          conflict_approach: string | null
          country_id: string
          created_at: string
          cycle_status: string | null
          decision_making_patterns: Json | null
          dependencies: Json
          distrust_signals: Json | null
          exit_difficulty: Json | null
          hidden_hierarchies: Json | null
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
          negotiation_styles: Json | null
          newcomer_mistakes: Json
          power_formal: Json
          power_informal: Json
          power_keys_ranking: Json
          risk_attitude: string | null
          social_norms: string | null
          strategies_punished: Json
          strategies_rewarded: Json
          system_produces: Json
          taboo_topics: Json | null
          time_perception: Json | null
          trust_signals: Json | null
          unspoken_rules: Json | null
          updated_at: string
        }
        Insert: {
          adaptive_behaviors?: Json
          authority_relation?: string | null
          backfiring_behaviors?: Json
          career_ceiling_by_profile?: Json | null
          conflict_approach?: string | null
          country_id: string
          created_at?: string
          cycle_status?: string | null
          decision_making_patterns?: Json | null
          dependencies?: Json
          distrust_signals?: Json | null
          exit_difficulty?: Json | null
          hidden_hierarchies?: Json | null
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
          negotiation_styles?: Json | null
          newcomer_mistakes?: Json
          power_formal?: Json
          power_informal?: Json
          power_keys_ranking?: Json
          risk_attitude?: string | null
          social_norms?: string | null
          strategies_punished?: Json
          strategies_rewarded?: Json
          system_produces?: Json
          taboo_topics?: Json | null
          time_perception?: Json | null
          trust_signals?: Json | null
          unspoken_rules?: Json | null
          updated_at?: string
        }
        Update: {
          adaptive_behaviors?: Json
          authority_relation?: string | null
          backfiring_behaviors?: Json
          career_ceiling_by_profile?: Json | null
          conflict_approach?: string | null
          country_id?: string
          created_at?: string
          cycle_status?: string | null
          decision_making_patterns?: Json | null
          dependencies?: Json
          distrust_signals?: Json | null
          exit_difficulty?: Json | null
          hidden_hierarchies?: Json | null
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
          negotiation_styles?: Json | null
          newcomer_mistakes?: Json
          power_formal?: Json
          power_informal?: Json
          power_keys_ranking?: Json
          risk_attitude?: string | null
          social_norms?: string | null
          strategies_punished?: Json
          strategies_rewarded?: Json
          system_produces?: Json
          taboo_topics?: Json | null
          time_perception?: Json | null
          trust_signals?: Json | null
          unspoken_rules?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      country_intelligence_translations: {
        Row: {
          country_id: string
          created_at: string
          id: string
          language: string
          translated_data: Json
          updated_at: string
        }
        Insert: {
          country_id: string
          created_at?: string
          id?: string
          language: string
          translated_data: Json
          updated_at?: string
        }
        Update: {
          country_id?: string
          created_at?: string
          id?: string
          language?: string
          translated_data?: Json
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
          common_mistakes_timeline: Json | null
          country_id: string
          created_at: string
          cultural_shocks: Json | null
          daily_life: Json
          entrepreneurship: Json
          example_trajectories: Json
          expat_communities: Json | null
          hidden_admin_steps: Json | null
          id: string
          institutions: Json
          is_complete: boolean
          labor_market: Json
          networks: Json
          profiles_struggle: Json
          profiles_succeed: Json
          real_costs_breakdown: Json | null
          success_timeline_months: Json | null
          surprises: Json
          typical_day: Json | null
          updated_at: string
          year_one_reality: Json | null
        }
        Insert: {
          common_mistakes_timeline?: Json | null
          country_id: string
          created_at?: string
          cultural_shocks?: Json | null
          daily_life?: Json
          entrepreneurship?: Json
          example_trajectories?: Json
          expat_communities?: Json | null
          hidden_admin_steps?: Json | null
          id?: string
          institutions?: Json
          is_complete?: boolean
          labor_market?: Json
          networks?: Json
          profiles_struggle?: Json
          profiles_succeed?: Json
          real_costs_breakdown?: Json | null
          success_timeline_months?: Json | null
          surprises?: Json
          typical_day?: Json | null
          updated_at?: string
          year_one_reality?: Json | null
        }
        Update: {
          common_mistakes_timeline?: Json | null
          country_id?: string
          created_at?: string
          cultural_shocks?: Json | null
          daily_life?: Json
          entrepreneurship?: Json
          example_trajectories?: Json
          expat_communities?: Json | null
          hidden_admin_steps?: Json | null
          id?: string
          institutions?: Json
          is_complete?: boolean
          labor_market?: Json
          networks?: Json
          profiles_struggle?: Json
          profiles_succeed?: Json
          real_costs_breakdown?: Json | null
          success_timeline_months?: Json | null
          surprises?: Json
          typical_day?: Json | null
          updated_at?: string
          year_one_reality?: Json | null
        }
        Relationships: []
      }
      country_variants_translations: {
        Row: {
          country_id: string
          created_at: string
          id: string
          language: string
          translated_data: Json
          updated_at: string
        }
        Insert: {
          country_id: string
          created_at?: string
          id?: string
          language: string
          translated_data: Json
          updated_at?: string
        }
        Update: {
          country_id?: string
          created_at?: string
          id?: string
          language?: string
          translated_data?: Json
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
      exit_keys_history: {
        Row: {
          compatibility_score: number | null
          country_id: string | null
          created_at: string | null
          exit_key_id: string
          id: string
          notes: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          compatibility_score?: number | null
          country_id?: string | null
          created_at?: string | null
          exit_key_id: string
          id?: string
          notes?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          compatibility_score?: number | null
          country_id?: string | null
          created_at?: string | null
          exit_key_id?: string
          id?: string
          notes?: string | null
          status?: string | null
          updated_at?: string | null
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
      generation_notifications: {
        Row: {
          batch_id: string | null
          created_at: string | null
          id: string
          job_id: string | null
          message: string
          notification_type: string
          read: boolean | null
          user_id: string
        }
        Insert: {
          batch_id?: string | null
          created_at?: string | null
          id?: string
          job_id?: string | null
          message: string
          notification_type: string
          read?: boolean | null
          user_id: string
        }
        Update: {
          batch_id?: string | null
          created_at?: string | null
          id?: string
          job_id?: string | null
          message?: string
          notification_type?: string
          read?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generation_notifications_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "country_generation_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generation_notifications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "country_generation_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      i18n_coverage_alerts: {
        Row: {
          alert_sent: boolean | null
          coverage_percentage: number
          created_at: string | null
          id: string
          languages_data: Json | null
          missing_keys_count: number
          sent_at: string | null
        }
        Insert: {
          alert_sent?: boolean | null
          coverage_percentage: number
          created_at?: string | null
          id?: string
          languages_data?: Json | null
          missing_keys_count: number
          sent_at?: string | null
        }
        Update: {
          alert_sent?: boolean | null
          coverage_percentage?: number
          created_at?: string | null
          id?: string
          languages_data?: Json | null
          missing_keys_count?: number
          sent_at?: string | null
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
      notification_settings: {
        Row: {
          created_at: string | null
          deadline_reminder_days: number | null
          email_enabled: boolean | null
          id: string
          push_enabled: boolean | null
          slack_webhook_url: string | null
          updated_at: string | null
          user_id: string
          weekly_digest: boolean | null
        }
        Insert: {
          created_at?: string | null
          deadline_reminder_days?: number | null
          email_enabled?: boolean | null
          id?: string
          push_enabled?: boolean | null
          slack_webhook_url?: string | null
          updated_at?: string | null
          user_id: string
          weekly_digest?: boolean | null
        }
        Update: {
          created_at?: string | null
          deadline_reminder_days?: number | null
          email_enabled?: boolean | null
          id?: string
          push_enabled?: boolean | null
          slack_webhook_url?: string | null
          updated_at?: string | null
          user_id?: string
          weekly_digest?: boolean | null
        }
        Relationships: []
      }
      ovi_suggestions: {
        Row: {
          created_at: string | null
          dismissed: boolean | null
          id: string
          relevance_score: number | null
          simulation_context: Json
          simulation_type: string
          suggested_frameworks: string[] | null
          suggested_grids: string[] | null
          user_id: string | null
          viewed_at: string | null
        }
        Insert: {
          created_at?: string | null
          dismissed?: boolean | null
          id?: string
          relevance_score?: number | null
          simulation_context: Json
          simulation_type: string
          suggested_frameworks?: string[] | null
          suggested_grids?: string[] | null
          user_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          created_at?: string | null
          dismissed?: boolean | null
          id?: string
          relevance_score?: number | null
          simulation_context?: Json
          simulation_type?: string
          suggested_frameworks?: string[] | null
          suggested_grids?: string[] | null
          user_id?: string | null
          viewed_at?: string | null
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
      traceos_notifications: {
        Row: {
          created_at: string
          days_since: number
          decision_id: string
          decision_title: string
          id: string
          notification_type: string
          read: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          days_since: number
          decision_id: string
          decision_title: string
          id?: string
          notification_type: string
          read?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          days_since?: number
          decision_id?: string
          decision_title?: string
          id?: string
          notification_type?: string
          read?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "traceos_notifications_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "traceos_decisions"
            referencedColumns: ["id"]
          },
        ]
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
      user_cases: {
        Row: {
          admin_checklist: Json | null
          anti_copy_checklist: Json | null
          budget_buffer_percent: number | null
          cash_reality: Json | null
          clarifications_done: Json | null
          clarifications_pending: Json | null
          country_id: string
          created_at: string
          estimated_start_date: string | null
          governance_map: Json | null
          id: string
          intention: string
          milestones: Json | null
          notes: string | null
          partners_vetted: Json | null
          poc_budget: number | null
          poc_duration: string | null
          poc_hypothesis: string | null
          poc_stop_criteria: Json | null
          poc_success_criteria: Json | null
          red_flags_acknowledged: Json | null
          risk_register: Json | null
          status: string
          target_completion_date: string | null
          timeline_scenario: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_checklist?: Json | null
          anti_copy_checklist?: Json | null
          budget_buffer_percent?: number | null
          cash_reality?: Json | null
          clarifications_done?: Json | null
          clarifications_pending?: Json | null
          country_id: string
          created_at?: string
          estimated_start_date?: string | null
          governance_map?: Json | null
          id?: string
          intention: string
          milestones?: Json | null
          notes?: string | null
          partners_vetted?: Json | null
          poc_budget?: number | null
          poc_duration?: string | null
          poc_hypothesis?: string | null
          poc_stop_criteria?: Json | null
          poc_success_criteria?: Json | null
          red_flags_acknowledged?: Json | null
          risk_register?: Json | null
          status?: string
          target_completion_date?: string | null
          timeline_scenario?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_checklist?: Json | null
          anti_copy_checklist?: Json | null
          budget_buffer_percent?: number | null
          cash_reality?: Json | null
          clarifications_done?: Json | null
          clarifications_pending?: Json | null
          country_id?: string
          created_at?: string
          estimated_start_date?: string | null
          governance_map?: Json | null
          id?: string
          intention?: string
          milestones?: Json | null
          notes?: string | null
          partners_vetted?: Json | null
          poc_budget?: number | null
          poc_duration?: string | null
          poc_hypothesis?: string | null
          poc_stop_criteria?: Json | null
          poc_success_criteria?: Json | null
          red_flags_acknowledged?: Json | null
          risk_register?: Json | null
          status?: string
          target_completion_date?: string | null
          timeline_scenario?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_governance_notes: {
        Row: {
          country_id: string
          created_at: string
          governance_map: Json | null
          id: string
          notes: string | null
          partner_reliability: Json | null
          poc_plan: Json | null
          risk_register: Json | null
          timeline_scenarios: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          country_id: string
          created_at?: string
          governance_map?: Json | null
          id?: string
          notes?: string | null
          partner_reliability?: Json | null
          poc_plan?: Json | null
          risk_register?: Json | null
          timeline_scenarios?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          country_id?: string
          created_at?: string
          governance_map?: Json | null
          id?: string
          notes?: string | null
          partner_reliability?: Json | null
          poc_plan?: Json | null
          risk_register?: Json | null
          timeline_scenarios?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          message: string
          priority: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          message: string
          priority?: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string
          priority?: string
          read?: boolean
          title?: string
          type?: string
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
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
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
      vacation_recommendations: {
        Row: {
          created_at: string | null
          destinations: Json
          id: string
          origin_country: string
          preferences: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          destinations?: Json
          id?: string
          origin_country: string
          preferences?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          destinations?: Json
          id?: string
          origin_country?: string
          preferences?: Json | null
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
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      increment_ai_usage: {
        Args: {
          p_action_type: string
          p_tokens?: number
          p_units?: number
          p_user_id: string
        }
        Returns: undefined
      }
      increment_b2b_usage: {
        Args: { p_increment?: number; p_metric: string; p_user_id: string }
        Returns: undefined
      }
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
