import { supabase } from '@/lib/supabase';

export async function deleteMyAccount() {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error('You must be logged in to delete your account.');
  }

  const { data, error } = await supabase.functions.invoke('delete-account', {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (error) {
    throw new Error(error.message || 'Failed to delete account.');
  }

  // Important: clear local cached session after deleting auth user
  await supabase.auth.signOut();

  return data;
}