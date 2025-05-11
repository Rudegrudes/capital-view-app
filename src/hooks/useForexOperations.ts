import { useState, useEffect, useCallback } from "react"; // Adicionado useCallback
import { toast } from "sonner";
import { User } from "@supabase/supabase-js"; // Mantido para o mock, se necessário em add
import type { ForexOperation, NewForexOperation } from "@/types/forex";
import { 
  fetchForexOperations as fetchOperationsService, 
  addForexOperation as addOperationService, 
  removeForexOperation as removeOperationService 
} from "@/services/forexService";

// Mock user para consistência, embora a lógica de autenticação real tenha sido removida/simplificada
const mockUser: User | null = {
  id: "mock-user-id-for-forex-operations",
  app_metadata: { provider: "email", providers: ["email"] },
  user_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
  email: "mockuser-forex@example.com",
  phone: "",
  updated_at: new Date().toISOString(),
} as User;

export const useForexOperations = (/* user: User | null */) => { // Parâmetro user removido
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
    // if (!mockUser) { // A checagem de usuário pode ser removida ou adaptada se o serviço não precisar mais do user
    //   toast.error("Você precisa estar logado para adicionar operações");
    //   return;
    // }
    console.log("[useForexOperations] Adicionando operação de forex:", operation);
    try {
      // Passando mockUser para addOperationService, que espera um objeto User.
      // O serviço forexService.ts ainda usa user.id.
      const newOperation = await addOperationService(operation, mockUser as User); // Garantir que mockUser não seja null aqui
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

  const removeForexOperation = async (id: number) => { // ID é number aqui, conforme o tipo ForexOperation
    console.log("[useForexOperations] Tentando remover operação de forex com ID:", id);
    // if (!mockUser) { // Removida checagem de usuário
    //   toast.error("Você precisa estar logado para remover operações");
    //   return;
    // }

    try {
      // A função removeOperationService em forexService.ts espera o ID e a lista atual de operações.
      // Isso é problemático e deve ser refatorado no serviço para usar apenas o ID (idealmente UUID string).
      await removeOperationService(id, forexOperations);
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
    // if (mockUser) { // Carrega operações independentemente do mockUser, pois a lógica de auth foi simplificada
      loadForexOperations();
    // } else {
    //   setForexOperations([]);
    //   setLoading(false);
    // }
  }, [loadForexOperations]); // Removida dependência mockUser, loadForexOperations é estável

  return {
    forexOperations,
    addForexOperation,
    removeForexOperation,
    loading,
    refreshForexOperations: loadForexOperations // Expor função de recarregar
  };
};

export type { ForexOperation };

