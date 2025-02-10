export class ProfileResponse {
  id: number;
  name: string;
  image: string;
  createdAt: string;
}

export class UpdateProfileRequest {
  image: string;
}

export class DeleteProfileRequest {
  nama: string;
}
