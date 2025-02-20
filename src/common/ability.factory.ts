import {
  AbilityBuilder,
  AbilityClass,
  PureAbility,
  InferSubjects,
} from '@casl/ability';
import { User } from '@prisma/client';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type Subjects = InferSubjects<'Post' | 'all'>;
export type AppAbility = PureAbility<[Action, Subjects]>;

export function defineAbilityFor(user: User) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(
    PureAbility as AbilityClass<AppAbility>,
  );

  can(Action.Read, 'Post'); // Semua user bisa membaca postingan
  can(Action.Create, 'Post'); // Semua user bisa membuat postingan

  // OBAC: User hanya bisa mengedit dan menghapus postingan miliknya sendiri
  can([Action.Update, Action.Delete], 'Post', { authorId: user.id });

  return build();
}
