// Feed Item States
export const FEED_ITEM_STATE = {
  PENDING: 'Pending',
  VIEWED: 'Viewed',
  OPENED: 'Opened',
  SKIPPED: 'Skipped',
} as const;

// User Relationship Types
export const USER_RELATIONSHIP_TYPE = {
  FOLLOW: 'follow',
} as const;

// User Relationship Target Types
export const USER_RELATIONSHIP_TARGET_TYPE = {
  USER: 'user',
  GROUP: 'group',
} as const;

// Feed Targets
export const FEED_TARGET = {
  COLLECTIONS: 'collections',
  COMMUNITY: 'community',
  HOME: 'home',
  SOCIAL: 'social',
  TRACK: 'track',
} as const;

// Comment Types
export const COMMENT_TYPE = {
  COMMENT: 'comment',
  REPLY: 'reply',
} as const;

// Expiry Condition Types
export const EXPIRY_CONDITION_TYPE = {
  TIME: 'time',
  VIEWS: 'views',
  INTERACTIONS: 'interactions',
} as const;

// Usage Event Types
export const USAGE_EVENT_TYPE = {
  CREATE_COMMENT: 'create_comment',
  SHOW_ALL_COMMENTS: 'show_all_comments',
  FOLLOW: 'follow',
  UNFOLLOW: 'unfollow',
  LIKE_POST: 'like_post',
  UNLIKE_POST: 'unlike_post',
  SHARE_POST: 'share_post',
  REPORT_POST: 'report_post',
  REPORT_COMMENT: 'report_comment',
  DELETE_COMMENT: 'delete_comment',
  VIEW_POST: 'view_post',
  OPEN_POST: 'open_post',
  SKIP_POST: 'skip_post',
} as const; 