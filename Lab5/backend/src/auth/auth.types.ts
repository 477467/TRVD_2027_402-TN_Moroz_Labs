export type RoleName = 'admin' | 'operator';

/** Дані, які підписуються в access-токені (claim sub містить ID користувача). */
export interface JwtPayload {
  sub: string;
  username: string;
  role: RoleName;
  iat?: number;
  exp?: number;
}

export interface RefreshPayload {
  sub: string;
  jti: string;
  exp?: number;
}
