'use server';

import { clearAuthCookie, setAuthCookie } from './auth';
import { redirect } from 'next/navigation';

export async function logoutAction() {
  await clearAuthCookie();
  redirect('/login');
}

export async function loginAction() {
  await setAuthCookie();
  redirect('/channel/1');
}