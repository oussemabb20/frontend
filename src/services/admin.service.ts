import api from './api.js';

export interface UserAnalytics {
    totalUsers: number;
    activeUsers: number;
}

export interface AdminUser {
    _id?: string;
    id?: string;
    username: string;
    email: string;
    role: "user" | "admin";
    isBanned: boolean;
    provider?: "local" | "google" | "github";
    createdAt?: string;
}

export const adminService = {
    getAnalytics: async (): Promise<UserAnalytics> => {
        const response = await api.get('/users/admin/analytics');
        return response.data;
    },

    getAllUsers: async (): Promise<AdminUser[]> => {
        const response = await api.get('/users');
        return response.data;
    },
 searchByUsername: async (username: string): Promise<AdminUser | null> => {
  try {
    // Utiliser search2 au lieu de username
    const response = await api.get(`/users/search2/${encodeURIComponent(username)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching user by username:', error);
    return null;
  }
},

    updateRole: async (userId: string, role: string) => {
        const response = await api.patch(`/users/${userId}/role`, { role });
        return response.data;
    },

    updateStatus: async (userId: string, isBanned: boolean) => {
        const response = await api.patch(`/users/${userId}/status`, { isBanned });
        return response.data;
    },

    resetPassword: async (userId: string, newPassword?: string) => {
        const response = await api.post(`/users/${userId}/reset-password-admin`, { newPassword });
        return response.data;
    },

    deleteUser: async (userId: string) => {
        const response = await api.delete(`/users/${userId}`);
        return response.data;
    }
    
};
