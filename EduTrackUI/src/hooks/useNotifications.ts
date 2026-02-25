import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { subscribeFCMMessages } from '@/lib/firebase';
import { API_ENDPOINTS, apiGet, apiPost } from '@/lib/api';

export interface Notification {
  id: number;
  user_id: number;
  role: string;
  type: string;
  title: string;
  body: string;
  icon: string | null;
  action_url: string | null;
  entity_type: string | null;
  entity_id: number | null;
  data: any; // JSON data
  audit_log_id: number | null;
  is_read: boolean;
  read_at: string | null;
  is_archived: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  total: number;
  unread_count: number;
  limit: number;
  offset: number;
}

export interface UnreadCountResponse {
  success: boolean;
  count: number;
}

/**
 * Hook to fetch notifications with pagination
 */
export function useNotifications(options?: {
  limit?: number;
  offset?: number;
  type?: string;
  unread_only?: boolean;
  enabled?: boolean;
}) {
  const { limit = 20, offset = 0, type, unread_only = false, enabled = true } = options || {};

  return useQuery<NotificationsResponse>({
    queryKey: ['notifications', limit, offset, type, unread_only],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('limit', String(limit));
      params.append('offset', String(offset));
      if (type) params.append('type', type);
      if (unread_only) params.append('unread_only', 'true');

      const response = await apiGet(`${API_ENDPOINTS.NOTIFICATIONS}?${params.toString()}`);
      return response;
    },
    // No aggressive polling — FCM foreground listener handles instant updates.
    // 5-minute fallback catches any missed pushes (e.g. background tab, FCM delivery failure).
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    enabled
  });
}

/**
 * Hook to fetch unread notification count
 */
export function useUnreadCount(options?: { enabled?: boolean; refetchInterval?: number }) {
  const { enabled = true, refetchInterval = 5 * 60 * 1000 } = options || {};

  return useQuery<UnreadCountResponse>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const response = await apiGet(API_ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT);
      return response;
    },
    refetchInterval, // 5-minute fallback; FCM listener handles real-time updates
    refetchOnWindowFocus: true,
    enabled
  });
}

/**
 * Hook to mark a notification as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await apiPost(API_ENDPOINTS.NOTIFICATION_MARK_AS_READ(notificationId), {});
      return response;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiPost(API_ENDPOINTS.NOTIFICATIONS_MARK_ALL_READ, {});
      return response;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
}

/**
 * Hook to fetch audit logs (admin only)
 */
export function useAuditLogs(options?: {
  limit?: number;
  offset?: number;
  action?: string;
  entity_type?: string;
  actor_user_id?: number;
  enabled?: boolean;
}) {
  const { limit = 50, offset = 0, action, entity_type, actor_user_id, enabled = true } = options || {};

  return useQuery({
    queryKey: ['audit-logs', limit, offset, action, entity_type, actor_user_id],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('limit', String(limit));
      params.append('offset', String(offset));
      if (action) params.append('action', action);
      if (entity_type) params.append('entity_type', entity_type);
      if (actor_user_id) params.append('actor_user_id', String(actor_user_id));

      const response = await apiGet(`${API_ENDPOINTS.AUDIT_LOGS}?${params.toString()}`);
      return response;
    },
    enabled
  });
}

/**
 * Hook to fetch notification statistics (admin only)
 */
export function useNotificationStats(enabled = true) {
  return useQuery({
    queryKey: ['notifications', 'stats'],
    queryFn: async () => {
      const response = await apiGet(API_ENDPOINTS.NOTIFICATIONS_STATS);
      return response;
    },
    refetchInterval: 5 * 60 * 1000, // 5-minute fallback
    enabled
  });
}
/**
 * Hook to fetch announcements (includes per-user is_read flag)
 */
export function useAnnouncements(options?: { enabled?: boolean }) {
  const { enabled = true } = options || {};

  return useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const response = await apiGet(API_ENDPOINTS.ANNOUNCEMENTS);
      return response;
    },
    refetchInterval: 5 * 60 * 1000, // 5-minute fallback; push handles real-time
    refetchOnWindowFocus: true,
    enabled
  });
}

/**
 * Hook that listens for foreground FCM push notifications and
 * immediately invalidates the notifications + announcements cache.
 * Mount this ONCE high in the tree (e.g. DashboardLayout).
 */
export function useFCMNotificationListener() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = subscribeFCMMessages((_payload) => {
        // A push arrived while the app is in the foreground — refresh all
        // notification-related queries instantly without waiting for the
        // polling fallback interval.
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['announcements'] });
      });
    } catch {
      // Firebase not available (e.g. permission denied, unsupported browser)
    }

    return () => {
      unsubscribe?.();
    };
  }, [queryClient]);
}

/**
 * Hook to mark an announcement as read for the current user
 */
export function useMarkAnnouncementRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (announcementId: number) => {
      const response = await apiPost(API_ENDPOINTS.ANNOUNCEMENT_MARK_AS_READ(announcementId), {});
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    }
  });
}