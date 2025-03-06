import { AbilityBuilder, PureAbility } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { Post, User } from '@prisma/client';
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma';
import { Action } from '../enum/action.enum';

export type AppAbility = PureAbility<
  [
    string,
    Subjects<{
      User: User;
      Post: Post;
    }>,
  ],
  PrismaQuery
>;

@Injectable()
export class CaslAbilityFactory {
  createForPost(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createPrismaAbility,
    );

    can([Action.Update, Action.Delete], 'Post', { userId: user.id });

    return build();
  }
}
