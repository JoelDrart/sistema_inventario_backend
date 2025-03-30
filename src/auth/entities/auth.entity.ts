export class Auth {}

export class JWTPayload {
  id: string;
  email: string;
  rol: string;
  iat?: number;
  exp?: number;
}

//Interface para el request con el usuario decodificado
export interface RequestWithUser extends Request {
  user: JWTPayload;
}
