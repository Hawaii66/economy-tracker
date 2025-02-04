export type SwishRecipient = {
  id: string;
  name: string;
  swishNumber: string;
};

export type Customer = {
  id: string;
  name: string;
  rename: string;
  color: string;
  categoryId: string;
};

export type Account = {
  id: string;
  name: string;
};

export type Category = {
  id: string;
  name: string;
  color: string;
  target: number;
};

export type ClassifyTransaction = {
  id: string;
  account: {
    id: string;
    name: string;
  };
  date: Date;
  text: string;
  amount: number;
};

export const ClassifyTypes = ["None", "Swish", "Customer", "Internal"] as const;

export type ClassifiedTransaction = ClassifyTransaction & {
  classed:
    | {
        type: "None";
        forced: false;
      }
    | {
        type: "Swish";
        swish: SwishRecipient;
        forced: true;
      }
    | {
        type: "Customer";
        customer: Customer;
        forced: true;
      }
    | {
        type: "Internal";
        account: Account;
        forced: false;
      };
};

export type ClassifiedChoice = {
  transactionId: string;
  categoryId: string;
} & (
  | {
      type: "None";
    }
  | {
      type: "Swish" | "Customer" | "Internal";
      otherId: string;
    }
);
