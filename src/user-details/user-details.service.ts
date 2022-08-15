import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Repository} from 'typeorm';
import { CreateUserDetailDto } from './dto/create-user-detail.dto';
import { UserDetail } from './entities/user-detail.entity';

const fetch = require('node-fetch');

@Injectable()
export class UserDetailsService {

  constructor(@InjectRepository(UserDetail) private readonly userRepository: Repository<UserDetail  >){}

  createInvoice = async(name:string, email:string, amt:string) => {
    const url = 'https://api.commerce.coinbase.com/invoices';

    const res = await axios.post(url, {
        business_name: 'Shiba Pubg',
        customer_email: email,
        customer_name: name,
        memo: '',
        local_price: { amount: amt, currency: 'INR' },
      },
      {headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-CC-Api-Key': 'b6ee57a3-8ec8-434a-a62c-cc67e2f4d896',
      }}
    )

    return res?.data?.data;
  };


  async create(createUserDetailDto: CreateUserDetailDto) {

    const user = this.userRepository.create(createUserDetailDto);

    this.userRepository.save(user);

    let success = false;
    try {
      const res = await this.createInvoice(user.name, user.email, user.amount);
      console.log("RESPONSE: ", res?.hosted_url);
      success = true
      return {success, response: res?.hosted_url};
    } catch (e) {
      console.log('ERROR: ', e);
      success = false
      return {success, response: e};
    }
    
  }

}
