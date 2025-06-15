import { Module } from '@nestjs/common';
import { UserRouter } from './user.router';
import { CommonModule } from '../common/common.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [CommonModule, AuthModule],
  providers: [UserRouter],
  exports: [UserRouter],
})
export class UsersModule {}
