import { db } from "@/lib/db";
import { DBCategory } from "../../../types/Database";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function Page() {
  const sql = await db();
  const categories = await sql.query<DBCategory>("SELECT * FROM categories");

  return (
    <div className="px-12 py-12">
      <Table className="border">
        <TableCaption>Categories</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.rows.map((cateogry) => (
            <TableRow key={cateogry.id}>
              <TableCell>
                <Badge style={{ backgroundColor: cateogry.color }}>
                  {cateogry.name}
                </Badge>
              </TableCell>
              <TableCell>{cateogry.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
