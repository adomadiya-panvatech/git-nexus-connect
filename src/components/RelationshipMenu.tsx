import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, UserPlus, UserMinus, Flag, MessageSquare, Share2 } from 'lucide-react';
import { FollowUserService } from '@/services/feedServices';
import { USAGE_EVENT_TYPE } from '@/constants/feedConstants';

interface RelationshipMenuProps {
  userId: number;
  onFollowChange?: (isFollowing: boolean) => void;
  onMessage?: () => void;
  onShare?: () => void;
  onReport?: () => void;
}

const RelationshipMenu: React.FC<RelationshipMenuProps> = ({
  userId,
  onFollowChange,
  onMessage,
  onShare,
  onReport,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkFollowingStatus();
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const checkFollowingStatus = () => {
    setIsFollowing(FollowUserService.isFollowing(userId));
  };

  const handleToggleFollow = async () => {
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
      setShowDropdown(false);
    } catch (error) {
      console.error(`Error ${isFollowing ? 'unfollowing' : 'following'} user:`, error);
    }
  };

  const handleMessage = () => {
    onMessage?.();
    setShowDropdown(false);
  };

  const handleShare = () => {
    onShare?.();
    setShowDropdown(false);
  };

  const handleReport = () => {
    onReport?.();
    setShowDropdown(false);
  };

  const trackEvent = (type: string) => {
    const eventProperties = {
      followingId: userId,
    };
    console.log('Track event:', type, eventProperties);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDropdown(!showDropdown)}
        className="h-8 w-8 p-0"
      >
        <MoreHorizontal className="w-4 h-4" />
      </Button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            <button
              onClick={handleToggleFollow}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {isFollowing ? (
                <>
                  <UserMinus className="w-4 h-4 mr-3 text-red-500" />
                  Unfollow
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-3 text-blue-500" />
                  Follow
                </>
              )}
            </button>

            <button
              onClick={handleMessage}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <MessageSquare className="w-4 h-4 mr-3 text-green-500" />
              Message
            </button>

            <button
              onClick={handleShare}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Share2 className="w-4 h-4 mr-3 text-blue-500" />
              Share Profile
            </button>

            <div className="border-t border-gray-200 my-1" />

            <button
              onClick={handleReport}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Flag className="w-4 h-4 mr-3" />
              Report User
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RelationshipMenu; 