
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import type { StockOperation, NewStockOperation } from "@/types/stock";
import { fetchStockOperations, addStockOperation as addOperation, removeStockOperation as removeOperation } from "@/services/stockService";

export const useStockOperations = (user: User | null) => {
  const [stockOperations, setStockOperations] = useState<StockOperation[]>([]);
  const [loading, setLoading] = useState(true);

  // Load stock operations
  const loadStockOperations = async () => {
    try {
      setLoading(true);
      const operations = await fetchStockOperations();
      setStockOperations(operations);
    } finally {
      setLoading(false);
    }
  };

  // Add stock operation
  const addStockOperation = async (operation: NewStockOperation) => {
    if (!user) {
      toast.error("Você precisa estar logado para adicionar operações");
      return;
    }

    try {
      const newOperation = await addOperation(operation, user);
      setStockOperations(prev => [newOperation, ...prev]);
      toast.success("Operação adicionada com sucesso!");
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Erro ao salvar operação");
      }
    }
  };

  // Remove stock operation
  const removeStockOperation = async (id: number) => {
    if (!user) {
      toast.error("Você precisa estar logado para remover operações");
      return;
    }

    try {
      await removeOperation(id, stockOperations);
      // Remove the operation from state
      setStockOperations(prev => prev.filter(op => op.id !== id));
      toast.success("Operação removida com sucesso");
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Erro ao remover operação");
      }
    }
  };

  useEffect(() => {
    if (user) {
      loadStockOperations();
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

// Re-export the type for convenience
export type { StockOperation };
