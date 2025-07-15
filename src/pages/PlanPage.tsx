
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, User, X, Edit2, Trash2 } from 'lucide-react';
import CreatePlanModal from '@/components/CreatePlanModal';
import { planService, PlanPayload } from '@/services/plan';
import { toast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';

const recommendedPlans = [
  {
    id: 1,
    name: 'A Peaceful Day',
    activities: [
      'Morning meditation',
      'Stretch for 10 minutes',
      'Read a book',
    ],
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    name: 'Back to Basics',
    activities: [
      'Go for a walk',
      'Take 5 breaths',
      'Drink water',
    ],
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    name: 'WFH Balance',
    activities: [
      'Morning stretch',
      'Healthy lunch',
      'Midday walk',
      'Evening reflection',
    ],
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80',
  },
];

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

function formatTime(time: string) {
  if (!time) return "";
  const [hour, minute] = time.split(":").map(Number);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}${minute === 0 ? "" : `:${minute}`} ${ampm}`;
}

const PlanPage = () => {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [myPlans, setMyPlans] = useState<any[]>([]);
  // Remove myPlan, myDailyPlan, planId
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editActivity, setEditActivity] = useState('');
  const [time, setTime] = useState(new Date());
  // Track done state for each plan's events: { [planId]: [{...event, done}] }
  const [planEventsDone, setPlanEventsDone] = useState<{ [planId: string]: any[] }>({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [planToEdit, setPlanToEdit] = useState(null);

  // Refresh the UI every minute to update checkbox enabled state
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch all user's plans on mount
  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const userId = getUserIdFromStorage();
        if (token && userId) {
          const plans = await planService.getPlansByUser(userId, token);
          setMyPlans(plans);
          // Initialize done state for each plan's events
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
        } else {
          setMyPlans([]);
          setPlanEventsDone({});
        }
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message || 'Failed to fetch plans.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleAddToMyPlan = async (plan: any) => {
    const token = localStorage.getItem('token');
    const userId = getUserIdFromStorage();
    if (!token || !userId) return;
    const now = new Date();
    const payload: PlanPayload = {
      userId,
      activity: plan.name,
      name: plan.name,
      plannedEvents: plan.activities.map((activity: string, idx: number) => ({
        name: activity,
        weekDay: idx + 1,
        hour: 8 + idx * 2,
        minute: 0,
        reminderEnabled: true,
      })),
      start: now.toISOString(),
      state: 'active',
      reminders: [],
    };
    try {
      setLoading(true);
      const created = await planService.createPlan(payload, token);
      setMyPlans(prev => [...prev, created]);
      setPlanEventsDone(prev => ({
        ...prev,
        [created.id]: (created.plannedEvents || created.planned_events || []).map((e: any, idx: number) => ({
          ...e,
          id: e.id || idx + 1,
          done: false,
        }))
      }));
      toast({
        title: 'Plan Created',
        description: 'Your plan was created successfully.',
      });
      setShowPlanModal(false);
      // Optionally refetch all plans
      const plans = await planService.getPlansByUser(userId, token);
      setMyPlans(plans);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create plan.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle done state for a plan's event
  const handleToggleDone = (planId: string, eventId: number) => {
    setPlanEventsDone(prev => ({
      ...prev,
      [planId]: prev[planId].map((item, idx) =>
        (item.id || idx) === eventId ? { ...item, done: !item.done } : item
      )
    }));
  };

  const handleCreatePlan = async (planData: PlanPayload) => {
    const token = localStorage.getItem('token');
    const userId = getUserIdFromStorage();
    if (!token || !userId) return;
    const now = new Date();
    const payload: PlanPayload = {
      ...planData,
      userId,
      start: planData.start || now.toISOString(),
      state: planData.state || 'active',
      reminders: planData.reminders || [],
    };
    try {
      setLoading(true);
      const created = await planService.createPlan(payload, token);
      setMyPlans(prev => [...prev, created]);
      setPlanEventsDone(prev => ({
        ...prev,
        [created.id]: (created.plannedEvents || created.planned_events || []).map((e: any, idx: number) => ({
          ...e,
          id: e.id || idx + 1,
          done: false,
        }))
      }));
      toast({
        title: 'Plan Created',
        description: 'Your plan was created successfully.',
      });
      setShowCreateModal(false);
      // Optionally refetch all plans
      const plans = await planService.getPlansByUser(userId, token);
      setMyPlans(plans);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create plan.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Update plan (full plan update)
  const handleEditPlan = async (planData: PlanPayload) => {
    const token = localStorage.getItem('token');
    if (!token || !planData.id) return;
    try {
      setLoading(true);
      const updated = await planService.updatePlan(planData.id, planData, token);
      setMyPlans((prev) => prev.map(plan => plan.id === planData.id ? { ...plan, ...updated } : plan));
      toast({
        title: 'Plan Updated',
        description: 'Your plan was updated successfully.',
      });
      setShowEditModal(false);
      setPlanToEdit(null);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update plan.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // End plan
  const handleEndPlan = async (planId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      setLoading(true);
      const endDate = new Date().toISOString();
      await planService.endPlan(planId, endDate, token);
      setMyPlans((prev) => prev.filter(plan => plan.id !== planId));
      setPlanEventsDone((prev) => {
        const copy = { ...prev };
        delete copy[planId];
        return copy;
      });
      toast({
        title: 'Plan Ended',
        description: 'Your plan has been ended.',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to end plan.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f7f8fa] to-[#f0f4ff] py-8 px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 px-4 sm:px-8 w-full gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-md">
            <User className="text-white w-7 h-7" />
          </div>
          <span className="text-3xl font-extrabold text-neutral-900 tracking-tight">Plan</span>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg px-8 py-3 hover:from-purple-700 hover:to-pink-700 text-lg shadow-md transition-all" onClick={() => setShowCreateModal(true)}>
          + Create Plan
        </Button>
      </div>

      {/* Main Content: Responsive Grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 sm:px-8">
        {/* Left: Recommended Plans */}
        <div className="col-span-1 flex flex-col gap-6">
          <h2 className="text-lg font-bold text-neutral-800 mb-2 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-purple-500" />Recommended Plans</h2>
          <div className="flex flex-col gap-5">
            {recommendedPlans.map((plan) => (
              <div
                key={plan.id}
                className="rounded-2xl overflow-hidden shadow-lg bg-white relative cursor-pointer transition-transform hover:scale-[1.025] group"
                style={{ minHeight: 110 }}
                onClick={() => {
                  setSelectedPlan(plan);
                  setShowPlanModal(true);
                }}
              >
                <img
                  src={plan.image}
                  alt={plan.name}
                  className="w-full h-32 object-cover object-center group-hover:opacity-80 transition-opacity"
                  onError={e => (e.currentTarget.src = 'https://via.placeholder.com/400x120?text=Plan')}
                />
                <div className="absolute top-4 left-5 text-white text-xl font-bold drop-shadow-lg">
                  {plan.name}
                </div>
                <div className="absolute top-4 right-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-4 py-1 rounded-full shadow-md font-semibold">
                  {plan.activities.length} Activities
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center/Right: My Daily Plan */}
        <div className="col-span-1 md:col-span-1 lg:col-span-2 flex flex-col gap-6">
          <h2 className="text-lg font-bold text-neutral-800 mb-2 flex items-center gap-2"><User className="w-5 h-5 text-pink-500" />My Daily Plan</h2>
          <Card className="rounded-2xl shadow-lg p-0 overflow-hidden bg-white">
            {loading ? (
              <div className="bg-neutral-100 text-neutral-500 text-center py-12 rounded-2xl">
                <div className="text-lg font-semibold mb-2">Loading...</div>
              </div>
            ) : myPlans.length === 0 ? (
              <div className="bg-neutral-100 text-neutral-500 text-center py-12 rounded-2xl">
                <div className="text-lg font-semibold mb-2">Your Plan is empty</div>
                <div className="text-base">Tap a recommended plan to start adding activities</div>
              </div>
            ) : (
              <div className="flex flex-col gap-10">
                {myPlans.map((plan) => {
                  const doneCount = planEventsDone[plan.id]?.filter((a: any) => a.done).length || 0;
                  const totalCount = planEventsDone[plan.id]?.length || 0;
                  return (
                    <div key={plan.id} className="mb-4 border-b pb-4 last:border-b-0 last:pb-0">
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 text-neutral-800 px-6 py-4 flex flex-col rounded-t-2xl">
                        <span className="font-bold text-xl mb-1">{plan.name || plan.activity}</span>
                        <span className="text-xs text-neutral-500 mb-1">
                          Start: {plan.start ? new Date(plan.start).toLocaleDateString() : 'N/A'}
                        </span>
                        <span className="text-xs text-neutral-500 mb-2">
                          State: {plan.state}
                        </span>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="outline" className="border-purple-500 text-purple-600 hover:bg-purple-50" onClick={() => {
                            setPlanToEdit(plan);
                            setShowEditModal(true);
                          }}><Edit2 className="w-4 h-4 mr-1" />Edit</Button>
                          <Button size="sm" variant="destructive" className="bg-gradient-to-r from-pink-600 to-red-500 text-white hover:from-pink-700 hover:to-red-600" onClick={() => handleEndPlan(plan.id)}><Trash2 className="w-4 h-4 mr-1" />End Plan</Button>
                        </div>
                      </div>
                      {/* Progress Bar */}
                      {totalCount > 0 && (
                        <div className="px-6 pt-3 pb-1">
                          <Progress value={doneCount / totalCount * 100} className="h-2 rounded-full bg-neutral-200" />
                          <div className="text-xs text-neutral-500 font-medium mt-1 text-right">
                            {doneCount} of {totalCount} today
                          </div>
                        </div>
                      )}
                      <ul className="divide-y divide-neutral-100">
                        {planEventsDone[plan.id] && planEventsDone[plan.id].map((item, idx) => (
                          <li key={item.id || idx} className="flex items-center px-6 py-4 gap-4">
                            <button
                              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${item.done ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-pink-600 shadow-md' : 'border-neutral-300 bg-white hover:border-purple-400'}`}
                              onClick={() => handleToggleDone(plan.id, item.id || idx)}
                            >
                              {item.done && <CheckCircle className="w-5 h-5 text-white" />}
                            </button>
                            <div className={`flex-1 text-lg ${item.done ? 'line-through text-neutral-400' : 'text-neutral-800 font-medium'}`}>{item.name}</div>
                            <div className="text-xs text-neutral-500 font-semibold ml-2">
                              {item.time
                                ? formatTime(item.time)
                                : item.hour !== undefined && item.minute !== undefined
                                ? formatTime(`${item.hour.toString().padStart(2, '0')}:${item.minute.toString().padStart(2, '0')}`)
                                : ''}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Plan Details Modal */}
      {showPlanModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-all duration-300" onClick={() => setShowPlanModal(false)}>
          <div
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 relative animate-fadeIn"
            onClick={e => e.stopPropagation()}
          >
            <button className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600" onClick={() => setShowPlanModal(false)}>
              <X className="w-5 h-5" />
            </button>
            <img src={selectedPlan.image} alt={selectedPlan.name} className="w-full h-36 object-cover rounded-xl mb-6" onError={e => (e.currentTarget.src = 'https://via.placeholder.com/400x120?text=Plan')} />
            <h3 className="text-2xl font-bold mb-3 text-neutral-900">{selectedPlan.name}</h3>
            <p className="text-neutral-600 mb-6 text-base">A plan to help you {selectedPlan.name === 'Back to Basics' ? 'get back to the basics of finding your rhythm' : 'enjoy your day with wellness activities'}.</p>
            <ul className="mb-8 space-y-3">
              {selectedPlan.activities.map((activity: string, idx: number) => (
                <li key={idx} className="flex items-center gap-3 text-neutral-800 text-lg">
                  <CheckCircle className="w-6 h-6 text-purple-300" />
                  {activity}
                </li>
              ))}
            </ul>
            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-lg rounded-lg py-3 hover:from-purple-700 hover:to-pink-700 shadow-md" onClick={() => handleAddToMyPlan(selectedPlan)}>
              Add to My Plan
            </Button>
          </div>
        </div>
      )}

      {/* Create Plan Modal */}
      <CreatePlanModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSave={handleCreatePlan} />
      <CreatePlanModal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setPlanToEdit(null); }} onSave={handleEditPlan} initialPlan={planToEdit} isEdit={true} />
    </div>
  );
};

export default PlanPage;
