
import React, { createContext, useContext, ReactNode } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useStockOperations, StockOperation } from "@/hooks/useStockOperations";
import { useForexOperations, ForexOperation } from "@/hooks/useForexOperations";

type OperationsContextType = {
  stockOperations: StockOperation[];
  forexOperations: ForexOperation[];
  addStockOperation: (operation: Omit<StockOperation, "id" | "profit">) => Promise<void>;
  addForexOperation: (operation: Omit<ForexOperation, "id" | "profit" | "roi">) => Promise<void>;
  removeStockOperation: (id: number) => Promise<void>;
  removeForexOperation: (id: number) => Promise<void>;
  loading: boolean;
};

const OperationsContext = createContext<OperationsContextType | undefined>(undefined);

export const useOperations = () => {
  const context = useContext(OperationsContext);
  if (context === undefined) {
    throw new Error("useOperations must be used within an OperationsProvider");
  }
  return context;
};

export { StockOperation, ForexOperation };

export const OperationsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { 
    stockOperations, 
    addStockOperation, 
    removeStockOperation, 
    loading: stockLoading 
  } = useStockOperations(user);
  
  const { 
    forexOperations, 
    addForexOperation, 
    removeForexOperation, 
    loading: forexLoading 
  } = useForexOperations(user);

  // Combine loading states
  const loading = stockLoading || forexLoading;

  return (
    <OperationsContext.Provider 
      value={{ 
        stockOperations, 
        forexOperations, 
        addStockOperation, 
        addForexOperation,
        removeStockOperation,
        removeForexOperation,
        loading
      }}
    >
      {children}
    </OperationsContext.Provider>
  );
};
