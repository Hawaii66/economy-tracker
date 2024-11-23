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
import CategoryEditDialog from "@/components/CategoryEditDialog";
import { Button } from "@/components/ui/button";
import { getCategories } from "@/lib/serverCategory";
import { colors } from "@/components/TagEditDialog";

export default async function Page() {
  const categories = await getCategories();

  return (
    <div className="flex flex-col justify-end items-end gap-2 px-12 py-12">
      <CategoryEditDialog
        isCreate
        category={{ color: colors[0], description: "", name: "" }}
      >
        <Button variant={"outline"}>New Category</Button>
      </CategoryEditDialog>
      <Table className="border">
        <TableCaption>Categories</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((category) => (
              <CategoryEditDialog category={category} key={category.id}>
                <TableRow>
                  <TableCell>
                    <Badge style={{ backgroundColor: category.color }}>
                      {category.name}
                    </Badge>
                  </TableCell>
                  <TableCell>{category.description}</TableCell>
                </TableRow>
              </CategoryEditDialog>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
