import 'client-only';
import { supabase } from './supabase';

export function listInquiries(userId?: string) {
  const query = supabase.from('inquiries').select('id,user_id,nickname,inquiry_code,status,created_at').order('created_at', { ascending: false });
  return userId ? query.eq('user_id', userId) : query;
}
export function listMessages(inquiryId: string, guestCode?: string) {
  return guestCode ? supabase.rpc('get_guest_inquiry_messages', { p_inquiry_code: guestCode })
    : supabase.from('inquiry_messages').select('id,inquiry_id,sender,message,created_at').eq('inquiry_id', inquiryId).order('created_at', { ascending: true });
}
export function sendMessage(inquiryId: string, message: string, sender: 'user' | 'admin', guestCode?: string) {
  return guestCode ? supabase.rpc('send_guest_inquiry_message', { p_inquiry_code: guestCode, p_message: message })
    : supabase.from('inquiry_messages').insert({ inquiry_id: inquiryId, sender, message }).select('id,inquiry_id,sender,message,created_at').single();
}
export function deleteInquiry(id: string) {
  return supabase.from('inquiries').delete().eq('id', id);
}
