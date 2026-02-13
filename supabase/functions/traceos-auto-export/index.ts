import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { corsHeaders } from "../_shared/cors.ts";

interface ExportRequest {
  userId?: string;
  scheduled?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, scheduled } = (await req.json()) as ExportRequest;

    // Get user ID from request or header
    let targetUserId = userId;
    
    if (!targetUserId) {
      // Try to get from auth header for manual exports
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const { data: { user }, error } = await supabase.auth.getUser(
          authHeader.replace('Bearer ', '')
        );
        if (!error && user) {
          targetUserId = user.id;
        }
      }
    }

    if (!targetUserId) {
      return new Response(
        JSON.stringify({ error: 'User ID required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting export for user: ${targetUserId}`);

    // Fetch all decisions for the user
    const { data: decisions, error: decisionsError } = await supabase
      .from('traceos_decisions')
      .select('*')
      .eq('user_id', targetUserId)
      .order('decision_date', { ascending: false });

    if (decisionsError) throw decisionsError;

    // Fetch history for all decisions
    const decisionIds = (decisions || []).map(d => d.id);
    let history: any[] = [];
    
    if (decisionIds.length > 0) {
      const { data: historyData, error: historyError } = await supabase
        .from('traceos_decision_history')
        .select('*')
        .in('decision_id', decisionIds)
        .order('created_at', { ascending: false });

      if (!historyError) {
        history = historyData || [];
      }
    }

    // Fetch approvals
    let approvals: any[] = [];
    if (decisionIds.length > 0) {
      const { data: approvalsData, error: approvalsError } = await supabase
        .from('traceos_approvals')
        .select('*')
        .in('decision_id', decisionIds);

      if (!approvalsError) {
        approvals = approvalsData || [];
      }
    }

    // Fetch tags
    const { data: tags, error: tagsError } = await supabase
      .from('traceos_tags')
      .select('*')
      .eq('user_id', targetUserId);

    // Fetch decision-tag associations
    let decisionTags: any[] = [];
    if (decisionIds.length > 0) {
      const { data: dtData, error: dtError } = await supabase
        .from('traceos_decision_tags')
        .select('*')
        .in('decision_id', decisionIds);

      if (!dtError) {
        decisionTags = dtData || [];
      }
    }

    // Build export object
    const exportData = {
      exportDate: new Date().toISOString(),
      exportType: scheduled ? 'scheduled' : 'manual',
      userId: targetUserId,
      summary: {
        totalDecisions: decisions?.length || 0,
        validated: decisions?.filter(d => d.status === 'validated').length || 0,
        pending: decisions?.filter(d => d.status === 'pending').length || 0,
        abandoned: decisions?.filter(d => d.status === 'abandoned').length || 0,
        totalHistoryEntries: history.length,
        totalApprovals: approvals.length,
        totalTags: tags?.length || 0,
      },
      decisions: decisions || [],
      history,
      approvals,
      tags: tags || [],
      decisionTags,
    };

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${targetUserId}/traceos-export-${timestamp}.json`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('traceos-exports')
      .upload(filename, JSON.stringify(exportData, null, 2), {
        contentType: 'application/json',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get signed URL for private bucket (valid for 7 days)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('traceos-exports')
      .createSignedUrl(filename, 60 * 60 * 24 * 7);

    // Update schedule if this was a scheduled export
    if (scheduled) {
      const { data: schedule } = await supabase
        .from('traceos_export_schedules')
        .select('frequency')
        .eq('user_id', targetUserId)
        .eq('is_active', true)
        .maybeSingle();

      if (schedule) {
        const now = new Date();
        let nextExport = new Date(now);
        
        switch (schedule.frequency) {
          case 'daily':
            nextExport.setDate(nextExport.getDate() + 1);
            break;
          case 'weekly':
            nextExport.setDate(nextExport.getDate() + 7);
            break;
          case 'monthly':
            nextExport.setMonth(nextExport.getMonth() + 1);
            break;
        }

        await supabase
          .from('traceos_export_schedules')
          .update({
            last_export_at: now.toISOString(),
            next_export_at: nextExport.toISOString(),
          })
          .eq('user_id', targetUserId)
          .eq('is_active', true);
      }
    }

    console.log(`Export completed: ${filename}`);

    return new Response(
      JSON.stringify({
        success: true,
        filename,
        url: signedUrlData?.signedUrl || null,
        summary: exportData.summary,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Export error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
