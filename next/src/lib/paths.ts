import { revalidatePath } from "next/cache";

export const Path = {
  home: "/",
  categories: "/categories",
  tags: "/tags",
  customers: "/customers",
  import: "/import",
  pendingTransactions: "/pending-transactions",
  transactions: "/transactions",
};

type Path = keyof typeof Path;

export const revalidatePaths = (paths: Path[]) => {
  paths.forEach((p) => revalidatePath(p));
};

export const revalidateAll = () =>
  revalidatePaths([
    "home",
    "categories",
    "tags",
    "customers",
    "import",
    "pendingTransactions",
    "transactions",
  ]);
