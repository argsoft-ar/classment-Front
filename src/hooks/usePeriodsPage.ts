import { useState } from "react";
import { usePeriodsManagement, type PeriodRow } from "./usePeriodsManagement";
import { useOfferingsManagement } from "./useOfferingsManagement";
import { useConfirm } from "./useConfirm";
import type { TabItem } from "../components/Tabs/Tabs";

export type PeriodsTab = "periods" | "offerings";

/** Composition for the "Períodos y ofertas" screen (tabs + cross-navigation). */
export function usePeriodsPage() {
  const [activeTab, setActiveTab] = useState<PeriodsTab>("periods");
  const confirm = useConfirm();
  const periods = usePeriodsManagement();
  const offerings = useOfferingsManagement(periods.periods, periods.reload, confirm.request);

  const tabs: TabItem[] = [
    { id: "periods", label: "Períodos", count: periods.periods.length },
    { id: "offerings", label: "Ofertas", count: offerings.offerings.length },
  ];

  const onTabChange = (id: string) => setActiveTab(id === "offerings" ? "offerings" : "periods");

  const viewOfferings = (period: PeriodRow) => {
    offerings.setPeriodFilter(period.id);
    setActiveTab("offerings");
  };

  return {
    tabs,
    activeTab,
    onTabChange,
    periods,
    offerings,
    viewOfferings,
    confirmModal: confirm.modalProps,
  };
}
