const Tx = require('ethereumjs-tx').Transaction;
const web3 = require('web3');
import Common from 'ethereumjs-common';

import {
  chainUrl,
  contractABI,
  contractAddress,
  myAddress,
  privateKey,
  //   toAddress,
} from './constants';
import { AbiItem } from 'web3-utils';

var count;

export const transferShibaPubg = (toAddress: string, amt: number) => {
  //Alchemy HttpProvider Endpoint
  const web3js = new web3(
    new web3.providers.HttpProvider(process.env.CHAIN_URL_TESTNET),
  );

  var contract = new web3js.eth.Contract(
    contractABI as AbiItem[],
    contractAddress,
  );

  // console.log(myAddress);

  // get transaction count, later will used as nonce
  web3js.eth.getTransactionCount(myAddress).then(async function (v) {
    // console.log('Count: ' + v);
    count = v;

    var amount = web3js.utils.toHex(amt * 1e18);
    // console.log(amount);
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

    const common = Common.forCustomChain(
      'mainnet',
      {
        name: 'matic-mumbai', //polygon-mainnet
        networkId: 80001, //137
        chainId: 80001, //137
      },
      'petersburg',
    );

    const transaction = new Tx(rawTransaction, {
      common,
    });
    //signing transaction with private key
    transaction.sign(privateKey);
    //sending transacton via web3js module
    const transactionHash = await web3js.eth.sendSignedTransaction(
      '0x' + transaction.serialize().toString('hex'),
    ); // .on('transactionHash', console.log);
    console.log(transactionHash);

    if (transactionHash?.status === true) {
      console.log('transactionHash status true');
      return transactionHash?.transactionHash;
    } else {
      return null;
    }

    // contract.methods
    //   .balanceOf(myAddress)
    //   .call()
    // .then(function (balance) {
    //   console.log(web3.utils.fromWei(balance, 'finney'));
    // });
  });
};
