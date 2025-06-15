import { Module, ConsoleLogger } from '@nestjs/common';
import { LoggedMiddleware } from './middleware/logger.middleware';
import { UserService } from './services/user.service';
import { AppContext } from './context/app.context';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [ConsoleLogger, LoggedMiddleware, UserService, AppContext],
  exports: [LoggedMiddleware, UserService, AppContext],
})
export class CommonModule {}
