
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { calculateStockProfit } from "@/utils/operationCalculations";
import { User } from "@supabase/supabase-js";

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

export const useStockOperations = (user: User | null) => {
  const [stockOperations, setStockOperations] = useState<StockOperation[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch stock operations from Supabase
  const fetchStockOperations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("stock_operations")
        .select()
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

  // Add stock operation to Supabase
  const addStockOperation = async (operation: Omit<StockOperation, "id" | "profit">) => {
    if (!user) {
      toast.error("Você precisa estar logado para adicionar operações");
      return;
    }

    try {
      const profit = calculateStockProfit(
        operation.entryPrice, 
        operation.exitPrice, 
        operation.quantity, 
        operation.type
      );
      
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
        .select();

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
        toast.success("Operação adicionada com sucesso!");
      }
    } catch (err) {
      console.error("Erro ao adicionar operação de ação:", err);
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

  useEffect(() => {
    if (user) {
      fetchStockOperations();
    } else {
      setStockOperations([]);
      setLoading(false);
    }
  }, [user]);

  return {
    stockOperations,
    addStockOperation,
    removeStockOperation,
    loading
  };
};
