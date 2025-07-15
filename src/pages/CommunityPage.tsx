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
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Wellness Community</h1>
        <p className="text-xl text-gray-600">Connect, share, and grow together on your wellness journey</p>
      </div>

      {/* Stats Cards */}
      <div className="mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-2xl shadow p-6 text-center">
          <Users className="w-8 h-8 mx-auto mb-2 text-black" />
          <h3 className="text-2xl font-bold text-black">{communityGroups.length}</h3>
          <p className="text-gray-700">Active Communities</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl shadow p-6 text-center">
          <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
          <h3 className="text-2xl font-bold text-black">4.8</h3>
          <p className="text-gray-700">Average Rating</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl shadow p-6 text-center">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
          <h3 className="text-2xl font-bold text-black">92%</h3>
          <p className="text-gray-700">Success Rate</p>
        </div>
      </div>

      {/* Your Joined Communities Section */}
      {userId && (
        <div className="mx-auto mb-8">
          <h2 className="text-2xl font-bold mb-4 text-black">Your Joined Communities</h2>
          {isLoadingJoined ? (
            <div className="text-center py-8 text-gray-500">Loading your joined communities...</div>
          ) : errorJoined ? (
            <div className="text-center py-8 text-red-500">Failed to load joined communities.</div>
          ) : joinedCommunities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">You haven't joined any communities yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {joinedCommunities.map((group) => (
                <div key={group.id} className="bg-white border border-gray-200 rounded-2xl shadow p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-[#e9d5ff] rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-500" />
                    </div>
                    <span className="text-xs text-gray-500">{group.joinedUsersCount || 0} members</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-black mb-1">{group.name}</h3>
                    <p className="text-gray-700 text-sm mb-4">{group.description || 'A great wellness community.'}</p>
                  </div>
                  <Link to={`/community/${group.id}`} className="w-full block mt-auto">
                    <Button variant="outline" className="w-full border border-gray-300 text-black rounded-lg font-semibold hover:bg-gray-100 transition">
                      View Details
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search Bar and Join Our Communities Title in one row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full mb-8 gap-4">
        <h2 className="text-2xl font-bold text-black flex-shrink-0 mb-0">Join Our Communities</h2>
        <div className="relative w-full md:max-w-xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search communities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-4 py-3 w-full border border-gray-300 rounded-lg text-black bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Join Our Communities Section */}
      <div className="mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedGroups.map((group) => (
            <div key={group.id} className="bg-white border border-gray-200 rounded-2xl shadow p-6 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-[#e9d5ff] rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-500" />
                </div>
                <span className="text-xs text-gray-500">{group.joinedUsersCount || 0} members</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-black mb-1">{group.name}</h3>
                <p className="text-gray-700 text-sm mb-4">{group.description || 'Join this amazing community to connect with like-minded wellness enthusiasts.'}</p>
              </div>
              <div className="flex space-x-2 mt-auto">
                <Link to={`/community/${group.id}`} className="flex-1">
                  <Button variant="outline" className="w-full border border-gray-300 text-black rounded-lg font-semibold hover:bg-gray-100 transition">
                    View Details
                  </Button>
                </Link>
                {!joinedCommunityIds.has(group.id) && (
                  <Button
                    onClick={() => handleJoinGroup(group.id)}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition"
                  >
                    Join
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            <Button
              variant="outline"
              className="px-3 py-1 border border-gray-300 text-black rounded-lg font-semibold hover:bg-gray-100 transition"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            {/* Page numbers with ellipsis */}
            {(() => {
              const pageButtons = [];
              const showLeftEllipsis = page > 3;
              const showRightEllipsis = page < totalPages - 2;
              const startPage = Math.max(2, page - 1);
              const endPage = Math.min(totalPages - 1, page + 1);

              // Always show first page
              pageButtons.push(
                <Button
                  key={1}
                  variant={page === 1 ? 'default' : 'outline'}
                  className={`px-3 py-1 border border-gray-300 text-black rounded-lg font-semibold ${page === 1 ? 'bg-black text-white' : 'hover:bg-gray-100 transition'}`}
                  onClick={() => setPage(1)}
                >
                  1
                </Button>
              );

              if (showLeftEllipsis) {
                pageButtons.push(
                  <span key="left-ellipsis" className="px-2 select-none">...</span>
                );
              }

              for (let i = startPage; i <= endPage; i++) {
                if (i > 1 && i < totalPages) {
                  pageButtons.push(
                    <Button
                      key={i}
                      variant={page === i ? 'default' : 'outline'}
                      className={`px-3 py-1 border border-gray-300 text-black rounded-lg font-semibold ${page === i ? 'bg-black text-white' : 'hover:bg-gray-100 transition'}`}
                      onClick={() => setPage(i)}
                    >
                      {i}
                    </Button>
                  );
                }
              }

              if (showRightEllipsis) {
                pageButtons.push(
                  <span key="right-ellipsis" className="px-2 select-none">...</span>
                );
              }

              // Always show last page
              if (totalPages > 1) {
                pageButtons.push(
                  <Button
                    key={totalPages}
                    variant={page === totalPages ? 'default' : 'outline'}
                    className={`px-3 py-1 border border-gray-300 text-black rounded-lg font-semibold ${page === totalPages ? 'bg-black text-white' : 'hover:bg-gray-100 transition'}`}
                    onClick={() => setPage(totalPages)}
                  >
                    {totalPages}
                  </Button>
                );
              }

              return pageButtons;
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;
