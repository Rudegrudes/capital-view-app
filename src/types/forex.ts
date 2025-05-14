
// Define types for forex operations
export type ForexOperation = {
  id: string; // Changed from number to string to match UUID from Supabase
  user_id?: string | null; // Added user_id from Supabase
  currencyPair: string;
  date: string;
  type: "Buy" | "Sell";
  entryPrice: number;
  exitPrice: number;
  lotSize: number;
  initialCapital: number;
  profit?: number;
  roi?: number;
};

// Define type for new forex operation without id, profit and roi
export type NewForexOperation = Omit<ForexOperation, "id" | "profit" | "roi" | "user_id">;
