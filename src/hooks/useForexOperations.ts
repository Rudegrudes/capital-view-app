
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { ForexOperation, NewForexOperation } from "@/types/forex";
import { 
  fetchForexOperations as fetchOperationsService, 
  addForexOperation as addOperationService, 
  removeForexOperation as removeOperationService 
} from "@/services/forexService";

export const useForexOperations = () => {
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

  const removeForexOperation = async (id: string) => { 
    console.log("[useForexOperations] Tentando remover operação de forex com ID:", id);
    try {
      await removeOperationService(id);
      setForexOperations(prev => prev.filter(op => op.id !== id)); 
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
