
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";

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

export const OperationsProvider = ({ children }: { children: ReactNode }) => {
  const [stockOperations, setStockOperations] = useState<StockOperation[]>([]);
  const [forexOperations, setForexOperations] = useState<ForexOperation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch operations when user is authenticated
  useEffect(() => {
    if (user) {
      fetchStockOperations();
      fetchForexOperations();
    } else {
      setStockOperations([]);
      setForexOperations([]);
      setLoading(false);
    }
  }, [user]);

  // Fetch stock operations from Supabase
  const fetchStockOperations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("stock_operations")
        .select() // Fixed: Removed extra argument here
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar operações de ações:", error);
        toast.error("Erro ao carregar operações de ações");
      } else {
        // Transform Supabase data to match our app's format
        const formattedData = data.map(op => ({
          id: Number(op.id.replace(/-/g, "").substring(0, 8), 16),  // Convert UUID to number ID for compatibility
          stockName: op.stock_name,
          date: op.date,
          type: op.type as "Compra" | "Venda",
          entryPrice: Number(op.entry_price),
          exitPrice: Number(op.exit_price),
          quantity: op.quantity,
          profit: Number(op.profit)
        }));
        setStockOperations(formattedData);
      }
    } catch (err) {
      console.error("Erro ao buscar operações de ações:", err);
      toast.error("Erro ao carregar operações de ações");
    } finally {
      setLoading(false);
    }
  };

  // Fetch forex operations from Supabase
  const fetchForexOperations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("forex_operations")
        .select() // Fixed: Removed extra argument here
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar operações de forex:", error);
        toast.error("Erro ao carregar operações de forex");
      } else {
        // Transform Supabase data to match our app's format
        const formattedData = data.map(op => ({
          id: Number(op.id.replace(/-/g, "").substring(0, 8), 16),  // Convert UUID to number ID for compatibility
          currencyPair: op.currency_pair,
          date: op.date,
          type: op.type as "Buy" | "Sell",
          entryPrice: Number(op.entry_price),
          exitPrice: Number(op.exit_price),
          lotSize: Number(op.lot_size),
          initialCapital: Number(op.initial_capital),
          profit: Number(op.profit),
          roi: Number(op.roi)
        }));
        setForexOperations(formattedData);
      }
    } catch (err) {
      console.error("Erro ao buscar operações de forex:", err);
      toast.error("Erro ao carregar operações de forex");
    } finally {
      setLoading(false);
    }
  };

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

  // Add stock operation to Supabase
  const addStockOperation = async (operation: Omit<StockOperation, "id" | "profit">) => {
    if (!user) {
      toast.error("Você precisa estar logado para adicionar operações");
      return;
    }

    try {
      const profit = calculateStockProfit(operation);
      
      // Insert operation into Supabase
      const { data, error } = await supabase
        .from("stock_operations")
        .insert({
          user_id: user.id,
          stock_name: operation.stockName,
          date: operation.date,
          type: operation.type,
          entry_price: operation.entryPrice,
          exit_price: operation.exitPrice,
          quantity: operation.quantity,
          profit: profit
        })
        .select(); // Fixed: Removed extra argument here

      if (error) {
        console.error("Erro ao adicionar operação de ação:", error);
        toast.error("Erro ao salvar operação");
        return;
      }

      // Add the new operation to state with a formatted ID
      if (data && data[0]) {
        const newOp = {
          id: Number(data[0].id.replace(/-/g, "").substring(0, 8), 16),
          stockName: operation.stockName,
          date: operation.date,
          type: operation.type,
          entryPrice: operation.entryPrice,
          exitPrice: operation.exitPrice,
          quantity: operation.quantity,
          profit: profit
        };
        setStockOperations(prev => [newOp, ...prev]);
      }
    } catch (err) {
      console.error("Erro ao adicionar operação de ação:", err);
      toast.error("Erro ao salvar operação");
    }
  };

  // Add forex operation to Supabase
  const addForexOperation = async (operation: Omit<ForexOperation, "id" | "profit" | "roi">) => {
    if (!user) {
      toast.error("Você precisa estar logado para adicionar operações");
      return;
    }

    try {
      const profit = calculateForexProfit(operation);
      const roi = (profit / operation.initialCapital) * 100;
      
      // Insert operation into Supabase
      const { data, error } = await supabase
        .from("forex_operations")
        .insert({
          user_id: user.id,
          currency_pair: operation.currencyPair,
          date: operation.date,
          type: operation.type,
          entry_price: operation.entryPrice,
          exit_price: operation.exitPrice,
          lot_size: operation.lotSize,
          initial_capital: operation.initialCapital,
          profit: profit,
          roi: roi
        })
        .select(); // Fixed: Removed extra argument here

      if (error) {
        console.error("Erro ao adicionar operação de forex:", error);
        toast.error("Erro ao salvar operação");
        return;
      }

      // Add the new operation to state with a formatted ID
      if (data && data[0]) {
        const newOp = {
          id: Number(data[0].id.replace(/-/g, "").substring(0, 8), 16),
          currencyPair: operation.currencyPair,
          date: operation.date,
          type: operation.type,
          entryPrice: operation.entryPrice,
          exitPrice: operation.exitPrice,
          lotSize: operation.lotSize,
          initialCapital: operation.initialCapital,
          profit: profit,
          roi: roi
        };
        setForexOperations(prev => [newOp, ...prev]);
      }
    } catch (err) {
      console.error("Erro ao adicionar operação de forex:", err);
      toast.error("Erro ao salvar operação");
    }
  };

  // Remove stock operation
  const removeStockOperation = async (id: number) => {
    if (!user) {
      toast.error("Você precisa estar logado para remover operações");
      return;
    }

    try {
      // Find the operation in our state
      const operationToRemove = stockOperations.find(op => op.id === id);
      if (!operationToRemove) {
        toast.error("Operação não encontrada");
        return;
      }
      
      // We'll find the actual UUID by querying for the operation
      const { data: dbOperation, error: findError } = await supabase
        .from("stock_operations")
        .select()
        .match({
          stock_name: operationToRemove.stockName,
          date: operationToRemove.date,
          type: operationToRemove.type,
          entry_price: operationToRemove.entryPrice,
          exit_price: operationToRemove.exitPrice,
          quantity: operationToRemove.quantity
        });
      
      if (findError || !dbOperation || dbOperation.length === 0) {
        console.error("Erro ao encontrar operação para remoção:", findError);
        toast.error("Erro ao remover operação");
        return;
      }

      // Now delete the operation using the actual UUID
      const { error: deleteError } = await supabase
        .from("stock_operations")
        .delete()
        .eq('id', dbOperation[0].id);

      if (deleteError) {
        console.error("Erro ao remover operação:", deleteError);
        toast.error("Erro ao remover operação");
        return;
      }

      // Remove the operation from state
      setStockOperations(prev => prev.filter(op => op.id !== id));
      toast.success("Operação removida com sucesso");
    } catch (err) {
      console.error("Erro ao remover operação:", err);
      toast.error("Erro ao remover operação");
    }
  };

  // Remove forex operation
  const removeForexOperation = async (id: number) => {
    if (!user) {
      toast.error("Você precisa estar logado para remover operações");
      return;
    }

    try {
      // Find the operation in our state
      const operationToRemove = forexOperations.find(op => op.id === id);
      if (!operationToRemove) {
        toast.error("Operação não encontrada");
        return;
      }
      
      // We'll find the actual UUID by querying for the operation
      const { data: dbOperation, error: findError } = await supabase
        .from("forex_operations")
        .select()
        .match({
          currency_pair: operationToRemove.currencyPair,
          date: operationToRemove.date,
          type: operationToRemove.type,
          entry_price: operationToRemove.entryPrice,
          exit_price: operationToRemove.exitPrice,
          lot_size: operationToRemove.lotSize
        });
      
      if (findError || !dbOperation || dbOperation.length === 0) {
        console.error("Erro ao encontrar operação para remoção:", findError);
        toast.error("Erro ao remover operação");
        return;
      }

      // Now delete the operation using the actual UUID
      const { error: deleteError } = await supabase
        .from("forex_operations")
        .delete()
        .eq('id', dbOperation[0].id);

      if (deleteError) {
        console.error("Erro ao remover operação:", deleteError);
        toast.error("Erro ao remover operação");
        return;
      }

      // Remove the operation from state
      setForexOperations(prev => prev.filter(op => op.id !== id));
      toast.success("Operação removida com sucesso");
    } catch (err) {
      console.error("Erro ao remover operação:", err);
      toast.error("Erro ao remover operação");
    }
  };

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
