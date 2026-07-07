import { query } from "./_generated/server.js";

export const ping = query({
  args: {},
  handler: async () => {
    return { ok: true as const };
  },
});
