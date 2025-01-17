import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
import { TestModule } from '../test/test.module';

@Module({
  imports: [CommonModule, UserModule, TestModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
