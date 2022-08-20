import { Module } from '@nestjs/common';
import { UserDetailsService } from './user-details.service';
import { UserDetailsController } from './user-details.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDetail } from './entities/user-detail.entity';
import { HttpModule } from '@nestjs/axios';
import { ConfigEntity } from './entities/config-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserDetail]),
    TypeOrmModule.forFeature([ConfigEntity]),
    HttpModule,
  ],
  controllers: [UserDetailsController],
  providers: [UserDetailsService],
})
export class UserDetailsModule {}
