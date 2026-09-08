import 'server-only';
import { createPublicSupabaseClient } from './supabase';

export function getPublishedReports() {
  return createPublicSupabaseClient().from('reports').select('id,slug,content,created_at').order('created_at', { ascending: false });
}
export function getPublishedReport(slug: string) {
  return createPublicSupabaseClient().from('reports').select('id,slug,content,created_at').eq('slug', slug).single();
}
