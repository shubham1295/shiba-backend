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
  Redirect,
} from '@nestjs/common';
import { UserDetailsService } from './user-details.service';
import { CreateUserDetailDto } from './dto/create-user-detail.dto';
import { RawBody } from 'src/Utils/utils';
import e, { Request } from 'express';

@Controller('user-details')
export class UserDetailsController {
  constructor(private readonly userDetailsService: UserDetailsService) {}

  @Get()
  getAmount() {
    return this.userDetailsService.getAmount();
  }

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
  @Redirect()
  successPage(@Body() req: any, @Res() res: Response) {
    // let url: boolean = false;
    this.userDetailsService.successPage(req);
    const t: string = 'fail';

    let test: string = 'https://google.com/';
    const u = test + t;
    return { url: u };
  }

  @Post('failPage')
  @Redirect()
  failPage(@Body() req: any, @Res() res: Response) {
    console.log(req);
    // // let url: boolean = false;
    // this.userDetailsService.successPage(req).then((val) => {
    //   // url = val === 'Success' ? true : false;
    // });
    // const t: string = 'fail';

    // let test: string = 'https://google.com/';
    // const u = test + t;
    // return { url: u };
  }
}
