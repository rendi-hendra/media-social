import { Body, Controller, HttpCode, Patch, Post, Req } from '@nestjs/common';
import { MembershipService } from './membership.service';
import {
  CreateAndUpdateMembershipRequest,
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
    @Body() request: CreateAndUpdateMembershipRequest,
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

  @Patch()
  @HttpCode(201)
  async updateMembership(
    @Body() request: CreateAndUpdateMembershipRequest,
    @Req() req: JwtRequest,
  ): Promise<WebResponse<MembershipResponse>> {
    const result = await this.membershipService.updateMembership(
      request,
      req.user.sub,
    );
    return {
      data: result,
    };
  }
}
