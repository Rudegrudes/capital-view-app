
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import type { StockOperation, NewStockOperation } from "@/types/stock";
import { calculateStockProfit } from "@/utils/operationCalculations";

// Fetch all stock operations from Supabase
export const fetchStockOperations = async () => {
  try {
    const { data, error } = await supabase
      .from("stock_operations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar operações de ações:", error);
      toast.error("Erro ao carregar operações de ações");
      return [];
    }

    // Transform Supabase data to match our app's format
    return data.map(op => ({
      id: Number(op.id.replace(/-/g, "").substring(0, 8), 16),  // Convert UUID to number ID for compatibility
      stockName: op.stock_name,
      date: op.date,
      type: op.type as "Compra" | "Venda",
      entryPrice: Number(op.entry_price),
      exitPrice: Number(op.exit_price),
      quantity: op.quantity,
      profit: Number(op.profit)
    }));
  } catch (err) {
    console.error("Erro ao buscar operações de ações:", err);
    toast.error("Erro ao carregar operações de ações");
    return [];
  }
};

// Add stock operation to Supabase
export const addStockOperation = async (operation: NewStockOperation, user: User) => {
  try {
    const profit = calculateStockProfit(
      operation.entryPrice, 
      operation.exitPrice, 
      operation.quantity, 
      operation.type
    );
    
    // Insert operation into Supabase
    const { data, error } = await supabase
      .from("stock_operations")
      .insert({
        user_id: user.id,
        stock_name: operation.stockName,
        date: operation.date,
        type: operation.type,
        entry_price: operation.entryPrice,
        exit_price: operation.exitPrice,
        quantity: operation.quantity,
        profit: profit
      })
      .select();

    if (error) {
      console.error("Erro ao adicionar operação de ação:", error);
      throw new Error("Erro ao salvar operação");
    }

    // Return the new operation with a formatted ID
    if (data && data[0]) {
      return {
        id: Number(data[0].id.replace(/-/g, "").substring(0, 8), 16),
        stockName: operation.stockName,
        date: operation.date,
        type: operation.type,
        entryPrice: operation.entryPrice,
        exitPrice: operation.exitPrice,
        quantity: operation.quantity,
        profit: profit
      };
    }
    throw new Error("Erro ao salvar operação");
  } catch (err) {
    console.error("Erro ao adicionar operação de ação:", err);
    throw err;
  }
};

// Remove stock operation from Supabase
export const removeStockOperation = async (id: number, operations: StockOperation[]) => {
  try {
    // Find the operation in our state
    const operationToRemove = operations.find(op => op.id === id);
    if (!operationToRemove) {
      throw new Error("Operação não encontrada");
    }
    
    // Get all operations from the database
    const { data: allOperations, error: fetchError } = await supabase
      .from("stock_operations")
      .select();
    
    if (fetchError || !allOperations) {
      console.error("Erro ao buscar operações:", fetchError);
      throw new Error("Erro ao remover operação");
    }

    console.log("Todas as operações no banco:", allOperations);
    
    // Find matching operations by comparing properties
    const matchingOperations = allOperations.filter(dbOp => 
      dbOp.stock_name === operationToRemove.stockName &&
      dbOp.date === operationToRemove.date &&
      dbOp.type === operationToRemove.type &&
      Number(dbOp.entry_price) === operationToRemove.entryPrice &&
      Number(dbOp.exit_price) === operationToRemove.exitPrice &&
      dbOp.quantity === operationToRemove.quantity
    );
    
    if (matchingOperations.length === 0) {
      console.error("Operação não encontrada no banco de dados");
      throw new Error("Operação não encontrada no banco de dados");
    }

    console.log("Operações encontradas para remoção:", matchingOperations);
    
    // Primeiro, vamos tentar excluir os registros dependentes através da função RPC
    try {
      const { error: deleteRelatedError } = await supabase
        .rpc('delete_stock_operation_dependents', { operation_uuid: matchingOperations[0].id });
      
      if (deleteRelatedError) {
        console.error("Erro ao remover registros dependentes:", deleteRelatedError);
        // Continuamos mesmo com erro, pois a função RPC pode não existir ainda
      }
    } catch (rpcError) {
      console.error("Erro ao executar função RPC:", rpcError);
      // Continuamos para tentar a exclusão direta
    }

    // Delete the operation using the UUID from the found operation
    const { error: deleteError } = await supabase
      .from("stock_operations")
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
