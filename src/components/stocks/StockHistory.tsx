
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOperations } from "@/context/OperationsContext";

const StockHistory = () => {
  const { stockOperations } = useOperations();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 animate-fade-in">
      <h3 className="text-xl font-semibold text-teal mb-4">Histórico de Operações</h3>
      
      {stockOperations.length > 0 ? (
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
              {stockOperations.map((op) => (
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
  );
};

export default StockHistory;
