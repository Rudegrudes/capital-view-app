
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import type { ForexOperation, NewForexOperation } from "@/types/forex";
import { calculateForexProfit, calculateForexROI } from "@/utils/operationCalculations";

// Fetch all forex operations from Supabase
export const fetchForexOperations = async () => {
  try {
    const { data, error } = await supabase
      .from("forex_operations")
      .select()
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar operações de forex:", error);
      toast.error("Erro ao carregar operações de forex");
      return [];
    }

    // Transform Supabase data to match our app's format
    return data.map(op => ({
      id: Number(op.id.replace(/-/g, "").substring(0, 8), 16),  // Convert UUID to number ID for compatibility
      currencyPair: op.currency_pair,
      date: op.date,
      type: op.type as "Buy" | "Sell", // Cast to our enum type
      entryPrice: Number(op.entry_price),
      exitPrice: Number(op.exit_price),
      lotSize: Number(op.lot_size),
      initialCapital: Number(op.initial_capital),
      profit: Number(op.profit),
      roi: Number(op.roi)
    }));
  } catch (err) {
    console.error("Erro ao buscar operações de forex:", err);
    toast.error("Erro ao carregar operações de forex");
    return [];
  }
};

// Add forex operation to Supabase
export const addForexOperation = async (operation: NewForexOperation, user: User) => {
  try {
    // Calculate profit and ROI
    const profit = calculateForexProfit(operation.entryPrice, operation.exitPrice, operation.lotSize, operation.type);
    const roi = calculateForexROI(profit, operation.initialCapital);
    
    // Insert operation into Supabase
    const { data, error } = await supabase
      .from("forex_operations")
      .insert({
        user_id: user.id,
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
      .select();

    if (error) {
      console.error("Erro ao adicionar operação de forex:", error);
      throw new Error("Erro ao salvar operação");
    }

    // Return the new operation with a formatted ID
    if (data && data[0]) {
      return {
        id: Number(data[0].id.replace(/-/g, "").substring(0, 8), 16),
        currencyPair: operation.currencyPair,
        date: operation.date,
        type: operation.type,
        entryPrice: operation.entryPrice,
        exitPrice: operation.exitPrice,
        lotSize: operation.lotSize,
        initialCapital: operation.initialCapital,
        profit: profit,
        roi: roi
      };
    }
    throw new Error("Erro ao salvar operação");
  } catch (err) {
    console.error("Erro ao adicionar operação de forex:", err);
    throw err;
  }
};

// Remove forex operation from Supabase
export const removeForexOperation = async (id: number, operations: ForexOperation[]) => {
  try {
    // Find the operation in our state
    const operationToRemove = operations.find(op => op.id === id);
    if (!operationToRemove) {
      throw new Error("Operação não encontrada");
    }
    
    // Get all operations from the database
    const { data: allOperations, error: fetchError } = await supabase
      .from("forex_operations")
      .select();
    
    if (fetchError || !allOperations) {
      console.error("Erro ao buscar operações:", fetchError);
      throw new Error("Erro ao remover operação");
    }

    console.log("Todas as operações no banco:", allOperations);
    
    // Find matching operations by comparing properties
    const matchingOperations = allOperations.filter(dbOp => 
      dbOp.currency_pair === operationToRemove.currencyPair &&
      dbOp.date === operationToRemove.date &&
      dbOp.type === operationToRemove.type &&
      Number(dbOp.entry_price) === operationToRemove.entryPrice &&
      Number(dbOp.exit_price) === operationToRemove.exitPrice &&
      Number(dbOp.lot_size) === operationToRemove.lotSize &&
      Number(dbOp.initial_capital) === operationToRemove.initialCapital
    );
    
    if (matchingOperations.length === 0) {
      console.error("Operação não encontrada no banco de dados");
      throw new Error("Operação não encontrada no banco de dados");
    }

    console.log("Operações encontradas para remoção:", matchingOperations);
    
    // Primeiro, vamos tentar excluir os registros dependentes através da função RPC
    try {
      const { error: deleteRelatedError } = await supabase
        .rpc('delete_forex_operation_dependents', { operation_uuid: matchingOperations[0].id });
      
      if (deleteRelatedError) {
        console.error("Erro ao remover registros dependentes:", deleteRelatedError);
        // Continuamos mesmo com erro, pois a função RPC pode não existir ainda
      }
    } catch (rpcError) {
      console.error("Erro ao executar função RPC:", rpcError);
      // Continuamos para tentar a exclusão direta
    }

    // Agora tentamos excluir diretamente qualquer registro dependente que possa existir
    // Isso depende das tabelas relacionadas no seu banco de dados
    try {
      // Exemplo: Supondo que exista uma tabela de análises relacionada
      const { error: deleteAnalysisError } = await supabase
        .from("forex_operation_analysis")  // Substitua pelo nome real da tabela
        .delete()
        .eq('operation_id', matchingOperations[0].id);
      
      if (deleteAnalysisError) {
        console.error("Erro ao remover análises:", deleteAnalysisError);
        // Se a tabela não existir, continuamos normalmente
      }
    } catch (relatedError) {
      console.error("Erro ao remover registros relacionados:", relatedError);
      // Continuamos para tentar a exclusão da operação principal
    }

    // Delete the operation using the UUID from the found operation
    const { error: deleteError } = await supabase
      .from("forex_operations")
      .delete()
      .eq('id', matchingOperations[0].id);

    if (deleteError) {
      console.error("Erro ao remover operação:", deleteError);
      throw new Error("Erro ao remover operação: " + deleteError.message);
    }

    return true;
  } catch (err) {
    console.error("Erro ao remover operação:", err);
    throw err;
  }
};
