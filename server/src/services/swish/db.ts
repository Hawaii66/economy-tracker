import { eq } from "drizzle-orm";
import { db, swishRecipientsTable } from "src/drizzle/schema";
import { SwishRecipient } from "./types";
import { uuid } from "../utils";

export const getSwishRecipients = async (
  userId: string
): Promise<SwishRecipient[]> => {
  const recipients = await db
    .select()
    .from(swishRecipientsTable)
    .where(eq(swishRecipientsTable.userId, userId));

  return recipients.map((i) => ({
    id: i.id,
    name: i.name,
    swishNumber: i.swishNumber,
  }));
};

export const insertSwishRecipient = async (
  userId: string,
  name: string,
  swishNumber: string
): Promise<void> => {
  await db.insert(swishRecipientsTable).values({
    userId,
    name,
    swishNumber,
    id: uuid(),
  });
};
