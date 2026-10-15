import { supabase } from './supabase';
import type { Database } from '@/types/supabase';

/**
 * Data-access layer — every function maps to a real table or RPC of the Uzzap
 * Supabase schema (verified against `public` functions/migrations). Screens must
 * only talk to the DB through here.
 */

const PAGE = 50;

// ---- Row shapes (source of truth: public schema) -------------------------

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_path: string | null;
  bio: string | null;
  status_text: string | null;
  province: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  last_seen_at?: string | null;
}

export type RoomKind = 'public' | 'private' | 'group';
export type MessageKind = 'text' | 'system' | 'media' | 'reply' | 'sticker';
export type ContentKind = 'post' | 'wiki' | 'poll';
export type ReportStatus = 'open' | 'reviewing' | 'resolved' | 'dismissed';
export type ModerationActionKind =
  | 'warn' | 'mute' | 'kick' | 'ban' | 'unban'
  | 'delete_message' | 'lock_room' | 'unlock_room' | 'strike';

export interface Room {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  kind: RoomKind;
  province_code: string | null;
  created_by: string | null;
  is_active: boolean;
  is_locked: boolean;
  announcement: string | null;
  view_only: boolean;
  members_can_invite: boolean;
  created_at: string;
  updated_at: string;
}

export interface PublicRoomSummary {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  province_code: string | null;
  created_by: string | null;
  member_count: number;
  online_count: number;
  created_at: string;
}

export interface ConversationSummary {
  id: string;
  participant_id: string;
  participant_username: string | null;
  participant_display_name: string | null;
  participant_bio: string | null;
  participant_status_text: string | null;
  participant_is_active: boolean;
  participant_last_seen_at: string | null;
  last_message: string | null;
  last_message_kind: MessageKind | null;
  last_message_at: string | null;
  unread_count: number;
  is_pinned: boolean;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  kind: MessageKind;
  body: string | null;
  reply_to_id: string | null;
  metadata: Record<string, any> | null;
  edited_at: string | null;
  deleted_at: string | null;
  created_at: string;
  /** Room messages are enriched with sender_name / mine / reactions server-side. */
  sender_name?: string | null;
  mine?: boolean;
  reaction_counts?: Record<string, number>;
  my_reactions?: string[];
}

export interface PollOptionResult {
  id: string;
  label: string;
  position: number;
  vote_count: number;
  is_selected: boolean;
}

export interface FeedContent {
  id: string;
  author_id: string;
  room_id: string | null;
  kind: ContentKind;
  title: string | null;
  body: string | null;
  metadata: Record<string, any> | null;
  is_published: boolean;
  is_featured: boolean;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
  author: Profile | null;
  likes_count: number;
  is_liked: boolean;
  comments_count: number;
  is_saved: boolean;
  poll_options: PollOptionResult[];
}

export interface PollResultOption {
  id: string;
  label: string;
  position: number;
  votes: number;
  percent: number;
  mine: boolean;
}

export interface ContentCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  kind: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentComment {
  id: string;
  content_id: string;
  author_id: string;
  parent_id: string | null;
  body: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface FeaturedProfile {
  profile: Profile;
  featured_until: string | null;
  featured_at: string;
  position: number;
}

export interface AppNotification {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: string;
  payload: Record<string, any> | null;
  read_at: string | null;
  created_at: string;
}

export interface ModerationAction {
  id: string;
  room_id: string;
  moderator_id: string;
  target_user_id: string | null;
  target_message_id: string | null;
  action: ModerationActionKind;
  reason: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface Report {
  id: string;
  room_id: string | null;
  reporter_id: string;
  reported_user_id: string | null;
  message_id: string | null;
  reason: string;
  status: ReportStatus;
  resolution: string | null;
  resolved_by: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface RoomInvite {
  id: string;
  room_id: string;
  inviter_id: string;
  invitee_id: string;
  created_at: string;
  accepted_at: string | null;
  declined_at: string | null;
}

export interface ConversationInvite {
  id: string;
  conversation_id: string;
  inviter_id: string;
  invitee_id: string;
  created_at: string;
  accepted_at: string | null;
  declined_at: string | null;
}

export interface Relationship {
  user_id: string;
  target_user_id: string;
  kind: 'follow' | 'block';
  created_at: string;
}

export interface UserCheckIn {
  user_id: string;
  checkin_date: string;
  streak: number;
  points: number;
  created_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  points: number;
  max_streak: number;
  username: string | null;
  display_name: string | null;
  avatar_path: string | null;
}

// ---- Helpers --------------------------------------------------------------

export function displayName(p?: Pick<Profile, 'display_name' | 'username'> | null) {
  if (!p) return 'Someone';
  return p.display_name?.trim() || p.username?.trim() || 'Someone';
}

export function avatarUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
}

const asArray = <T>(data: unknown): T[] => (Array.isArray(data) ? (data as T[]) : []);

// ---- Profile --------------------------------------------------------------

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return (data as Profile) ?? null;
}

export async function getMyProfile(userId: string) {
  return getProfile(userId);
}

export async function updateMyProfile(
  userId: string,
  patch: Partial<Pick<Profile, 'username' | 'display_name' | 'bio' | 'status_text' | 'province' | 'avatar_path'>>
): Promise<void> {
  const payload: Database['public']['Tables']['profiles']['Update'] = {
    updated_at: new Date().toISOString(),
    username: patch.username ?? undefined,
    display_name: patch.display_name ?? undefined,
    bio: patch.bio ?? undefined,
    status_text: patch.status_text ?? undefined,
    province: patch.province ?? undefined,
    avatar_path: patch.avatar_path ?? undefined,
  };
  const { error } = await supabase.from('profiles').update(payload).eq('id', userId);
  if (error) throw error;
}

export async function searchProfiles(query: string): Promise<Profile[]> {
  const { data, error } = await supabase.rpc('search_profiles', {
    p_query: query.trim(),
    p_limit: 20,
  });
  if (error) throw error;
  return asArray<Profile>(data);
}

// ---- Rooms ----------------------------------------------------------------

export async function listRooms(): Promise<Room[]> {
  const { data, error } = await supabase.rpc('list_public_rooms', {
    p_limit: PAGE,
    p_offset: 0,
  });
  if (error) throw error;
  return asArray<Room>(data);
}

export async function getRoom(roomId: string): Promise<Room | null> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', roomId)
    .maybeSingle();
  if (error) throw error;
  return (data as Room) ?? null;
}

function slugify(name: string) {
  const base = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
  return `${base || 'room'}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function createRoom(input: {
  name: string;
  description?: string;
  kind?: RoomKind;
  provinceCode?: string | null;
}): Promise<Room> {
  const { data, error } = await supabase.rpc('create_room', {
    p_slug: slugify(input.name),
    p_name: input.name.trim(),
    p_description: input.description?.trim() || undefined,
    p_kind: input.kind ?? 'public',
    p_province_code: input.provinceCode ?? undefined,
  });
  if (error) throw error;
  return data as Room;
}

// ---- Room messages --------------------------------------------------------

export async function listRoomMessages(roomId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase.rpc('list_room_messages', {
    p_room_id: roomId,
    p_before_created_at: undefined,
    p_before_id: undefined,
    p_limit: 100,
  });
  if (error) throw error;
  const items = asArray<ChatMessage>((data as any)?.items);
  return items.slice().reverse();
}

export async function sendRoomMessage(roomId: string, body: string): Promise<void> {
  const { error } = await supabase.rpc('send_room_message', {
    p_room_id: roomId,
    p_body: body,
    p_kind: 'text',
    p_reply_to_id: undefined,
    p_metadata: {},
  });
  if (error) throw error;
}

export async function toggleRoomMessageReaction(messageId: string, reaction: string) {
  const { error } = await supabase.rpc('toggle_room_message_reaction', {
    p_message_id: messageId,
    p_reaction: reaction,
  });
  if (error) throw error;
}

// ---- Conversations --------------------------------------------------------

export async function listConversations(): Promise<ConversationSummary[]> {
  const { data, error } = await supabase.rpc('list_conversations');
  if (error) throw error;
  return asArray<ConversationSummary>(data).map((c) => ({
    ...c,
    unread_count: Number(c.unread_count ?? 0),
  }));
}

export async function listConversationMessages(conversationId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase.rpc('list_conversation_messages', {
    p_conversation_id: conversationId,
    p_before_created_at: undefined,
    p_before_id: undefined,
    p_limit: 100,
  });
  if (error) throw error;
  const items = asArray<ChatMessage>((data as any)?.items);
  return items.slice().reverse();
}

export async function sendConversationMessage(conversationId: string, body: string): Promise<void> {
  const { error } = await supabase.rpc('send_conversation_message', {
    p_conversation_id: conversationId,
    p_body: body,
    p_kind: 'text',
    p_reply_to_id: undefined,
    p_metadata: {},
  });
  if (error) throw error;
}

export async function createConversation(memberIds: string[], title?: string): Promise<string> {
  const { data, error } = await supabase.rpc('create_conversation', {
    p_kind: memberIds.length > 1 ? 'group' : 'private',
    p_title: title ?? undefined,
    p_member_ids: memberIds,
  });
  if (error) throw error;
  return (data as any)?.id ?? (data as unknown as string);
}

// ---- Content feed ---------------------------------------------------------

export async function listContentFeed(): Promise<FeedContent[]> {
  const { data, error } = await supabase.rpc('list_content_feed_v2', {
    p_room_id: undefined,
    p_author_id: undefined,
    p_before_created_at: undefined,
    p_before_id: undefined,
    p_limit: 30,
  });
  if (error) throw error;
  return asArray<FeedContent>((data as any)?.items);
}

export async function createContent(input: {
  kind: ContentKind;
  title?: string | null;
  body?: string | null;
  roomId?: string | null;
  metadata?: Record<string, any>;
}): Promise<FeedContent> {
  const { data, error } = await supabase.rpc('create_content', {
    // The generator marks these params as required, but the SQL handles NULL.
    p_room_id: (input.roomId ?? null) as unknown as string,
    p_kind: input.kind,
    p_title: (input.title ?? null) as unknown as string,
    p_body: (input.body ?? null) as unknown as string,
    p_metadata: input.metadata ?? {},
  });
  if (error) throw error;
  return data as FeedContent;
}

export async function toggleContentReaction(contentId: string, reaction = 'like'): Promise<void> {
  const { error } = await supabase.rpc('toggle_content_reaction', {
    p_content_id: contentId,
    p_reaction: reaction,
  });
  if (error) throw error;
}

export async function toggleContentSave(contentId: string): Promise<void> {
  const { error } = await supabase.rpc('toggle_content_save', { p_content_id: contentId });
  if (error) throw error;
}

export async function voteContentPoll(contentId: string, optionId: string): Promise<void> {
  const { error } = await supabase.rpc('vote_content_poll', {
    p_content_id: contentId,
    p_option_id: optionId,
  });
  if (error) throw error;
}

export async function getContentPollResults(contentId: string) {
  const { data, error } = await supabase.rpc('get_content_poll_results', {
    p_content_id: contentId,
  });
  if (error) throw error;
  return data as unknown as { total_votes: number; items: PollResultOption[] };
}

// ---- Content categories & comments ---------------------------------------

export async function listContentCategories(kind?: string): Promise<ContentCategory[]> {
  const { data, error } = await supabase.rpc('list_content_categories', {
    p_kind: kind ?? undefined,
  });
  if (error) throw error;
  return asArray<ContentCategory>(data);
}

export async function listCategoryContent(categoryId: string): Promise<FeedContent[]> {
  const { data, error } = await supabase.rpc('list_category_content', {
    p_category_id: categoryId,
    p_limit: PAGE,
    p_before_created_at: undefined,
    p_before_id: undefined,
  });
  if (error) throw error;
  return asArray<FeedContent>((data as any)?.items);
}

export async function listContentComments(contentId: string): Promise<ContentComment[]> {
  const { data, error } = await supabase.rpc('list_content_comments', {
    p_content_id: contentId,
    p_before_created_at: undefined,
    p_before_id: undefined,
    p_limit: PAGE,
  });
  if (error) throw error;
  return asArray<ContentComment>((data as any)?.items);
}

export async function addContentComment(
  contentId: string,
  body: string,
  parentId?: string | null
): Promise<void> {
  const { error } = await supabase.rpc('add_content_comment', {
    p_content_id: contentId,
    p_body: body,
    p_parent_id: parentId ?? undefined,
  });
  if (error) throw error;
}

// ---- Discovery: featured / favorites / relationships ----------------------

export async function listFeaturedProfiles(): Promise<FeaturedProfile[]> {
  const { data, error } = await supabase.rpc('list_featured_profiles', {
    p_limit: PAGE,
    p_offset: 0,
  });
  if (error) throw error;
  return asArray<FeaturedProfile>(data);
}

export async function listFavoriteUsers() {
  const { data, error } = await supabase.rpc('list_favorite_users', {
    p_limit: PAGE,
    p_offset: 0,
  });
  if (error) throw error;
  return asArray<{
    user_id: string;
    username: string | null;
    display_name: string | null;
    avatar_path: string | null;
    last_seen_at: string | null;
    is_online: boolean;
  }>(data);
}

export async function toggleFavorite(targetUserId: string): Promise<void> {
  const { error } = await supabase.rpc('toggle_favorite', { p_target_user_id: targetUserId });
  if (error) throw error;
}

export async function toggleFollow(targetUserId: string): Promise<void> {
  const { error } = await supabase.rpc('toggle_follow', { p_target_user_id: targetUserId });
  if (error) throw error;
}

export async function toggleBlock(targetUserId: string): Promise<void> {
  const { error } = await supabase.rpc('toggle_block', { p_target_user_id: targetUserId });
  if (error) throw error;
}

// ---- Check-ins & leaderboard ---------------------------------------------

export async function checkIn(): Promise<void> {
  const { error } = await supabase.rpc('check_in');
  if (error) throw error;
}

export async function listMyCheckIns(userId: string): Promise<UserCheckIn[]> {
  const { data, error } = await supabase
    .from('user_check_ins')
    .select('*')
    .eq('user_id', userId)
    .order('checkin_date', { ascending: false })
    .limit(PAGE);
  if (error) throw error;
  return asArray<UserCheckIn>(data);
}

export async function getLeaderboard(period = 'all'): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase.rpc('get_engagement_leaderboard', {
    p_period: period,
    p_limit: PAGE,
    p_offset: 0,
  });
  if (error) throw error;
  return asArray<LeaderboardEntry>((data as any)?.items);
}

// ---- Profile visits -------------------------------------------------------

export async function listProfileVisitors() {
  const { data, error } = await supabase.rpc('list_profile_visitors', { p_limit: PAGE });
  if (error) throw error;
  const visits = asArray<{ id: string; visitor_id: string; profile_id: string; visited_at: string }>(data);
  if (visits.length === 0) return [];
  const ids = Array.from(new Set(visits.map((v) => v.visitor_id)));
  const { data: people } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_path, status_text')
    .in('id', ids);
  const map = new Map((people ?? []).map((p: any) => [p.id, p as Profile]));
  return visits.map((v) => ({ ...v, visitor: map.get(v.visitor_id) ?? null }));
}

export async function recordProfileVisit(profileId: string): Promise<void> {
  const { error } = await supabase.rpc('record_profile_visit', { p_profile_id: profileId });
  if (error) throw error;
}

// ---- Notifications --------------------------------------------------------

export async function listNotifications(): Promise<AppNotification[]> {
  const { data, error } = await supabase.rpc('list_notifications', {
    p_before_created_at: undefined,
    p_before_id: undefined,
    p_limit: PAGE,
  });
  if (error) throw error;
  return asArray<AppNotification>((data as any)?.items);
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase.rpc('mark_notification_read', { p_notification_id: id });
  if (error) throw error;
}

export async function markAllNotificationsRead(): Promise<void> {
  const { error } = await supabase.rpc('mark_all_notifications_read');
  if (error) throw error;
}

export interface NotificationPreferences {
  follow_enabled: boolean;
  block_enabled: boolean;
  content_comment_enabled: boolean;
  comment_reply_enabled: boolean;
  content_reaction_enabled: boolean;
  room_message_reaction_enabled: boolean;
  profile_comment_enabled: boolean;
  mention_enabled: boolean;
  room_invite_enabled: boolean;
  conversation_invite_enabled: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  follow_enabled: true,
  block_enabled: true,
  content_comment_enabled: true,
  comment_reply_enabled: true,
  content_reaction_enabled: true,
  room_message_reaction_enabled: true,
  profile_comment_enabled: true,
  mention_enabled: true,
  room_invite_enabled: true,
  conversation_invite_enabled: true,
};

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const { data, error } = await supabase.rpc('get_notification_preferences');
  if (error) throw error;
  const row = (Array.isArray(data) ? data[0] : data) as any;
  return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...(row ?? {}) };
}

export async function setNotificationPreferences(p: NotificationPreferences): Promise<void> {
  const { error } = await supabase.rpc('set_notification_preferences', {
    p_follow_enabled: p.follow_enabled,
    p_block_enabled: p.block_enabled,
    p_content_comment_enabled: p.content_comment_enabled,
    p_comment_reply_enabled: p.comment_reply_enabled,
    p_content_reaction_enabled: p.content_reaction_enabled,
    p_room_message_reaction_enabled: p.room_message_reaction_enabled,
    p_profile_comment_enabled: p.profile_comment_enabled,
    p_mention_enabled: p.mention_enabled,
    p_room_invite_enabled: p.room_invite_enabled,
    p_conversation_invite_enabled: p.conversation_invite_enabled,
  });
  if (error) throw error;
}

// ---- Invites --------------------------------------------------------------

export async function listRoomInvites(): Promise<
  (RoomInvite & { inviter_name: string | null; room_name: string | null })[]
> {
  const { data, error } = await supabase
    .from('room_invites')
    .select('*')
    .is('accepted_at', null)
    .is('declined_at', null)
    .order('created_at', { ascending: false })
    .limit(PAGE);
  if (error) throw error;
  const invites = asArray<RoomInvite>(data);
  if (invites.length === 0) return [];

  const roomIds = Array.from(new Set(invites.map((i) => i.room_id)));
  const inviterIds = Array.from(new Set(invites.map((i) => i.inviter_id)));
  const [{ data: rooms }, { data: people }] = await Promise.all([
    supabase.from('rooms').select('id, name').in('id', roomIds),
    supabase.from('profiles').select('id, display_name, username').in('id', inviterIds),
  ]);
  const roomMap = new Map((rooms ?? []).map((r: any) => [r.id, r.name]));
  const peopleMap = new Map(
    (people ?? []).map((p: any) => [p.id, displayName({ display_name: p.display_name, username: p.username })])
  );
  return invites.map((i) => ({
    ...i,
    room_name: roomMap.get(i.room_id) ?? null,
    inviter_name: peopleMap.get(i.inviter_id) ?? null,
  }));
}

export async function createRoomInvite(roomId: string, inviteeId: string): Promise<void> {
  const { error } = await supabase.rpc('create_room_invite', {
    p_room_id: roomId,
    p_invitee_id: inviteeId,
  });
  if (error) throw error;
}

export async function respondRoomInvite(inviteId: string, accept: boolean): Promise<void> {
  const { error } = await supabase.rpc('respond_room_invite', {
    p_invite_id: inviteId,
    p_accept: accept,
  });
  if (error) throw error;
}

export async function listConversationInvites(): Promise<
  (ConversationInvite & { inviter_name: string | null })[]
> {
  const { data, error } = await supabase
    .from('conversation_invites')
    .select('*')
    .is('accepted_at', null)
    .is('declined_at', null)
    .order('created_at', { ascending: false })
    .limit(PAGE);
  if (error) throw error;
  const invites = asArray<ConversationInvite>(data);
  if (invites.length === 0) return [];
  const inviterIds = Array.from(new Set(invites.map((i) => i.inviter_id)));
  const { data: people } = await supabase
    .from('profiles')
    .select('id, display_name, username')
    .in('id', inviterIds);
  const peopleMap = new Map(
    (people ?? []).map((p: any) => [p.id, displayName({ display_name: p.display_name, username: p.username })])
  );
  return invites.map((i) => ({ ...i, inviter_name: peopleMap.get(i.inviter_id) ?? null }));
}

export async function createConversationInvite(conversationId: string, inviteeId: string) {
  const { error } = await supabase.rpc('create_conversation_invite', {
    p_conversation_id: conversationId,
    p_invitee_id: inviteeId,
  });
  if (error) throw error;
}

export async function respondConversationInvite(inviteId: string, accept: boolean) {
  const { error } = await supabase.rpc('respond_conversation_invite', {
    p_invite_id: inviteId,
    p_accept: accept,
  });
  if (error) throw error;
}

// ---- Moderation & reports -------------------------------------------------

export async function listModerationHistory(roomId: string): Promise<ModerationAction[]> {
  const { data, error } = await supabase.rpc('list_moderation_history', {
    p_room_id: roomId,
    p_before_created_at: undefined,
    p_before_id: undefined,
    p_limit: PAGE,
  });
  if (error) throw error;
  return asArray<ModerationAction>((data as any)?.items);
}

export async function moderateRoomMember(input: {
  roomId: string;
  targetUserId: string;
  action: ModerationActionKind;
  durationMinutes?: number | null;
  reason?: string | null;
}): Promise<void> {
  const { error } = await supabase.rpc('moderate_room_member', {
    p_room_id: input.roomId,
    p_target_user_id: input.targetUserId,
    p_action: input.action,
    p_duration_minutes: input.durationMinutes ?? undefined,
    p_reason: input.reason ?? undefined,
  });
  if (error) throw error;
}

export async function moderateRoomMessage(input: {
  messageId: string;
  action: ModerationActionKind;
  reason?: string | null;
}): Promise<void> {
  const { error } = await supabase.rpc('moderate_room_message', {
    p_message_id: input.messageId,
    p_action: input.action,
    p_reason: input.reason ?? undefined,
  });
  if (error) throw error;
}

export async function listRoomReports(roomId: string, status?: ReportStatus): Promise<Report[]> {
  const { data, error } = await supabase.rpc('list_room_reports', {
    p_room_id: roomId,
    p_status: status ?? undefined,
    p_limit: PAGE,
    p_offset: 0,
  });
  if (error) throw error;
  return asArray<Report>(data);
}

export async function listMyReports(userId: string): Promise<Report[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('reporter_id', userId)
    .order('created_at', { ascending: false })
    .limit(PAGE);
  if (error) throw error;
  return asArray<Report>(data);
}

export async function createReport(input: {
  reporterId: string;
  reason: string;
  roomId?: string | null;
  reportedUserId?: string | null;
  messageId?: string | null;
}): Promise<void> {
  const { error } = await supabase.from('reports').insert({
    reporter_id: input.reporterId,
    reason: input.reason,
    room_id: input.roomId ?? undefined,
    reported_user_id: input.reportedUserId ?? undefined,
    message_id: input.messageId ?? undefined,
  });
  if (error) throw error;
}
