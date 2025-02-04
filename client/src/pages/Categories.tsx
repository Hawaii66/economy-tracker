import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCategory } from "@/hooks/useCategory";
import { formatSEK } from "@/lib/utils";
import { useState } from "react";

export default function Categories() {
  const { categories, insertCategory } = useCategory();

  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [color, setColor] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col justify-center items-center gap-4 w-full">
      <h1>Categories</h1>
      <div className="flex flex-row flex-wrap justify-center items-center gap-2 px-12">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle>{category.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-row justify-start items-center gap-2">
              <div
                className="rounded-full w-4 h-4"
                style={{ backgroundColor: category.color }}
              />
              <p>{formatSEK(category.target)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Add category</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add category</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Name</Label>
            <Input
              disabled={loading}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Label>Target</Label>
            <Input
              type="number"
              disabled={loading}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
            <Label>Rename</Label>
            <Input
              type="color"
              disabled={loading}
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose />
            <Button
              onClick={async () => {
                setLoading(true);
                await insertCategory({
                  name,
                  color,
                  target: Math.round(parseInt(target) * 100),
                });
                setOpen(false);
                setLoading(false);
              }}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
