
// Define types for stock operations
export type StockOperation = {
  id: string; // Changed from number to string to match UUID from Supabase
  user_id?: string | null; // Added user_id from Supabase
  stockName: string;
  date: string;
  type: "Compra" | "Venda";
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  profit?: number;
};

// Define type for new stock operation without id and profit
export type NewStockOperation = Omit<StockOperation, "id" | "profit" | "user_id">;
