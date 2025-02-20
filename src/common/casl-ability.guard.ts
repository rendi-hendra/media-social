import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ForbiddenError } from '@casl/ability';
import { defineAbilityFor } from './ability.factory';
import { PrismaService } from './prisma.service';

@Injectable()
export class CaslAbilityGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const ability = defineAbilityFor(user);
    const rules =
      this.reflector.get('check-ability', context.getHandler()) || [];

    try {
      for (const rule of rules) {
        if (
          rule.subject === 'Post' &&
          ['update', 'delete'].includes(rule.action)
        ) {
          // Cek apakah postingan benar-benar milik user
          const post = await this.prisma.post.findUnique({
            where: { id: request.params.id },
          });

          if (!post) return false; // Post tidak ditemukan
          ForbiddenError.from(ability).throwUnlessCan(rule.action, 'Post');
        } else {
          ForbiddenError.from(ability).throwUnlessCan(
            rule.action,
            rule.subject,
          );
        }
      }
      return true;
    } catch (error) {
      return false;
    }
  }
}
