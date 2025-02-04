import { insertCategory as _insertCategory, getCategories } from "@/lib/api";
import { Category } from "@/types";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";

export const useCategory = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const { getToken } = useAuth();

  const load = async () => {
    const response = await getCategories(getToken);
    setCategories(response);
  };

  const insertCategory = async (
    data: Pick<Category, "name" | "color" | "target">
  ) => {
    await _insertCategory(data, getToken);
    await load();
  };

  useEffect(() => {
    load();
  }, []);

  return {
    categories,
    refetch: load,
    insertCategory,
  };
};
