import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Chart, LineChart } from "@/components/ui/chart";

type StockOperation = {
  id: number;
  stockName: string;
  date: string;
  type: "Compra" | "Venda";
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  profit?: number;
};

const StocksPanel = () => {
  const [operations, setOperations] = useState<StockOperation[]>([]);
  const [stockName, setStockName] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState<"Compra" | "Venda">("Compra");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  const calculateProfit = (operation: Omit<StockOperation, "id" | "profit">) => {
    const entryValue = operation.entryPrice * operation.quantity;
    const exitValue = operation.exitPrice * operation.quantity;
    return operation.type === "Compra" ? exitValue - entryValue : entryValue - exitValue;
  };

  const handleAddOperation = () => {
    if (!stockName || !date || !entryPrice || !exitPrice || !quantity) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    const newOperation = {
      id: Date.now(),
      stockName,
      date,
      type,
      entryPrice: parseFloat(entryPrice),
      exitPrice: parseFloat(exitPrice),
      quantity: parseInt(quantity),
    };

    const profit = calculateProfit(newOperation);
    const operationWithProfit = { ...newOperation, profit };

    setOperations([...operations, operationWithProfit]);
    toast.success("Operação adicionada com sucesso!");

    // Reset form
    setStockName("");
    setDate("");
    setType("Compra");
    setEntryPrice("");
    setExitPrice("");
    setQuantity("");
  };

  const totalProfit = operations.reduce((acc, op) => acc + (op.profit || 0), 0);
  
  // Prepare chart data for the updated Chart component
  const lineChartSeries = [{
    name: 'Lucro Acumulado',
    data: chartData.map(data => data.accumulated),
  }];
  
  const chartOptions = {
    xaxis: {
      categories: chartData.map(data => data.name),
    },
    colors: ['#2A9D8F']
  };

  return (
    <div className="pt-16 animate-fade-in">
      <h2 className="text-2xl font-bold text-teal mb-6">Painel de Operações em Ações</h2>
      
      <div className="grid md:grid-cols-2 gap-8 mb-8">
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
          >
            Adicionar Operação
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-teal mb-4">Lucro Acumulado</h3>
          {operations.length > 0 ? (
            <div className="h-[300px]">
              <Chart 
                type="area"
                series={lineChartSeries}
                options={chartOptions}
                height={300}
                className="mt-4"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] bg-gray rounded text-gray-500">
              Nenhuma operação registrada
            </div>
          )}
          
          <div className="mt-4 text-center">
            <span className="text-sm font-medium">Lucro Total: </span>
            <span className={`text-xl font-bold ${totalProfit >= 0 ? 'text-green' : 'text-red-500'}`}>
              R$ {totalProfit.toFixed(2)}
            </span>
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
                  <TableHead>Ação</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Preço Entrada</TableHead>
                  <TableHead>Preço Saída</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Resultado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operations.map((op) => (
                  <TableRow key={op.id}>
                    <TableCell className="font-medium">{op.stockName}</TableCell>
                    <TableCell>{new Date(op.date).toLocaleDateString()}</TableCell>
                    <TableCell>{op.type}</TableCell>
                    <TableCell>R$ {op.entryPrice.toFixed(2)}</TableCell>
                    <TableCell>R$ {op.exitPrice.toFixed(2)}</TableCell>
                    <TableCell>{op.quantity}</TableCell>
                    <TableCell className={op.profit && op.profit >= 0 ? 'text-green font-medium' : 'text-red-500 font-medium'}>
                      R$ {op.profit?.toFixed(2)}
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

export default StocksPanel;
