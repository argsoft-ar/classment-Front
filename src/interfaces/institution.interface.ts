/** GET /institution — single-institution configuration row. */
export interface IInstitutionConfig {
  id: string;
  name: string;
  cue: string;
  address: string;
  levelType: "TERTIARY";
  allowsPromotion: boolean;
  passingGrade: number;
  promotionGrade: number | null;
  validateFinalCorrelatives: boolean;
  createdAt: string;
  updatedAt: string;
}

/** PATCH /institution (SuperAdmin only). */
export type UpdateInstitutionDto = Partial<
  Pick<
    IInstitutionConfig,
    | "name"
    | "cue"
    | "address"
    | "allowsPromotion"
    | "passingGrade"
    | "promotionGrade"
    | "validateFinalCorrelatives"
  >
>;
