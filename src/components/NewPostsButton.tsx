import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface NewPostsButtonProps {
  onClick: () => void;
  isVisible: boolean;
}

const NewPostsButton: React.FC<NewPostsButtonProps> = ({ onClick, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-out">
      <Button
        onClick={onClick}
        className="bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white shadow-lg rounded-full px-6 py-3"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        See new posts
      </Button>
    </div>
  );
};

export default NewPostsButton; 