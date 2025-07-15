
import { api } from './api';

export interface ActivityCategory {
  id: number;
  name: string;
  description?: string;
}

export interface ActivityType {
  id: number;
  name: string;
  category_id?: number;
}

export interface ActivityList {
  id: number;
  name: string;
  description?: string;
  activities?: any[];
}

export interface Goal {
  id: number;
  title: string;
  description?: string;
  target_value?: number;
  current_value?: number;
}

export interface GoalTemplate {
  id: number;
  name: string;
  description?: string;
  category_id?: number;
}

export const planService = {
  // Activity related
  getActivityCategories: () => api.get<ActivityCategory[]>('/activity-categories'),
  getActivityTypes: () => api.get<ActivityType[]>('/activity-types'),
  getActivityLists: () => api.get<ActivityList[]>('/activity-lists'),
  getActivityListTemplates: () => api.get<any[]>('/activity-list-templates'),
  
  // Goals related
  getGoals: () => api.get<Goal[]>('/goals'),
  getGoalTemplates: () => api.get<GoalTemplate[]>('/goal-templates'),
  getGoalCategories: () => api.get<any[]>('/goal-categories'),
  
  // Habits
  getHabits: () => api.get<any[]>('/habits'),
  
  // Mock function for UI interactions (no actual API calls)
  createPlan: async (planData: any) => {
    console.log('Mock create plan:', planData);
    return Promise.resolve({ id: Date.now(), ...planData });
  },

  getPlansByUser: (userId: number) => api.get<any[]>(`/plan/owned-by/${userId}`),
};
