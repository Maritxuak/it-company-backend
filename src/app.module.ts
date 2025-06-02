import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';
import { UserModule } from './users/users.module';
import { AuthModule } from './module/auth/auth.module';
import { UserProfileModule } from './module/user-profile/user-profile.module';
import { JobVacanciesModule } from './module/job-vacancies/job-vacancies.module';
import { NotificationsModule } from './module/notifications/notifications.module';
import { ChatsModule } from './module/chats/chats.module';
import { StatisticsModule } from './module/statistics/statistics.module';
import { ProjectsModule } from './module/projects/projects.module';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('DATABASE_HOST'),
        port: configService.getOrThrow<number>('DATABASE_PORT'),
        username: configService.getOrThrow<string>('DATABASE_USERNAME'),
        password: configService.getOrThrow<string>('DATABASE_PASSWORD'),
        database: configService.getOrThrow<string>('DATABASE_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    UserProfileModule,
    JobVacanciesModule,
    NotificationsModule,
    ChatsModule,
    StatisticsModule,
    ProjectsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
