import type { LucideIcon } from "lucide-react";

/** One entry of the sidebar navigation. */
export interface NavbarItem {
  label: string;
  to: string;
  /** Lucide icon component rendered before the label (decorative). */
  icon: LucideIcon;
  /** Active only on exact match (for index routes). */
  end?: boolean;
}
