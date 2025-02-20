export class PostResponse {
  id: string;
  userId: number;
  author: string;
  slug: string;
  image: string;
  description: string;
  createdAt: Date;
}

export class CreatePostRequest {
  title: string;
  image: string;
  description: string;
}
