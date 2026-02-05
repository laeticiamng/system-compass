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
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string | null
          id: string
          ip_hash: string | null
          record_count: number | null
          table_name: string
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string | null
          id?: string
          ip_hash?: string | null
          record_count?: number | null
          table_name: string
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string | null
          id?: string
          ip_hash?: string | null
          record_count?: number | null
          table_name?: string
        }
        Relationships: []
      }
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
      analytics_daily_stats_secure: {
        Row: {
          avg_session_duration_seconds: number | null
          created_at: string | null
          date: string
          id: string
          page_views: number | null
          total_sessions: number | null
          unique_users: number | null
          updated_at: string | null
        }
        Insert: {
          avg_session_duration_seconds?: number | null
          created_at?: string | null
          date: string
          id?: string
          page_views?: number | null
          total_sessions?: number | null
          unique_users?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_session_duration_seconds?: number | null
          created_at?: string | null
          date?: string
          id?: string
          page_views?: number | null
          total_sessions?: number | null
          unique_users?: number | null
          updated_at?: string | null
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
      case_delays_reality: {
        Row: {
          case_id: string
          cashflow_implications: string | null
          confidence_score: number | null
          created_at: string
          delay_risk_signals: string[] | null
          id: string
          is_ai_generated: boolean | null
          official_timeframe: string | null
          optimistic_timeframe: string | null
          pessimistic_timeframe: string | null
          process_name: string
          realistic_timeframe: string | null
          sources: Json | null
          updated_at: string
        }
        Insert: {
          case_id: string
          cashflow_implications?: string | null
          confidence_score?: number | null
          created_at?: string
          delay_risk_signals?: string[] | null
          id?: string
          is_ai_generated?: boolean | null
          official_timeframe?: string | null
          optimistic_timeframe?: string | null
          pessimistic_timeframe?: string | null
          process_name: string
          realistic_timeframe?: string | null
          sources?: Json | null
          updated_at?: string
        }
        Update: {
          case_id?: string
          cashflow_implications?: string | null
          confidence_score?: number | null
          created_at?: string
          delay_risk_signals?: string[] | null
          id?: string
          is_ai_generated?: boolean | null
          official_timeframe?: string | null
          optimistic_timeframe?: string | null
          pessimistic_timeframe?: string | null
          process_name?: string
          realistic_timeframe?: string | null
          sources?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      case_governance_actors: {
        Row: {
          actor_type: string
          case_id: string
          confidence_score: number | null
          country_code: string
          created_at: string
          formality_level: string | null
          id: string
          is_ai_generated: boolean | null
          label: string
          notes: string | null
          power_types: string[] | null
          reliability_status: string | null
          sector: string | null
          sources: Json | null
          updated_at: string
        }
        Insert: {
          actor_type: string
          case_id: string
          confidence_score?: number | null
          country_code: string
          created_at?: string
          formality_level?: string | null
          id?: string
          is_ai_generated?: boolean | null
          label: string
          notes?: string | null
          power_types?: string[] | null
          reliability_status?: string | null
          sector?: string | null
          sources?: Json | null
          updated_at?: string
        }
        Update: {
          actor_type?: string
          case_id?: string
          confidence_score?: number | null
          country_code?: string
          created_at?: string
          formality_level?: string | null
          id?: string
          is_ai_generated?: boolean | null
          label?: string
          notes?: string | null
          power_types?: string[] | null
          reliability_status?: string | null
          sector?: string | null
          sources?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      case_governance_partners: {
        Row: {
          case_id: string
          confidence_score: number | null
          created_at: string
          description: string | null
          due_diligence_checklist: string[] | null
          id: string
          is_ai_generated: boolean | null
          is_mandatory: boolean | null
          notes: string | null
          partner_type: string
          risk_flags: string[] | null
          sources: Json | null
          updated_at: string
        }
        Insert: {
          case_id: string
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          due_diligence_checklist?: string[] | null
          id?: string
          is_ai_generated?: boolean | null
          is_mandatory?: boolean | null
          notes?: string | null
          partner_type: string
          risk_flags?: string[] | null
          sources?: Json | null
          updated_at?: string
        }
        Update: {
          case_id?: string
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          due_diligence_checklist?: string[] | null
          id?: string
          is_ai_generated?: boolean | null
          is_mandatory?: boolean | null
          notes?: string | null
          partner_type?: string
          risk_flags?: string[] | null
          sources?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      case_intermediation_patterns: {
        Row: {
          case_id: string
          confidence_score: number | null
          created_at: string
          description_neutral: string
          id: string
          is_ai_generated: boolean | null
          pattern_type: string
          protections: string[] | null
          risk_level: string | null
          signals: string[] | null
          sources: Json | null
          updated_at: string
        }
        Insert: {
          case_id: string
          confidence_score?: number | null
          created_at?: string
          description_neutral: string
          id?: string
          is_ai_generated?: boolean | null
          pattern_type: string
          protections?: string[] | null
          risk_level?: string | null
          signals?: string[] | null
          sources?: Json | null
          updated_at?: string
        }
        Update: {
          case_id?: string
          confidence_score?: number | null
          created_at?: string
          description_neutral?: string
          id?: string
          is_ai_generated?: boolean | null
          pattern_type?: string
          protections?: string[] | null
          risk_level?: string | null
          signals?: string[] | null
          sources?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      challenge_progress: {
        Row: {
          challenge_id: string
          challenge_type: string
          completed_at: string | null
          created_at: string
          current_progress: number
          expires_at: string
          id: string
          target_progress: number
          user_id: string
          xp_awarded: number
        }
        Insert: {
          challenge_id: string
          challenge_type: string
          completed_at?: string | null
          created_at?: string
          current_progress?: number
          expires_at: string
          id?: string
          target_progress: number
          user_id: string
          xp_awarded?: number
        }
        Update: {
          challenge_id?: string
          challenge_type?: string
          completed_at?: string | null
          created_at?: string
          current_progress?: number
          expires_at?: string
          id?: string
          target_progress?: number
          user_id?: string
          xp_awarded?: number
        }
        Relationships: []
      }
      consultations: {
        Row: {
          amount: number | null
          created_at: string | null
          duration_minutes: number | null
          expert_id: string
          id: string
          meeting_url: string | null
          notes: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          platform_fee: number | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["consultation_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          duration_minutes?: number | null
          expert_id: string
          id?: string
          meeting_url?: string | null
          notes?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          platform_fee?: number | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["consultation_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          duration_minutes?: number | null
          expert_id?: string
          id?: string
          meeting_url?: string | null
          notes?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          platform_fee?: number | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["consultation_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultations_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          cost_of_living: Json
          created_at: string
          data_version: number
          healthcare: Json
          id: string
          iso2: string
          last_updated: string | null
          lgbtq_rights: Json
          name: string
          name_local: string | null
          natural_risks: Json
          playbook: Json
          positive_points: Json
          pyramid: Json
          pyramid_type: string
          quality_of_life: Json
          region: string
          risks: Json
          rule_of_gold: string | null
          snapshot: Json
          sources: Json
          updated_at: string
          visa: Json
          who_loses: Json
          who_wins: Json
        }
        Insert: {
          cost_of_living?: Json
          created_at?: string
          data_version?: number
          healthcare?: Json
          id: string
          iso2: string
          last_updated?: string | null
          lgbtq_rights?: Json
          name: string
          name_local?: string | null
          natural_risks?: Json
          playbook?: Json
          positive_points?: Json
          pyramid?: Json
          pyramid_type: string
          quality_of_life?: Json
          region: string
          risks?: Json
          rule_of_gold?: string | null
          snapshot?: Json
          sources?: Json
          updated_at?: string
          visa?: Json
          who_loses?: Json
          who_wins?: Json
        }
        Update: {
          cost_of_living?: Json
          created_at?: string
          data_version?: number
          healthcare?: Json
          id?: string
          iso2?: string
          last_updated?: string | null
          lgbtq_rights?: Json
          name?: string
          name_local?: string | null
          natural_risks?: Json
          playbook?: Json
          positive_points?: Json
          pyramid?: Json
          pyramid_type?: string
          quality_of_life?: Json
          region?: string
          risks?: Json
          rule_of_gold?: string | null
          snapshot?: Json
          sources?: Json
          updated_at?: string
          visa?: Json
          who_loses?: Json
          who_wins?: Json
        }
        Relationships: []
      }
      country_data_sources: {
        Row: {
          country_id: string
          created_at: string
          error_count: number
          id: string
          is_active: boolean
          last_content_hash: string | null
          last_error: string | null
          last_scraped_at: string | null
          scrape_frequency_hours: number
          source_name: string | null
          source_type: Database["public"]["Enums"]["source_type"]
          source_url: string
          updated_at: string
        }
        Insert: {
          country_id: string
          created_at?: string
          error_count?: number
          id?: string
          is_active?: boolean
          last_content_hash?: string | null
          last_error?: string | null
          last_scraped_at?: string | null
          scrape_frequency_hours?: number
          source_name?: string | null
          source_type: Database["public"]["Enums"]["source_type"]
          source_url: string
          updated_at?: string
        }
        Update: {
          country_id?: string
          created_at?: string
          error_count?: number
          id?: string
          is_active?: boolean
          last_content_hash?: string | null
          last_error?: string | null
          last_scraped_at?: string | null
          scrape_frequency_hours?: number
          source_name?: string | null
          source_type?: Database["public"]["Enums"]["source_type"]
          source_url?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "country_data_sources_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      country_data_updates: {
        Row: {
          change_summary: string | null
          change_type: Database["public"]["Enums"]["change_type"]
          country_id: string
          created_at: string
          detected_at: string
          id: string
          new_value: Json
          old_value: Json | null
          published_at: string | null
          source_id: string
          updated_at: string
          validated_by: string | null
          validation_notes: string | null
          validation_status: Database["public"]["Enums"]["validation_status"]
        }
        Insert: {
          change_summary?: string | null
          change_type: Database["public"]["Enums"]["change_type"]
          country_id: string
          created_at?: string
          detected_at?: string
          id?: string
          new_value: Json
          old_value?: Json | null
          published_at?: string | null
          source_id: string
          updated_at?: string
          validated_by?: string | null
          validation_notes?: string | null
          validation_status?: Database["public"]["Enums"]["validation_status"]
        }
        Update: {
          change_summary?: string | null
          change_type?: Database["public"]["Enums"]["change_type"]
          country_id?: string
          created_at?: string
          detected_at?: string
          id?: string
          new_value?: Json
          old_value?: Json | null
          published_at?: string | null
          source_id?: string
          updated_at?: string
          validated_by?: string | null
          validation_notes?: string | null
          validation_status?: Database["public"]["Enums"]["validation_status"]
        }
        Relationships: [
          {
            foreignKeyName: "country_data_updates_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "country_data_updates_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "country_data_sources"
            referencedColumns: ["id"]
          },
        ]
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
      event_registrations: {
        Row: {
          created_at: string
          event_date: string
          event_id: string
          event_title: string
          event_type: string
          guest_email: string | null
          guest_name: string | null
          id: string
          notes: string | null
          registration_ip_hash: string | null
          reminder_sent: boolean
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_date: string
          event_id: string
          event_title: string
          event_type: string
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          notes?: string | null
          registration_ip_hash?: string | null
          reminder_sent?: boolean
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_date?: string
          event_id?: string
          event_title?: string
          event_type?: string
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          notes?: string | null
          registration_ip_hash?: string | null
          reminder_sent?: boolean
          status?: string
          updated_at?: string
          user_id?: string | null
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
      expert_applications: {
        Row: {
          admin_notes: string | null
          bio: string | null
          certifications: Json | null
          countries: string[] | null
          created_at: string | null
          currency: string | null
          display_name: string
          documents: Json | null
          hourly_rate: number | null
          id: string
          languages: string[] | null
          reviewed_at: string | null
          reviewed_by: string | null
          specialties: string[] | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          bio?: string | null
          certifications?: Json | null
          countries?: string[] | null
          created_at?: string | null
          currency?: string | null
          display_name: string
          documents?: Json | null
          hourly_rate?: number | null
          id?: string
          languages?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          specialties?: string[] | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          bio?: string | null
          certifications?: Json | null
          countries?: string[] | null
          created_at?: string | null
          currency?: string | null
          display_name?: string
          documents?: Json | null
          hourly_rate?: number | null
          id?: string
          languages?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          specialties?: string[] | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      expert_review_votes: {
        Row: {
          created_at: string
          id: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_review_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "expert_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_reviews: {
        Row: {
          content: string
          created_at: string
          expert_id: string
          expert_response: string | null
          expert_response_at: string | null
          helpful_count: number | null
          id: string
          rating: number
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          content: string
          created_at?: string
          expert_id: string
          expert_response?: string | null
          expert_response_at?: string | null
          helpful_count?: number | null
          id?: string
          rating: number
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          content?: string
          created_at?: string
          expert_id?: string
          expert_response?: string | null
          expert_response_at?: string | null
          helpful_count?: number | null
          id?: string
          rating?: number
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_expert_reviews_experts"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
        ]
      }
      experts: {
        Row: {
          avatar_url: string | null
          bio: string | null
          booking_url: string | null
          certifications: Json | null
          countries: string[] | null
          created_at: string | null
          currency: string | null
          display_name: string
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          languages: string[] | null
          rating_avg: number | null
          response_time_hours: number | null
          review_count: number | null
          specialties: string[] | null
          stripe_account_id: string | null
          stripe_onboarding_complete: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          booking_url?: string | null
          certifications?: Json | null
          countries?: string[] | null
          created_at?: string | null
          currency?: string | null
          display_name: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          rating_avg?: number | null
          response_time_hours?: number | null
          review_count?: number | null
          specialties?: string[] | null
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          booking_url?: string | null
          certifications?: Json | null
          countries?: string[] | null
          created_at?: string | null
          currency?: string | null
          display_name?: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          rating_avg?: number | null
          response_time_hours?: number | null
          review_count?: number | null
          specialties?: string[] | null
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      financial_intel_country_snapshots: {
        Row: {
          audience: string | null
          confidence: number | null
          country: string
          country_profile: Json | null
          created_at: string
          disclaimer: string | null
          expires_at: string
          id: string
          language: string
          legit_top7_json: Json
          scam_top7_json: Json
          sector_focus: string | null
          sources_json: Json
          updated_at: string
        }
        Insert: {
          audience?: string | null
          confidence?: number | null
          country: string
          country_profile?: Json | null
          created_at?: string
          disclaimer?: string | null
          expires_at?: string
          id?: string
          language?: string
          legit_top7_json?: Json
          scam_top7_json?: Json
          sector_focus?: string | null
          sources_json?: Json
          updated_at?: string
        }
        Update: {
          audience?: string | null
          confidence?: number | null
          country?: string
          country_profile?: Json | null
          created_at?: string
          disclaimer?: string | null
          expires_at?: string
          id?: string
          language?: string
          legit_top7_json?: Json
          scam_top7_json?: Json
          sector_focus?: string | null
          sources_json?: Json
          updated_at?: string
        }
        Relationships: []
      }
      financial_intel_generation_runs: {
        Row: {
          completed_at: string | null
          country: string
          created_at: string
          error_message: string | null
          id: string
          params_json: Json | null
          snapshot_id: string | null
          status: string
          tokens_cost: number | null
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          completed_at?: string | null
          country: string
          created_at?: string
          error_message?: string | null
          id?: string
          params_json?: Json | null
          snapshot_id?: string | null
          status?: string
          tokens_cost?: number | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          completed_at?: string | null
          country?: string
          created_at?: string
          error_message?: string | null
          id?: string
          params_json?: Json | null
          snapshot_id?: string | null
          status?: string
          tokens_cost?: number | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_intel_generation_runs_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "financial_intel_country_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      fiscal_conventions: {
        Row: {
          applicable_income_types: string[]
          convention_type: Database["public"]["Enums"]["fiscal_convention_type"]
          country_a_id: string
          country_b_id: string
          created_at: string
          effective_date: string | null
          id: string
          source_url: string | null
          updated_at: string
          withholding_rates: Json | null
        }
        Insert: {
          applicable_income_types?: string[]
          convention_type: Database["public"]["Enums"]["fiscal_convention_type"]
          country_a_id: string
          country_b_id: string
          created_at?: string
          effective_date?: string | null
          id?: string
          source_url?: string | null
          updated_at?: string
          withholding_rates?: Json | null
        }
        Update: {
          applicable_income_types?: string[]
          convention_type?: Database["public"]["Enums"]["fiscal_convention_type"]
          country_a_id?: string
          country_b_id?: string
          created_at?: string
          effective_date?: string | null
          id?: string
          source_url?: string | null
          updated_at?: string
          withholding_rates?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fiscal_conventions_country_a_id_fkey"
            columns: ["country_a_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiscal_conventions_country_b_id_fkey"
            columns: ["country_b_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      fiscal_rules: {
        Row: {
          brackets: Json
          country_id: string
          created_at: string
          currency: string
          deductions: Json | null
          id: string
          notes_i18n: Json | null
          rule_type: Database["public"]["Enums"]["fiscal_rule_type"]
          source_url: string | null
          updated_at: string
          valid_from: string
          valid_to: string | null
        }
        Insert: {
          brackets?: Json
          country_id: string
          created_at?: string
          currency?: string
          deductions?: Json | null
          id?: string
          notes_i18n?: Json | null
          rule_type: Database["public"]["Enums"]["fiscal_rule_type"]
          source_url?: string | null
          updated_at?: string
          valid_from?: string
          valid_to?: string | null
        }
        Update: {
          brackets?: Json
          country_id?: string
          created_at?: string
          currency?: string
          deductions?: Json | null
          id?: string
          notes_i18n?: Json | null
          rule_type?: Database["public"]["Enums"]["fiscal_rule_type"]
          source_url?: string | null
          updated_at?: string
          valid_from?: string
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fiscal_rules_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      fiscal_special_regimes: {
        Row: {
          application_deadline: string | null
          benefits: Json
          conditions: Json
          country_id: string
          created_at: string
          description_i18n: Json | null
          duration_years: number | null
          id: string
          is_active: boolean
          regime_name: string
          source_url: string | null
          updated_at: string
        }
        Insert: {
          application_deadline?: string | null
          benefits?: Json
          conditions?: Json
          country_id: string
          created_at?: string
          description_i18n?: Json | null
          duration_years?: number | null
          id?: string
          is_active?: boolean
          regime_name: string
          source_url?: string | null
          updated_at?: string
        }
        Update: {
          application_deadline?: string | null
          benefits?: Json
          conditions?: Json
          country_id?: string
          created_at?: string
          description_i18n?: Json | null
          duration_years?: number | null
          id?: string
          is_active?: boolean
          regime_name?: string
          source_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fiscal_special_regimes_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      game_statistics: {
        Row: {
          archetypes_used: Json | null
          best_score_race: number | null
          best_score_solo: number | null
          countries_visited: string[] | null
          created_at: string
          display_name: string | null
          favorite_actions: Json | null
          id: string
          last_game_at: string | null
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
          display_name?: string | null
          favorite_actions?: Json | null
          id?: string
          last_game_at?: string | null
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
          display_name?: string | null
          favorite_actions?: Json | null
          id?: string
          last_game_at?: string | null
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
      gamification_progress: {
        Row: {
          badges: string[]
          challenges_completed: string[]
          created_at: string
          id: string
          last_active: string
          level: string
          phase: string
          streak: number
          total_challenges_completed: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          badges?: string[]
          challenges_completed?: string[]
          created_at?: string
          id?: string
          last_active?: string
          level?: string
          phase?: string
          streak?: number
          total_challenges_completed?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          badges?: string[]
          challenges_completed?: string[]
          created_at?: string
          id?: string
          last_active?: string
          level?: string
          phase?: string
          streak?: number
          total_challenges_completed?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      gdpr_consent_log: {
        Row: {
          consent_given: boolean
          consent_type: string
          created_at: string | null
          id: string
          ip_hash: string | null
          session_id: string | null
          updated_at: string | null
          user_agent_hash: string | null
          user_id: string | null
        }
        Insert: {
          consent_given: boolean
          consent_type: string
          created_at?: string | null
          id?: string
          ip_hash?: string | null
          session_id?: string | null
          updated_at?: string | null
          user_agent_hash?: string | null
          user_id?: string | null
        }
        Update: {
          consent_given?: boolean
          consent_type?: string
          created_at?: string | null
          id?: string
          ip_hash?: string | null
          session_id?: string | null
          updated_at?: string | null
          user_agent_hash?: string | null
          user_id?: string | null
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
      gov_intel_runs: {
        Row: {
          actors_count: number | null
          case_id: string
          completed_at: string | null
          country_code: string
          created_at: string
          delays_count: number | null
          error_message: string | null
          id: string
          intention: string | null
          partners_count: number | null
          patterns_count: number | null
          project_type: string | null
          sector: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          actors_count?: number | null
          case_id: string
          completed_at?: string | null
          country_code: string
          created_at?: string
          delays_count?: number | null
          error_message?: string | null
          id?: string
          intention?: string | null
          partners_count?: number | null
          patterns_count?: number | null
          project_type?: string | null
          sector?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          actors_count?: number | null
          case_id?: string
          completed_at?: string | null
          country_code?: string
          created_at?: string
          delays_count?: number | null
          error_message?: string | null
          id?: string
          intention?: string | null
          partners_count?: number | null
          patterns_count?: number | null
          project_type?: string | null
          sector?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
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
      music_generation_tasks: {
        Row: {
          attempts: number | null
          audio_url: string | null
          country_id: string
          created_at: string
          error_message: string | null
          external_task_id: string | null
          id: string
          mood: string | null
          pyramid_type: string
          status: string
          stream_url: string | null
          suno_task_id: string | null
          updated_at: string
        }
        Insert: {
          attempts?: number | null
          audio_url?: string | null
          country_id: string
          created_at?: string
          error_message?: string | null
          external_task_id?: string | null
          id?: string
          mood?: string | null
          pyramid_type: string
          status?: string
          stream_url?: string | null
          suno_task_id?: string | null
          updated_at?: string
        }
        Update: {
          attempts?: number | null
          audio_url?: string | null
          country_id?: string
          created_at?: string
          error_message?: string | null
          external_task_id?: string | null
          id?: string
          mood?: string | null
          pyramid_type?: string
          status?: string
          stream_url?: string | null
          suno_task_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscriptions: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          preferences: Json
          source: string | null
          subscribed_at: string
          unsubscribed_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          preferences?: Json
          source?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          preferences?: Json
          source?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
          updated_at?: string
          user_id?: string | null
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
      pmo_ai_citations: {
        Row: {
          case_id: string | null
          citation_text: string | null
          confidence_score: number | null
          created_at: string
          evidence_id: string | null
          id: string
          response_id: string | null
          user_id: string
        }
        Insert: {
          case_id?: string | null
          citation_text?: string | null
          confidence_score?: number | null
          created_at?: string
          evidence_id?: string | null
          id?: string
          response_id?: string | null
          user_id: string
        }
        Update: {
          case_id?: string | null
          citation_text?: string | null
          confidence_score?: number | null
          created_at?: string
          evidence_id?: string | null
          id?: string
          response_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pmo_ai_citations_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "user_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pmo_ai_citations_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "pmo_evidence_vault"
            referencedColumns: ["id"]
          },
        ]
      }
      pmo_budget_lines: {
        Row: {
          actual_amount: number | null
          amount: number
          approved_at: string | null
          approved_by: string | null
          budget_type: string
          case_id: string | null
          category: string
          created_at: string
          created_by: string | null
          currency: string
          description: string
          end_month: string | null
          id: string
          initiative_id: string | null
          is_recurring: boolean | null
          justification: string | null
          milestone_id: string | null
          month_year: string
          owner_id: string | null
          owner_name: string | null
          recurrence: string | null
          risk_id: string | null
          scenario_id: string | null
          start_month: string | null
          status: string
          updated_at: string
          updated_by: string | null
          user_id: string
          variance: number | null
        }
        Insert: {
          actual_amount?: number | null
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          budget_type: string
          case_id?: string | null
          category: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description: string
          end_month?: string | null
          id?: string
          initiative_id?: string | null
          is_recurring?: boolean | null
          justification?: string | null
          milestone_id?: string | null
          month_year: string
          owner_id?: string | null
          owner_name?: string | null
          recurrence?: string | null
          risk_id?: string | null
          scenario_id?: string | null
          start_month?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          user_id: string
          variance?: number | null
        }
        Update: {
          actual_amount?: number | null
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          budget_type?: string
          case_id?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string
          end_month?: string | null
          id?: string
          initiative_id?: string | null
          is_recurring?: boolean | null
          justification?: string | null
          milestone_id?: string | null
          month_year?: string
          owner_id?: string | null
          owner_name?: string | null
          recurrence?: string | null
          risk_id?: string | null
          scenario_id?: string | null
          start_month?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          user_id?: string
          variance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pmo_budget_lines_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "user_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pmo_budget_lines_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "pmo_initiatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pmo_budget_lines_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "pmo_milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pmo_budget_lines_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "pmo_risk_register"
            referencedColumns: ["id"]
          },
        ]
      }
      pmo_budget_scenarios: {
        Row: {
          available_cash: number | null
          case_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          forecast_months: number | null
          id: string
          is_active: boolean | null
          monthly_burn_rate: number | null
          name: string
          parameters: Json | null
          runway_months: number | null
          scenario_type: string
          start_month: string | null
          total_budget: number | null
          total_capex: number | null
          total_opex: number | null
          updated_at: string
          updated_by: string | null
          user_id: string
        }
        Insert: {
          available_cash?: number | null
          case_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          forecast_months?: number | null
          id?: string
          is_active?: boolean | null
          monthly_burn_rate?: number | null
          name: string
          parameters?: Json | null
          runway_months?: number | null
          scenario_type?: string
          start_month?: string | null
          total_budget?: number | null
          total_capex?: number | null
          total_opex?: number | null
          updated_at?: string
          updated_by?: string | null
          user_id: string
        }
        Update: {
          available_cash?: number | null
          case_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          forecast_months?: number | null
          id?: string
          is_active?: boolean | null
          monthly_burn_rate?: number | null
          name?: string
          parameters?: Json | null
          runway_months?: number | null
          scenario_type?: string
          start_month?: string | null
          total_budget?: number | null
          total_capex?: number | null
          total_opex?: number | null
          updated_at?: string
          updated_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pmo_budget_scenarios_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "user_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      pmo_compliance_frameworks: {
        Row: {
          activation_questionnaire: Json | null
          case_id: string
          created_at: string
          created_by: string | null
          description: string | null
          framework_type: string
          id: string
          is_active: boolean | null
          name: string
          source_url: string | null
          updated_at: string
          updated_by: string | null
          user_id: string
          version: string | null
        }
        Insert: {
          activation_questionnaire?: Json | null
          case_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          framework_type: string
          id?: string
          is_active?: boolean | null
          name: string
          source_url?: string | null
          updated_at?: string
          updated_by?: string | null
          user_id: string
          version?: string | null
        }
        Update: {
          activation_questionnaire?: Json | null
          case_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          framework_type?: string
          id?: string
          is_active?: boolean | null
          name?: string
          source_url?: string | null
          updated_at?: string
          updated_by?: string | null
          user_id?: string
          version?: string | null
        }
        Relationships: []
      }
      pmo_compliance_mappings: {
        Row: {
          coverage_status: string | null
          created_at: string
          id: string
          mapping_type: string
          notes: string | null
          owner_name: string | null
          requirement_id: string
          target_id: string
          target_title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          coverage_status?: string | null
          created_at?: string
          id?: string
          mapping_type: string
          notes?: string | null
          owner_name?: string | null
          requirement_id: string
          target_id: string
          target_title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          coverage_status?: string | null
          created_at?: string
          id?: string
          mapping_type?: string
          notes?: string | null
          owner_name?: string | null
          requirement_id?: string
          target_id?: string
          target_title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pmo_compliance_mappings_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "pmo_compliance_requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      pmo_compliance_requirements: {
        Row: {
          category: string | null
          created_at: string
          criticality: string | null
          description: string | null
          due_date: string | null
          framework_id: string
          id: string
          notes: string | null
          requirement_code: string | null
          source_date: string | null
          source_reference: string | null
          source_version: string | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          criticality?: string | null
          description?: string | null
          due_date?: string | null
          framework_id: string
          id?: string
          notes?: string | null
          requirement_code?: string | null
          source_date?: string | null
          source_reference?: string | null
          source_version?: string | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          criticality?: string | null
          description?: string | null
          due_date?: string | null
          framework_id?: string
          id?: string
          notes?: string | null
          requirement_code?: string | null
          source_date?: string | null
          source_reference?: string | null
          source_version?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pmo_compliance_requirements_framework_id_fkey"
            columns: ["framework_id"]
            isOneToOne: false
            referencedRelation: "pmo_compliance_frameworks"
            referencedColumns: ["id"]
          },
        ]
      }
      pmo_dependencies: {
        Row: {
          case_id: string | null
          created_at: string
          dependency_type: string
          description: string | null
          id: string
          source_id: string
          source_type: string
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          case_id?: string | null
          created_at?: string
          dependency_type?: string
          description?: string | null
          id?: string
          source_id: string
          source_type: string
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          case_id?: string | null
          created_at?: string
          dependency_type?: string
          description?: string | null
          id?: string
          source_id?: string
          source_type?: string
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pmo_dependencies_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "user_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      pmo_evidence_vault: {
        Row: {
          case_id: string | null
          content: string | null
          created_at: string
          created_by: string | null
          evidence_type: string
          id: string
          is_verified: boolean | null
          reliability: string
          source_date: string | null
          source_name: string | null
          tags: string[] | null
          title: string
          updated_at: string
          updated_by: string | null
          url: string | null
          user_id: string
          verified_at: string | null
          verified_by: string | null
          version: string | null
        }
        Insert: {
          case_id?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          evidence_type: string
          id?: string
          is_verified?: boolean | null
          reliability?: string
          source_date?: string | null
          source_name?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          updated_by?: string | null
          url?: string | null
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
          version?: string | null
        }
        Update: {
          case_id?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          evidence_type?: string
          id?: string
          is_verified?: boolean | null
          reliability?: string
          source_date?: string | null
          source_name?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          updated_by?: string | null
          url?: string | null
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pmo_evidence_vault_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "user_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      pmo_generated_packs: {
        Row: {
          case_id: string | null
          file_size_bytes: number | null
          file_url: string | null
          generated_at: string
          generated_by: string | null
          id: string
          is_shared: boolean | null
          pack_type: string
          share_expires_at: string | null
          share_token: string | null
          snapshot_data: Json
          template_version: string | null
          title: string
          user_id: string
        }
        Insert: {
          case_id?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          generated_at?: string
          generated_by?: string | null
          id?: string
          is_shared?: boolean | null
          pack_type: string
          share_expires_at?: string | null
          share_token?: string | null
          snapshot_data: Json
          template_version?: string | null
          title: string
          user_id: string
        }
        Update: {
          case_id?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          generated_at?: string
          generated_by?: string | null
          id?: string
          is_shared?: boolean | null
          pack_type?: string
          share_expires_at?: string | null
          share_token?: string | null
          snapshot_data?: Json
          template_version?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pmo_generated_packs_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "user_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      pmo_initiatives: {
        Row: {
          blocked_reason: string | null
          case_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          effort_days: number | null
          effort_estimate: string | null
          id: string
          objective_id: string | null
          owner_id: string | null
          owner_name: string | null
          start_date: string | null
          status: string
          target_date: string | null
          title: string
          updated_at: string
          updated_by: string | null
          user_id: string
          value_expected: string | null
        }
        Insert: {
          blocked_reason?: string | null
          case_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          effort_days?: number | null
          effort_estimate?: string | null
          id?: string
          objective_id?: string | null
          owner_id?: string | null
          owner_name?: string | null
          start_date?: string | null
          status?: string
          target_date?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
          user_id: string
          value_expected?: string | null
        }
        Update: {
          blocked_reason?: string | null
          case_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          effort_days?: number | null
          effort_estimate?: string | null
          id?: string
          objective_id?: string | null
          owner_id?: string | null
          owner_name?: string | null
          start_date?: string | null
          status?: string
          target_date?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
          user_id?: string
          value_expected?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pmo_initiatives_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "user_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pmo_initiatives_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "pmo_objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      pmo_milestones: {
        Row: {
          achieved_at: string | null
          case_id: string | null
          created_at: string
          created_by: string | null
          deliverables: Json | null
          description: string | null
          id: string
          initiative_id: string | null
          objective_id: string | null
          status: string
          target_date: string
          title: string
          updated_at: string
          updated_by: string | null
          user_id: string
          validation_criteria: Json | null
        }
        Insert: {
          achieved_at?: string | null
          case_id?: string | null
          created_at?: string
          created_by?: string | null
          deliverables?: Json | null
          description?: string | null
          id?: string
          initiative_id?: string | null
          objective_id?: string | null
          status?: string
          target_date: string
          title: string
          updated_at?: string
          updated_by?: string | null
          user_id: string
          validation_criteria?: Json | null
        }
        Update: {
          achieved_at?: string | null
          case_id?: string | null
          created_at?: string
          created_by?: string | null
          deliverables?: Json | null
          description?: string | null
          id?: string
          initiative_id?: string | null
          objective_id?: string | null
          status?: string
          target_date?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
          user_id?: string
          validation_criteria?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "pmo_milestones_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "user_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pmo_milestones_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "pmo_initiatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pmo_milestones_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "pmo_objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      pmo_objectives: {
        Row: {
          case_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          horizon_days: number
          id: string
          org_id: string | null
          priority: string
          progress_percent: number | null
          status: string
          success_metrics: Json | null
          target_date: string | null
          title: string
          updated_at: string
          updated_by: string | null
          user_id: string
        }
        Insert: {
          case_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          horizon_days?: number
          id?: string
          org_id?: string | null
          priority?: string
          progress_percent?: number | null
          status?: string
          success_metrics?: Json | null
          target_date?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
          user_id: string
        }
        Update: {
          case_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          horizon_days?: number
          id?: string
          org_id?: string | null
          priority?: string
          progress_percent?: number | null
          status?: string
          success_metrics?: Json | null
          target_date?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pmo_objectives_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "user_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      pmo_priority_scores: {
        Row: {
          breakdown: Json | null
          calculated_at: string
          case_id: string | null
          created_at: string
          id: string
          initiative_id: string | null
          investor_deadline: string | null
          is_mvp_mode: boolean | null
          score: number
          user_id: string
          weights_snapshot: Json | null
        }
        Insert: {
          breakdown?: Json | null
          calculated_at?: string
          case_id?: string | null
          created_at?: string
          id?: string
          initiative_id?: string | null
          investor_deadline?: string | null
          is_mvp_mode?: boolean | null
          score?: number
          user_id: string
          weights_snapshot?: Json | null
        }
        Update: {
          breakdown?: Json | null
          calculated_at?: string
          case_id?: string | null
          created_at?: string
          id?: string
          initiative_id?: string | null
          investor_deadline?: string | null
          is_mvp_mode?: boolean | null
          score?: number
          user_id?: string
          weights_snapshot?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "pmo_priority_scores_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "user_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pmo_priority_scores_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "pmo_initiatives"
            referencedColumns: ["id"]
          },
        ]
      }
      pmo_risk_register: {
        Row: {
          case_id: string | null
          category: string
          cause: string | null
          closed_at: string | null
          closure_reason: string | null
          contingency_plan: string | null
          created_at: string
          created_by: string | null
          criticality: string | null
          description: string
          escalation_threshold: number | null
          id: string
          impact: number
          last_review_date: string | null
          mitigation_plan: string | null
          next_review_date: string | null
          occurred_at: string | null
          org_id: string | null
          owner_id: string | null
          owner_name: string | null
          probability: number
          response_strategy: string | null
          score: number | null
          status: string
          title: string
          updated_at: string
          updated_by: string | null
          user_id: string
        }
        Insert: {
          case_id?: string | null
          category: string
          cause?: string | null
          closed_at?: string | null
          closure_reason?: string | null
          contingency_plan?: string | null
          created_at?: string
          created_by?: string | null
          criticality?: string | null
          description: string
          escalation_threshold?: number | null
          id?: string
          impact?: number
          last_review_date?: string | null
          mitigation_plan?: string | null
          next_review_date?: string | null
          occurred_at?: string | null
          org_id?: string | null
          owner_id?: string | null
          owner_name?: string | null
          probability?: number
          response_strategy?: string | null
          score?: number | null
          status?: string
          title: string
          updated_at?: string
          updated_by?: string | null
          user_id: string
        }
        Update: {
          case_id?: string | null
          category?: string
          cause?: string | null
          closed_at?: string | null
          closure_reason?: string | null
          contingency_plan?: string | null
          created_at?: string
          created_by?: string | null
          criticality?: string | null
          description?: string
          escalation_threshold?: number | null
          id?: string
          impact?: number
          last_review_date?: string | null
          mitigation_plan?: string | null
          next_review_date?: string | null
          occurred_at?: string | null
          org_id?: string | null
          owner_id?: string | null
          owner_name?: string | null
          probability?: number
          response_strategy?: string | null
          score?: number | null
          status?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pmo_risk_register_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "user_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      pmo_risk_reviews: {
        Row: {
          actions_generated: Json | null
          assessment: string | null
          created_at: string
          decision: string | null
          escalated: boolean | null
          id: string
          impact_change: string | null
          new_score: number | null
          next_review_date: string | null
          previous_score: number | null
          probability_change: string | null
          review_date: string
          risk_id: string
          score_change: number | null
          user_id: string
        }
        Insert: {
          actions_generated?: Json | null
          assessment?: string | null
          created_at?: string
          decision?: string | null
          escalated?: boolean | null
          id?: string
          impact_change?: string | null
          new_score?: number | null
          next_review_date?: string | null
          previous_score?: number | null
          probability_change?: string | null
          review_date?: string
          risk_id: string
          score_change?: number | null
          user_id: string
        }
        Update: {
          actions_generated?: Json | null
          assessment?: string | null
          created_at?: string
          decision?: string | null
          escalated?: boolean | null
          id?: string
          impact_change?: string | null
          new_score?: number | null
          next_review_date?: string | null
          previous_score?: number | null
          probability_change?: string | null
          review_date?: string
          risk_id?: string
          score_change?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pmo_risk_reviews_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "pmo_risk_register"
            referencedColumns: ["id"]
          },
        ]
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
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
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
      scrape_jobs: {
        Row: {
          changes_detected: number | null
          completed_at: string | null
          country_id: string | null
          created_at: string
          error_message: string | null
          id: string
          source_id: string | null
          started_at: string | null
          status: string
          tokens_used: number | null
        }
        Insert: {
          changes_detected?: number | null
          completed_at?: string | null
          country_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          source_id?: string | null
          started_at?: string | null
          status?: string
          tokens_used?: number | null
        }
        Update: {
          changes_detected?: number | null
          completed_at?: string | null
          country_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          source_id?: string | null
          started_at?: string | null
          status?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scrape_jobs_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scrape_jobs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "country_data_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          active: boolean | null
          created_at: string
          description: string | null
          features: Json | null
          id: string
          limits: Json | null
          name: string
          price_monthly: number | null
          price_yearly: number | null
          stripe_price_id: string | null
          stripe_price_id_yearly: string | null
          stripe_product_id: string | null
          tier: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          limits?: Json | null
          name: string
          price_monthly?: number | null
          price_yearly?: number | null
          stripe_price_id?: string | null
          stripe_price_id_yearly?: string | null
          stripe_product_id?: string | null
          tier: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          limits?: Json | null
          name?: string
          price_monthly?: number | null
          price_yearly?: number | null
          stripe_price_id?: string | null
          stripe_price_id_yearly?: string | null
          stripe_product_id?: string | null
          tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      terrain_realities_cache: {
        Row: {
          country: string
          created_at: string
          data_json: Json
          expires_at: string
          id: string
          language: string
        }
        Insert: {
          country: string
          created_at?: string
          data_json: Json
          expires_at?: string
          id?: string
          language?: string
        }
        Update: {
          country?: string
          created_at?: string
          data_json?: Json
          expires_at?: string
          id?: string
          language?: string
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
      ui_translations: {
        Row: {
          created_at: string
          id: string
          language: string
          namespace: string
          translations: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          language: string
          namespace?: string
          translations?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          namespace?: string
          translations?: Json
          updated_at?: string
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
      user_test_results: {
        Row: {
          answers: Json
          created_at: string
          elapsed_seconds: number | null
          id: string
          result_archetype: string | null
          result_pyramid: string
          test_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answers: Json
          created_at?: string
          elapsed_seconds?: number | null
          id?: string
          result_archetype?: string | null
          result_pyramid: string
          test_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          elapsed_seconds?: number | null
          id?: string
          result_archetype?: string | null
          result_pyramid?: string
          test_type?: string
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
      game_leaderboard: {
        Row: {
          best_score_race: number | null
          best_score_solo: number | null
          display_name: string | null
          total_games_played: number | null
        }
        Relationships: []
      }
      game_leaderboard_safe: {
        Row: {
          best_score_race: number | null
          best_score_solo: number | null
          display_name: string | null
          total_games_played: number | null
          user_id: string | null
        }
        Relationships: []
      }
      game_statistics_leaderboard: {
        Row: {
          best_score_race: number | null
          best_score_solo: number | null
          display_name: string | null
          id: string | null
          total_games_played: number | null
          total_turns_played: number | null
          updated_at: string | null
        }
        Insert: {
          best_score_race?: number | null
          best_score_solo?: number | null
          display_name?: string | null
          id?: string | null
          total_games_played?: number | null
          total_turns_played?: number | null
          updated_at?: string | null
        }
        Update: {
          best_score_race?: number | null
          best_score_solo?: number | null
          display_name?: string | null
          id?: string | null
          total_games_played?: number | null
          total_turns_played?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notification_settings_safe: {
        Row: {
          created_at: string | null
          deadline_reminder_days: number | null
          email_enabled: boolean | null
          id: string | null
          push_enabled: boolean | null
          slack_status: string | null
          updated_at: string | null
          user_id: string | null
          weekly_digest: boolean | null
        }
        Insert: {
          created_at?: string | null
          deadline_reminder_days?: number | null
          email_enabled?: boolean | null
          id?: string | null
          push_enabled?: boolean | null
          slack_status?: never
          updated_at?: string | null
          user_id?: string | null
          weekly_digest?: boolean | null
        }
        Update: {
          created_at?: string | null
          deadline_reminder_days?: number | null
          email_enabled?: boolean | null
          id?: string | null
          push_enabled?: boolean | null
          slack_status?: never
          updated_at?: string | null
          user_id?: string | null
          weekly_digest?: boolean | null
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
      update_game_stats: {
        Args: {
          p_games_played?: number
          p_score_race?: number
          p_score_solo?: number
          p_turns_played?: number
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      change_type:
        | "visa_rules"
        | "tax_rates"
        | "cost_of_living"
        | "healthcare"
        | "immigration_policy"
        | "lgbtq_rights"
        | "natural_risks"
        | "quality_of_life"
      consultation_status:
        | "requested"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "disputed"
      fiscal_convention_type: "exemption" | "credit" | "deduction"
      fiscal_rule_type:
        | "income_tax"
        | "social_contributions"
        | "wealth_tax"
        | "capital_gains"
        | "vat"
        | "special_regime"
      game_mode: "solo" | "race" | "points_duel" | "cooperative"
      partner_application_status:
        | "pending"
        | "approved"
        | "rejected"
        | "suspended"
      partner_type: "ambassador" | "b2b_partner"
      payment_status: "pending" | "paid" | "refunded"
      source_type:
        | "government"
        | "embassy"
        | "statistics"
        | "immigration"
        | "fiscal"
      validation_status: "pending" | "approved" | "rejected"
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
      change_type: [
        "visa_rules",
        "tax_rates",
        "cost_of_living",
        "healthcare",
        "immigration_policy",
        "lgbtq_rights",
        "natural_risks",
        "quality_of_life",
      ],
      consultation_status: [
        "requested",
        "confirmed",
        "completed",
        "cancelled",
        "disputed",
      ],
      fiscal_convention_type: ["exemption", "credit", "deduction"],
      fiscal_rule_type: [
        "income_tax",
        "social_contributions",
        "wealth_tax",
        "capital_gains",
        "vat",
        "special_regime",
      ],
      game_mode: ["solo", "race", "points_duel", "cooperative"],
      partner_application_status: [
        "pending",
        "approved",
        "rejected",
        "suspended",
      ],
      partner_type: ["ambassador", "b2b_partner"],
      payment_status: ["pending", "paid", "refunded"],
      source_type: [
        "government",
        "embassy",
        "statistics",
        "immigration",
        "fiscal",
      ],
      validation_status: ["pending", "approved", "rejected"],
    },
  },
} as const
