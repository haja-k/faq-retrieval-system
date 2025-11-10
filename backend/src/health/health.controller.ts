import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  @Get()
  async checkHealth() {
    try {
      // Check database connection
      await this.dataSource.query('SELECT 1');
      
      return {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('db')
  async checkDatabase() {
    try {
      const result = await this.dataSource.query('SELECT NOW() as current_time, version() as version');
      return {
        status: 'connected',
        ...result[0],
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
}