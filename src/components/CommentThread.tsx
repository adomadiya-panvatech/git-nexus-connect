import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Heart, Reply, Flag, Trash2, Edit } from 'lucide-react';
import { postService, Comment } from '@/services/postService';

interface CommentThreadProps {
  feedItemId: number;
  user: { id: number; name: string };
}

const CommentThread: React.FC<CommentThreadProps> = ({ feedItemId, user }) => {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editText, setEditText] = useState('');

  // Fetch comments for this feed item
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', feedItemId],
    queryFn: () => postService.getComments(feedItemId),
  });

  // Create comment
  const createCommentMutation = useMutation({
    mutationFn: (payload: any) => postService.createComment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', feedItemId] });
      setNewComment('');
      setReplyTo(null);
    },
  });

  // Edit comment
  const editCommentMutation = useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) =>
      postService.updateComment(id, [
        { op: 'replace', path: 'content', value: content },
      ]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', feedItemId] });
      setEditingComment(null);
      setEditText('');
    },
  });

  // Delete comment
  const deleteCommentMutation = useMutation({
    mutationFn: (id: number) => postService.deleteComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', feedItemId] });
    },
  });

  // Like a comment
  const [likedCommentIds, setLikedCommentIds] = useState<Set<number>>(new Set());

  const likeMutation = useMutation({
    mutationFn: (comment_id: number) =>
      postService.createUserReaction({
        userId: user.id,
        reactionType: 'like',
        commentId: comment_id,
      }),
    onSuccess: (_, comment_id) => {
      setLikedCommentIds(prev => new Set(prev).add(comment_id));
      queryClient.invalidateQueries({ queryKey: ['comments', feedItemId] });
    },
  });

  // Unlike a comment
  const unlikeMutation = useMutation({
    mutationFn: (userReactionId: number) =>
      postService.deleteUserReaction(userReactionId),
    onSuccess: (_, userReactionId) => {
      setLikedCommentIds(prev => {
        const next = new Set(prev);
        next.delete(userReactionId);
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ['comments', feedItemId] });
    },
  });

  const handleCreateComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    createCommentMutation.mutate({
      content: newComment,
      user_id: user.id,
      author_name: user.name,
      parent_id: replyTo?.id,
      commentable_id: feedItemId,
    });
  };

  const handleEditComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComment || !editText.trim()) return;
    editCommentMutation.mutate({ id: editingComment.id, content: editText });
  };

  const handleLike = (comment: Comment) => {
    if (comment.isLiked || likedCommentIds.has(comment.id)) {
      unlikeMutation.mutate(comment.id);
    } else {
      likeMutation.mutate(comment.id);
    }
  };

  const repliesMap: { [parentId: number]: Comment[] } = {};
  comments.forEach((comment: Comment) => {
    if (comment.parent_id) {
      if (!repliesMap[comment.parent_id]) repliesMap[comment.parent_id] = [];
      repliesMap[comment.parent_id].push(comment);
    }
  });

  function renderComment(comment: Comment) {
    return (
      <div key={comment.id} className="space-y-3">
        <div className="flex space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-gradient-to-r from-pink-500 to-orange-500 text-white text-xs">
              {comment.author_name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-sm">
                    {comment.author_name || `User ${comment.user_id}`}
                  </span>
                  <span className="text-xs text-gray-500">
                    {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(comment)}
                    className={`h-6 w-6 p-0 ${(comment.isLiked || likedCommentIds.has(comment.id)) ? 'text-red-500' : 'text-gray-500'}`}
                  >
                    <Heart className={`w-4 h-4 ${(comment.isLiked || likedCommentIds.has(comment.id)) ? 'fill-current' : ''}`} />
                  </Button>
                  <span className="ml-1 text-xs text-gray-500">{comment.likes_count || 0}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyTo(comment)}
                    className="h-6 w-6 p-0 text-gray-500"
                  >
                    <Reply className="w-4 h-4" />
                  </Button>
                  {user.name === comment.author_name && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingComment(comment);
                          setEditText(comment.content);
                        }}
                        className="h-6 w-6 p-0 text-gray-500"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCommentMutation.mutate(comment.id)}
                        className="h-6 w-6 p-0 text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {editingComment?.id === comment.id ? (
                <form onSubmit={handleEditComment} className="space-y-2">
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="min-h-[60px] resize-none text-sm"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingComment(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!editText.trim() || editCommentMutation.status === 'pending'}
                      className="bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700"
                    >
                      {editCommentMutation.status === 'pending' ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </form>
              ) : (
                <p className="text-sm text-gray-800">{comment.content}</p>
              )}
            </div>
          </div>
        </div>
        {/* Render replies if any */}
        {repliesMap[comment.id] && (
          <div className="pl-10 mt-2 space-y-2">
            {repliesMap[comment.id].map(renderComment)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Comment Form */}
      <form onSubmit={handleCreateComment} className="space-y-3">
        <div className="flex items-start space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-gradient-to-r from-pink-500 to-orange-500 text-white text-xs">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            {replyTo && (
              <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                Replying to {replyTo.author_name}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyTo(null)}
                  className="ml-2"
                >
                  Cancel
                </Button>
              </div>
            )}
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[60px] resize-none text-sm"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={!newComment.trim() || createCommentMutation.status === 'pending'}
                className="bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700"
              >
                {createCommentMutation.status === 'pending' ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-gray-500">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-gray-500">No comments yet.</div>
        ) : (
          comments
            .filter((comment: any) => !comment.parent_id)
            .map(renderComment)
        )}
      </div>
    </div>
  );
};

export default CommentThread; 