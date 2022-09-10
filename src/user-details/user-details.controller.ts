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
  Render,
  Res,
} from '@nestjs/common';
import { UserDetailsService } from './user-details.service';
import { CreateUserDetailDto } from './dto/create-user-detail.dto';
import { RawBody } from 'src/Utils/utils';
import { Request } from 'express';

@Controller('user-details')
export class UserDetailsController {
  constructor(private readonly userDetailsService: UserDetailsService) {}

  @Get()
  getAmount() {
    return this.userDetailsService.getAmount();
  }

  // @Get('create')
  // create(@Body() createUserDetailDto: CreateUserDetailDto) {
  //   console.log('testig');
  // }

  @Post('payCrypto')
  payCrypto(@Body() createUserDetailDto: CreateUserDetailDto) {
    return this.userDetailsService.payCrypto(createUserDetailDto);
  }

  @Post('payBank')
  payBank(@Body() createUserDetailDto: CreateUserDetailDto) {
    return this.userDetailsService.payBank(createUserDetailDto);
  }

  @Post('coinbaseWebhookHandler')
  webHookHandler(@Headers() headers, @Req() rawBody: RawBodyRequest<Request>) {
    return this.userDetailsService.webHookHandler(headers, rawBody.rawBody);
  }

  @Post('successPage')
  successPage(@Body() test: any) {
    return this.userDetailsService.successPage(test);
  }
}
