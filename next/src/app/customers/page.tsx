import CategoryBadge from "@/components/CategoryBadge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCustomers } from "@/lib/serverCustomers";

export const dynamic = "force-dynamic";

export default async function Customers() {
  const customers = await getCustomers();

  return (
    <div className="flex flex-col justify-end items-end gap-2 px-12 py-12">
      <Table className="border">
        <TableCaption>Categories</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Rename</TableHead>
            <TableHead>Category</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.type.toUpperCase()}</TableCell>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.rename}</TableCell>
                <TableCell>
                  {customer.category && (
                    <CategoryBadge category={customer.category} />
                  )}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
