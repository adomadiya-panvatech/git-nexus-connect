
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Heart, Bookmark, Clock, Check, Target, Users, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { planService } from '@/services/planService';
import { communityService } from '@/services/communityService';
import { postService } from '@/services/postService';
import { useQuery } from '@tanstack/react-query';

function getUserIdFromStorage() {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return undefined;
    const user = JSON.parse(userStr);
    return user.id;
  } catch {
    return undefined;
  }
}

const HomePage = () => {
  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: planService.getGoals,
  });

  const { data: communityGroups = [] } = useQuery({
    queryKey: ['community-groups'],
    queryFn: communityService.getCommunityGroups,
  });

  const { data: feedItems = [] } = useQuery({
    queryKey: ['feed-items'],
    queryFn: () => postService.getFeedItems().then(res => res.items || []),
  });

  const { data: habits = [] } = useQuery({
    queryKey: ['habits'],
    queryFn: planService.getHabits,
  });

  const [myPlans, setMyPlans] = useState<any[]>([]);
  const [planEventsDone, setPlanEventsDone] = useState<{ [planId: string]: any[] }>({});
  useEffect(() => {
    const fetchPlans = async () => {
      const userId = getUserIdFromStorage();
      if (!userId) return;
      const plans = await planService.getPlansByUser(userId);
      setMyPlans(plans);
      const doneMap: { [planId: string]: any[] } = {};
      plans.forEach((plan: any) => {
        const events = (plan.plannedEvents || plan.planned_events || []).map((e: any, idx: number) => ({
          ...e,
          id: e.id || idx + 1,
          done: false,
        }));
        doneMap[plan.id] = events;
      });
      setPlanEventsDone(doneMap);
    };
    fetchPlans();
  }, []);

  const handleToggleDone = (planId: string, eventId: number) => {
    setPlanEventsDone(prev => ({
      ...prev,
      [planId]: prev[planId].map((item, idx) =>
        (item.id || idx) === eventId ? { ...item, done: !item.done } : item
      )
    }));
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Good afternoon, Wellness Warrior!
        </h1>
        <p className="text-xl text-gray-600">Ready to have a healthy day?</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Plan */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>My Daily Plan</span>
                <Link to="/plan">
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {myPlans.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-lg font-semibold mb-2">No plans yet</div>
                  <div className="text-base">Create a plan to start your wellness journey!</div>
                </div>
              ) : (
                myPlans.slice(0, 1).map((plan) => {
                  const doneCount = planEventsDone[plan.id]?.filter((a: any) => a.done).length || 0;
                  const totalCount = planEventsDone[plan.id]?.length || 0;
                  return (
                    <div key={plan.id}>
                      <div className="font-bold text-lg mb-2">{plan.name || plan.activity}</div>
                      {totalCount > 0 && (
                        <div className="mb-2">
                          <Progress value={doneCount / totalCount * 100} className="h-2 rounded-full bg-neutral-200" />
                          <div className="text-xs text-neutral-500 font-medium mt-1 text-right">
                            {doneCount} of {totalCount} today
                          </div>
                        </div>
                      )}
                      <ul className="divide-y divide-neutral-100">
                        {planEventsDone[plan.id] && planEventsDone[plan.id].map((item, idx) => (
                          <li key={item.id || idx} className="flex items-center py-3 gap-3">
                            <button
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${item.done ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-pink-600 shadow-md' : 'border-neutral-300 bg-white hover:border-purple-400'}`}
                              onClick={() => handleToggleDone(plan.id, item.id || idx)}
                            >
                              {item.done && <Check className="w-4 h-4 text-white" />}
                            </button>
                            <div className={`flex-1 text-base ${item.done ? 'line-through text-neutral-400' : 'text-neutral-800 font-medium'}`}>{item.name}</div>
                            <div className="text-xs text-neutral-500 font-semibold ml-2">
                              {item.time
                                ? item.time
                                : item.hour !== undefined && item.minute !== undefined
                                ? `${item.hour.toString().padStart(2, '0')}:${item.minute.toString().padStart(2, '0')}`
                                : ''}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Goals</span>
                <span className="font-semibold">{goals.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Habits</span>
                <span className="font-semibold">{habits.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Communities</span>
                <span className="font-semibold">{communityGroups.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Posts Today</span>
                <span className="font-semibold">{feedItems.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">

          {/* Community Highlights */}
          {communityGroups.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Popular Communities</h2>
                <Link to="/community">
                  <Button variant="outline" size="sm">Explore All</Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {communityGroups.slice(0, 4).map((group) => (
                  <Card key={group.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-black mb-2">{group.name}</h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {group.description || 'Join this amazing community'}
                          </p>
                          <Link to={`/community/${group.id}`}>
                            <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600">
                              View Community
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Recent Posts */}
          {feedItems.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Recent Community Posts</h2>
                <Link to="/posts">
                  <Button variant="outline" size="sm">View All Posts</Button>
                </Link>
              </div>
              
              <div className="space-y-6">
                {feedItems.slice(0, 3).map((post) => (
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
                          <p className="text-gray-700 line-clamp-3">{post.content}</p>
                          <div className="flex items-center space-x-6 text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Heart className="w-4 h-4" />
                              <span>{post.likes_count || Math.floor(Math.random() * 50)}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <MessageSquare className="w-4 h-4" />
                              <span>{post.comments_count || Math.floor(Math.random() * 20)}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Motivational Quote */}
          <Card className="bg-gradient-to-r from-gray-900 to-black text-white">
            <CardContent className="p-8">
              <blockquote className="text-xl font-medium mb-4">
                "The groundwork for all happiness is good health."
              </blockquote>
              <p className="text-gray-300">
                — Leigh Hunt
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
