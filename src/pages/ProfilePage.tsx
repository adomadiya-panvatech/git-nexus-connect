
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Edit, Settings, ExternalLink, MessageCircle, Heart, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('saved');
  
  const [profile, setProfile] = useState({
    firstName: 'Test',
    username: 'test.user',
    bio: 'A little about you',
    age: '33',
    gender: 'Female'
  });

  const savedItems = [
    {
      title: 'Community Group Rules',
      type: 'article',
      image: '/lovable-uploads/037bdc42-13e6-45ec-866b-faadbcd2030a.png'
    },
    {
      title: 'Healthy Sweet Potato & Black Bean Breakfast Burritos',
      author: 'Ambitious Kitchen',
      type: 'recipe',
      image: '/lovable-uploads/e3fa7127-e6a6-4676-bfbb-2ae5cb1b4d22.png'
    }
  ];

  return (
    <div>
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 mb-8 text-white relative">
        <div className="absolute top-4 right-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-white/20"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit profile'}
          </Button>
        </div>
        
        <div className="flex items-start space-x-6">
          <div className="relative">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-white text-purple-600 text-2xl font-bold">
                T
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <button className="absolute -bottom-2 -right-2 bg-white text-purple-600 rounded-full p-2 shadow-lg">
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">{profile.firstName}</h1>
            <p className="text-purple-100 mb-4">@{profile.username}</p>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <ExternalLink className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isEditing ? (
        // Edit Profile Form
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={profile.firstName}
                  onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="username">@username</Label>
                <Input
                  id="username"
                  value={profile.username}
                  onChange={(e) => setProfile({...profile, username: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                placeholder="Tell us about yourself..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  value={profile.age}
                  onChange={(e) => setProfile({...profile, age: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Input
                  id="gender"
                  value={profile.gender}
                  onChange={(e) => setProfile({...profile, gender: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex space-x-4">
              <Button 
                onClick={() => setIsEditing(false)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Save Changes
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Profile Content
        <div>
          {/* Tabs */}
          <div className="flex space-x-8 mb-8 border-b">
            {[
              { id: 'saved', label: 'Saved', active: activeTab === 'saved' },
              { id: 'history', label: 'History', active: activeTab === 'history' },
              { id: 'likes', label: 'Likes', active: activeTab === 'likes' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-2 font-medium transition-colors ${
                  tab.active 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Content based on active tab */}
          {activeTab === 'saved' && (
            <div>
              {savedItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {savedItems.map((item, index) => (
                    <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                        <div className="absolute top-4 right-4 flex space-x-2">
                          <Heart className="w-5 h-5 text-gray-600" />
                          <Bookmark className="w-5 h-5 text-blue-600 fill-current" />
                        </div>
                      </div>
                      <CardContent className="p-4">
                        {item.author && (
                          <p className="text-sm text-gray-600 mb-1">{item.author}</p>
                        )}
                        <h3 className="font-semibold text-black">{item.title}</h3>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">You haven't saved anything yet</h3>
                  <p className="text-gray-600">
                    Build your own collection by tapping the bookmark icon on your favorite articles, videos, and more.
                  </p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'history' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No history yet</h3>
              <p className="text-gray-600">Your activity history will appear here.</p>
            </div>
          )}
          
          {activeTab === 'likes' && (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No likes yet</h3>
              <p className="text-gray-600">Items you like will appear here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
