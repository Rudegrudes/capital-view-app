
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useStockOperations } from "@/hooks/useStockOperations"; 
import { useState } from "react";
import type { StockOperation } from "@/types/stock";

const StockHistory = () => {
  const { stockOperations, loading, removeStockOperation } = useStockOperations();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    console.log("[StockHistory] Iniciando exclusão para o ID:", id);
    setIsDeleting(true);
    setDeletingId(id);
    try {
      await removeStockOperation(id);
      console.log("[StockHistory] Exclusão concluída para o ID:", id);
    } catch (error) {
      console.error("[StockHistory] Erro ao excluir a operação ID:", id, error);
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 animate-fade-in">
        <h3 className="text-xl font-semibold text-teal mb-4">Histórico de Operações</h3>
        <div className="text-center py-8">
          Carregando histórico...
        </div>
      </div>
    );
  }

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
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockOperations.map((op: StockOperation) => (
                <TableRow key={op.id}>
                  <TableCell className="font-medium">{op.stockName}</TableCell>
                  <TableCell>{new Date(op.date).toLocaleDateString()}</TableCell>
                  <TableCell>{op.type}</TableCell>
                  <TableCell>R$ {op.entryPrice.toFixed(2)}</TableCell>
                  <TableCell>R$ {op.exitPrice.toFixed(2)}</TableCell>
                  <TableCell>{op.quantity}</TableCell>
                  <TableCell className={op.profit && op.profit >= 0 ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>
                    R$ {op.profit?.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-gray-500 hover:text-red-500"
                          title="Remover operação"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover operação</AlertDialogTitle>
                          <AlertDialogDescription>
                            Deseja remover a operação {op.stockName}? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => {
                              console.log("[StockHistory] Botão de remover clicado para o ID:", op.id);
                              handleDelete(op.id);
                            }}
                            disabled={isDeleting && deletingId === op.id}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            {isDeleting && deletingId === op.id ? "Removendo..." : "Remover"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
