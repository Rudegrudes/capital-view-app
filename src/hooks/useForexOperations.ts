
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { calculateForexProfit, calculateForexROI } from "@/utils/operationCalculations";
import { User } from "@supabase/supabase-js";

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

export const useForexOperations = (user: User | null) => {
  const [forexOperations, setForexOperations] = useState<ForexOperation[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch forex operations from Supabase
  const fetchForexOperations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("forex_operations")
        .select()
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

  // Add forex operation to Supabase
  const addForexOperation = async (operation: Omit<ForexOperation, "id" | "profit" | "roi">) => {
    if (!user) {
      toast.error("Você precisa estar logado para adicionar operações");
      return;
    }

    try {
      const profit = calculateForexProfit(
        operation.entryPrice, 
        operation.exitPrice, 
        operation.lotSize,
        operation.type
      );
      const roi = calculateForexROI(profit, operation.initialCapital);
      
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
        .select();

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
        toast.success("Operação adicionada com sucesso!");
      }
    } catch (err) {
      console.error("Erro ao adicionar operação de forex:", err);
      toast.error("Erro ao salvar operação");
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
      
      // Get all operations from the database
      const { data: allOperations, error: fetchError } = await supabase
        .from("forex_operations")
        .select();
      
      if (fetchError || !allOperations) {
        console.error("Erro ao buscar operações:", fetchError);
        toast.error("Erro ao remover operação");
        return;
      }

      console.log("Todas as operações no banco:", allOperations);
      
      // Find matching operations by comparing properties
      const matchingOperations = allOperations.filter(dbOp => 
        dbOp.currency_pair === operationToRemove.currencyPair &&
        dbOp.date === operationToRemove.date &&
        dbOp.type === operationToRemove.type &&
        Number(dbOp.entry_price) === operationToRemove.entryPrice &&
        Number(dbOp.exit_price) === operationToRemove.exitPrice &&
        Number(dbOp.lot_size) === operationToRemove.lotSize
      );
      
      if (matchingOperations.length === 0) {
        console.error("Operação não encontrada no banco de dados");
        toast.error("Operação não encontrada no banco de dados");
        return;
      }

      console.log("Operações encontradas para remoção:", matchingOperations);
      
      // Delete the operation using the UUID from the found operation
      const { error: deleteError } = await supabase
        .from("forex_operations")
        .delete()
        .eq('id', matchingOperations[0].id);

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

  useEffect(() => {
    if (user) {
      fetchForexOperations();
    } else {
      setForexOperations([]);
      setLoading(false);
    }
  }, [user]);

  return {
    forexOperations,
    addForexOperation,
    removeForexOperation,
    loading
  };
};
