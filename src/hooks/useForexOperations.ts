import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
// import { User } from "@supabase/supabase-js"; // No longer directly needed for add/remove operation signatures
import type { ForexOperation, NewForexOperation } from "@/types/forex";
import { 
  fetchForexOperations as fetchOperationsService, 
  addForexOperation as addOperationService, 
  removeForexOperation as removeOperationService 
} from "@/services/forexService";

export const useForexOperations = () => {
  // const user: User | null = { ... }; // Mock user object is not passed to service anymore

  const [forexOperations, setForexOperations] = useState<ForexOperation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadForexOperations = useCallback(async () => {
    console.log("[useForexOperations] Carregando operações de forex...");
    try {
      setLoading(true);
      const operations = await fetchOperationsService();
      setForexOperations(operations);
      console.log("[useForexOperations] Operações de forex carregadas.");
    } catch (error) {
      console.error("[useForexOperations] Erro ao carregar operações de forex:", error);
      toast.error("Erro ao carregar histórico de operações de forex.");
    } finally {
      setLoading(false);
    }
  }, []);

  const addForexOperation = async (operation: NewForexOperation) => {
    console.log("[useForexOperations] Adicionando operação de forex:", operation);
    try {
      // MODIFICADO: addOperationService (from forexService) no longer takes a user argument
      const newOperation = await addOperationService(operation);
      setForexOperations(prev => [newOperation, ...prev]);
      toast.success("Operação de Forex adicionada com sucesso!");
      console.log("[useForexOperations] Operação de forex adicionada ao estado:", newOperation);
    } catch (err) {
      console.error("[useForexOperations] Erro ao adicionar operação de forex:", err);
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Erro ao salvar operação de forex");
      }
    }
  };

  // MODIFICADO: ID é string (UUID) conforme alteração no forexService
  const removeForexOperation = async (id: string) => { 
    console.log("[useForexOperations] Tentando remover operação de forex com ID:", id);
    try {
      // MODIFICADO: removeOperationService (from forexService) now takes only string ID
      await removeOperationService(id);
      setForexOperations(prev => prev.filter(op => op.id !== id)); // Ensure op.id is also string for comparison
      toast.success("Operação de Forex removida com sucesso");
      console.log("[useForexOperations] Operação de forex ID:", id, "removida com sucesso do estado.");
    } catch (err) {
      console.error("[useForexOperations] Erro ao remover operação de forex ID:", id, err);
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Erro ao remover operação de forex");
      }
    }
  };

  useEffect(() => {
    loadForexOperations();
  }, [loadForexOperations]);

  return {
    forexOperations,
    addForexOperation,
    removeForexOperation,
    loading,
    refreshForexOperations: loadForexOperations
  };
};

export type { ForexOperation };

