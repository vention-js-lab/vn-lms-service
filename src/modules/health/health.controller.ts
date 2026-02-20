import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Controller('health')
export class HealthController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  async health() {
    try {
      await this.databaseService.db.execute('SELECT 1');

      return {
        status: 'ok',
        database: 'connected',
      };
    } catch {
      return {
        status: 'degraded',
        database: 'disconnected',
      };
    }
  }
}
