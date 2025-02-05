import Customer from "@/components/Customer";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategory } from "@/hooks/useCategory";
import { useCustomer } from "@/hooks/useCustomer";
import { useState } from "react";

export default function Customers() {
  const { customers, insertCustomer, insertCustomerDetection } = useCustomer();
  const { categories } = useCategory();

  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [category, setCategory] = useState("--none--");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col justify-center items-center gap-4 w-full">
      <h1>Customers</h1>
      <div className="flex flex-row flex-wrap justify-center items-center gap-2 px-12">
        {customers.map((customer) => (
          <Customer
            categories={categories}
            customer={customer}
            insertCustomerDetection={insertCustomerDetection}
            key={customer.id}
          />
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Add customer</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add customer</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Name</Label>
            <Input
              disabled={loading}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Label>Color</Label>
            <Input
              type="color"
              disabled={loading}
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
            <Label>Default Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="--none--">None</SelectItem>
                </SelectGroup>
                <SelectGroup>
                  {categories.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <DialogClose />
            <Button
              onClick={async () => {
                setLoading(true);
                await insertCustomer({
                  name,
                  color,
                  categoryId: category === "--none--" ? null : category,
                });
                setName("");
                setColor("");
                setCategory("--none--");
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
