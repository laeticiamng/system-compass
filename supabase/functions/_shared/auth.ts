/**
 * Shared authentication utilities for Supabase Edge Functions
 * Provides consistent auth patterns across all endpoints
 */

import { SupabaseClient, User } from "https://esm.sh/@supabase/supabase-js@2";

export interface AuthResult {
  user: User;
  userId: string;
}

export interface AuthError {
  error: string;
  status: number;
}

/**
 * Require authentication for an edge function
 * Returns the authenticated user or throws an error
 */
export async function requireAuth(
  req: Request,
  supabase: SupabaseClient
): Promise<AuthResult> {
  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader) {
    throw {
      error: "No authorization header provided",
      status: 401,
    } as AuthError;
  }

  if (!authHeader.startsWith("Bearer ")) {
    throw {
      error: "Invalid authorization header format",
      status: 401,
    } as AuthError;
  }

  const token = authHeader.replace("Bearer ", "");
  
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  
  if (userError) {
    throw {
      error: `Authentication failed: ${userError.message}`,
      status: 401,
    } as AuthError;
  }

  if (!userData.user) {
    throw {
      error: "User not authenticated",
      status: 401,
    } as AuthError;
  }

  return {
    user: userData.user,
    userId: userData.user.id,
  };
}

/**
 * Optional authentication - returns user if present, null otherwise
 */
export async function optionalAuth(
  req: Request,
  supabase: SupabaseClient
): Promise<AuthResult | null> {
  try {
    return await requireAuth(req, supabase);
  } catch {
    return null;
  }
}

/**
 * Check if user has a specific role
 */
export async function requireRole(
  userId: string,
  role: string,
  supabase: SupabaseClient
): Promise<boolean> {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: role,
  });

  if (error) {
    console.error("Role check error:", error);
    return false;
  }

  return !!data;
}

/**
 * Require admin role
 */
export async function requireAdmin(
  userId: string,
  supabase: SupabaseClient
): Promise<void> {
  const isAdmin = await requireRole(userId, "admin", supabase);
  
  if (!isAdmin) {
    throw {
      error: "Admin access required",
      status: 403,
    } as AuthError;
  }
}

/**
 * Create an error response for auth failures
 */
export function authErrorResponse(
  error: AuthError,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({ error: error.error }),
    {
      status: error.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

/**
 * Wrap an async handler with auth error handling
 */
export function withAuth<T>(
  handler: (auth: AuthResult, req: Request) => Promise<T>,
  corsHeaders: Record<string, string>
): (req: Request, supabase: SupabaseClient) => Promise<Response | T> {
  return async (req: Request, supabase: SupabaseClient) => {
    try {
      const auth = await requireAuth(req, supabase);
      return await handler(auth, req);
    } catch (err) {
      if (typeof err === "object" && err !== null && "status" in err) {
        return authErrorResponse(err as AuthError, corsHeaders);
      }
      throw err;
    }
  };
}
