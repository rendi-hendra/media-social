import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { MembershipService } from './membership.service';
import {
  CreateMembershipRequest,
  MembershipResponse,
} from '../model/membership.model';
import { WebResponse } from '../model/web.model';
import { JwtRequest } from '../model/jwt.model';

@Controller('/api/memberships')
export class MembershipController {
  constructor(private membershipService: MembershipService) {}

  @Post()
  @HttpCode(201)
  async createMembership(
    @Body() request: CreateMembershipRequest,
    @Req() req: JwtRequest,
  ): Promise<WebResponse<MembershipResponse>> {
    const result = await this.membershipService.createMembership(
      request,
      req.user.sub,
    );
    return {
      data: result,
    };
  }
}
