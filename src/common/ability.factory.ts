import {
  AbilityBuilder,
  PureAbility,
  InferSubjects,
  createMongoAbility,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PostResponse } from '../model/post.model';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

// class Post {
//   id: number;
//   title: string;
//   userId: number;
//   author: User;
//   description: string;
// }

export type Subjects = InferSubjects<typeof PostResponse | 'all'>;
export type AppAbility = PureAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForPost(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

    can(Action.Read, PostResponse); // Semua user bisa membaca postingan
    can(Action.Create, PostResponse); // Semua user bisa membuat postingan
    // OBAC: User hanya bisa mengedit dan menghapus postingan miliknya sendiri
    can([Action.Update, Action.Delete], PostResponse, { userId: user.id });

    return build();
  }
}
