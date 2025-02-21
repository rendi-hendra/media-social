export class PostResponse {
  id: string;
  userId: number;
  author: string;
  title: string;
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

export class UpdatePostRequest {
  title: string;
  image: string;
  description: string;
}
