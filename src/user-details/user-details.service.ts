import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Webhook } from 'coinbase-commerce-node';
import { transferShibaPubg } from 'src/Utils/contact';
import { Repository } from 'typeorm';
import { ConfigDto } from './dto/config.dto';
import { CreateUserDetailDto } from './dto/create-user-detail.dto';
import { ConfigEntity } from './entities/config-entity';
import { UserDetail } from './entities/user-detail.entity';

@Injectable()
export class UserDetailsService {
  constructor(
    @InjectRepository(UserDetail)
    private readonly userRepository: Repository<UserDetail>,
    @InjectRepository(ConfigEntity)
    private readonly configDto: Repository<ConfigEntity>,
  ) {}

  createInvoice = async (name: string, email: string, amt: string) => {
    const url = 'https://api.commerce.coinbase.com/invoices';

    const res = await axios.post(
      url,
      {
        business_name: 'Shiba Pubg',
        customer_email: email,
        customer_name: name,
        memo: '',
        local_price: { amount: amt, currency: 'INR' },
      },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-CC-Api-Key': 'b6ee57a3-8ec8-434a-a62c-cc67e2f4d896',
        },
      },
    );

    return res?.data?.data;
  };

  findBykey(key: string): Promise<ConfigDto | undefined> {
    return this.configDto.findOne({ where: { key } });
  }

  getAmount() {
    const configRes = this.findBykey('tokenPrice');
    return configRes;
  }

  async create(createUserDetailDto: CreateUserDetailDto) {
    const user = this.userRepository.create(createUserDetailDto);

    this.userRepository.save(user);

    let success = false;
    try {
      const res = await this.createInvoice(user.name, user.email, user.amount);
      console.log('RESPONSE: ', res?.hosted_url);
      success = true;
      return { success, response: res?.hosted_url };
    } catch (e) {
      console.log('ERROR: ', e);
      success = false;
      return { success, response: e };
    }
  }

  findByWalletAddress(
    email: string,
    price: string,
  ): Promise<CreateUserDetailDto | undefined> {
    return this.userRepository.findOne({
      where: { email: email, amount: price },
      order: { id: 'DESC' },
    });
  }

  async webHookHandler(header: string, rawbody: any) {
    // console.log('Body : ', rawbody);
    var event;
    var webhookSecret = 'ebe5db70-46bd-4f91-97ae-afdbae286ff6';
    try {
      event = Webhook.verifyEventBody(
        rawbody,
        header['x-cc-webhook-signature'],
        webhookSecret,
      );
      console.log('Event : ', event);
    } catch (error) {
      console.log('Error occured', error.message);

      return 'Webhook Error:' + error.message;
    }

    if (event.type == 'invoice:paid') {
      const data = await this.findByWalletAddress(
        event.data.customer_email,
        event.data.local_price.amount,
      );
      // console.log(data);
      transferShibaPubg(data.address, Number(data.tokenAmount));
    }

    return 'Signed Webhook Received: ' + event.id;
  }
}
