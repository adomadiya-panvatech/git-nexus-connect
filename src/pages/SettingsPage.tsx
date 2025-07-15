
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, User, Bell, Settings as SettingsIcon, Shield, LogOut } from 'lucide-react';

const SettingsPage = () => {
  const settingsOptions = [
    {
      icon: User,
      title: 'Account',
      description: 'Manage your account settings',
      color: 'text-blue-600'
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Control your notification preferences',
      color: 'text-green-600'
    },
    {
      icon: SettingsIcon,
      title: 'Preferences',
      description: 'Customize your app experience',
      color: 'text-purple-600'
    },
    {
      icon: Shield,
      title: 'Privacy',
      description: 'Manage your privacy settings',
      color: 'text-orange-600'
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account and app preferences</p>
      </div>

      {/* Settings Options */}
      <div className="space-y-4 mb-8">
        {settingsOptions.map((option, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center`}>
                    <option.icon className={`w-5 h-5 ${option.color}`} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${option.color}`}>{option.title}</h3>
                    <p className="text-gray-600 text-sm">{option.description}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sign Out */}
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-600">Sign out</h3>
                <p className="text-gray-600 text-sm">Sign out of your account</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </CardContent>
      </Card>

      {/* App Info */}
      <div className="mt-12 text-center text-gray-500">
        <p className="text-sm">WELLNESS App v1.0.0</p>
        <p className="text-xs mt-2">Made with ❤️ for your wellness journey</p>
      </div>
    </div>
  );
};

export default SettingsPage;
