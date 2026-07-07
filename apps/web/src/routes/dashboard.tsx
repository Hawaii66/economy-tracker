import { createFileRoute, Outlet } from '@tanstack/react-router'
import DashboardHeader from '@/components/DashboardHeader'
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

  return (
    <>
      <DashboardHeader user={user} />
      <Outlet />
    </>
  )
}
