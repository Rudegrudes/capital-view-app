
import React, { createContext, useContext, ReactNode } from "react";
import { useStockOperations } from "@/hooks/useStockOperations";
import { useForexOperations } from "@/hooks/useForexOperations";
import type { StockOperation, NewStockOperation as NewStockOp } from "@/types/stock"; // Renomeado para evitar conflito
import type { ForexOperation, NewForexOperation } from "@/types/forex";
import { User } from "@supabase/supabase-js"; // Importar User para o mock

// Mock user object para passar para useForexOperations, se necessário, ou pode ser null
// Para useStockOperations, o mock já está dentro do próprio hook.
const mockUser: User | null = {
  id: "mock-user-id-for-operations-context",
  app_metadata: { provider: "email", providers: ["email"] },
  user_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
  email: "mockuser-context@example.com",
  phone: "",
  updated_at: new Date().toISOString(),
} as User;

type OperationsContextType = {
  stockOperations: StockOperation[];
  forexOperations: ForexOperation[];
  addStockOperation: (operation: Omit<StockOperation, "id" | "profit" | "user_id">) => Promise<void>; // Ajustado para o que o form envia
  addForexOperation: (operation: NewForexOperation) => Promise<void>;
  removeStockOperation: (id: string) => Promise<void>; // ID é string (UUID)
  removeForexOperation: (id: string) => Promise<void>; // Corrigido: ID é string em Forex também
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

export type { StockOperation, ForexOperation };

export const OperationsProvider = ({ children }: { children: ReactNode }) => {
  const { 
    stockOperations, 
    addStockOperation: addStockOpService, // Renomeado para evitar conflito de nome
    removeStockOperation: removeStockOpService, // Renomeado
    loading: stockLoading 
  } = useStockOperations(); // Não passa mais 'user'
  
  const { 
    forexOperations, 
    addForexOperation: addForexOpService, // Renomeado
    removeForexOperation: removeForexOpService, // Renomeado
    loading: forexLoading 
  } = useForexOperations(); // Não passa mais mockUser

  const loading = stockLoading || forexLoading;

  // Adaptar a função addStockOperation para o contexto, se necessário
  // O hook useStockOperations já espera NewStockOperation, que não inclui user_id
  const handleAddStockOperation = async (operation: Omit<StockOperation, "id" | "profit" | "user_id">) => {
    // O hook useStockOperations internamente usa um mock user e chama o service
    // A tipagem de NewStockOperation em useStockOperations é { stockName: string; date: string; type: "Compra" | "Venda"; entryPrice: number; exitPrice: number; quantity: number; }
    // O form envia isso, então está compatível.
    await addStockOpService(operation as NewStockOp); 
  };

  const handleRemoveStockOperation = async (id: string) => {
    await removeStockOpService(id);
  };

  const handleAddForexOperation = async (operation: NewForexOperation) => {
    await addForexOpService(operation);
  };

  const handleRemoveForexOperation = async (id: string) => {
    await removeForexOpService(id);
  };

  return (
    <OperationsContext.Provider 
      value={{
        stockOperations, 
        forexOperations, 
        addStockOperation: handleAddStockOperation, 
        addForexOperation: handleAddForexOperation,
        removeStockOperation: handleRemoveStockOperation,
        removeForexOperation: handleRemoveForexOperation,
        loading
      }}
    >
      {children}
    </OperationsContext.Provider>
  );
};
