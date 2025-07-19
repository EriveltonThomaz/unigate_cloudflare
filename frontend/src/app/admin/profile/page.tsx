import React from 'react';
import ProfileClientPage from './ProfileClientPage';
import { getUserProfile } from '@/services/admin.service';

export default async function ProfileServerPage() {
  const userProfile = await getUserProfile();

  return <ProfileClientPage initialProfile={userProfile} />;
}