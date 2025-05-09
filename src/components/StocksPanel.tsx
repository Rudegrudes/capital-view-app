
import StockForm from "./stocks/StockForm";
import StockChart from "./stocks/StockChart";
import StockHistory from "./stocks/StockHistory";

const StocksPanel = () => {
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
