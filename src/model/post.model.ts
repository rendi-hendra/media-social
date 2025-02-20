export class PostResponse {
  id: string;
  userId: number;
  name: string;
  slug: string;
  image: string;
  description: string;
  createdAt: Date;
}

export class CreatePostRequest {
  userId: number;
  name: string;
  slug: string;
  image: string;
  description: string;
  createdAt: Date;
}
