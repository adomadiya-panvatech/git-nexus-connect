import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Users, Star, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { communityService, CommunityGroup } from '@/services/communityService';
import { useQuery } from '@tanstack/react-query';

const CommunityPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const { data: communityGroups = [], isLoading, error } = useQuery({
    queryKey: ['community-groups'],
    queryFn: communityService.getCommunityGroups,
  });

  const { data: userRelationships = [] } = useQuery({
    queryKey: ['user-relationships'],
    queryFn: communityService.getUserRelationships,
  });

  const filteredGroups = communityGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredGroups.length / pageSize) || 1;
  const paginatedGroups = filteredGroups.slice((page - 1) * pageSize, page * pageSize);

  const getCurrentUserId = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return undefined;
      const user = JSON.parse(userStr);
      return user.id;
    } catch {
      return undefined;
    }
  };

  const handleJoinGroup = async (groupId: number) => {
    const userId = getCurrentUserId();
    if (!userId) {
      alert('You must be logged in to join a community.');
      return;
    }
    await communityService.joinCommunity(groupId, userId);
  };

  const userId = getCurrentUserId();
  const {
    data: joinedCommunities = [],
    isLoading: isLoadingJoined,
    error: errorJoined,
  } = useQuery({
    queryKey: ['joined-communities', userId],
    queryFn: () => userId ? communityService.getJoinedCommunities(userId) : Promise.resolve([]),
    enabled: !!userId,
  });

  // Create a Set of joined community IDs for fast lookup
  const joinedCommunityIds = new Set(joinedCommunities.map((g) => g.id));

  // Reset to page 1 if search term changes
  React.useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading communities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Error loading communities:', error);
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading communities. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Modern Header */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 gradient-wellness rounded-2xl shadow-medium mb-6">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold gradient-wellness bg-clip-text text-transparent leading-tight">
            Wellness Community
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Connect, share, and grow together on your wellness journey. Join like-minded individuals creating positive change.
          </p>
        </div>

        {/* Modern Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-modern rounded-3xl p-8 text-center hover-lift group">
            <div className="w-16 h-16 gradient-wellness rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-2">{communityGroups.length}</h3>
            <p className="text-muted-foreground font-medium">Active Communities</p>
          </div>
          <div className="glass-modern rounded-3xl p-8 text-center hover-lift group">
            <div className="w-16 h-16 gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-2">4.8</h3>
            <p className="text-muted-foreground font-medium">Average Rating</p>
          </div>
          <div className="glass-modern rounded-3xl p-8 text-center hover-lift group">
            <div className="w-16 h-16 gradient-wellness rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-2">92%</h3>
            <p className="text-muted-foreground font-medium">Success Rate</p>
          </div>
        </div>

        {/* Your Joined Communities Section */}
        {userId && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">Your Wellness Journey</h2>
              <p className="text-muted-foreground">Communities you're part of</p>
            </div>
            {isLoadingJoined ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 gradient-wellness rounded-2xl animate-pulse mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <p className="text-muted-foreground">Loading your communities...</p>
              </div>
            ) : errorJoined ? (
              <div className="text-center py-12">
                <div className="text-destructive">Failed to load your communities.</div>
              </div>
            ) : joinedCommunities.length === 0 ? (
              <div className="text-center py-12 glass-modern rounded-3xl">
                <div className="w-20 h-20 gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Start Your Journey</h3>
                <p className="text-muted-foreground">You haven't joined any communities yet. Explore below to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {joinedCommunities.map((group) => (
                  <div key={group.id} className="glass-modern rounded-3xl p-6 hover-lift group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 gradient-wellness rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm text-muted-foreground font-medium">{group.joinedUsersCount || 0} members</span>
                    </div>
                    <div className="flex-1 mb-6">
                      <h3 className="text-xl font-bold text-foreground mb-2">{group.name}</h3>
                      <p className="text-muted-foreground leading-relaxed">{group.description || 'A thriving wellness community.'}</p>
                    </div>
                    <Link to={`/community/${group.id}`} className="block">
                      <Button variant="outline" className="w-full border-2 rounded-xl font-semibold hover:bg-accent transition-all duration-300">
                        View Community
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search and Discover Section */}
        <div className="text-center space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Discover Communities</h2>
            <p className="text-muted-foreground">Find your perfect wellness community</p>
          </div>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search communities by name or interest..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg rounded-2xl border-2 bg-card shadow-soft focus:shadow-medium transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Community Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedGroups.map((group) => (
            <div key={group.id} className="glass-modern rounded-3xl p-6 hover-lift group">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 gradient-wellness rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-muted-foreground">{group.joinedUsersCount || 0}</span>
                  <p className="text-xs text-muted-foreground">members</p>
                </div>
              </div>
              <div className="flex-1 mb-6">
                <h3 className="text-xl font-bold text-foreground mb-3 leading-tight">{group.name}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {group.description || 'Join this amazing community to connect with like-minded wellness enthusiasts.'}
                </p>
              </div>
              <div className="flex gap-3">
                <Link to={`/community/${group.id}`} className="flex-1">
                  <Button variant="outline" className="w-full border-2 rounded-xl font-semibold hover:bg-accent transition-all duration-300">
                    Explore
                  </Button>
                </Link>
                {!joinedCommunityIds.has(group.id) && (
                  <Button
                    onClick={() => handleJoinGroup(group.id)}
                    className="flex-1 gradient-wellness text-white rounded-xl font-semibold hover:shadow-medium transition-all duration-300 transform hover:scale-105"
                  >
                    Join Now
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        {/* Modern Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 pt-8">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 rounded-xl border-2 font-semibold disabled:opacity-50 hover:bg-accent transition-all duration-300"
            >
              Previous
            </Button>
            <div className="flex items-center gap-2">
              {(() => {
                const pageButtons = [];
                const showLeftEllipsis = page > 3;
                const showRightEllipsis = page < totalPages - 2;
                const startPage = Math.max(2, page - 1);
                const endPage = Math.min(totalPages - 1, page + 1);

                // First page
                pageButtons.push(
                  <Button
                    key={1}
                    variant={page === 1 ? 'default' : 'outline'}
                    className={`w-12 h-12 rounded-xl border-2 font-semibold transition-all duration-300 ${
                      page === 1 
                        ? 'gradient-wellness text-white shadow-medium' 
                        : 'hover:bg-accent'
                    }`}
                    onClick={() => setPage(1)}
                  >
                    1
                  </Button>
                );

                if (showLeftEllipsis) {
                  pageButtons.push(
                    <span key="left-ellipsis" className="px-2 text-muted-foreground">...</span>
                  );
                }

                for (let i = startPage; i <= endPage; i++) {
                  if (i > 1 && i < totalPages) {
                    pageButtons.push(
                      <Button
                        key={i}
                        variant={page === i ? 'default' : 'outline'}
                        className={`w-12 h-12 rounded-xl border-2 font-semibold transition-all duration-300 ${
                          page === i 
                            ? 'gradient-wellness text-white shadow-medium' 
                            : 'hover:bg-accent'
                        }`}
                        onClick={() => setPage(i)}
                      >
                        {i}
                      </Button>
                    );
                  }
                }

                if (showRightEllipsis) {
                  pageButtons.push(
                    <span key="right-ellipsis" className="px-2 text-muted-foreground">...</span>
                  );
                }

                // Last page
                if (totalPages > 1) {
                  pageButtons.push(
                    <Button
                      key={totalPages}
                      variant={page === totalPages ? 'default' : 'outline'}
                      className={`w-12 h-12 rounded-xl border-2 font-semibold transition-all duration-300 ${
                        page === totalPages 
                          ? 'gradient-wellness text-white shadow-medium' 
                          : 'hover:bg-accent'
                      }`}
                      onClick={() => setPage(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  );
                }

                return pageButtons;
              })()}
            </div>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 rounded-xl border-2 font-semibold disabled:opacity-50 hover:bg-accent transition-all duration-300"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;
