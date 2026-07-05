import { createContext, useState } from "react";

export const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  const [summary, setSummary] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [livingCost, setLivingCost] = useState([]);
  const [debts, setDebts] = useState([]);
  const [familyCost, setFamilyCost] = useState([]);

  return (
    <FinanceContext.Provider
      value={{
        summary,
        setSummary,

        transactions,
        setTransactions,

        livingCost,
        setLivingCost,

        debts,
        setDebts,

        familyCost,
        setFamilyCost,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}