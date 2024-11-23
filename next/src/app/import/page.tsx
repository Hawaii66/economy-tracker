"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addNewCustomersFromCSV } from "@/lib/serverCustomers";
import { useState } from "react";

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);

    reader.readAsText(file);
  });
};

export default function Import() {
  const [file, setFile] = useState<File | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  return (
    <div>
      <Label>SEB File</Label>
      <Input
        type="file"
        accept=".csv"
        onChange={(e) =>
          setFile(e.target.files === null ? null : e.target.files[0])
        }
        disabled={isMutating}
      />
      <Button
        disabled={isMutating}
        onClick={async () => {
          if (!file) return;
          setIsMutating(true);

          const text = await readFileAsText(file);
          await addNewCustomersFromCSV(text);
          setIsMutating(false);
        }}
      >
        {isMutating ? "Loading" : "Process"}
      </Button>
    </div>
  );
}
