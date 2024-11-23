"use client";

import { useState } from "react";
import { Category } from "../../types/category";
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
import { onCreateCategory, onEditCategory } from "@/lib/serverCategory";
import { colors } from "./TagEditDialog";

type Props = PropsEdit | PropsCreate;

type PropsEdit = {
  category: Category;
  isCreate?: false;
};

type PropsCreate = {
  category: Omit<Category, "id">;
  isCreate: true;
};

export default function CategoryEditDialog({
  children,
  category,
  isCreate,
}: Props & Children) {
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description);
  const [color, setColor] = useState(category.color);
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
        </div>
        <DialogFooter>
          <DialogClose />
          <Button
            disabled={isMutating}
            onClick={async () => {
              setIsMutating(true);
              if (isCreate) {
                await onCreateCategory({ color, description, name });
              } else {
                await onEditCategory(category.id, { description, name, color });
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
