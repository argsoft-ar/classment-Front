export interface IStudyPlanBrief {
  id: string;
  code: string;
  year: number;
}

/** GET /careers, GET /careers/:id */
export interface ICareer {
  id: string;
  name: string;
  durationYears: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  studyPlans: IStudyPlanBrief[];
  _count: { studyPlans: number };
}

export interface CreateCareerDto {
  name: string;
  durationYears: number;
}

export type UpdateCareerDto = Partial<CreateCareerDto & { isActive: boolean }>;
