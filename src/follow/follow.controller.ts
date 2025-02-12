import { Controller } from '@nestjs/common';
import { FollowService } from './follow.service';

@Controller('/api/follows')
export class FollowController {
  constructor(private followService: FollowService) {}
}
