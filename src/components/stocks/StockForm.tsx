
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useOperations } from "@/context/OperationsContext";
import { useAuth } from "@/components/AuthProvider";

const StockForm = () => {
  const { addStockOperation } = useOperations();
  const { user } = useAuth();
  
  // Form state
  const [stockName, setStockName] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState<"Compra" | "Venda">("Compra");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddOperation = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para adicionar operações");
      return;
    }

    if (!stockName || !date || !entryPrice || !exitPrice || !quantity) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    setIsSubmitting(true);

    try {
      const newOperation = {
        stockName,
        date,
        type,
        entryPrice: parseFloat(entryPrice),
        exitPrice: parseFloat(exitPrice),
        quantity: parseInt(quantity),
      };

      // Add operation using context function
      await addStockOperation(newOperation);
      toast.success("Operação adicionada com sucesso!");

      // Reset form
      setStockName("");
      setDate("");
      setType("Compra");
      setEntryPrice("");
      setExitPrice("");
      setQuantity("");
    } catch (error) {
      console.error("Erro ao adicionar operação:", error);
      toast.error("Erro ao adicionar operação");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-xl font-semibold text-teal mb-4">Nova Operação</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stockName">Nome da Ação</Label>
          <Input 
            id="stockName" 
            placeholder="Ex: PETR4" 
            value={stockName} 
            onChange={(e) => setStockName(e.target.value)} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <Input 
            id="date" 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <Select value={type} onValueChange={(value) => setType(value as "Compra" | "Venda")}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Compra">Compra</SelectItem>
              <SelectItem value="Venda">Venda</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="entryPrice">Preço de Entrada</Label>
          <Input 
            id="entryPrice" 
            type="number"
            step="0.01" 
            placeholder="0.00" 
            value={entryPrice} 
            onChange={(e) => setEntryPrice(e.target.value)} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="exitPrice">Preço de Saída</Label>
          <Input 
            id="exitPrice" 
            type="number"
            step="0.01" 
            placeholder="0.00" 
            value={exitPrice} 
            onChange={(e) => setExitPrice(e.target.value)} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantidade</Label>
          <Input 
            id="quantity" 
            type="number" 
            placeholder="0" 
            value={quantity} 
            onChange={(e) => setQuantity(e.target.value)} 
          />
        </div>
      </div>
      
      <Button 
        className="w-full mt-6 bg-green hover:bg-opacity-90 hover-effect"
        onClick={handleAddOperation}
        disabled={isSubmitting || !user}
      >
        {isSubmitting ? "Adicionando..." : "Adicionar Operação"}
      </Button>
      
      {!user && (
        <p className="mt-2 text-center text-red-500 text-sm">
          Você precisa estar logado para adicionar operações
        </p>
      )}
    </div>
  );
};

export default StockForm;
