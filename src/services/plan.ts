import axios from 'axios';

// Adjust this to match your actual API base URL
// declare const API_BASE_URL: string;

export interface PlanPayload {
  id?: string;
  userId?: string | number;
  goalId?: string;
  activity?: string;
  name?: string;
  activityTypeId?: string;
  customText?: string;
  start?: string;
  endDate?: string;
  taxonomyIds?: string[];
  mainTopic?: string;
  trackingTypes?: string[];
  calendarEvents?: any[];
  durationInWeeks?: number;
  state?: string;
  plannedEvents?: any[];
  reminders?: any[];
  activityTime?: string;
  activityWith?: string;
  contextRefs?: any[];
  reminderMsgBody?: string;
  plannedInfo?: any;
}

// You may want to set this from an env variable or config
const API_BASE_URL = 'http://localhost:3000/api';

export const planService = {
  // Get a single plan by ID
  getPlan: (planId: string, token: string) =>
    axios.get(`${API_BASE_URL}/plans/${planId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => res.data),

  // Get all plans for a user
  getPlansByUser: (userId: string | number, token: string) =>
    axios.get(`${API_BASE_URL}/plans/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => res.data),

  // Create a new plan
  createPlan: (payload: PlanPayload, token: string) =>
    axios.post(`${API_BASE_URL}/plan`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => res.data),

  // Update an existing plan
  updatePlan: (planId: string, payload: PlanPayload, token: string) =>
    axios.patch(`${API_BASE_URL}/plans/${planId}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => res.data),

  // End a plan (patch end date)
  endPlan: (planId: string, endDate: string, token: string) => {
    const patchPayload = [
      { op: 'replace', path: 'end', value: endDate },
    ];
    return axios.patch(`${API_BASE_URL}/plans/${planId}`, patchPayload, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => res.data);
  },
}; 