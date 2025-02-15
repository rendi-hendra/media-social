export class FollowCountResponse {
  followers: number;
  following: number;
}

export class FollowResponse {
  status: string;
  following: {
    id: number;
    username: string;
    name: string;
  };
}

export class FollowRequest {
  id: number;
}
