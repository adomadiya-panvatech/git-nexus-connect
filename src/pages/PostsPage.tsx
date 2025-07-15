import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MessageSquare, Share2, Image, Send, MoreHorizontal } from 'lucide-react';
import { postService } from '@/services/postService';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import PostItem from '@/components/PostItem';
import NewPostsButton from '@/components/NewPostsButton';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { FollowUserService, FeedItemStateService } from '@/services/feedServices';
import { USAGE_EVENT_TYPE } from '@/constants/feedConstants';

const PostsPage = () => {
  const [newPost, setNewPost] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<{ [key: number]: boolean }>({});
  const [newComment, setNewComment] = useState<{ [key: number]: string }>({});
  const [likedPosts, setLikedPosts] = useState<{ [key: number]: boolean }>({});
  const [likeReactionIds, setLikeReactionIds] = useState<{ [key: number]: number }>({});
  const [showNewPostsButton, setShowNewPostsButton] = useState(false);
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return undefined;
      return JSON.parse(userStr);
    } catch {
      return undefined;
    }
  };
  const currentUser = getCurrentUser();

  // Infinite query for posts from joined communities
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['feed-items-infinite', currentUser?.id],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => currentUser ? postService.getJoinedFeedItems(currentUser.id, pageParam, 20) : Promise.resolve({ items: [], pagination: { page: 1, pages: 1, limit: 20, total: 0 } }),
    getNextPageParam: (lastPage) => {
      if (!lastPage || typeof lastPage !== 'object' || !lastPage.pagination) return undefined;
      const { page, pages } = lastPage.pagination;
      if (typeof page !== 'number' || typeof pages !== 'number') return undefined;
      return page < pages ? page + 1 : undefined;
    },
    enabled: !!currentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createPostMutation = useMutation({
    mutationFn: postService.createFeedItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed-items-infinite'] });
      setNewPost('');
      setSelectedImage(null);
      setImagePreview(null);
      setHasNewPosts(true);
      setShowNewPostsButton(true);
    },
  });

  const likePostMutation = useMutation<any, unknown, number>({
    mutationFn: async (postId: number) => {
      const res = await postService.createUserReaction({
        userId: currentUser.id,
        reactionType: 'like',
        feedItemId: postId,
      });
      return res;
    },
    onSuccess: (data, postId) => {
      setLikedPosts(prev => ({ ...prev, [postId]: true }));
      setLikeReactionIds(prev => ({ ...prev, [postId]: data.id }));
      queryClient.invalidateQueries({ queryKey: ['feed-items-infinite'] });
    },
  });

  const unlikePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const reactionId = likeReactionIds[postId];
      if (reactionId) {
        await postService.deleteUserReaction(reactionId);
      }
    },
    onSuccess: (_, postId) => {
      setLikedPosts(prev => ({ ...prev, [postId]: false }));
      setLikeReactionIds(prev => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ['feed-items-infinite'] });
    },
  });

  // Initialize feed services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        await FollowUserService.loadRelationships();
      } catch (error) {
        console.error('Error loading relationships:', error);
      }
    };
    initializeServices();
  }, []);

  // Check for new posts periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        setHasNewPosts(true);
      }
    }, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [isLoading]);

  // Infinite scroll hook
  const loadingRef = useInfiniteScroll({
    onLoadMore: () => fetchNextPage(),
    hasMore: !!hasNextPage,
    isLoading: isFetchingNextPage,
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() && !selectedImage) return;
    if (!currentUser) return;
    try {
      await createPostMutation.mutateAsync({
        feed_id: 1, // mock or get from context
        content: newPost,
        author_id: currentUser.id,
        author_name: currentUser.name,
        image_url: imagePreview || undefined,
        private: false, // or true if needed
        targets: ['health'], // or get from UI/context
        community_group_id: 1, // mock or get from context
      });
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLike = (postId: number) => {
    if (likedPosts[postId]) {
      unlikePostMutation.mutate(postId);
    } else {
      likePostMutation.mutate(postId);
    }
  };

  const handleComment = async (postId: number, comment: string) => {
    // This should be handled in the CommentThread component per post
    // Left here for compatibility
  };

  const toggleComments = (postId: number) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleNewCommentChange = (postId: number, value: string) => {
    setNewComment(prev => ({ ...prev, [postId]: value }));
  };

  const handleRefreshPosts = async () => {
    await refetch();
    setShowNewPostsButton(false);
    setHasNewPosts(false);
  };

  const handleShare = (postId: number) => {
    console.log('Share post:', postId);
    // Track share event
    console.log('Track event:', USAGE_EVENT_TYPE.SHARE_POST, { postId });
  };

  const handleReport = (post: any) => {
    console.log('Report post:', post);
    // Track report event
    console.log('Track event:', USAGE_EVENT_TYPE.REPORT_POST, { postId: post.id });
  };

  const handleDelete = (post: any) => {
    console.log('Delete post:', post);
    // In a real app, you'd call the API to delete the post
  };

  const handleView = (post: any) => {
    console.log('View post:', post);
    // Track view event
    console.log('Track event:', USAGE_EVENT_TYPE.VIEW_POST, { postId: post.id });
  };

  const handleSkip = (post: any) => {
    console.log('Skip post:', post);
    // Track skip event
    console.log('Track event:', USAGE_EVENT_TYPE.SKIP_POST, { postId: post.id });
  };

  // Flatten all posts from all pages
  const allPosts = Array.isArray(data?.pages)
    ? data.pages.flatMap(page => {
        if (!page || typeof page !== 'object') return [];
        if (Array.isArray(page.items)) return page.items;
        return [];
      })
    : [];

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-gray-600 text-lg">You must be logged in to view posts.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <p className="text-red-600">Error loading posts. Please try again.</p>
          <Button onClick={() => refetch()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
          Community Posts
        </h1>
        <p className="text-xl text-gray-600">Share your wellness journey and connect with others</p>
      </div>

      {/* "See new posts" button */}
      <NewPostsButton 
        onClick={handleRefreshPosts}
        isVisible={showNewPostsButton}
      />

      {/* Posts Feed */}
      <div className="space-y-6">
        {allPosts.map((post) => (
          <PostItem
            key={post.id}
            post={post}
            user={currentUser}
            comments={[]}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
            onReport={handleReport}
            onDelete={handleDelete}
            onView={handleView}
            onSkip={handleSkip}
            likedPosts={likedPosts}
            expandedComments={expandedComments}
            onToggleComments={toggleComments}
            newComment={newComment}
            onNewCommentChange={handleNewCommentChange}
          />
        ))}

        {/* Loading indicator for infinite scroll */}
        <div ref={loadingRef} className="py-8">
          {isFetchingNextPage && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading more posts...</p>
            </div>
          )}
        </div>

        {/* End of feed indicator */}
        {!hasNextPage && allPosts.length > 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-px bg-gray-300 mx-auto mb-4"></div>
            <p className="text-gray-500 text-sm">You've reached the end of the feed</p>
          </div>
        )}

        {/* Empty state */}
        {allPosts.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600">Be the first to share your wellness journey!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostsPage;
