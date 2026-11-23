import type { BadgeStatus } from "../components/StatusBadge/status";
import type { UserStatus } from "../interfaces/user.interface";

/** Reuses StatusBadge colors for user account states. */
export const USER_STATUS_BADGE: Record<UserStatus, BadgeStatus> = {
  ACTIVE: "ACTIVA",
  INVITED: "CURSANDO",
  INACTIVE: "BAJA",
};
