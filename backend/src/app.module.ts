import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaqModule } from './faq/faq.module';
import { HealthModule } from './health/health.module';
import { Faq } from './faq/entities/faq.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Faq],
      synchronize: true,
      logging: process.env.NODE_ENV === 'development',
    }),
    FaqModule,
    HealthModule,
  ],
})
export class AppModule {}