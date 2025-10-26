'use server';

import { clearAuthCookie } from './auth';
import { redirect } from 'next/navigation';

export async function logoutAction() {
  await clearAuthCookie();
  redirect('/login');
}