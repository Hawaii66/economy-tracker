export type TransactionRow = {
  date: Date;
  text: string;
  amount: number;
  collisionMitigator: string;
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
