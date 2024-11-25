import { getCategories } from "@/lib/serverCategory";
import Import from "./client";

export const dynamic = "force-dynamic";

export default async function Page() {
  const categories = await getCategories();

  return <Import categories={categories} />;
}
