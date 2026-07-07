import type { DomainEvent } from "budget-core";

export type GhostSetupModule = {
  events: readonly DomainEvent[];
};
