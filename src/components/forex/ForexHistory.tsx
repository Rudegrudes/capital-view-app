
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
import { useOperations } from "@/context/OperationsContext";
import { useState } from "react";

const ForexHistory = () => {
  const { forexOperations, loading, removeForexOperation } = useOperations();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    setDeletingId(id);
    try {
      await removeForexOperation(id);
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
      
      {forexOperations.length > 0 ? (
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
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forexOperations.map((op) => (
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
                            Deseja remover a operação {op.currencyPair}? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(op.id)}
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

export default ForexHistory;
