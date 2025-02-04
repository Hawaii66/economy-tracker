import { eq } from "drizzle-orm";
import { Request } from "express";
import { db, usersTable } from "src/drizzle/schema";

export const requestToUserId = async (request: Request): Promise<string> => {
  if (!("auth" in request) || !request.auth) {
    throw new Error("No auth");
  }

  if (typeof request.auth !== "object" || !("userId" in request.auth)) {
    throw new Error("No userId");
  }

  if (typeof request.auth.userId !== "string") {
    throw new Error("userId is not a string");
  }

  const clerkUserId = request.auth.userId;

  const [userId] = await db
    .select({
      userId: usersTable.id,
    })
    .from(usersTable)
    .where(eq(usersTable.clerkId, clerkUserId));

  return userId.userId;
};
