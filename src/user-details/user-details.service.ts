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
import { NestFactory } from '@nestjs/core/nest-factory';
import { NestExpressApplication } from '@nestjs/platform-express/interfaces/nest-express-application.interface';
import { AppModule } from 'src/app.module';
import { join } from 'path';

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
    // console.log(user);
    // console.log(hash.digest('hex'));

    try {
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

      var hash = createHash('sha512');
      hash.update(value);

      // const res = await axios.post(
      //   payUApi,
      //   {
      //     key: payUApiMerchantKey,
      //     txnid: user.txnId,
      //     amount: user.amount,
      //     productinfo: productInfo,
      //     firstname: user.name,
      //     email: user.email,
      //     phone: user.phone,
      //     surl: 'https://apiplayground-response.herokuapp.com/',
      //     furl: 'https://apiplayground-response.herokuapp.com/',
      //     hash: hash.digest('hex'),
      //   },
      //   {
      //     headers: {
      //       Accept: 'application/json',
      //       'Content-Type': 'multipart/form-data',
      //     },
      //   },
      // );
      // console.log(res);
      // return res?.data;

      const json = `{
      "key" : "${payUApiMerchantKey}",
      "txnId": "${user.txnId}",
      "amount": "${user.amount}",
      "prodInfo": "${productInfo}",
      "name": "${user.name}",
      "email": "${user.email}",
      "hash": "${hash.digest('hex')}",
      "surl": "https://shibapubg.herokuapp.com/user-details/successPage",
      "furl": "https://shibapubg.herokuapp.com/user-details/failPage"
    }`;

      let success = true;
      return { success, response: JSON.parse(json) };
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

  findBytxnId(txnId: string): Promise<CreateUserDetailDto | undefined> {
    return this.userRepository.findOne({
      where: { txnId: txnId },
    });
  }

  getAmount() {
    const configRes = this.findBykey('tokenPrice');
    return configRes;
  }

  // async create(createUserDetailDto: CreateUserDetailDto) {
  //   const txnId: string = uuid();
  //   createUserDetailDto.txnId = txnId;
  //   let success = false;
  //   try {
  //     const user = this.userRepository.create(createUserDetailDto);
  //     this.userRepository.save(user);
  //     success = true;
  //     return { success, response: 'User Created' };
  //   } catch (e) {
  //     console.log('ERROR in create: ', e);
  //     success = false;
  //     return { success, response: e };
  //   }
  // }

  async payCrypto(createUserDetailDto: CreateUserDetailDto) {
    let success = false;
    if (
      createUserDetailDto.tokenAmount === null ||
      createUserDetailDto.tokenAmount === '' ||
      createUserDetailDto.tokenAmount === '0'
    ) {
      return { success, false: 'Token amount is not proper' };
    }
    try {
      const currencyRes = await axios.get(
        'https://api.exchangerate.host/convert?from=USD&to=INR',
      );
      if (currencyRes.data.success === true) {
        const rate = currencyRes.data.result;
        // console.log(
        //   'INR : ' + (Number(createUserDetailDto.amount) * rate).toFixed(2),
        // );

        createUserDetailDto.amount = (
          Number(createUserDetailDto.amount) * rate
        ).toFixed(2);
        const txnId: string = uuid();
        createUserDetailDto.txnId = txnId;
        const user = this.userRepository.create(createUserDetailDto);
        user.paymentMode = 'Crypto';
        this.userRepository.save(user);
        const res = await this.createInvoice(
          user.name,
          user.email,
          user.amount,
        );
        success = true;
        return { success, response: res?.hosted_url };
      } else {
        success = false;
        return { success, response: 'Currency Conversion Failed' };
      }
    } catch (e) {
      console.log('ERROR in payCrypto: ', e);
      success = false;
      return { success, response: e };
    }
  }

  async payBank(createUserDetailDto: CreateUserDetailDto) {
    let success = false;
    if (
      createUserDetailDto.tokenAmount === null ||
      createUserDetailDto.tokenAmount === '' ||
      createUserDetailDto.tokenAmount === '0'
    ) {
      return { success, false: 'Token amount is not proper' };
    }
    try {
      const currencyRes = await axios.get(
        'https://api.exchangerate.host/convert?from=USD&to=INR',
      );
      if (currencyRes.data.success === true) {
        const rate = currencyRes.data.result;
        // console.log(
        //   'INR : ' + (Number(createUserDetailDto.amount) * rate).toFixed(2),
        // );

        createUserDetailDto.amount = (
          Number(createUserDetailDto.amount) * rate
        ).toFixed(2);
        const txnId: string = uuid();
        createUserDetailDto.txnId = txnId;
        const user = this.userRepository.create(createUserDetailDto);
        user.paymentMode = 'payU';
        this.userRepository.save(user);
        const res = await this.payuPayment(user);
        success = true;
        return res;
      } else {
        success = false;
        return { success, response: 'Currency Conversion Failed' };
      }
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
      data.paid = 'done';
      this.userRepository.save(data);

      if (data?.tokenTransfered !== 'done') {
        await transferShibaPubg(data?.address, Number(data?.tokenAmount)).then(
          (r) => {
            console.log('hash : ' + r);
            if (r !== null && r !== undefined) {
              data.tokenTransfered = 'done';
              this.userRepository.save(data);
            }
          },
        );
      }
    }

    return 'Signed Webhook Received: ' + event?.id;
  }

  async successPage(req: any) {
    if (req?.status === 'success' && req?.error === 'E000') {
      const data = await this.findBytxnId(req?.txnid);
      if (null !== data) {
        data.paid = 'done';
        this.userRepository.save(data);
        if (data?.tokenTransfered !== 'done') {
          const result = await transferShibaPubg(
            data?.address,
            Number(data?.tokenAmount),
          ).then((r) => {
            console.log('hash : ' + r);
            if (r !== null && r !== undefined) {
              data.tokenTransfered = 'done';
              this.userRepository.save(data);
              return 'Success';
            }
          });

          return result;
        }
      } else {
        console.log('No user');
        return 'No User Found';
      }
    }
  }
}
