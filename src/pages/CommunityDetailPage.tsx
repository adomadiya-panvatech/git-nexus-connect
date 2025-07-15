
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, MessageSquare, Calendar, Star, Heart, Share2, Image } from 'lucide-react';
import { communityService } from '@/services/communityService';
import { postService } from '@/services/postService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

const CommunityDetailPage = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const [isJoined, setIsJoined] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
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

  const createPostMutation = useMutation({
    mutationFn: postService.createFeedItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed-items'] });
      setNewPost('');
      setSelectedImage(null);
      setImagePreview(null);
    },
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser || !communityId) throw new Error('User or communityId missing');
      await communityService.joinCommunity(Number(communityId), currentUser.id);
    },
    onSuccess: () => {
      setIsJoined(true);
      queryClient.invalidateQueries({ queryKey: ['community-group', communityId] });
      queryClient.invalidateQueries({ queryKey: ['feed-items', communityId] });
      queryClient.invalidateQueries({ queryKey: ['joined-communities', currentUser?.id] });
      refetchJoinedCommunities(); // Force refetch after join
      window.location.reload(); // Fallback: reload page if refetch does not work
    },
    onError: (error) => {
      console.error('Failed to join community:', error);
      // Optionally show error to user
    },
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
    if (!hasJoined) {
      toast({
        title: 'Join the community',
        description: 'You need to join this community to share a post.',
        variant: 'destructive',
      });
      return;
    }
    if (!newPost.trim() && !imagePreview) return;
    if (!currentUser) return;
    try {
      await createPostMutation.mutateAsync({
        feed_id: 1, // or get from context if needed
        content: newPost,
        author_id: currentUser.id,
        author_name: currentUser.name,
        image_url: imagePreview || undefined,
        private: false,
        targets: ['health'],
        community_group_id: Number(communityId),
      });
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const { data: communityGroup, isLoading } = useQuery({
    queryKey: ['community-group', communityId],
    queryFn: () => communityService.getCommunityGroup(Number(communityId)),
    enabled: !!communityId,
  });

  // Fetch feed items for this community group
  const { data: feedItemsRes = { items: [] } } = useQuery({
    queryKey: ['feed-items', communityId],
    queryFn: () => postService.getFeedItems({ communityGroupId: Number(communityId) }),
    enabled: !!communityId,
  });
  const items = Array.isArray(feedItemsRes.items) ? feedItemsRes.items : [];

  const handleJoinToggle = () => {
    if (!isJoined && currentUser && communityId) {
      joinMutation.mutate();
    }
  };

  // Fetch joined communities for the current user
  const userId = currentUser?.id;
  const { data: joinedCommunities = [], refetch: refetchJoinedCommunities } = useQuery({
    queryKey: ['joined-communities', userId],
    queryFn: () => userId ? communityService.getJoinedCommunities(userId) : Promise.resolve([]),
    enabled: !!userId,
  });
  const hasJoined = joinedCommunities.some((g) => g.id === Number(communityId));

  React.useEffect(() => {
    if (isJoined) {
      refetchJoinedCommunities();
    }
  }, [isJoined, refetchJoinedCommunities]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading community details...</p>
        </div>
      </div>
    );
  }

  if (!communityGroup) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Community not found.</p>
        <Link to="/community">
          <Button className="mt-4">Back to Communities</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link to="/community" className="inline-flex items-center text-gray-600 hover:text-black">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Communities
      </Link>

      {/* Community Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
              <Users className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{communityGroup.name}</h1>
              <p className="text-purple-100 mt-2">{communityGroup.description}</p>
              <div className="flex items-center space-x-4 mt-4">
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {communityGroup.joinedUsersCount || 0 } members
                </span>
                <span className="flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  4.8 rating
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            {!hasJoined && (
              <Button
                onClick={handleJoinToggle}
                variant={isJoined ? "secondary" : "default"}
                className={isJoined ? "bg-white text-purple-600 hover:bg-gray-100" : "bg-white text-purple-600 hover:bg-gray-100"}
                disabled={isJoined || !currentUser || joinMutation.isPending}
              >
                {isJoined ? 'Joined' : joinMutation.isPending ? 'Joining...' : 'Join Community'}
              </Button>
            )}
            <Button variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <h3 className="text-2xl font-bold">{items.length}</h3>
            <p className="text-gray-600">Posts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <h3 className="text-2xl font-bold">{communityGroup.joinedUsersCount || 0}</h3>
            <p className="text-gray-600">Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
            <h3 className="text-2xl font-bold">4.8</h3>
            <p className="text-gray-600">Rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Create New Post */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start space-x-4">
            <Avatar>
              <AvatarFallback className="bg-gradient-to-r from-pink-500 to-orange-500 text-white">T</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <Textarea
                placeholder="What's on your mind? Share your wellness journey..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[100px] resize-none border-none focus:ring-0 text-lg placeholder-gray-400"
              />
              {imagePreview && (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="rounded-lg max-w-full h-auto max-h-64 object-cover" />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Photo
                  </Button>
                </div>
                <Button
                  onClick={handleCreatePost}
                  disabled={!newPost.trim() && !selectedImage}
                  className="bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700"
                >
                  Share Post
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Posts */}
      <h2 className="text-2xl font-bold mb-6">Recent Community Posts</h2>
      <div className="space-y-6">
        {items.slice(0, 5).map((post) => (
          <Card key={post.id}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    {post.author_name ? post.author_name.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="font-semibold">{post.author_name || `User ${post.author_id}`}</h3>
                    <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                  <p className="text-gray-700">{post.content}</p>
                  {post.image_url && (
                    <img src={post.image_url} alt="Post" className="rounded-lg max-w-full h-auto" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CommunityDetailPage;
