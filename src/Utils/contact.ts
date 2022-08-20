const Tx = require('ethereumjs-tx').Transaction;
// const web3 = require('web3');
import Web3 from 'web3';
import {
  contractABI,
  contractAddress,
  myAddress,
  privateKey,
  //   toAddress,
} from './constants';
import { AbiItem } from 'web3-utils';

var count;

//Infura HttpProvider Endpoint
const web3js = new Web3(
  new Web3.providers.HttpProvider(
    'https://rinkeby.infura.io/v3/b358549d97e44fb8b54e17089a9339b5',
  ),
);

export const transferShibaPubg = (toAddress: string, amt: number) => {
  var contract = new web3js.eth.Contract(
    contractABI as AbiItem[],
    contractAddress,
  );

  // get transaction count, later will used as nonce
  web3js.eth.getTransactionCount(myAddress).then(function (v) {
    console.log('Count: ' + v);
    count = v;

    var amount = web3js.utils.toHex(amt * 1e18);

    console.log(amount);
    // creating raw tranaction
    var rawTransaction = {
      from: myAddress,
      gasPrice: web3js.utils.toHex(20 * 1e9),
      gasLimit: web3js.utils.toHex(210000),
      to: contractAddress,
      value: '0x0',
      data: contract.methods.transfer(toAddress, amount).encodeABI(),
      nonce: web3js.utils.toHex(count),
    };
    console.log(rawTransaction);
    //creating tranaction via ethereumjs-tx
    const transaction = new Tx(rawTransaction, {
      chain: 'rinkeby',
      hardfork: 'petersburg',
    });
    //signing transaction with private key
    transaction.sign(privateKey);
    //sending transacton via web3js module
    web3js.eth
      .sendSignedTransaction('0x' + transaction.serialize().toString('hex'))
      .on('transactionHash', console.log);

    contract.methods
      .balanceOf(myAddress)
      .call()
      .then(function (balance) {
        console.log(Web3.utils.fromWei(balance, 'finney'));
      });
  });
};
