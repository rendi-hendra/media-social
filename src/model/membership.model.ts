export class MembershipResponse {
  id: string;
  userId: number;
  amount: number;
  createdAt: Date;
}

export class CreateMembershipRequest {
  amount: number;
}
