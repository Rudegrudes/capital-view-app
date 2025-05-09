
import React, { createContext, useContext, useState, ReactNode } from "react";

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

// Define types for forex operations
export type ForexOperation = {
  id: number;
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

type OperationsContextType = {
  stockOperations: StockOperation[];
  forexOperations: ForexOperation[];
  addStockOperation: (operation: Omit<StockOperation, "id" | "profit">) => void;
  addForexOperation: (operation: Omit<ForexOperation, "id" | "profit" | "roi">) => void;
};

const OperationsContext = createContext<OperationsContextType | undefined>(undefined);

export const useOperations = () => {
  const context = useContext(OperationsContext);
  if (context === undefined) {
    throw new Error("useOperations must be used within an OperationsProvider");
  }
  return context;
};

export const OperationsProvider = ({ children }: { children: ReactNode }) => {
  const [stockOperations, setStockOperations] = useState<StockOperation[]>([]);
  const [forexOperations, setForexOperations] = useState<ForexOperation[]>([]);

  // Calculate profit for stock operations
  const calculateStockProfit = (operation: Omit<StockOperation, "id" | "profit">) => {
    const entryValue = operation.entryPrice * operation.quantity;
    const exitValue = operation.exitPrice * operation.quantity;
    
    if (operation.type === "Compra") {
      // Na compra: lucro quando preço saída > preço entrada
      return exitValue - entryValue;
    } else {
      // Na venda: lucro quando preço entrada > preço saída
      return entryValue - exitValue;
    }
  };

  // Calculate profit for forex operations
  const calculateForexProfit = (operation: Omit<ForexOperation, "id" | "profit" | "roi">) => {
    const priceDiff = operation.exitPrice - operation.entryPrice;
    
    let profitValue;
    
    if (operation.type === "Buy") {
      // Se for compra (Buy), lucro quando preço saída > preço entrada
      profitValue = priceDiff * operation.lotSize * 100000;
    } else {
      // Se for venda (Sell), lucro quando preço entrada > preço saída
      profitValue = -priceDiff * operation.lotSize * 100000;
    }
    
    return profitValue;
  };

  // Add stock operation
  const addStockOperation = (operation: Omit<StockOperation, "id" | "profit">) => {
    const profit = calculateStockProfit(operation);
    const newOperation = { ...operation, id: Date.now(), profit };
    setStockOperations([...stockOperations, newOperation]);
  };

  // Add forex operation
  const addForexOperation = (operation: Omit<ForexOperation, "id" | "profit" | "roi">) => {
    const profit = calculateForexProfit(operation);
    const roi = (profit / operation.initialCapital) * 100;
    const newOperation = { ...operation, id: Date.now(), profit, roi };
    setForexOperations([...forexOperations, newOperation]);
  };

  return (
    <OperationsContext.Provider 
      value={{ 
        stockOperations, 
        forexOperations, 
        addStockOperation, 
        addForexOperation 
      }}
    >
      {children}
    </OperationsContext.Provider>
  );
};
