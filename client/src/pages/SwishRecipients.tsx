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
import { useSwish } from "@/hooks/useSwish";
import { useState } from "react";

export default function SwishRecipients() {
  const { insertRecipient, recipients } = useSwish();

  const [name, setName] = useState("");
  const [swishNumber, setSwishNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col justify-center items-center gap-4 w-full">
      <h1>Swish Recipients</h1>
      <div className="flex flex-row flex-wrap justify-center items-center gap-2 px-12">
        {recipients.map((recipient) => (
          <Card key={recipient.id}>
            <CardHeader>
              <CardTitle>{recipient.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{recipient.swishNumber}</p>
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
            <Label>Swish number</Label>
            <Input
              disabled={loading}
              value={swishNumber}
              onChange={(e) => setSwishNumber(e.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose />
            <Button
              onClick={async () => {
                setLoading(true);
                await insertRecipient({ name, swishNumber });
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
