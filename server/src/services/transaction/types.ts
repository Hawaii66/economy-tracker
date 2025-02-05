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

export type Transaction = {
  id: string;
  account: {
    name: string;
    id: string;
  };
  date: Date;
  text: string;
  amount: number;
  category: {
    id: string;
    name: string;
    color: string;
  };
} & (
  | {
      type: "Swish";
      swish: {
        id: string;
        name: string;
        swishNumber: string;
      };
    }
  | {
      type: "Customer";
      customer: {
        id: string;
        name: string;
        color: string;
      };
    }
  | {
      type: "Internal";
      otherAccount: {
        id: string;
        name: string;
      };
    }
);
