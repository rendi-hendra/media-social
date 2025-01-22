export class UserResponse {
  id?: number;
  name: string;
  email: string;
  image?: string;
  token?: string;
  createdAt: string;
}

export class RegisterUserRequest {
  name: string;
  email: string;
  password: string;
  image?: string;
  createdAt: string;
}

export class LoginUserRequest {
  email: string;
  password: string;
}
