
import { useEffect } from "react";
import StockForm from "./stocks/StockForm";
import StockChart from "./stocks/StockChart";
import StockHistory from "./stocks/StockHistory";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";

const StocksPanel = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      toast.warning("Faça login para salvar suas operações", {
        duration: 5000,
        id: "login-required-stocks"
      });
    }
  }, [user]);

  return (
    <div className="pt-16 animate-fade-in">
      <h2 className="text-2xl font-bold text-teal mb-6">Painel de Operações em Ações</h2>
      
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <StockForm />
        <StockChart />
      </div>
      
      <StockHistory />
    </div>
  );
};

export default StocksPanel;
