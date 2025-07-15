
import { api } from './api';

export interface Post {
  id: number;
  feed_id?: number;
  content: string;
  author_id: number;
  author_name?: string;
  createdAt?: string;
  updatedAt?: string;
  likes_count?: number;
  comments_count?: number;
  image_url?: string;
  state?: string;
  private?: boolean;
  targets?: string[];
  community_group_id?: number;
  author?: any;
}

export interface Comment {
  id: number;
  content: string;
  user_id: number;
  author_name?: string;
  parent_id?: number;
  commentable_type?: string;
  commentable_id?: number;
  likes_count?: number;
  isLiked?: boolean;
  createdAt?: string;
  updatedAt?: string;
  author?: any;
}

export interface UserRelationship {
  id: number;
  owned_by_id: number;
  user_id: number;
  relationship_type: string;
  target_type: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserReaction {
  id: number;
  owned_by_id: number;
  reaction_type: string;
  comment_id?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  nextPage?: number;
}

export const postService = {
  // Feed Items
  getFeedItems: async (params?: { page?: number; limit?: number; state?: string; private?: boolean; communityGroupId?: number; authorId?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.state) query.append('state', params.state);
    if (params?.private !== undefined) query.append('private', String(params.private));
    if (params?.communityGroupId) query.append('communityGroupId', String(params.communityGroupId));
    if (params?.authorId) query.append('authorId', String(params.authorId));
    const url = `/feed-items${query.toString() ? '?' + query.toString() : ''}`;
    let res;
    try {
      res = await api.get<any>(url);
    } catch (e) {
      // On error, return empty items and default pagination
      return { items: [], pagination: { page: 1, pages: 1, limit: 10, total: 0 } };
    }
    // Defensive: if res is an array, wrap it; if missing fields, fill them
    if (Array.isArray(res)) {
      return { items: res, pagination: { page: 1, pages: 1, limit: res.length, total: res.length } };
    }
    if (!res || typeof res !== 'object') {
      return { items: [], pagination: { page: 1, pages: 1, limit: 10, total: 0 } };
    }
    if (!Array.isArray(res.items)) {
      res.items = [];
    }
    if (!res.pagination || typeof res.pagination !== 'object') {
      res.pagination = { page: 1, pages: 1, limit: res.items.length, total: res.items.length };
    }
    return res;
  },
  getFeedItem: async (id: number) => {
    const res = await api.get<any>(`/feed-items/${id}`);
    return res;
  },
  createFeedItem: async (data: any) => {
    return api.post('/feed-items/create', data);
  },
  updateFeedItem: async (id: number, ops: any[]) => {
    return api.patch(`/feed-items/${id}`, ops);
  },
  deleteFeedItem: async (id: number) => {
    return api.delete(`/feed-items/${id}`);
  },

  // Comments
  getComments: async (feedItemId: number) => {
    const res = await api.get<any>(`/comments?commentable_type=FeedItem&commentable_id=${feedItemId}`);
    return res.comments || [];
  },
  createComment: async (data: { content: string; user_id: number; author_name?: string; parent_id?: number; commentable_id: number }) => {
    return api.post('/comments', {
      ...data,
      commentable_type: 'FeedItem',
    });
  },
  updateComment: async (id: number, ops: any[]) => {
    return api.patch(`/comments/${id}`, ops);
  },
  deleteComment: async (id: number) => {
    return api.delete(`/comments/${id}`);
  },
  getCommentReplies: async (commentId: number) => {
    const res = await api.get<any>(`/comments/${commentId}/replies`);
    return res.replies || [];
  },

  // User Relationships
  getUserRelationships: async (userId: number) => {
    const res = await api.get<any>(`/user-relationships?filter=owned_by&ownedById=${userId}`);
    return res;
  },
  followUser: async (data: { ownedById: number; userId: number; relationshipType: string; targetType: string }) => {
    return api.post('/user-relationships', data);
  },
  unfollowUser: async (params: { ownedById: number; userId: number; relationshipType: string; targetType: string }) => {
    const query = new URLSearchParams();
    query.append('ownedById', String(params.ownedById));
    query.append('userId', String(params.userId));
    query.append('relationshipType', params.relationshipType);
    if (params.targetType) query.append('targetType', params.targetType);
    return api.delete(`/user-relationships?${query.toString()}`);
  },

  // Reports
  reportComment: async (data: { commentId: number; reason: string; userId: number; additionalDetails?: string }) => {
    return api.post('/reports/comment', data);
  },
  reportFeedItem: async (data: { feedItemId: number; reason: string; userId: number; additionalDetails?: string }) => {
    return api.post('/reports/feed-item', data);
  },

  // User Reactions (like/unlike)
  createUserReaction: async (data: { userId: number; reactionType: string; commentId?: number; feedItemId?: number }) => {
    return api.post('/user-reactions', data);
  },
  deleteUserReaction: async (userReactionId: number) => {
    return api.delete(`/user-reactions/${userReactionId}`);
  },

  // Joined Feed Items for a user
  getJoinedFeedItems: async (userId: number, page: number = 1, limit: number = 20) => {
    const url = `/feed-items/joined?userId=${userId}&page=${page}&limit=${limit}`;
    let res;
    try {
      res = await api.get<any>(url);
    } catch (e) {
      return { items: [], pagination: { page: 1, pages: 1, limit, total: 0 } };
    }
    if (Array.isArray(res)) {
      return { items: res, pagination: { page: 1, pages: 1, limit: res.length, total: res.length } };
    }
    if (!res || typeof res !== 'object') {
      return { items: [], pagination: { page: 1, pages: 1, limit, total: 0 } };
    }
    if (!Array.isArray(res.items)) {
      res.items = [];
    }
    if (!res.pagination || typeof res.pagination !== 'object') {
      res.pagination = { page: 1, pages: 1, limit: res.items.length, total: res.items.length };
    }
    return res;
  },
};
