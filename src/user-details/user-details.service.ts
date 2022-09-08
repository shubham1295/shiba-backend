import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Webhook } from 'coinbase-commerce-node';
import {
  coinbaseInvoiceApi,
  localCurrency,
  payUApi,
  payUApiMerchantKey,
  payUApiSalt,
} from 'src/Utils/constants';
import { transferShibaPubg } from 'src/Utils/contact';
import { Repository } from 'typeorm';
import { ConfigDto } from './dto/config.dto';
import { CreateUserDetailDto } from './dto/create-user-detail.dto';
import { ConfigEntity } from './entities/config-entity';
import { UserDetail } from './entities/user-detail.entity';
import { v4 as uuid } from 'uuid';
import { createHash } from 'crypto';

@Injectable()
export class UserDetailsService {
  constructor(
    @InjectRepository(UserDetail)
    private readonly userRepository: Repository<UserDetail>,
    @InjectRepository(ConfigEntity)
    private readonly configDto: Repository<ConfigEntity>,
  ) {}

  createInvoice = async (name: string, email: string, amt: string) => {
    const res = await axios.post(
      coinbaseInvoiceApi,
      {
        business_name: 'Shiba Pubg',
        customer_email: email,
        customer_name: name,
        memo: '',
        local_price: { amount: amt, currency: localCurrency },
      },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-CC-Api-Key': process.env.COINBASE_API_KEY,
        },
      },
    );

    return res?.data?.data;
  };

  async payuPayment(user: CreateUserDetailDto) {
    var productInfo: string = user.tokenAmount + ' Shiba Pubg Token';
    var value: string =
      payUApiMerchantKey +
      '|' +
      user.txnId +
      '|' +
      user.amount +
      '|' +
      productInfo +
      '|' +
      user.name +
      '|' +
      user.email +
      '|||||||||||' +
      payUApiSalt;
    // var hash = sha512.hmac.update(payUApiSalt, value);
    var hash = createHash('sha512');
    hash.update(value);

    // console.log(hash.digest('hex'));

    try {
      const res = await axios.post(
        payUApi,
        {
          key: payUApiMerchantKey,
          txnid: user.txnId,
          amount: user.amount,
          productinfo: productInfo,
          firstname: user.name,
          email: user.email,
          phone: user.phone,
          surl: 'https://apiplayground-response.herokuapp.com/',
          furl: 'https://apiplayground-response.herokuapp.com/',
          hash: hash.digest('hex'),
        },
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      // console.log(res);

      return res?.data;
    } catch (e) {
      console.log('ERROR in payuPayment: ', e);
      let success = false;
      return { success, response: e };
    }
  }

  findBykey(key: string): Promise<ConfigDto | undefined> {
    return this.configDto.findOne({ where: { key } });
  }

  findByUserByEmail(email: string): Promise<CreateUserDetailDto | undefined> {
    return this.userRepository.findOne({
      where: { email: email },
      order: { id: 'DESC' },
    });
  }

  findByEmailAndPrice(
    email: string,
    price: string,
  ): Promise<CreateUserDetailDto | undefined> {
    return this.userRepository.findOne({
      where: { email: email, amount: price },
      order: { id: 'DESC' },
    });
  }

  getAmount() {
    const configRes = this.findBykey('tokenPrice');
    return configRes;
  }

  async create(createUserDetailDto: CreateUserDetailDto) {
    const txnId: string = uuid();
    createUserDetailDto.txnId = txnId;
    let success = false;
    try {
      const user = this.userRepository.create(createUserDetailDto);
      this.userRepository.save(user);
      success = true;
      return { success, response: 'User Created' };
    } catch (e) {
      console.log('ERROR in create: ', e);
      success = false;
      return { success, response: e };
    }
  }

  async payCrypto(createUserDetailDto: CreateUserDetailDto) {
    const user = await this.findByUserByEmail(createUserDetailDto.email);

    let success = false;
    try {
      user.paymentMode = 'Crypto';
      this.userRepository.save(user);
      const res = await this.createInvoice(user.name, user.email, user.amount);
      // console.log('RESPONSE: ', res?.hosted_url);
      success = true;
      return { success, response: 'res?.hosted_url' };
    } catch (e) {
      console.log('ERROR in payCrypto: ', e);
      success = false;
      return { success, response: e };
    }
  }

  async payBank(createUserDetailDto: CreateUserDetailDto) {
    // console.log('HERE');
    const user = await this.findByUserByEmail(createUserDetailDto.email);

    let success = false;
    try {
      const res = await this.payuPayment(user);
      // console.log('RESPONSE: ', res?.hosted_url);
      success = true;
      return res;
    } catch (e) {
      console.log('ERROR in payBank: ', e);
      success = false;
      return { success, response: e };
    }
  }

  async webHookHandler(header: string, rawbody: any) {
    // console.log('Body : ', rawbody);
    var event;
    var webhookSecret = process.env.COINBASE_WEBHOOK_SECRET;
    try {
      event = Webhook.verifyEventBody(
        rawbody,
        header['x-cc-webhook-signature'],
        webhookSecret,
      );
      console.log('Event : ', event);
    } catch (error) {
      console.log('Error occured', error?.message);

      return 'Webhook Error:' + error?.message;
    }

    if (event?.type == 'invoice:paid') {
      const data = await this.findByEmailAndPrice(
        event?.data?.customer_email,
        event?.data?.local_price.amount,
      );
      // console.log(data);
      transferShibaPubg(data?.address, Number(data?.tokenAmount));
    }

    return 'Signed Webhook Received: ' + event?.id;
  }
}
