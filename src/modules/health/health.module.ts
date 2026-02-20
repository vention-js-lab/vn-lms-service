import { Module } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { HealthController } from './health.controller';

@Module({
  providers: [DatabaseService],
  controllers: [HealthController],
})
export class HealthModule {}
