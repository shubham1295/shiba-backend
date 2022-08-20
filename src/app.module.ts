import { Module } from '@nestjs/common';
// import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigEntity } from './user-details/entities/config-entity';
import { UserDetail } from './user-details/entities/user-detail.entity';
import { UserDetailsModule } from './user-details/user-details.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    UserDetailsModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'bocmfox74gzgdendt04f-mysql.services.clever-cloud.com',
      port: 3306,
      username: 'u7r1cxesbrdnevzc',
      password: 'Iqjm1pqSkgAbCbT3Pmm4',
      database: 'bocmfox74gzgdendt04f',
      entities: [UserDetail, ConfigEntity],
      synchronize: true,
    }),
  ],
})
export class AppModule {}
