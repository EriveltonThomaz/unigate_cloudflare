'use server';

import { updateUserProfile as serviceUpdateUserProfile } from '@/services/admin.service';
import { User } from '@/lib/definitions';

export async function updateUserProfile(userData: Partial<Pick<User, 'name' | 'email'>>): Promise<User> {
  return serviceUpdateUserProfile(userData);
}