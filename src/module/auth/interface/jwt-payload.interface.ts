// src/module/auth/interfaces/jwt-payload.interface.ts
export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  // Добавьте другие поля, которые вам нужны в payload токена
}