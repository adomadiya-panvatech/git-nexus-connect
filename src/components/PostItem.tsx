import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MessageSquare, Share2, MoreHorizontal, Eye, SkipForward, Flag, Trash2 } from 'lucide-react';
import { FeedItemStateService, FeedItemFreshnessService } from '@/services/feedServices';
import { USAGE_EVENT_TYPE, FEED_ITEM_STATE } from '@/constants/feedConstants';
import CommentThread from './CommentThread';
import FollowUser from './FollowUser';
import RelationshipMenu from './RelationshipMenu';

interface Post {
  id: number;
  content: string;
  image_url?: string;
  author_name?: string;
  author_id: number;
  created_at: string;
  likes_count?: number;
  state?: string;
  private?: boolean;
  targets?: string[];
  communityGroupId?: number;
  userPost?: any;
  feedContent?: any;
  assignment?: any;
  contentCollection?: any;
  comments_count?: number;
}

interface Comment {
  id: number;
  content: string;
  author_name?: string;
  created_at: string;
  post_id: number;
}

interface PostItemProps {
  post: Post;
  user: { id: number; name: string };
  comments: Comment[];
  onLike: (postId: number) => void;
  onComment: (postId: number, comment: string) => Promise<void>;
  onShare?: (postId: number) => void;
  onReport?: (post: Post) => void;
  onDelete?: (post: Post) => void;
  onView?: (post: Post) => void;
  onSkip?: (post: Post) => void;
  likedPosts: { [key: number]: boolean };
  expandedComments: { [key: number]: boolean };
  onToggleComments: (postId: number) => void;
  newComment: { [key: number]: string };
  onNewCommentChange: (postId: number, value: string) => void;
}

const PostItem: React.FC<PostItemProps> = ({
  post,
  user,
  comments,
  onLike,
  onComment,
  onShare,
  onReport,
  onDelete,
  onView,
  onSkip,
  likedPosts,
  expandedComments,
  onToggleComments,
  newComment,
  onNewCommentChange,
}) => {
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showRelationshipMenu, setShowRelationshipMenu] = useState(false);

  const postComments = comments.filter(comment => comment.post_id === post.id);
  const isCommentsExpanded = expandedComments[post.id];
  const isLiked = likedPosts[post.id];
  const isFresh = FeedItemFreshnessService.isFresh(post);
  const canSkip = FeedItemStateService.canSkip(post);

  // Track view when post becomes visible
  useEffect(() => {
    if (post.private && (!post.state || post.state === FEED_ITEM_STATE.PENDING)) {
      FeedItemStateService.viewFeedItem(post);
      onView?.(post);
    }
  }, [post.id]);

  const handleOpenPost = async () => {
    if (post.private && post.state !== FEED_ITEM_STATE.OPENED) {
      await FeedItemStateService.openFeedItem(post);
      onView?.(post);
    }
  };

  const handleSkipPost = async () => {
    if (canSkip) {
      await FeedItemStateService.skipFeedItem(post);
      onSkip?.(post);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const comment = newComment[post.id];
    if (!comment?.trim()) return;

    setIsSubmittingComment(true);
    try {
      await onComment(post.id, comment);
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(post.id);
    } else {
      // Default share behavior
      if (navigator.share) {
        navigator.share({
          title: 'Check out this post',
          text: post.content,
          url: window.location.href,
        });
      } else {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(post.content);
      }
    }
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow ${isFresh ? 'ring-2 ring-green-200' : ''}`}>
      <CardContent className="p-6 space-y-4">
        {/* Post Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback className="bg-gradient-to-r from-pink-500 to-orange-500 text-white">
                {post.author_name ? post.author_name.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold">{post.author_name || `User ${post.author_id}`}</h3>
                {isFresh && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    New
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {post.author_id !== user.id && <FollowUser userId={post.author_id} />}
          </div>
        </div>

        {/* Post Content */}
        <div className="space-y-3">
          <p className="text-gray-800 leading-relaxed">{post.content}</p>
          {post.image_url ? (
            <div className="relative w-full flex justify-center items-center bg-gray-50 rounded-xl border border-gray-200 overflow-hidden shadow-md group">
              <img
                src={post.image_url}
                alt="Post"
                className="rounded-xl w-full max-h-96 object-contain transition-transform duration-300 group-hover:scale-105 bg-white"
                //onClick={() => window.open(post.image_url, '_blank')}
                style={{ cursor: 'zoom-in' }}
              />
            </div>
          ) : (
            <div className="w-full h-64 flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl border border-gray-200">
              <span className="text-gray-400 text-4xl">🖼️</span>
            </div>
          )}
          
          {/* User Post Content */}
          {post.userPost && (
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: post.userPost.html }}
            />
          )}
        </div>

        {/* Post Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => onLike(post.id)}
              className={`flex items-center space-x-2 transition-colors ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{post.likes_count || 0}</span>
            </button>
            <button
              onClick={() => onToggleComments(post.id)}
              className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              <span>{typeof post.comments_count === 'number' ? post.comments_count : postComments.length}</span>
            </button>
            <button 
              onClick={handleShare}
              className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
            {post.private && (
              <>
                <button
                  onClick={handleOpenPost}
                  className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
                >
                  <Eye className="w-5 h-5" />
                  <span>Open</span>
                </button>
                {canSkip && (
                  <button
                    onClick={handleSkipPost}
                    className="flex items-center space-x-2 text-gray-500 hover:text-orange-500 transition-colors"
                  >
                    <SkipForward className="w-5 h-5" />
                    <span>Skip</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Comments Section */}
        {isCommentsExpanded && (
          <div className="pt-4 border-t">
            <CommentThread
              feedItemId={post.id}
              user={user}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PostItem; 