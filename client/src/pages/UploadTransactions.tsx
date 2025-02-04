import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@clerk/clerk-react";
import { useState } from "react";

export default function UploadTransactions() {
  const [file, setFile] = useState<File | null>(null);
  const { getToken } = useAuth();

  const uploadFile = async () => {
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("start-date", "2025-01-01");
    formData.append("end-date", "2025-01-31");
    formData.append("account-id", "5a0d8040-38be-43ce-8965-23d704232646");

    try {
      const response = await fetch(
        "http://localhost:8000/import/upload-transactions",
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );

      if (response.ok) {
        alert("File uploaded successfully");
      } else {
        alert("Failed to upload file");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to upload file");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center gap-4 w-full h-full">
      <div className="flex flex-col items-center gap-4 w-1/2">
        <Label>Upload SEB .csv file</Label>
        <Input
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          type="file"
          placeholder="SEB.csv"
        />
        <Button onClick={uploadFile}>Upload</Button>
      </div>
    </div>
  );
}
