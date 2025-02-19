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

export class FollowUserResponse {
  id: number;
  username: string;
  name: string;
  followers: {
    id: number;
    username: string;
    name: string;
  }[];
  following: {
    id: number;
    username: string;
    name: string;
  }[];
}

export class FollowRequest {
  id: number;
}
