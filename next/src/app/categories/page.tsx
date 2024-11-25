import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CategoryEditDialog from "@/components/CategoryEditDialog";
import { Button } from "@/components/ui/button";
import { getCategories } from "@/lib/serverCategory";
import { colors } from "@/components/TagEditDialog";
import CategoryBadge from "@/components/CategoryBadge";
import { getTags } from "@/lib/serverTag";
import TagBadge from "@/components/TagBadge";
import { formatCentSEK } from "@/lib/format";

export default async function Page() {
  const categories = await getCategories();
  const tags = await getTags();

  return (
    <div className="flex flex-col justify-end items-end gap-2 px-12 py-12">
      <CategoryEditDialog
        isCreate
        category={{
          color: colors[0],
          description: "",
          name: "",
          expectedPerMonth: 0,
        }}
      >
        <Button variant={"outline"}>New Category</Button>
      </CategoryEditDialog>
      <Table className="border">
        <TableCaption>Categories</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Expected / month</TableHead>
            <TableHead>Tags</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((category) => (
              <CategoryEditDialog
                tags={tags}
                category={category}
                key={category.id}
              >
                <TableRow>
                  <TableCell>
                    <CategoryBadge category={category} />
                  </TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell>
                    {formatCentSEK(category.expectedPerMonth)}
                  </TableCell>
                  <TableCell className="flex flex-row flex-wrap gap-2">
                    {category.tags
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((tag) => (
                        <TagBadge tag={tag} key={tag.id} />
                      ))}
                  </TableCell>
                </TableRow>
              </CategoryEditDialog>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
