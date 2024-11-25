"use client";

import { useState } from "react";
import { Category, CategoryWithTags } from "../../types/category";
import { Children } from "../../types/children";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  onAddTag,
  onCreateCategory,
  onEditCategory,
  onRemoveTag,
} from "@/lib/serverCategory";
import { colors } from "./TagEditDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Plus, Trash } from "lucide-react";
import { Tag } from "../../types/tag";
import TagBadge from "./TagBadge";

type Props = PropsEdit | PropsCreate;

type PropsEdit = {
  category: CategoryWithTags;
  isCreate?: false;
  tags: Tag[];
};

type PropsCreate = {
  category: Omit<Category, "id">;
  isCreate: true;
  tags?: undefined;
};

export default function CategoryEditDialog({
  children,
  category,
  isCreate,
  tags,
}: Props & Children) {
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description);
  const [color, setColor] = useState(category.color);
  const [perMonth, setPerMonth] = useState(
    category.expectedPerMonth.toString()
  );
  const [tagId, setTagId] = useState<Tag["id"] | undefined>(undefined);
  const [isMutating, setIsMutating] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isCreate ? "Create Category" : "Edit Category"}
          </DialogTitle>
          <DialogDescription>
            {isCreate
              ? "Create a new category to connect transactions to"
              : `Edit ${category.name}`}
          </DialogDescription>
        </DialogHeader>
        <div className="items-center gap-y-2 grid grid-cols-2">
          <Label>Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
          />
          <Label>Description</Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
          />
          <Label>Expected / month</Label>
          <Input
            min={0}
            value={perMonth}
            onChange={(e) => setPerMonth(e.target.value)}
            placeholder="Expected / month"
          />
          <Label>Color</Label>
          <div className="flex flex-row flex-wrap gap-1">
            {colors.map((colorInArray) => (
              <div
                className="flex justify-center items-center border-4 rounded-full w-8 h-8"
                style={{ borderColor: colorInArray }}
                key={colorInArray}
                onClick={() => setColor(colorInArray)}
              >
                <div
                  style={{
                    backgroundColor: colorInArray === color ? color : undefined,
                  }}
                  className="rounded-full w-3 h-3"
                />
              </div>
            ))}
          </div>
          {!isCreate && (
            <>
              <Label>Add tag</Label>
              <Select value={tagId} onValueChange={setTagId}>
                <div className="flex flex-row gap-2">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <Button
                    disabled={!tagId}
                    onClick={async () => {
                      if (!tagId) return;

                      setIsMutating(true);
                      await onAddTag(category.id, tagId);
                      setIsMutating(false);
                      setTagId(undefined);
                    }}
                    variant={"secondary"}
                  >
                    {isMutating ? "" : <Plus />}
                  </Button>
                </div>

                <SelectContent>
                  {tags
                    .filter(
                      (i) => !category.tags.map((i) => i.id).includes(i.id)
                    )
                    .map((tag) => (
                      <SelectItem key={tag.id} value={tag.id}>
                        <TagBadge tag={tag} />
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Label>Tags</Label>
              <div className="flex flex-row flex-wrap gap-1">
                {category.tags.map((tag) => (
                  <TagBadge
                    key={tag.id}
                    onClick={async () => {
                      setIsMutating(true);
                      await onRemoveTag(category.id, tag.id);
                      setIsMutating(false);
                    }}
                    className="cursor-pointer group"
                    tag={tag}
                  >
                    <Trash
                      size={12}
                      className="group-hover:scale-110 group-hover:text-red-500 transition-all"
                    />
                  </TagBadge>
                ))}
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <DialogClose />
          <Button
            disabled={isMutating}
            onClick={async () => {
              setIsMutating(true);
              if (isCreate) {
                await onCreateCategory({
                  color,
                  description,
                  name,
                  expectedPerMonth: parseInt(perMonth) * 100,
                });
              } else {
                await onEditCategory(category.id, {
                  description,
                  name,
                  color,
                  expectedPerMonth: parseInt(perMonth) * 100,
                });
              }
              setIsMutating(false);
            }}
          >
            {isMutating ? "Loading" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
