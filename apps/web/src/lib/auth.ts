import { convexQuery } from '@convex-dev/react-query'
import { redirect } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { api } from '@economy-tracker/convex/api'

export async function fetchCurrentUser(queryClient: QueryClient) {
  return queryClient.fetchQuery(convexQuery(api.users.currentUser, {}))
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
