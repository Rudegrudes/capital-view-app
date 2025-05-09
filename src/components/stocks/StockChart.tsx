
import { Chart } from "@/components/ui/chart";
import { useOperations } from "@/context/OperationsContext";

const StockChart = () => {
  const { stockOperations } = useOperations();
  const totalProfit = stockOperations.reduce((acc, op) => acc + (op.profit || 0), 0);
  
  // Generate chart data from operations
  const chartData = stockOperations.map((operation, index) => {
    // For each operation, calculate the accumulated profit up to this point
    const accumulated = stockOperations
      .slice(0, index + 1)
      .reduce((acc, op) => acc + (op.profit || 0), 0);
      
    return {
      name: new Date(operation.date).toLocaleDateString(),
      accumulated,
    };
  });
  
  // Prepare chart data
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
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-xl font-semibold text-teal mb-4">Lucro Acumulado</h3>
      {stockOperations.length > 0 ? (
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
  );
};

export default StockChart;
