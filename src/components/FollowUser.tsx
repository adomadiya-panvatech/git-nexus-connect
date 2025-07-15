import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, UserCheck } from 'lucide-react';
import { FollowUserService } from '@/services/feedServices';
import { USAGE_EVENT_TYPE, USER_RELATIONSHIP_TARGET_TYPE } from '@/constants/feedConstants';

interface FollowUserProps {
  userId: number;
  hideFollowing?: boolean;
  relationship?: any;
  onFollowChange?: (isFollowing: boolean) => void;
}

const FollowUser: React.FC<FollowUserProps> = ({
  userId,
  hideFollowing = false,
  relationship,
  onFollowChange,
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkFollowingStatus();
  }, [userId, relationship]);

  const checkFollowingStatus = () => {
    if (relationship) {
      setIsFollowing(relationship.relationshipType === 'follow');
    } else {
      setIsFollowing(FollowUserService.isFollowing(userId));
    }
  };

  const handleToggleFollow = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (isFollowing) {
        await FollowUserService.unfollowUser(userId);
        trackEvent(USAGE_EVENT_TYPE.UNFOLLOW);
      } else {
        await FollowUserService.followUser(userId);
        trackEvent(USAGE_EVENT_TYPE.FOLLOW);
      }

      setIsFollowing(!isFollowing);
      onFollowChange?.(!isFollowing);
    } catch (error) {
      console.error(`Error ${isFollowing ? 'unfollowing' : 'following'} user:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const trackEvent = (type: string) => {
    const eventProperties = {
      followingId: userId,
      targetType: USER_RELATIONSHIP_TARGET_TYPE.USER,
    };
    console.log('Track event:', type, eventProperties);
  };

  // Hide the button if user is following and hideFollowing is true
  if (isFollowing && hideFollowing) {
    return null;
  }

  return (
    <Button
      onClick={handleToggleFollow}
      disabled={isLoading}
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      className={`transition-all duration-200 ${
        isFollowing 
          ? "border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700" 
          : "bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white"
      }`}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
      ) : isFollowing ? (
        <>
          <UserMinus className="w-4 h-4 mr-2" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
};

export default FollowUser; 