import { Module } from '@nestjs/common';
// import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigEntity } from './user-details/entities/config-entity';
import { UserDetail } from './user-details/entities/user-detail.entity';
import { UserDetailsModule } from './user-details/user-details.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    ConfigModule.forRoot(),
    UserDetailsModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_SCHEMA,
      entities: [UserDetail, ConfigEntity],
      synchronize: true,
    }),
  ],
})
export class AppModule {}
