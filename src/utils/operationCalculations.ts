
// Utility functions for calculating profits and ROI for trading operations

// Calculate profit for stock operations
export const calculateStockProfit = (
  entryPrice: number, 
  exitPrice: number, 
  quantity: number, 
  type: "Compra" | "Venda"
): number => {
  const entryValue = entryPrice * quantity;
  const exitValue = exitPrice * quantity;
  
  if (type === "Compra") {
    // Na compra: lucro quando preço saída > preço entrada
    return exitValue - entryValue;
  } else {
    // Na venda: lucro quando preço entrada > preço saída
    return entryValue - exitValue;
  }
};

// Calculate profit for forex operations
export const calculateForexProfit = (
  entryPrice: number, 
  exitPrice: number, 
  lotSize: number,
  type: "Buy" | "Sell"
): number => {
  const priceDiff = exitPrice - entryPrice;
  
  if (type === "Buy") {
    // Se for compra (Buy), lucro quando preço saída > preço entrada
    return priceDiff * lotSize * 100000;
  } else {
    // Se for venda (Sell), lucro quando preço entrada > preço saída
    return -priceDiff * lotSize * 100000;
  }
};

// Calculate ROI for forex operations
export const calculateForexROI = (profit: number, initialCapital: number): number => {
  return (profit / initialCapital) * 100;
};
