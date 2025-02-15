export class FollowCountResponse {
  followers: number;
  following: number;
}

export class FollowResponse {
  status: string;
  following: {
    id: number;
    name: string;
  };
}

export class FollowRequest {
  id: number;
}
