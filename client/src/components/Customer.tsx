import { Category, Customer as CustomerType } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Button } from "./ui/button";

type Props = {
  customer: CustomerType;
  categories: Category[];
  insertCustomerDetection: (categoryId: string, name: string) => void;
};

export default function Customer({
  customer,
  categories,
  insertCustomerDetection,
}: Props) {
  const [open, setOpen] = useState(false);
  const [detection, setDetection] = useState("");

  return (
    <Dialog key={customer.id} open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Card>
          <CardHeader>
            <CardTitle>{customer.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-start items-center gap-2">
            <div className="flex flex-row justify-center items-center gap-4">
              <div
                className="rounded-full w-4 h-4"
                style={{ backgroundColor: customer.color }}
              />
              <p>
                {customer.categoryId &&
                  categories.find((i) => i.id === customer.categoryId)?.name}
              </p>
            </div>
            {customer.detections.map((i) => (
              <p key={i}>- {i}</p>
            ))}
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{customer.name}</DialogTitle>
        </DialogHeader>
        <Label>Detection</Label>
        <Input
          value={detection}
          onChange={(e) => setDetection(e.target.value)}
        />
        <DialogFooter>
          <DialogClose />
          <Button
            onClick={async () => {
              await insertCustomerDetection(customer.id, detection);
              setDetection("");
              setOpen(false);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
