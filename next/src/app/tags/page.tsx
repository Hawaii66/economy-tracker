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
import { Button } from "@/components/ui/button";
import TagEditDialog, { colors } from "@/components/TagEditDialog";
import { getTags } from "@/lib/serverTag";

export default async function Page() {
  const tags = await getTags();

  return (
    <div className="flex flex-col justify-end items-end gap-2 px-12 py-12">
      <TagEditDialog
        isCreate
        tag={{ color: colors[0], description: "", name: "" }}
      >
        <Button variant={"outline"}>New Tag</Button>
      </TagEditDialog>
      <Table className="border">
        <TableCaption>Tags</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tags
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((tag) => (
              <TagEditDialog tag={tag} key={tag.id}>
                <TableRow>
                  <TableCell>
                    <Badge style={{ backgroundColor: tag.color }}>
                      {tag.name}
                    </Badge>
                  </TableCell>
                  <TableCell>{tag.description}</TableCell>
                </TableRow>
              </TagEditDialog>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
