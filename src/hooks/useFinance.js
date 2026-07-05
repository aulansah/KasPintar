import { useContext } from "react";
import { FinanceContext } from "../context/FinanceContext";

export function useFinance() {
  return useContext(FinanceContext);
}