export class JwtRequest {
  user: {
    sub: number;
    username: string;
    name: string;
    iat: number;
    exp: number;
  };
}
