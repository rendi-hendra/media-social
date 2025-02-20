import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
import { TestModule } from '../test/test.module';
import { ConfigModule } from '@nestjs/config';
import { ProfileModule } from './profile/profile.module';
import { FollowModule } from './follow/follow.module';
import { PostModule } from './post/post.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CommonModule,
    UserModule,
    TestModule,
    ProfileModule,
    FollowModule,
    PostModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
