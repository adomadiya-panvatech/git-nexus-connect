
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { communityService } from '@/services/communityService';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Home, 
  Calendar, 
  Users, 
  Settings, 
  Plus, 
  Heart, 
  Bookmark,
  Clock,
  Check,
  Target
} from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard = ({ onLogout }: DashboardProps) => {
  const dailyTasks = [
    { id: 1, task: 'Drink water', time: '8 AM', completed: false },
    { id: 2, task: 'Have breakfast', time: '8 AM', completed: true },
    { id: 3, task: 'Go for a walk', time: '12 PM', completed: false },
    { id: 4, task: 'Meditation', time: '7 PM', completed: false },
  ];

  const communityGroups = [
    { name: 'Sleep Seekers', description: 'Struggling to get good sleep? Connect and get advice.', image: '🛌' },
    { name: 'Movement Buddies', description: 'A place for accountability and support for physical activity.', image: '🏃‍♀️' },
    { name: 'Healthy Eaters', description: 'Share healthy meal ideas and nutrition tips.', image: '🥗' },
  ];

  const recipes = [
    { title: 'Healthy Sweet Potato & Black Bean Breakfast Burritos', author: 'Ambitious Kitchen', gradient: 'from-orange-400 to-red-400' },
    { title: 'Spinach Goat Cheese Mini Quiches', author: 'Oh My Veggies', gradient: 'from-purple-400 to-pink-400' },
  ];

  const [joinedGroups, setJoinedGroups] = React.useState<{ [key: number]: boolean }>({});
  const [joiningGroup, setJoiningGroup] = React.useState<number | null>(null);
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

  const joinMutation = useMutation({
    mutationFn: async ({ groupId, userId }: { groupId: number; userId: number }) => {
      await communityService.joinCommunity(groupId, userId);
    },
    onSuccess: (data, variables) => {
      setJoinedGroups((prev) => ({ ...prev, [variables.groupId]: true }));
      setJoiningGroup(null);
      // Optionally refetch community data
      queryClient.invalidateQueries({ queryKey: ['community-group', variables.groupId] });
    },
    onError: () => {
      setJoiningGroup(null);
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">WELLNESS</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-black">
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-black">
                <Calendar className="w-4 h-4" />
                <span>Plan</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-black">
                <Users className="w-4 h-4" />
                <span>Community</span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarFallback className="bg-black text-white">T</AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" onClick={onLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Good afternoon, Test</h1>
          <p className="text-gray-600">Ready to have a healthy day?</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Daily Plan */}
          <div className="lg:col-span-1">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>My Daily Plan</span>
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600">1 of {dailyTasks.length} today</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {dailyTasks.map((task) => (
                  <div key={task.id} className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      task.completed ? 'bg-black border-black' : 'border-gray-300'
                    }`}>
                      {task.completed && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-black'}`}>
                        {task.task}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {task.time}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recipes Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Ready to have a healthy breakfast this morning?</h2>
              </div>
              <p className="text-gray-600 mb-6">Check out these healthy breakfast recipes!</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recipes.map((recipe, index) => (
                  <Card key={index} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                    <div className={`h-48 bg-gradient-to-br ${recipe.gradient} relative`}>
                      <div className="absolute top-4 left-4">
                        <Heart className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute top-4 right-4">
                        <Bookmark className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <p className="text-sm text-gray-600 mb-2">{recipe.author}</p>
                      <h3 className="font-semibold text-black leading-tight">{recipe.title}</h3>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Community Groups */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Community Groups</h2>
                <Button variant="outline" size="sm">See all groups</Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {communityGroups.map((group, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl">{group.image}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-black mb-2">{group.name}</h3>
                          <p className="text-sm text-gray-600">{group.description}</p>
                          {/*<Button
                            size="sm"
                            className="mt-4 bg-black hover:bg-gray-800"
                            disabled={joinedGroups[index] || joiningGroup === index || !currentUser}
                            onClick={() => {
                              if (!joinedGroups[index] && currentUser) {
                                setJoiningGroup(index);
                                joinMutation.mutate({ groupId: index, userId: currentUser.id });
                              }
                            }}
                          >
                            {joinedGroups[index]
                              ? 'Joined'
                              : joiningGroup === index && joinMutation.isPending
                              ? 'Joining...'
                              : 'Join'}
                          </Button> */}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Wellness Quote */}
            <Card className="bg-gradient-to-r from-gray-900 to-black text-white">
              <CardContent className="p-8">
                <blockquote className="text-xl font-medium mb-4">
                  "Be kind and compassionate."
                </blockquote>
                <p className="text-gray-300">
                  When we share our questions, thoughts, and experiences with each other, 
                  let's always come from a place of respect.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
