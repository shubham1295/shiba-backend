import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { UserDetailsService } from './user-details.service';
import { CreateUserDetailDto } from './dto/create-user-detail.dto';
import { RawBody } from 'src/Utils/utils';
import { Request } from 'express';

@Controller('user-details')
export class UserDetailsController {
  constructor(private readonly userDetailsService: UserDetailsService) {}

  @Post('create')
  create(@Body() createUserDetailDto: CreateUserDetailDto) {
    return this.userDetailsService.create(createUserDetailDto);
  }

  @Post('coinbaseWebhookHandler')
  webHookHandler(@Headers() headers, @Req() rawBody: RawBodyRequest<Request>) {
    return this.userDetailsService.webHookHandler(headers, rawBody.rawBody);
  }
}
