"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import type { StockOperation, NewStockOperation } from "@/types/stock";
import { fetchStockOperations as fetchOperationsService, addStockOperation as addOperationService, removeStockOperation as removeOperationService } from "@/services/stockService";
// import { useAuth } from "@/context/AuthContext"; // COMENTADO: Removida dependência do AuthContext

export const useStockOperations = () => {
  // const { user } = useAuth(); // COMENTADO: Removida obtenção de usuário do AuthContext
  
  // Mock user object para contornar a ausência do AuthContext.
  // As operações com Supabase usando a service_role key não devem ser afetadas por RLS baseado em user_id.
  // No entanto, se a lógica de frontend ou backend explicitamente necessitar de um user.id, isso pode precisar de ajuste.
  const user: User | null = {
    id: "mock-user-id-for-authcontext-bypass",
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
    // Adicione outras propriedades de User que possam ser acessadas, com valores mock
    email: "mockuser@example.com",
    phone: "",
    updated_at: new Date().toISOString(),
    // etc.
  } as User;

  const [stockOperations, setStockOperations] = useState<StockOperation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStockOperations = useCallback(async () => {
    // if (!user) return; // COMENTADO: Permitir carregamento mesmo sem 'user' real do AuthContext
    console.log("[useStockOperations] Carregando operações de ações...");
    try {
      setLoading(true);
      const operations = await fetchOperationsService();
      setStockOperations(operations);
      console.log("[useStockOperations] Operações carregadas:", operations);
    } catch (error) {
      console.error("[useStockOperations] Erro ao carregar operações:", error);
      toast.error("Erro ao carregar histórico de operações.");
    } finally {
      setLoading(false);
    }
  }, []); // Removida dependência 'user'

  const addStockOperation = async (operation: NewStockOperation) => {
    // if (!user) { // COMENTADO
    //   toast.error("Você precisa estar logado para adicionar operações");
    //   console.warn("[useStockOperations] Tentativa de adicionar operação sem usuário logado.");
    //   return;
    // }
    console.log("[useStockOperations] Adicionando operação:", operation);
    try {
      // A função addOperationService pode precisar do objeto 'user' ou user.id
      // Passando o 'user' mockado. Verifique se addOperationService lida com isso ou se precisa de um user_id real.
      const newOperation = await addOperationService(operation, user);
      setStockOperations(prev => [newOperation, ...prev]);
      toast.success("Operação adicionada com sucesso!");
      console.log("[useStockOperations] Operação adicionada ao estado:", newOperation);
    } catch (err) {
      console.error("[useStockOperations] Erro ao adicionar operação:", err);
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Erro ao salvar operação");
      }
    }
  };

  const removeStockOperation = async (id: string) => {
    console.log("[useStockOperations] Tentando remover operação com ID:", id);
    // if (!user) { // COMENTADO: Removida verificação de usuário para a função de deletar
    //   toast.error("Você precisa estar logado para remover operações");
    //   console.warn("[useStockOperations] Usuário não logado tentou remover operação ID:", id);
    //   return;
    // }

    try {
      await removeOperationService(id);
      setStockOperations(prev => prev.filter(op => op.id !== id));
      toast.success("Operação removida com sucesso");
      console.log("[useStockOperations] Operação ID:", id, "removida com sucesso do estado.");
    } catch (err) {
      console.error("[useStockOperations] Erro ao remover operação ID:", id, err);
      if (err instanceof Error) {
        // O erro "Operação não encontrada" pode vir daqui se removeOperationService rejeitar.
        toast.error(err.message); 
      } else {
        toast.error("Erro ao remover operação");
      }
    }
  };

  useEffect(() => {
    // if (user) { // COMENTADO
      loadStockOperations();
    // } else {
    //   setStockOperations([]); 
    //   setLoading(false);
    // }
  }, [loadStockOperations]); // Removida dependência 'user'

  return {
    stockOperations,
    addStockOperation,
    removeStockOperation,
    loading,
    refreshStockOperations: loadStockOperations
  };
};

export type { StockOperation };

