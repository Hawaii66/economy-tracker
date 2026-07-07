import { useMutation } from 'convex/react'
import { api } from '@economy-tracker/convex/api'
import type { Id } from '@economy-tracker/convex/dataModel'

type ClientEvent = {
  eventType: string
  payload: Record<string, unknown>
}

export function useAppendBudgetEvents(budgetId: Id<'budgets'>) {
  const appendEvents = useMutation(api.budgets.appendEvents)

  return async function submitEvents(events: ClientEvent[]) {
    if (events.length === 0) {
      return
    }

    await appendEvents({ budgetId, events })
  }
}
