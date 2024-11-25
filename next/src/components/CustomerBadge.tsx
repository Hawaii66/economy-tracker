import { Building } from "lucide-react";
import { Badge } from "./ui/badge";
import { Customer } from "../../types/customer";

type Props = {
  customer: Pick<Customer, "rename">;
};

export default function CustomerBadge({ customer }: Props) {
  return (
    <Badge className="gap-2 px-2" variant={"outline"}>
      <Building size={16} /> {customer.rename}
    </Badge>
  );
}
