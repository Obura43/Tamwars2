import { supabase } from '@/lib/supabase';

type AuthResult = { userId: string } | { error: string };

export async function signUpWithEmail(email: string, password: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };

  console.log('[AUTH] signup response email_confirmed_at:', data.user?.email_confirmed_at);
  console.log('[AUTH] signup session:', data.session ? 'exists' : 'null');

  return { userId: data.user?.id ?? '' };
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.log('[AUTH] login error:', error.message);
    if (error.message.toLowerCase().includes('email not confirmed')) {
      return { error: 'Please verify your email before logging in.' };
    }
    return { error: error.message };
  }

  console.log('[AUTH] login response email_confirmed_at:', data.user?.email_confirmed_at);

  // Enforce verification on the frontend even if Supabase lets the login through
  if (!data.user?.email_confirmed_at) {
    console.log('[AUTH] user not verified after login, signing out');
    await supabase.auth.signOut();
    return { error: 'Please verify your email before logging in.' };
  }

  return { userId: data.user?.id ?? '' };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) return { error: error.message };
  return {};
}

export async function resendVerificationEmail(email: string): Promise<{ error?: string }> {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  });
  if (error) return { error: error.message };
  return {};
}

export async function refreshAndCheckVerification(): Promise<{ verified: boolean; userId?: string; error?: string }> {
  const { error: refreshError } = await supabase.auth.refreshSession();
  if (refreshError) {
    console.log('[AUTH] refreshSession error:', refreshError.message);
  }

  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.log('[AUTH] getUser error:', error.message);
    return { verified: false, error: error.message };
  }

  console.log('[AUTH] refreshAndCheck email_confirmed_at:', data.user?.email_confirmed_at);

  if (data.user?.email_confirmed_at) {
    return { verified: true, userId: data.user.id };
  }
  return { verified: false };
}
