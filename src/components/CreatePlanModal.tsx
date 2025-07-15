
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

const weekDays = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
];

const defaultEvent = {
  name: '',
  weekDay: 1,
  hour: 8,
  minute: 0,
  reminderEnabled: true,
};

const CreatePlanModal = ({ isOpen, onClose, onSave, initialPlan = null, isEdit = false }) => {
  const [name, setName] = useState('');
  const [activity, setActivity] = useState('');
  const [start, setStart] = useState(() => new Date().toISOString().slice(0, 16)); // yyyy-MM-ddTHH:mm
  const [state, setState] = useState('active');
  const [plannedEvents, setPlannedEvents] = useState([{ ...defaultEvent }]);
  // reminders can be left as empty array for now
  const userId = getUserIdFromStorage();

  // Pre-fill fields if editing
  useEffect(() => {
    if (isOpen && initialPlan) {
      setName(initialPlan.name || '');
      setActivity(initialPlan.activity || '');
      setStart(initialPlan.start ? new Date(initialPlan.start).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16));
      setState(initialPlan.state || 'active');
      setPlannedEvents(
        (initialPlan.plannedEvents || initialPlan.planned_events || []).map(e => ({ ...e }))
      );
    } else if (isOpen && !initialPlan) {
      setName('');
      setActivity('');
      setStart(new Date().toISOString().slice(0, 16));
      setState('active');
      setPlannedEvents([{ ...defaultEvent }]);
    }
  }, [isOpen, initialPlan]);

  const handleEventChange = (idx, field, value) => {
    setPlannedEvents(events =>
      events.map((ev, i) => (i === idx ? { ...ev, [field]: value } : ev))
    );
  };

  const handleAddEvent = () => {
    setPlannedEvents(events => [...events, { ...defaultEvent }]);
  };

  const handleRemoveEvent = (idx) => {
    setPlannedEvents(events => events.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (!name || !activity || plannedEvents.some(ev => !ev.name)) return;
    const payload = {
      userId,
      name,
      activity,
      plannedEvents,
      start: new Date(start).toISOString(),
      state,
      reminders: [],
      ...(isEdit && initialPlan && initialPlan.id ? { id: initialPlan.id } : {}),
    };
    onSave(payload);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Wellness Plan' : 'Create New Wellness Plan'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update your plan details below.' : 'Set up a new goal or habit to track your wellness journey.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Plan Name</Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="col-span-3"
              placeholder="Enter plan name"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="activity" className="text-right">Activity</Label>
            <Input
              id="activity"
              value={activity}
              onChange={e => setActivity(e.target.value)}
              className="col-span-3"
              placeholder="e.g. WFH Balance"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start" className="text-right">Start Date/Time</Label>
            <Input
              id="start"
              type="datetime-local"
              value={start}
              onChange={e => setStart(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="state" className="text-right">State</Label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="ended">Ended</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-2 block">Planned Events</Label>
            <div className="space-y-4">
              {plannedEvents.map((event, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end border p-2 rounded-md mb-2 bg-gray-50">
                  <div className="col-span-3">
                    <Input
                      placeholder="Event name"
                      value={event.name}
                      onChange={e => handleEventChange(idx, 'name', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Select
                      value={String(event.weekDay)}
                      onValueChange={val => handleEventChange(idx, 'weekDay', Number(val))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Weekday" />
                      </SelectTrigger>
                      <SelectContent>
                        {weekDays.map(day => (
                          <SelectItem key={day.value} value={String(day.value)}>{day.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min={0}
                      max={23}
                      placeholder="Hour"
                      value={event.hour}
                      onChange={e => handleEventChange(idx, 'hour', Number(e.target.value))}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min={0}
                      max={59}
                      placeholder="Minute"
                      value={event.minute}
                      onChange={e => handleEventChange(idx, 'minute', Number(e.target.value))}
                    />
                  </div>
                  <div className="col-span-2 flex items-center">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={event.reminderEnabled}
                        onChange={e => handleEventChange(idx, 'reminderEnabled', e.target.checked)}
                      />
                      <span>Reminder</span>
                    </label>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {plannedEvents.length > 1 && (
                      <Button variant="destructive" size="sm" onClick={() => handleRemoveEvent(idx)}>
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={handleAddEvent}>
                + Add Event
              </Button>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name || !activity || plannedEvents.some(ev => !ev.name)}
          >
            {isEdit ? 'Update Plan' : 'Create Plan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePlanModal;
