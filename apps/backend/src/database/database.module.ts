import { Module, Global } from '@nestjs/common';
import { DatabaseService } from './config/database.config';
import { UserRepository } from './repositories/user.repository';
import { TodoRepository } from './repositories/todo.repository';

@Global()
@Module({
  providers: [DatabaseService, UserRepository, TodoRepository],
  exports: [DatabaseService, UserRepository, TodoRepository],
})
export class DatabaseModule {}
