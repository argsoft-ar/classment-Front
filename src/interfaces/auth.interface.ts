export interface LoginDto {
  email: string;
  password: string;
  institutionId: string;
}

export interface LoginResponse {
  token: string;
}

export interface DecodedToken {
  userId: string;
  institutionId: string;
  role: string;
  email: string;
  // Standard JWT registered claims
  exp: number;
  iat: number;
}
