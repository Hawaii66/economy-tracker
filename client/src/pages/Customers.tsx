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
import { useCustomer } from "@/hooks/useCustomer";
import { useState } from "react";

export default function Customers() {
  const { customers, insertCustomer } = useCustomer();

  const [name, setName] = useState("");
  const [rename, setRename] = useState("");
  const [color, setColor] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col justify-center items-center gap-4 w-full">
      <h1>Customers</h1>
      <div className="flex flex-row flex-wrap justify-center items-center gap-2 px-12">
        {customers.map((customer) => (
          <Card key={customer.id}>
            <CardHeader>
              <CardTitle>{customer.rename}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-row justify-start items-center gap-2">
              <div
                className="rounded-full w-4 h-4"
                style={{ backgroundColor: customer.color }}
              />
              <p>{customer.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Add recipient</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add recipient</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Name</Label>
            <Input
              disabled={loading}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Label>Rename</Label>
            <Input
              disabled={loading}
              value={rename}
              onChange={(e) => setRename(e.target.value)}
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
                console.log(color);
                setLoading(true);
                await insertCustomer({ name, color, rename });
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
