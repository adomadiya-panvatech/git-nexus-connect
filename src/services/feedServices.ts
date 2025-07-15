import { api } from './api';
import { FEED_ITEM_STATE, USER_RELATIONSHIP_TYPE, USER_RELATIONSHIP_TARGET_TYPE } from '@/constants/feedConstants';
import { postService } from './postService';

// Types
export interface FeedItem {
  id: number;
  content: string;
  author_id: number;
  author_name?: string;
  created_at: string;
  likes_count?: number;
  comments_count?: number;
  image_url?: string;
  state?: string;
  private?: boolean;
  targets?: string[];
  communityGroupId?: number;
  userPost?: any;
  feedContent?: any;
  assignment?: any;
  contentCollection?: any;
}

export interface Comment {
  id: number;
  content: string;
  author_id: number;
  author_name?: string;
  post_id: number;
  created_at: string;
  parentCommentId?: number;
  likes_count?: number;
  isLiked?: boolean;
}

export interface UserRelationship {
  id: number;
  ownedById: number;
  userId: number;
  relationshipType: string;
  targetType: string;
}

export interface CommentReply {
  id: number;
  content: string;
  author_id: number;
  author_name?: string;
  parentCommentId: number;
  created_at: string;
  likes_count?: number;
  isLiked?: boolean;
}

// Feed Item State Service
export class FeedItemStateService {
  static async openFeedItem(feedItem: FeedItem): Promise<void> {
    if (this.canOpen(feedItem)) {
      await this.updateFeedItemState(feedItem, FEED_ITEM_STATE.OPENED);
    }
  }

  static async skipFeedItem(feedItem: FeedItem): Promise<void> {
    if (this.canSkip(feedItem)) {
      await this.updateFeedItemState(feedItem, FEED_ITEM_STATE.SKIPPED);
    }
  }

  static async viewFeedItem(feedItem: FeedItem): Promise<void> {
    if (this.canView(feedItem)) {
      await this.updateFeedItemState(feedItem, FEED_ITEM_STATE.VIEWED);
    }
  }

  static canSkip(feedItem: FeedItem): boolean {
    return feedItem.private && feedItem.state !== FEED_ITEM_STATE.SKIPPED;
  }

  private static canOpen(feedItem: FeedItem): boolean {
    return feedItem.private && feedItem.state !== FEED_ITEM_STATE.OPENED;
  }

  private static canView(feedItem: FeedItem): boolean {
    return feedItem.private && (!feedItem.state || feedItem.state === FEED_ITEM_STATE.PENDING);
  }

  private static async updateFeedItemState(feedItem: FeedItem, state: string): Promise<void> {
    try {
      await api.patch(`/feed-items/${feedItem.id}`, [{
        op: 'replace',
        path: 'state',
        value: state,
      }]);
      feedItem.state = state;
    } catch (error) {
      console.error('Error updating feed item state:', error);
      // In a real app, you might want to show a toast notification here
    }
  }
}

// Follow User Service
export class FollowUserService {
  private static followingByUserId: { [key: number]: UserRelationship } = {};

  static async loadRelationships(): Promise<void> {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) throw new Error('Not logged in');
      const currentUser = JSON.parse(userStr);
      const relationships = await postService.getUserRelationships(currentUser.id);
      this.storeByUserId(relationships);
    } catch (error) {
      console.error('Error loading relationships:', error);
    }
  }

  static async followUser(userId: number): Promise<void> {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) throw new Error('Not logged in');
      const currentUser = JSON.parse(userStr);
      const userRelationship = {
        ownedById: currentUser.id,
        userId: userId,
        relationshipType: USER_RELATIONSHIP_TYPE.FOLLOW,
        targetType: USER_RELATIONSHIP_TARGET_TYPE.USER,
      };
      await postService.followUser(userRelationship);
      await this.loadRelationships();
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  }

  static async unfollowUser(userId: number): Promise<void> {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) throw new Error('Not logged in');
      const currentUser = JSON.parse(userStr);
      await postService.unfollowUser({
        ownedById: currentUser.id,
        userId: userId,
        relationshipType: USER_RELATIONSHIP_TYPE.FOLLOW,
        targetType: USER_RELATIONSHIP_TARGET_TYPE.USER,
      });
      await this.loadRelationships();
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  }

  static isFollowing(userId: number): boolean {
    return !!this.followingByUserId[userId];
  }

  private static storeByUserId(userRelationships: UserRelationship[]): void {
    userRelationships.forEach(userRelationship => {
      this.followingByUserId[userRelationship.userId] = userRelationship;
    });
  }
}

// Comment Reply Service
export class CommentReplyService {
  private comments: Comment[] = [];

  constructor(comments: Comment[]) {
    this.comments = comments;
  }

  getComments(): Comment[] {
    return this.comments;
  }

  getTotalCommentCount(): number {
    return this.comments.length;
  }

  removeComment(comment: Comment): void {
    this.comments = this.comments.filter(c => c.id !== comment.id);
  }

  addComment(comment: Comment): void {
    this.comments.unshift(comment);
  }
}

// Report Comment Service
export class ReportCommentService {
  static async report(comment: Comment): Promise<void> {
    try {
      // In a real app, you would call the API here
      // await api.post('/report-comment', {
      //   commentId: comment.id,
      //   reason: 'inappropriate',
      // });
      
      console.log('Comment reported:', comment.id);
    } catch (error) {
      console.error('Error reporting comment:', error);
      throw error;
    }
  }
}

// Feed Retriever Service
export class FeedRetrieverService {
  private page = 1;
  private hasMore = true;
  private items: FeedItem[] = [];

  async getItems(): Promise<{ feedItems: FeedItem[]; noMoreContent: boolean }> {
    try {
      // Mock data for now - replace with actual API call
      const mockItems: FeedItem[] = [
        {
          id: 1,
          content: "This is a sample feed item with some interesting content.",
          author_id: 1,
          author_name: "John Doe",
          created_at: new Date().toISOString(),
          likes_count: 5,
          comments_count: 2,
          private: true,
          state: FEED_ITEM_STATE.PENDING,
        },
        {
          id: 2,
          content: "Another sample feed item that users can interact with.",
          author_id: 2,
          author_name: "Jane Smith",
          created_at: new Date().toISOString(),
          likes_count: 3,
          comments_count: 1,
          private: false,
        },
        {
          id: 3,
          content: "A third feed item to demonstrate the feed functionality.",
          author_id: 3,
          author_name: "Mike Johnson",
          created_at: new Date().toISOString(),
          likes_count: 7,
          comments_count: 4,
          private: true,
          state: FEED_ITEM_STATE.VIEWED,
        }
      ];

      const newItems = mockItems;
      this.items = [...this.items, ...newItems];
      this.page++;
      this.hasMore = newItems.length > 0;

      return {
        feedItems: newItems,
        noMoreContent: !this.hasMore,
      };
    } catch (error) {
      console.error('Error retrieving feed items:', error);
      throw error;
    }
  }

  reset(): void {
    this.page = 1;
    this.hasMore = true;
    this.items = [];
  }
}

// Group Retriever Service
export class GroupRetrieverService {
  private page = 1;
  private hasMore = true;

  async getItems(): Promise<{ feedItems: FeedItem[]; noMoreContent: boolean }> {
    try {
      // Mock data for now - replace with actual API call
      const mockItems: FeedItem[] = [
        {
          id: 4,
          content: "Group-specific feed item for community discussions.",
          author_id: 4,
          author_name: "Group Member",
          created_at: new Date().toISOString(),
          likes_count: 2,
          comments_count: 0,
          private: false,
        }
      ];

      const newItems = mockItems;
      this.page++;
      this.hasMore = newItems.length > 0;

      return {
        feedItems: newItems,
        noMoreContent: !this.hasMore,
      };
    } catch (error) {
      console.error('Error retrieving group items:', error);
      throw error;
    }
  }

  reset(): void {
    this.page = 1;
    this.hasMore = true;
  }
}

// Feed Item Freshness Service
export class FeedItemFreshnessService {
  static isFresh(feedItem: FeedItem): boolean {
    const createdAt = new Date(feedItem.created_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    return hoursDiff < 24; // Consider fresh if less than 24 hours old
  }
}

// Expiry Condition Service
export class ExpiryConditionService {
  static onViewFeedItem(feedItem: FeedItem): void {
    // Handle expiry conditions when viewing a feed item
    console.log('Feed item viewed:', feedItem.id);
  }
} 