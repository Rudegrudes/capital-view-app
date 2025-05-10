
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import type { ForexOperation, NewForexOperation } from "@/types/forex";
import { 
  fetchForexOperations, 
  addForexOperation as addOperation, 
  removeForexOperation as removeOperation 
} from "@/services/forexService";

export const useForexOperations = (user: User | null) => {
  const [forexOperations, setForexOperations] = useState<ForexOperation[]>([]);
  const [loading, setLoading] = useState(true);

  // Load forex operations
  const loadForexOperations = async () => {
    try {
      setLoading(true);
      const operations = await fetchForexOperations();
      setForexOperations(operations);
    } finally {
      setLoading(false);
    }
  };

  // Add forex operation
  const addForexOperation = async (operation: NewForexOperation) => {
    if (!user) {
      toast.error("Você precisa estar logado para adicionar operações");
      return;
    }

    try {
      const newOperation = await addOperation(operation, user);
      setForexOperations(prev => [newOperation, ...prev]);
      toast.success("Operação adicionada com sucesso!");
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Erro ao salvar operação");
      }
    }
  };

  // Remove forex operation
  const removeForexOperation = async (id: number) => {
    if (!user) {
      toast.error("Você precisa estar logado para remover operações");
      return;
    }

    try {
      await removeOperation(id, forexOperations);
      // Remove the operation from state
      setForexOperations(prev => prev.filter(op => op.id !== id));
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
      loadForexOperations();
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

// Re-export the type for convenience
export type { ForexOperation };
