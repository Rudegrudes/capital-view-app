
"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { StockOperation, NewStockOperation } from "@/types/stock";
import { 
  fetchStockOperations as fetchOperationsService, 
  addStockOperation as addOperationService, 
  removeStockOperation as removeOperationService 
} from "@/services/stockService";

export const useStockOperations = () => {
  const [stockOperations, setStockOperations] = useState<StockOperation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStockOperations = useCallback(async () => {
    console.log("[useStockOperations] Carregando operações de ações...");
    try {
      setLoading(true);
      const operations = await fetchOperationsService();
      setStockOperations(operations);
      console.log("[useStockOperations] Operações carregadas.");
    } catch (error) {
      console.error("[useStockOperations] Erro ao carregar operações:", error);
      toast.error("Erro ao carregar histórico de operações de ações.");
    } finally {
      setLoading(false);
    }
  }, []);

  const addStockOperation = async (operation: NewStockOperation) => {
    console.log("[useStockOperations] Adicionando operação de ação:", operation);
    try {
      const newOperation = await addOperationService(operation);
      setStockOperations(prev => [newOperation, ...prev]);
      toast.success("Operação de ação adicionada com sucesso!");
      console.log("[useStockOperations] Operação de ação adicionada ao estado:", newOperation);
    } catch (err) {
      console.error("[useStockOperations] Erro ao adicionar operação de ação:", err);
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Erro ao salvar operação de ação");
      }
    }
  };

  const removeStockOperation = async (id: string) => {
    console.log("[useStockOperations] Tentando remover operação de ação com ID:", id);
    try {
      await removeOperationService(id);
      setStockOperations(prev => prev.filter(op => op.id !== id));
      toast.success("Operação de ação removida com sucesso");
      console.log("[useStockOperations] Operação de ação ID:", id, "removida com sucesso do estado.");
    } catch (err) {
      console.error("[useStockOperations] Erro ao remover operação de ação ID:", id, err);
      if (err instanceof Error) {
        toast.error(err.message); 
      } else {
        toast.error("Erro ao remover operação de ação");
      }
    }
  };

  useEffect(() => {
    loadStockOperations();
  }, [loadStockOperations]);

  return {
    stockOperations,
    addStockOperation,
    removeStockOperation,
    loading,
    refreshStockOperations: loadStockOperations
  };
};

export type { StockOperation };
