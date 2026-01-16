'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// --- SIGNUP ACTION ---
export async function signup(prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const full_name = formData.get('full_name') as string;
  const phone = formData.get('phone') as string;
  const role = formData.get('role') as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
        phone,
        role,
      },
    },
  });

  if (error) {
    return { error: error.message, success: false };
  }
  
  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

// --- LOGIN ACTION ---
export async function login(prevState: unknown, formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard') // Redirect to your secured page
}

// --- LOGOUT ACTION ---
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  revalidatePath('/', 'layout')
  redirect('/login')
}