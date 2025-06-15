import { Module } from '@nestjs/common';
import { TRPCModule } from 'nestjs-trpc';
import { TodosModule } from './todos/todos.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AppContext } from './common/context/app.context';

@Module({
  imports: [
    TRPCModule.forRoot({
      autoSchemaFile: '../../packages/trpc/src/server',
      context: AppContext,
    }),
    CommonModule,
    AuthModule,
    TodosModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
