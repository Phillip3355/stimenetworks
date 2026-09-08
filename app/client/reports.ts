import 'client-only';
import { supabase } from './supabase';

export function listReports() {
  return supabase.from('reports').select('id,slug,created_at').order('created_at', { ascending: false });
}
export function publishReport(slug: string, content: string) {
  return supabase.from('reports').insert({ slug, content });
}
export function deleteReport(id: string) {
  return supabase.from('reports').delete().eq('id', id);
}
