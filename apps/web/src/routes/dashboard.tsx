import { createFileRoute } from '@tanstack/react-router'
import DashboardShell from '@/components/DashboardShell'
import { requireAuth } from '@/lib/auth'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async ({ context, location }) => {
    const user = await requireAuth(context.queryClient, {
      redirectHref: location.href,
    })
    return { user }
  },
  component: DashboardLayout,
})

function DashboardLayout() {
  const { user } = Route.useRouteContext()

  return <DashboardShell user={user} />
}
