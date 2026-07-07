# Ghost tests

Ghost tests replay a fixed event sequence and compare the resulting budget state to a saved JSON file.

## Layout

Each scenario lives in its own folder under `packages/budget-core-test/ghost/`:

```
ghost/
  my-scenario/
    setup.ts       # exports the event sequence
    expected.json  # golden output (generated)
```

`tests/ghost.test.ts` discovers every `ghost/*/setup.ts` folder and runs it automatically. You do not need to add a new test file per scenario.

## Create a ghost test

1. Create a folder: `packages/budget-core-test/ghost/my-scenario/`
2. Add `setup.ts` that exports an `events` array:

```ts
import { accountAddedEvent } from "../../helpers/domain-event.js";

export const events = [
  accountAddedEvent({
    sequenceNumber: 1,
    userId: "user-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    payload: {
      accountId: "acct-checking",
      name: "Checking",
      openingBalance: 0,
      currency: "SEK",
      genesisDate: "2026-01-01",
    },
  }),
];
```

3. Generate the golden file:

```bash
cd packages/budget-core-test
pnpm test:ghost:update
```

This writes `expected.json` next to `setup.ts`. Commit both files.

## Run tests

```bash
cd packages/budget-core-test
pnpm test
```

If the replayed state differs from `expected.json`, the ghost test fails. When the change is intentional, run `pnpm test:ghost:update` and commit the updated JSON.
