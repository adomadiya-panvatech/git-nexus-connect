
import { api } from './api';

export interface CommunityGroup {
  joinedUsersCount: number;
  id: number;
  name: string;
  description: string;
  member_count?: number;
  image_url?: string;
}

export interface Community {
  id: number;
  name: string;
  description: string;
}

export const communityService = {
  // Get all community groups
  getCommunityGroups: () => api.get<CommunityGroup[]>('/community-groups'),
  
  // Get specific community group
  getCommunityGroup: (id: number) => api.get<CommunityGroup>(`/community-groups/${id}`),
  
  // Get communities
  getCommunities: () => api.get<Community[]>('/community'),
  
  // Get user relationships (for checking if user joined)
  getUserRelationships: () => api.get<any[]>('/user-relationships'),
  
  // Join a community group
  joinCommunity: async (groupId: number, userId: number) => {
    return api.post(`/community-groups/${groupId}/join`, { userId });
  },

  // Get communities joined by a user
  getJoinedCommunities: (userId: number) => api.get<CommunityGroup[]>(`/community-groups/joined?userId=${userId}`),
};
