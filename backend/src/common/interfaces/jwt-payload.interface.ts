export interface JwtPayload {
  sub: number;
  email: string;
}

export interface AuthenticatedUser {
  userId: number;
  email: string;
}