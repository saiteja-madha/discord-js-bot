// src/pages/api/guilds/refresh.ts
import type { APIRoute } from 'astro';
import { clearGuildsCache } from '@/lib/data-utils';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();
    const redirectUrl = formData.get('redirect')?.toString() || '/dashboard';

    await clearGuildsCache();

    return redirect(redirectUrl);
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to refresh guilds' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
