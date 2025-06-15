import { Module } from '@nestjs/common';
import { TodosService } from './todos.service';
import { TodoRouter } from './todo.router';
import { CommonModule } from '../common/common.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [CommonModule, DatabaseModule],
  providers: [TodosService, TodoRouter],
})
export class TodosModule {}
