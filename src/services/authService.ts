import { supabase } from '@/lib/supabase';

type AuthResult = { userId: string } | { error: string };

export async function signUpWithEmail(email: string, password: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };

  console.log('[AUTH] signup response email_confirmed_at:', data.user?.email_confirmed_at);
  console.log('[AUTH] signup session:', data.session ? 'exists' : 'null');

  if (!data.session) {
    const signInResult = await supabase.auth.signInWithPassword({ email, password });
    if (signInResult.error) {
      return { error: signInResult.error.message };
    }
  }

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

export async function sendPasswordResetEmail(email: string, redirectTo?: string): Promise<{ error?: string }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, redirectTo ? { redirectTo } : undefined);
  if (error) return { error: error.message };
  return {};
}

function getUrlParam(url: string, key: string) {
  const query = url.split('?')[1]?.split('#')[0] ?? '';
  const hash = url.split('#')[1] ?? '';
  const queryParams = new URLSearchParams(query);
  const hashParams = new URLSearchParams(hash);

  return queryParams.get(key) ?? hashParams.get(key);
}

export async function preparePasswordResetSession(url: string): Promise<{ ready: boolean; error?: string }> {
  const code = getUrlParam(url, 'code');
  const accessToken = getUrlParam(url, 'access_token');
  const refreshToken = getUrlParam(url, 'refresh_token');

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return { ready: false, error: error.message };
    return { ready: true };
  }

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) return { ready: false, error: error.message };
    return { ready: true };
  }

  const { data } = await supabase.auth.getSession();
  return { ready: !!data.session };
}

export async function updatePassword(password: string): Promise<{ error?: string }> {
  const { error } = await supabase.auth.updateUser({ password });
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
