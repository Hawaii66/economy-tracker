"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import {
  ImportedCustomer,
  ImportedCustomerWithCategory,
} from "../../../types/importFile";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash } from "lucide-react";
import {
  getNewCustomersFromCSV,
  insertCustomer,
  insertIgnoredCustomer,
} from "@/lib/serverCustomers";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Category } from "../../../types/category";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TagBadge from "@/components/TagBadge";
import { onAddTag } from "@/lib/serverCategory";
import CategoryBadge from "@/components/CategoryBadge";
import CategoryEditDialog from "@/components/CategoryEditDialog";
import { colors } from "@/lib/colors";

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);

    reader.readAsText(file);
  });
};

type Props = {
  categories: Category[];
};

export default function Import({ categories }: Props) {
  const [stage, setStage] = useState<
    "select-file" | "insert-customers" | "upload-transactions"
  >("select-file");
  const [isMutating, setIsMutating] = useState(false);
  const [newCustomers, setNewCustomers] = useState<ImportedCustomer[]>([]);
  const [categoryId, setCategoryId] = useState<Category["id"] | undefined>(
    undefined
  );

  useEffect(() => {
    if (newCustomers.length === 0 && stage === "insert-customers") {
      setStage("upload-transactions");
    }
  }, [newCustomers, stage]);

  return (
    <div className="flex flex-col justify-start items-start gap-2 px-12 py-12 w-full">
      <div className="flex flex-row justify-between items-start w-full">
        <div>
          <Label>Import SEB csv</Label>
          <Input
            type="file"
            accept=".csv"
            onChange={async (e) => {
              const file = e.target.files === null ? null : e.target.files[0];
              if (!file) return;
              setIsMutating(true);
              const text = await readFileAsText(file);
              const newCustomers = await getNewCustomersFromCSV(text);
              if (newCustomers.length === 0) {
                setStage("upload-transactions");
              } else {
                setNewCustomers(newCustomers);
                setStage("insert-customers");
              }
              setIsMutating(false);
            }}
            disabled={isMutating || stage === "insert-customers"}
          />
        </div>
        {newCustomers.length > 0 && (
          <CategoryEditDialog
            isCreate
            category={{ color: colors[0], description: "", name: "" }}
          >
            <Button>Add category</Button>
          </CategoryEditDialog>
        )}
      </div>
      {stage === "insert-customers" && newCustomers.length > 0 && (
        <Table>
          <TableCaption>New Customers</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {newCustomers
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((customer) => (
                <TableRow key={customer.name}>
                  <TableCell>{customer.type.toUpperCase()}</TableCell>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell className="flex flex-row gap-2">
                    <Button
                      onClick={async () => {
                        setIsMutating(true);
                        await insertIgnoredCustomer(customer);
                        setNewCustomers((old) =>
                          old.filter((i) => i.name !== customer.name)
                        );
                        setCategoryId(undefined);
                        setIsMutating(false);
                      }}
                      variant={"outline"}
                      size="icon"
                      className="bg-red-100 hover:bg-red-200 transition-all"
                    >
                      <Trash />
                    </Button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          className="bg-green-100 hover:bg-green-200 transition-all"
                          variant={"outline"}
                          size="icon"
                        >
                          <Plus />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <Label>Select category</Label>
                        <Select
                          value={categoryId}
                          onValueChange={setCategoryId}
                        >
                          <div className="flex flex-row gap-2">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <Button
                              disabled={!categoryId}
                              onClick={() => {
                                if (!categoryId) return;

                                insertCustomer({
                                  categoryId,
                                  name: customer.name,
                                  type: customer.type,
                                });
                                setNewCustomers((o) =>
                                  o.filter((i) => i.name !== customer.name)
                                );
                                setCategoryId(undefined);
                              }}
                              variant={"secondary"}
                            >
                              {isMutating ? "" : <Plus />}
                            </Button>
                          </div>

                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                <CategoryBadge category={category} />
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      )}
      {stage === "upload-transactions" && <Button>Upload transactions</Button>}
    </div>
  );
}
