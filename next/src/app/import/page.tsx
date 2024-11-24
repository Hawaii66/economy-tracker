import { getCategories } from "@/lib/serverCategory";
import Import from "./client";

export default async function Page() {
  const categories = await getCategories();

  return <Import categories={categories} />;
}
