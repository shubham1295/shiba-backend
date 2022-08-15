import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Repository} from 'typeorm';
import { CreateUserDetailDto } from './dto/create-user-detail.dto';
import { UpdateUserDetailDto } from './dto/update-user-detail.dto';
import { UserDetail } from './entities/user-detail.entity';

const fetch = require('node-fetch');

@Injectable()
export class UserDetailsService {

  constructor(@InjectRepository(UserDetail) private readonly userRepository: Repository<UserDetail  >, private readonly httpService : HttpService){}

  create(createUserDetailDto: CreateUserDetailDto) {

    const user = this.userRepository.create(createUserDetailDto);

    this.userRepository.save(user);

    this.createInvoice().then(res => console.log(res));

    return "testing";
    
  }


  async createInvoice() {
    const url = 'https://api.commerce.coinbase.com/invoices';
    const options = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-CC-Api-Key': 'b6ee57a3-8ec8-434a-a62c-cc67e2f4d896'
      },
      body: JSON.stringify({
        business_name: 'Crypto Accounting LLC',
        customer_email: 'customer@test.com',
        customer_name: 'Test Customer 2',
        memo: 'Taxes and Accounting Services',
        local_price: {amount: 1, currency: 'INR'}
      })
    };
    let ress : any;
    const res = fetch(url, options)
      .then(res => res.json())
      .then(json => console.log(json.data))
      .then(data => ress = data)
      .catch(err => console.error('error:' + err));
      
      await console.log("res :"+res);
      console.log("ress :"+ress);
  }

  // findAll() {
  //   return `This action returns all userDetails`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} userDetail`;
  // }

  // update(id: number, updateUserDetailDto: UpdateUserDetailDto) {
  //   return `This action updates a #${id} userDetail`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} userDetail`;
  // }
}
