
// Define types for stock operations
export type StockOperation = {
  id: number;
  stockName: string;
  date: string;
  type: "Compra" | "Venda";
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  profit?: number;
};

// Define type for new stock operation without id and profit
export type NewStockOperation = Omit<StockOperation, "id" | "profit">;
