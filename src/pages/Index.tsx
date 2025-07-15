import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/components/LoginPage';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import PlanPage from '@/pages/PlanPage';
import CommunityPage from '@/pages/CommunityPage';
import CommunityDetailPage from '@/pages/CommunityDetailPage';
import PostsPage from '@/pages/PostsPage';
import ProfilePage from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Retrieve from localStorage on initial load
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const handleLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Layout onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/plan" element={<PlanPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/community/:communityId" element={<CommunityDetailPage />} />
        <Route path="/posts" element={<PostsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default Index;
