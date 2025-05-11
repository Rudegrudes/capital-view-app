"use client";

import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
// import { User } from "@supabase/supabase-js"; // User object no longer needed for addStockOperation
import type { StockOperation, NewStockOperation } from "@/types/stock";
import { calculateStockProfit } from "@/utils/operationCalculations";

// Fetch all stock operations from Supabase
export const fetchStockOperations = async (): Promise<StockOperation[]> => {
  console.log("[stockService] Buscando todas as operações de ações.");
  try {
    const { data, error } = await supabase
      .from("stock_operations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[stockService] Erro ao buscar operações de ações:", error);
      toast.error("Erro ao carregar operações de ações");
      return [];
    }
    console.log("[stockService] Operações de ações buscadas com sucesso.");
    return data.map(op => ({
      id: op.id,
      user_id: op.user_id, // Continuamos a buscar, mas não será usado para inserção da mesma forma
      stockName: op.stock_name,
      date: op.date,
      type: op.type as "Compra" | "Venda",
      entryPrice: Number(op.entry_price),
      exitPrice: Number(op.exit_price),
      quantity: op.quantity,
      profit: Number(op.profit)
    }));
  } catch (err) {
    console.error("[stockService] Exceção ao buscar operações de ações:", err);
    toast.error("Erro ao carregar operações de ações");
    return [];
  }
};

// Add stock operation to Supabase
// Removido o parâmetro 'user: User' pois enviaremos user_id: null
export const addStockOperation = async (operation: NewStockOperation): Promise<StockOperation> => {
  console.log("[stockService] Adicionando nova operação de ação (user_id será null).");
  try {
    const profit = calculateStockProfit(
      operation.entryPrice,
      operation.exitPrice,
      operation.quantity,
      operation.type
    );
    
    const { data, error } = await supabase
      .from("stock_operations")
      .insert({
        user_id: null, // MODIFICADO: Enviando null para user_id
        stock_name: operation.stockName,
        date: operation.date,
        type: operation.type,
        entry_price: operation.entryPrice,
        exit_price: operation.exitPrice,
        quantity: operation.quantity,
        profit: profit
      })
      .select()
      .single();

    if (error) {
      console.error("[stockService] Erro ao adicionar operação de ação no Supabase:", error);
      throw new Error("Erro ao salvar operação: " + error.message);
    }

    if (data) {
      console.log("[stockService] Operação de ação adicionada com sucesso.");
      return {
        id: data.id,
        user_id: data.user_id, // Será null se a inserção com null for bem-sucedida
        stockName: data.stock_name,
        date: data.date,
        type: data.type as "Compra" | "Venda",
        entryPrice: Number(data.entry_price),
        exitPrice: Number(data.exit_price),
        quantity: data.quantity,
        profit: Number(data.profit)
      };
    }
    console.error("[stockService] Erro ao salvar operação: não houve retorno de dados do Supabase.");
    throw new Error("Erro ao salvar operação: não houve retorno de dados.");
  } catch (err) {
    console.error("[stockService] Exceção ao adicionar operação de ação:", err);
    if (err instanceof Error) throw err;
    throw new Error("Erro desconhecido ao adicionar operação.");
  }
};

// Remove stock operation from Supabase by its UUID
export const removeStockOperation = async (id: string): Promise<boolean> => {
  console.log("[stockService] Tentando remover operação com ID (UUID):", id);
  if (!id || typeof id !== 'string') {
    console.error("[stockService] ID inválido fornecido para remoção:", id);
    throw new Error("ID inválido para remoção.");
  }
  try {
    const { error } = await supabase
      .from("stock_operations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[stockService] Erro ao remover operação ID:", id, "no Supabase. Detalhes do erro:", error);
      if (error.code === "PGRST204" || error.message.toLowerCase().includes("no rows found")) {
        console.warn("[stockService] Operação ID:", id, "não encontrada no Supabase para remoção. Erro Supabase:", error.message);
        throw new Error("Operação não encontrada ou você não tem permissão para removê-la (verifique RLS).");
      } else if (error.message.includes("constraint")) {
         console.warn("[stockService] Violação de restrição ao remover operação ID:", id, ". Erro Supabase:", error.message);
         throw new Error("Não foi possível remover a operação devido a registros dependentes ou restrições de permissão.");
      }
      throw new Error("Erro ao remover operação no Supabase: " + error.message);
    }
    console.log("[stockService] Operação ID:", id, "removida com sucesso do Supabase (ou não encontrada, o que é tratado como sucesso na lógica de UI).");
    return true;
  } catch (err) {
    console.error("[stockService] Exceção ao remover operação ID:", id, ". Detalhes da exceção:", err);
    if (err instanceof Error) {
        if (err.message.startsWith("Operação não encontrada") || err.message.startsWith("Não foi possível remover") || err.message.startsWith("Erro ao remover operação no Supabase")) {
            throw err;
        }
        throw new Error("Erro desconhecido ao tentar remover operação: " + err.message);
    } 
    throw new Error("Erro desconhecido ao tentar remover operação.");
  }
};

