"use client";

import { useState } from "react";
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
import { Tag } from "../../types/tag";
import { onCreateTag, onEditTag } from "@/lib/serverTag";

type Props = PropsEdit | PropsCreate;

type PropsEdit = {
  tag: Tag;
  isCreate?: false;
};

type PropsCreate = {
  tag: Omit<Tag, "id">;
  isCreate: true;
};

export const colors = [
  "#9ABF80",
  "#6A669D",
  "#FFE6A9",
  "#659287",
  "#80C4E9",
  "#FF7F3E",
  "#F6D6D6",
  "#78B3CE",
  "#AE445A",
  "#4B4376",
  "#219B9D",
  "#FAB12F",
];

export default function TagEditDialog({
  children,
  tag,
  isCreate,
}: Props & Children) {
  const [name, setName] = useState(tag.name);
  const [description, setDescription] = useState(tag.description);
  const [color, setColor] = useState(tag.color);
  const [isMutating, setIsMutating] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isCreate ? "Create Tag" : "Edit Tag"}</DialogTitle>
          <DialogDescription>
            {isCreate
              ? "Create a new tag to connect transactions to"
              : `Edit ${tag.name}`}
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
                await onCreateTag({ color, description, name });
              } else {
                await onEditTag(tag.id, { description, name, color });
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
