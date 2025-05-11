import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Chart } from "@/components/ui/chart";
import { useOperations } from "@/context/OperationsContext";
import { useAuth } from "@/components/AuthProvider";
import ForexHistory from "./forex/ForexHistory";

const ForexPanel = () => {
  // Get operations from context
  const { forexOperations, addForexOperation, loading } = useOperations();
  const { user } = useAuth();
  
  // Form state
  const [currencyPair, setCurrencyPair] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState<"Buy" | "Sell">("Buy");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [lotSize, setLotSize] = useState("");
  const [initialCapital, setInitialCapital] = useState("30");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.warning("Faça login para salvar suas operações", {
        duration: 5000,
        id: "login-required-forex"
      });
    }
  }, [user]);

  const handleAddOperation = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para adicionar operações");
      return;
    }

    if (!currencyPair || !date || !entryPrice || !exitPrice || !lotSize || !initialCapital) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    setIsSubmitting(true);

    try {
      const newOperation = {
        currencyPair,
        date,
        type,
        entryPrice: parseFloat(entryPrice),
        exitPrice: parseFloat(exitPrice),
        lotSize: parseFloat(lotSize),
        initialCapital: parseFloat(initialCapital),
      };

      // Add operation using context function
      await addForexOperation(newOperation);
      toast.success("Operação adicionada com sucesso!");

      // Reset form
      setCurrencyPair("");
      setDate("");
      setType("Buy");
      setEntryPrice("");
      setExitPrice("");
      setLotSize("");
    } catch (error) {
      console.error("Erro ao adicionar operação:", error);
      toast.error("Erro ao adicionar operação");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalProfit = forexOperations.reduce((acc, op) => acc + (op.profit || 0), 0);
  const averageROI = forexOperations.length > 0 
    ? forexOperations.reduce((acc, op) => acc + (op.roi || 0), 0) / forexOperations.length
    : 0;
  
  // Prepare pie chart data for win/loss ratio
  const winCount = forexOperations.filter(op => (op.profit || 0) > 0).length;
  const lossCount = forexOperations.filter(op => (op.profit || 0) <= 0).length;
  const pieChartSeries = [{
    name: 'Trading Results',
    data: [winCount, lossCount]
  }];
  
  const pieChartOptions = {
    labels: ['Ganhos', 'Perdas'],
    colors: ['#2A9D8F', '#e63946']
  };

  // Prepare line chart data for performance over time
  const lineChartData = forexOperations.map((op, index) => {
    const previousProfit = index > 0 
      ? forexOperations.slice(0, index).reduce((acc, prevOp) => acc + (prevOp.profit || 0), 0) 
      : 0;
    return {
      name: `Op ${index + 1} (${op.currencyPair})`,
      profit: op.profit || 0,
      accumulated: previousProfit + (op.profit || 0)
    };
  });

  const lineChartSeries = [{
    name: 'Resultado',
    data: lineChartData.map(data => data.accumulated),
  }];
  
  const lineChartOptions = {
    xaxis: {
      categories: lineChartData.map(data => data.name),
    },
    colors: ['#264653']
  };

  return (
    <div className="pt-16 animate-fade-in">
      <h2 className="text-2xl font-bold text-teal mb-6">Painel de Operações Forex</h2>
      
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-teal mb-4">Nova Operação</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currencyPair">Par de Moedas</Label>
              <Input 
                id="currencyPair" 
                placeholder="Ex: EUR/USD" 
                value={currencyPair} 
                onChange={(e) => setCurrencyPair(e.target.value)} 
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
              <Select value={type} onValueChange={(value) => setType(value as "Buy" | "Sell")}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Buy">Buy</SelectItem>
                  <SelectItem value="Sell">Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="entryPrice">Preço de Entrada</Label>
              <Input 
                id="entryPrice" 
                type="number"
                step="0.00001" 
                placeholder="0.00000" 
                value={entryPrice} 
                onChange={(e) => setEntryPrice(e.target.value)} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="exitPrice">Preço de Saída</Label>
              <Input 
                id="exitPrice" 
                type="number"
                step="0.00001" 
                placeholder="0.00000" 
                value={exitPrice} 
                onChange={(e) => setExitPrice(e.target.value)} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lotSize">Lote</Label>
              <Input 
                id="lotSize" 
                type="number"
                step="0.01" 
                placeholder="0.01" 
                value={lotSize} 
                onChange={(e) => setLotSize(e.target.value)} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="initialCapital">Capital Inicial</Label>
              <Input 
                id="initialCapital" 
                type="number" 
                placeholder="30" 
                value={initialCapital} 
                onChange={(e) => setInitialCapital(e.target.value)} 
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
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-teal mb-4">Desempenho</h3>
          {loading ? (
            <div className="flex items-center justify-center h-[300px]">
              Carregando gráficos...
            </div>
          ) : forexOperations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-[300px]">
                <Chart 
                  type="pie"
                  series={pieChartSeries}
                  options={pieChartOptions}
                  height={300}
                />
              </div>
              <div className="h-[300px]">
                <Chart 
                  type="line"
                  series={lineChartSeries}
                  options={lineChartOptions}
                  height={300}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] bg-gray rounded text-gray-500">
              Nenhuma operação registrada
            </div>
          )}
          
          <div className="mt-4 flex justify-around">
            <div className="text-center">
              <span className="block text-sm font-medium">Lucro Total</span>
              <span className={`text-xl font-bold ${totalProfit >= 0 ? 'text-green' : 'text-red-500'}`}>
                $ {totalProfit.toFixed(2)}
              </span>
            </div>
            <div className="text-center">
              <span className="block text-sm font-medium">ROI Médio</span>
              <span className={`text-xl font-bold ${averageROI >= 0 ? 'text-green' : 'text-red-500'}`}>
                {averageROI.toFixed(2)}%
              </span>
            </div>
            <div className="text-center">
              <span className="block text-sm font-medium">Win Rate</span>
              <span className="text-xl font-bold text-teal">
                {forexOperations.length ? ((winCount / forexOperations.length) * 100).toFixed(0) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <ForexHistory />
    </div>
  );
};

export default ForexPanel;
