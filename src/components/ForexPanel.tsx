import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Chart } from "@/components/ui/chart";

type ForexOperation = {
  id: number;
  currencyPair: string;
  date: string;
  type: "Buy" | "Sell";
  entryPrice: number;
  exitPrice: number;
  lotSize: number;
  initialCapital: number;
  profit?: number;
  roi?: number;
};

const ForexPanel = () => {
  const [operations, setOperations] = useState<ForexOperation[]>([]);
  const [currencyPair, setCurrencyPair] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState<"Buy" | "Sell">("Buy");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [lotSize, setLotSize] = useState("");
  const [initialCapital, setInitialCapital] = useState("30");

  const calculateProfit = (operation: Omit<ForexOperation, "id" | "profit" | "roi">) => {
    // Corrigindo o cálculo de profit para Forex
    // Para pares de moedas, o cálculo é baseado na diferença de pontos * tamanho do lote * valor do pip
    
    // Calculando a diferença de pontos (considerando 5 casas decimais como padrão para forex)
    const priceDiff = operation.exitPrice - operation.entryPrice;
    
    // Determinar se é lucro ou prejuízo baseado no tipo de operação
    let profitValue;
    
    if (operation.type === "Buy") {
      // Se for compra (Buy), lucro quando preço saída > preço entrada
      profitValue = priceDiff * operation.lotSize * 100000;
    } else {
      // Se for venda (Sell), lucro quando preço entrada > preço saída
      profitValue = -priceDiff * operation.lotSize * 100000;
    }
    
    return profitValue;
  };

  const handleAddOperation = () => {
    if (!currencyPair || !date || !entryPrice || !exitPrice || !lotSize || !initialCapital) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    const newOperation = {
      id: Date.now(),
      currencyPair,
      date,
      type,
      entryPrice: parseFloat(entryPrice),
      exitPrice: parseFloat(exitPrice),
      lotSize: parseFloat(lotSize),
      initialCapital: parseFloat(initialCapital),
    };

    const profit = calculateProfit(newOperation);
    const roi = (profit / newOperation.initialCapital) * 100;
    const operationWithResults = { ...newOperation, profit, roi };

    setOperations([...operations, operationWithResults]);
    toast.success("Operação adicionada com sucesso!");

    // Reset form
    setCurrencyPair("");
    setDate("");
    setType("Buy");
    setEntryPrice("");
    setExitPrice("");
    setLotSize("");
  };

  const totalProfit = operations.reduce((acc, op) => acc + (op.profit || 0), 0);
  const averageROI = operations.length > 0 
    ? operations.reduce((acc, op) => acc + (op.roi || 0), 0) / operations.length
    : 0;
  
  // Prepare pie chart data for win/loss ratio
  const winCount = operations.filter(op => (op.profit || 0) > 0).length;
  const lossCount = operations.filter(op => (op.profit || 0) <= 0).length;
  const pieChartSeries = [{
    name: 'Trading Results',
    data: [winCount, lossCount]
  }];
  
  const pieChartOptions = {
    labels: ['Ganhos', 'Perdas'],
    colors: ['#2A9D8F', '#e63946']
  };

  // Prepare line chart data for performance over time
  const lineChartData = operations.map((op, index) => {
    const previousProfit = index > 0 
      ? operations.slice(0, index).reduce((acc, prevOp) => acc + (prevOp.profit || 0), 0) 
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
          >
            Adicionar Operação
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-teal mb-4">Desempenho</h3>
          {operations.length > 0 ? (
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
                {operations.length ? ((winCount / operations.length) * 100).toFixed(0) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 animate-fade-in">
        <h3 className="text-xl font-semibold text-teal mb-4">Histórico de Operações</h3>
        
        {operations.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Par</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Preço Entrada</TableHead>
                  <TableHead>Preço Saída</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Capital</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead>ROI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operations.map((op) => (
                  <TableRow key={op.id}>
                    <TableCell className="font-medium">{op.currencyPair}</TableCell>
                    <TableCell>{new Date(op.date).toLocaleDateString()}</TableCell>
                    <TableCell>{op.type}</TableCell>
                    <TableCell>{op.entryPrice.toFixed(5)}</TableCell>
                    <TableCell>{op.exitPrice.toFixed(5)}</TableCell>
                    <TableCell>{op.lotSize.toFixed(2)}</TableCell>
                    <TableCell>$ {op.initialCapital}</TableCell>
                    <TableCell className={op.profit && op.profit >= 0 ? 'text-green font-medium' : 'text-red-500 font-medium'}>
                      $ {op.profit?.toFixed(2)}
                    </TableCell>
                    <TableCell className={op.roi && op.roi >= 0 ? 'text-green font-medium' : 'text-red-500 font-medium'}>
                      {op.roi?.toFixed(2)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Nenhuma operação registrada
          </div>
        )}
      </div>
    </div>
  );
};

export default ForexPanel;
