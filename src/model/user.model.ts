export class UserResponse {
  id: number;
  username: string;
  name: string;
  email?: string;
  image: string;
  token?: string;
  createdAt: Date;
}

export class RegisterUserRequest {
  username: string;
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

export class DeleteUserRequest {
  password: string;
}
