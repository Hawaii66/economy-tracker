import { convexQuery } from '@convex-dev/react-query'
import { redirect } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { api } from '@economy-tracker/convex/api'

export async function fetchCurrentUser(queryClient: QueryClient) {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return await queryClient.fetchQuery(convexQuery(api.users.currentUser, {}))
  } catch {
    return null
  }
}

export async function requireAuth(
  queryClient: QueryClient,
  options?: { redirectHref?: string },
) {
  const user = await fetchCurrentUser(queryClient)
  if (!user) {
    throw redirect({
      to: '/sign-in',
      search: options?.redirectHref
        ? { redirect: options.redirectHref }
        : undefined,
    })
  }
  return user
}

export function getSafeRedirectPath(redirect: string | undefined) {
  if (redirect?.startsWith('/dashboard')) {
    return redirect
  }
  return '/dashboard'
}
