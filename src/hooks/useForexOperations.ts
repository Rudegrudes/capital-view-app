
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import { ForexOperation, NewForexOperation } from "@/types/forex";
import { fetchForexOperations, addForexOperation as addForexOp, removeForexOperation as removeForexOp } from "@/services/forexService";

export type { ForexOperation };

export const useForexOperations = (user: User | null) => {
  const [forexOperations, setForexOperations] = useState<ForexOperation[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch forex operations from service
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

    const newOperation = await addForexOp(operation, user.id);
    
    if (newOperation) {
      setForexOperations(prev => [newOperation, ...prev]);
      toast.success("Operação adicionada com sucesso!");
    }
  };

  // Remove forex operation
  const removeForexOperation = async (id: number) => {
    if (!user) {
      toast.error("Você precisa estar logado para remover operações");
      return;
    }

    // Find the operation in our state
    const operationToRemove = forexOperations.find(op => op.id === id);
    if (!operationToRemove) {
      toast.error("Operação não encontrada");
      return;
    }

    const success = await removeForexOp(operationToRemove, user.id);
    
    if (success) {
      setForexOperations(prev => prev.filter(op => op.id !== id));
      toast.success("Operação removida com sucesso");
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
