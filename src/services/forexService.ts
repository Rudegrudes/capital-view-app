"use client";

import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
// import { User } from "@supabase/supabase-js"; // User object no longer needed for addForexOperation
import type { ForexOperation, NewForexOperation } from "@/types/forex";
import { calculateForexProfit, calculateForexROI } from "@/utils/operationCalculations";

// Fetch all forex operations from Supabase
export const fetchForexOperations = async (): Promise<ForexOperation[]> => {
  console.log("[forexService] Buscando todas as operações de forex.");
  try {
    const { data, error } = await supabase
      .from("forex_operations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[forexService] Erro ao buscar operações de forex:", error);
      toast.error("Erro ao carregar operações de forex");
      return [];
    }
    console.log("[forexService] Operações de forex buscadas com sucesso.");
    return data.map(op => ({
      id: op.id, // Supabase ID is likely a UUID string, ensure ForexOperation type matches
      user_id: op.user_id,
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
  } catch (err) {
    console.error("[forexService] Exceção ao buscar operações de forex:", err);
    toast.error("Erro ao carregar operações de forex");
    return [];
  }
};

// Add forex operation to Supabase
// Removido o parâmetro 'user: User'
export const addForexOperation = async (operation: NewForexOperation): Promise<ForexOperation> => {
  console.log("[forexService] Adicionando nova operação de forex (user_id será null).");
  try {
    const profit = calculateForexProfit(operation.entryPrice, operation.exitPrice, operation.lotSize, operation.type);
    const roi = calculateForexROI(profit, operation.initialCapital);
    
    const { data, error } = await supabase
      .from("forex_operations")
      .insert({
        user_id: null, // MODIFICADO: Enviando null para user_id
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
      .select()
      .single(); // Assuming insert returns a single record

    if (error) {
      console.error("[forexService] Erro ao adicionar operação de forex no Supabase:", error);
      throw new Error("Erro ao salvar operação de forex: " + error.message);
    }

    if (data) {
      console.log("[forexService] Operação de forex adicionada com sucesso.");
      return {
        id: data.id, // Ensure this matches ForexOperation type
        user_id: data.user_id, // Será null
        currencyPair: data.currency_pair,
        date: data.date,
        type: data.type as "Buy" | "Sell",
        entryPrice: Number(data.entry_price),
        exitPrice: Number(data.exit_price),
        lotSize: Number(data.lot_size),
        initialCapital: Number(data.initial_capital),
        profit: Number(data.profit),
        roi: Number(data.roi)
      };
    }
    console.error("[forexService] Erro ao salvar operação de forex: não houve retorno de dados do Supabase.");
    throw new Error("Erro ao salvar operação de forex: não houve retorno de dados.");
  } catch (err) {
    console.error("[forexService] Exceção ao adicionar operação de forex:", err);
    if (err instanceof Error) throw err;
    throw new Error("Erro desconhecido ao adicionar operação de forex.");
  }
};

// Remove forex operation from Supabase by its UUID
// Modificado para aceitar 'id' como string (UUID) e remover 'operations' como parâmetro
export const removeForexOperation = async (id: string): Promise<boolean> => {
  console.log("[forexService] Tentando remover operação de forex com ID (UUID):", id);
  if (!id || typeof id !== 'string') {
    console.error("[forexService] ID inválido fornecido para remoção de forex:", id);
    throw new Error("ID inválido para remoção de operação forex.");
  }
  try {
    // Primeiro, tentar remover dependentes via RPC, se existir
    try {
      const { error: rpcError } = await supabase
        .rpc('delete_forex_operation_dependents', { operation_uuid: id });
      if (rpcError) {
        console.warn("[forexService] Erro (ou RPC não existe) ao remover dependentes da operação forex ID:", id, rpcError.message);
        // Não tratar como erro fatal, continuar para a deleção principal
      }
    } catch (rpcCatchError) {
      console.warn("[forexService] Exceção ao chamar RPC delete_forex_operation_dependents para ID:", id, rpcCatchError);
    }

    const { error } = await supabase
      .from("forex_operations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[forexService] Erro ao remover operação de forex ID:", id, "no Supabase. Detalhes:", error);
      if (error.code === "PGRST204" || error.message.toLowerCase().includes("no rows found")) {
        console.warn("[forexService] Operação de forex ID:", id, "não encontrada no Supabase para remoção.");
        throw new Error("Operação Forex não encontrada."); // Mensagem mais específica
      } else if (error.message.includes("constraint")) {
         console.warn("[forexService] Violação de restrição ao remover operação de forex ID:", id);
         throw new Error("Não foi possível remover a operação Forex devido a registros dependentes ou restrições.");
      }
      throw new Error("Erro ao remover operação de forex no Supabase: " + error.message);
    }
    console.log("[forexService] Operação de forex ID:", id, "removida com sucesso do Supabase.");
    return true;
  } catch (err) {
    console.error("[forexService] Exceção ao remover operação de forex ID:", id, err);
    if (err instanceof Error) {
        if (err.message.startsWith("Operação Forex não encontrada") || err.message.startsWith("Não foi possível remover") || err.message.startsWith("Erro ao remover operação de forex no Supabase")) {
            throw err;
        }
        throw new Error("Erro desconhecido ao tentar remover operação de forex: " + err.message);
    } 
    throw new Error("Erro desconhecido ao tentar remover operação de forex.");
  }
};

