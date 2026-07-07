import {
  INITIAL_BUDGET_STATE,
  replayBudgetEvents,
  type BudgetState,
  type DomainEvent,
} from "budget-core";

export function replaySequence(events: readonly DomainEvent[]): BudgetState {
  return replayBudgetEvents(INITIAL_BUDGET_STATE, events);
}
