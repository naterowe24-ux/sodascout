import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

export type { User };

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export function displayName(user: User): string {
  return (
    user.user_metadata?.full_name as string | undefined ??
    user.user_metadata?.name as string | undefined ??
    user.email ??
    'Member'
  );
}

export function avatarInitial(user: User): string {
  const name = displayName(user);
  return name.charAt(0).toUpperCase();
}
