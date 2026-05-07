import { apiClient } from './api.js';

// ============================================================================
// INTERFACES
// ============================================================================

export interface Clan {
  _id: string;
  name: string;
  users: string[];
  number: number;
  description?: string;
  avatar?: string;
  leaderId?: string;
  leaderUsername?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateClanDto {
  name: string;
  userId?: string;
}

export interface UpdateClanDto {
  name?: string;
  description?: string;
  avatar?: string;
}

export interface Notification {
  _id: string;
  description: string;
  userId: string;
  clanId: string;
  status: 'pending' | 'read' | 'accepted' | 'rejected' | 'archived';
  type: 'clan_invitation' | 'clan_request' | 'clan_joined' | 'clan_left' | 
        'clan_kicked' | 'clan_promoted' | 'clan_demoted' | 'clan_updated' | 
        'message' | 'system';
  fromUserId?: string;
  fromUsername?: string;
  metadata?: Record<string, any>;
  readAt?: string;
  actionAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateNotificationDto {
  description: string;
  userId: string;
  clanId: string;
  status?: 'pending' | 'read' | 'accepted' | 'rejected' | 'archived';
  type?: string;
  fromUserId?: string;
  fromUsername?: string;
  metadata?: Record<string, any>;
}

export interface QueryNotificationDto {
  status?: string;
  type?: string;
  limit?: number;
  offset?: number;
}

// ============================================================================
// SERVICE
// ============================================================================

class ClanService {
  private basePath = '/clans';
  private notificationBasePath = '/clans/notifications';

  // ==========================================================================
  // CLAN METHODS
  // ==========================================================================

  /**
   * Créer un clan
   * POST /api/clans
   */
  async createClan(data: CreateClanDto): Promise<Clan> {
    const response = await apiClient.post(this.basePath, data);
    return response.data;
  }

  /**
   * Lister tous les clans
   * GET /api/clans
   */
  async getAllClans(): Promise<Clan[]> {
    const response = await apiClient.get(this.basePath);
    return response.data;
  }

  /**
   * Voir un clan par ID
   * GET /api/clans/:id
   */
  async getClanById(id: string): Promise<Clan> {
    const response = await apiClient.get(`${this.basePath}/${id}`);
    return response.data;
  }

  /**
   * Récupérer le clan d'un utilisateur
   * GET /api/clans/user/:userId
   */
  async getClanByUser(userId: string): Promise<Clan | null> {
    try {
      const response = await apiClient.get(`${this.basePath}/user/${userId}`);
      return response.data;
    } catch {
      return null;
    }
  }

  /**
   * Modifier un clan
   * PATCH /api/clans/:id
   */
  async updateClan(id: string, data: UpdateClanDto): Promise<Clan> {
    const response = await apiClient.patch(`${this.basePath}/${id}`, data);
    return response.data;
  }

  /**
   * Supprimer un clan
   * DELETE /api/clans/:id
   */
  async deleteClan(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`${this.basePath}/${id}`);
    return response.data;
  }

  /**
   * Rejoindre un clan
   * POST /api/clans/:id/join
   */
  async joinClan(clanId: string, userId: string): Promise<Clan> {
    const response = await apiClient.post(`${this.basePath}/${clanId}/join`, { userId });
    return response.data;
  }

  /**
   * Quitter un clan
   * POST /api/clans/:id/leave
   */
  async leaveClan(clanId: string, userId: string): Promise<Clan> {
    const response = await apiClient.post(`${this.basePath}/${clanId}/leave`, { userId });
    return response.data;
  }

  // ==========================================================================
  // NOTIFICATION METHODS
  // ==========================================================================

  /**
   * Créer une notification d'invitation
   * POST /api/clans/notifications/invite
   */
  async createNotification(userId: string, clanId: string): Promise<Notification> {
    const response = await apiClient.post(`${this.notificationBasePath}/invite`, { userId, clanId });
    return response.data;
  }

  /**
   * Sélectionner toutes les notifications d'un utilisateur
   * GET /api/clans/notifications/user/:userId
   */
  async selectAllNotifications(userId: string, query?: QueryNotificationDto): Promise<Notification[]> {
    const params = new URLSearchParams();
    if (query?.status) params.append('status', query.status);
    if (query?.type) params.append('type', query.type);
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.offset) params.append('offset', query.offset.toString());
    
    const url = `${this.notificationBasePath}/user/${userId}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  }

  /**
   * Accepter une invitation
   * POST /api/clans/notifications/:id/accept
   */
  async acceptInvitation(notificationId: string, userId: string, clanId: string): Promise<{ clan: Clan; notification: Notification }> {
    const response = await apiClient.post(`${this.notificationBasePath}/${notificationId}/accept`, { userId, clanId });
    return response.data;
  }

  /**
   * Refuser une invitation
   * POST /api/clans/notifications/:id/reject
   */
  async rejectInvitation(notificationId: string, userId: string): Promise<Notification> {
    const response = await apiClient.post(`${this.notificationBasePath}/${notificationId}/reject`, { userId });
    return response.data;
  }

  /**
   * Supprimer toutes les notifications d'un utilisateur
   * DELETE /api/clans/notifications/user/:userId
   */
  async deleteAllNotifications(userId: string): Promise<{ message: string; deletedCount: number }> {
    const response = await apiClient.delete(`${this.notificationBasePath}/user/${userId}`);
    return response.data;
  }

  /**
   * Supprimer une notification spécifique
   * DELETE /api/clans/notifications/:id
   */
  async deleteNotification(notificationId: string, userId?: string): Promise<{ message: string }> {
    const response = await apiClient.delete(
      `${this.notificationBasePath}/${notificationId}`,
      {
        params: userId ? { userId } : undefined,
        data: userId ? { userId } : undefined,
      }
    );
    return response.data;
  }

  /**
   * Marquer une notification comme lue
   * PATCH /api/clans/notifications/:id/read
   */
  async markNotificationAsRead(notificationId: string, userId: string): Promise<Notification> {
    const response = await apiClient.patch(`${this.notificationBasePath}/${notificationId}/read`, { userId });
    return response.data;
  }

  /**
   * Marquer toutes les notifications comme lues
   * PATCH /api/clans/notifications/user/:userId/read-all
   */
  async markAllNotificationsAsRead(userId: string): Promise<{ message: string; modifiedCount: number }> {
    const response = await apiClient.patch(`${this.notificationBasePath}/user/${userId}/read-all`);
    return response.data;
  }

  /**
   * Compter les notifications non lues
   * GET /api/clans/notifications/user/:userId/unread/count
   */
  async countUnreadNotifications(userId: string): Promise<number> {
    const response = await apiClient.get(`${this.notificationBasePath}/user/${userId}/unread/count`);
    const data = response.data;
    if (typeof data === 'number') return data;
    if (typeof data?.count === 'number') return data.count;
    if (typeof data?.unreadCount === 'number') return data.unreadCount;
    return 0;
  }

  /**
   * Récupérer les invitations en attente
   * GET /api/clans/notifications/user/:userId/pending
   */
  async getPendingInvitations(userId: string): Promise<Notification[]> {
    const response = await apiClient.get(`${this.notificationBasePath}/user/${userId}/pending`);
    return response.data;
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  /**
   * Vérifier si un utilisateur est dans un clan
   */
  isUserInClan(clan: Clan, userId: string): boolean {
    return clan.users.includes(userId);
  }

  /**
   * Nombre de membres d'un clan
   */
  getMemberCount(clan: Clan): number {
    return clan.number;
  }

  /**
   * Vérifier si un utilisateur est le leader du clan
   */
  isUserLeader(clan: Clan, userId: string): boolean {
    return clan.leaderId === userId;
  }

  /**
   * Obtenir les notifications par statut
   */
  getNotificationsByStatus(notifications: Notification[], status: string): Notification[] {
    return notifications.filter(notif => notif.status === status);
  }

  /**
   * Obtenir les notifications par type
   */
  getNotificationsByType(notifications: Notification[], type: string): Notification[] {
    return notifications.filter(notif => notif.type === type);
  }

  /**
   * Trier les notifications par date (plus récentes d'abord)
   */
  sortNotificationsByDate(notifications: Notification[]): Notification[] {
    return [...notifications].sort((a, b) => {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }
}

export const clanService = new ClanService();
export default clanService;