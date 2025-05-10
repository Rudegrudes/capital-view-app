
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { calculateForexProfit, calculateForexROI } from "@/utils/operationCalculations";
import { ForexOperation, NewForexOperation } from "@/types/forex";
import { User } from "@supabase/supabase-js";

// Format data from Supabase to match our app's format
const formatForexOperation = (op: any): ForexOperation => ({
  id: Number(op.id.replace(/-/g, "").substring(0, 8), 16),
  currencyPair: op.currency_pair,
  date: op.date,
  type: op.type as "Buy" | "Sell",
  entryPrice: Number(op.entry_price),
  exitPrice: Number(op.exit_price),
  lotSize: Number(op.lot_size),
  initialCapital: Number(op.initial_capital),
  profit: Number(op.profit),
  roi: Number(op.roi)
});

// Fetch forex operations from Supabase
export const fetchForexOperations = async (): Promise<ForexOperation[]> => {
  try {
    const { data, error } = await supabase
      .from("forex_operations")
      .select();

    if (error) {
      console.error("Erro ao buscar operações de forex:", error);
      toast.error("Erro ao carregar operações de forex");
      return [];
    }

    // Transform Supabase data to match our app's format
    return data.map(formatForexOperation);
  } catch (err) {
    console.error("Erro ao buscar operações de forex:", err);
    toast.error("Erro ao carregar operações de forex");
    return [];
  }
};

// Add forex operation to Supabase
export const addForexOperation = async (
  operation: NewForexOperation,
  userId: string
): Promise<ForexOperation | null> => {
  try {
    const profit = calculateForexProfit(
      operation.entryPrice,
      operation.exitPrice,
      operation.lotSize,
      operation.type
    );
    const roi = calculateForexROI(profit, operation.initialCapital);

    // Insert operation into Supabase
    const { data, error } = await supabase
      .from("forex_operations")
      .insert({
        user_id: userId,
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
      toast.error("Erro ao salvar operação");
      return null;
    }

    // Return the new operation with a formatted ID
    if (data && data[0]) {
      return formatForexOperation(data[0]);
    }
    return null;
  } catch (err) {
    console.error("Erro ao adicionar operação de forex:", err);
    toast.error("Erro ao salvar operação");
    return null;
  }
};

// Remove forex operation
export const removeForexOperation = async (
  operationToRemove: ForexOperation,
  userId: string
): Promise<boolean> => {
  try {
    // Get all operations from the database
    const { data: allOperations, error: fetchError } = await supabase
      .from("forex_operations")
      .select();

    if (fetchError || !allOperations) {
      console.error("Erro ao buscar operações:", fetchError);
      toast.error("Erro ao remover operação");
      return false;
    }

    console.log("Todas as operações no banco:", allOperations);

    // Find matching operations by comparing properties
    const matchingOperations = allOperations.filter(dbOp =>
      dbOp.currency_pair === operationToRemove.currencyPair &&
      dbOp.date === operationToRemove.date &&
      dbOp.type === operationToRemove.type &&
      Number(dbOp.entry_price) === operationToRemove.entryPrice &&
      Number(dbOp.exit_price) === operationToRemove.exitPrice &&
      Number(dbOp.lot_size) === operationToRemove.lotSize
    );

    if (matchingOperations.length === 0) {
      console.error("Operação não encontrada no banco de dados");
      toast.error("Operação não encontrada no banco de dados");
      return false;
    }

    console.log("Operações encontradas para remoção:", matchingOperations);

    // Delete the operation using the UUID from the found operation
    const { error: deleteError } = await supabase
      .from("forex_operations")
      .delete()
      .eq('id', matchingOperations[0].id);

    if (deleteError) {
      console.error("Erro ao remover operação:", deleteError);
      toast.error("Erro ao remover operação");
      return false;
    }

    return true;
  } catch (err) {
    console.error("Erro ao remover operação:", err);
    toast.error("Erro ao remover operação");
    return false;
  }
};
