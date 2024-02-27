import User from '../models/User.js';
import {
    AccountId,
    PrivateKey,
    Client,
    AccountBalanceQuery,
    AccountInfoQuery,
    TransferTransaction,
  } from "@hashgraph/sdk";
  import dotenv from 'dotenv';
  dotenv.config();
  const accountIdString = process.env.ACCOUNT_ID;
const privateKeyString = process.env.ACCOUNT_PRIVATE_KEY;
const tokenId = process.env.TOKEN_ID
if (accountIdString === undefined || privateKeyString === undefined) { throw new Error('account id and private key in env file are empty') }

const operatorAccountId = AccountId.fromString(accountIdString);
const operatorPrivateKey = PrivateKey.fromString(privateKeyString);

const client = Client.forTestnet().setOperator(operatorAccountId, operatorPrivateKey);
async function createchildinblockchain(){
    
    console.log('- Creating a new account...\n');
    const privateKey = PrivateKey.generateECDSA();
    const publicKey = privateKey.publicKey;
    // Assuming that the target shard and realm are known.
    // For now they are virtually always 0 and 0.
    const aliasAccountId = publicKey.toAccountId(0, 0);
    console.log(`- New account ID: ${aliasAccountId.toString()}`);
    if (aliasAccountId.aliasKey === null) {
        throw new Error('alias key is empty');
    }
    console.log(`- Just the aliasKey: ${aliasAccountId.aliasKey.toString()}\n`);
    /**
     * Step 4
     *
     * Transfer the fungible token to the public key alias
     */
    console.log('- Transferring the fungible tokens...\n');
    await sendToken(client, tokenId, operatorAccountId, aliasAccountId, 1, operatorPrivateKey);
    /**
     * Step 5
     *
     * Return the new account ID in the child record
     */
    const accountId =await getAccountIdByAlias(client, aliasAccountId);
    console.log(`The normal account ID of the given alias: ${accountId}`);
    /**
   * Step 6
   *
   * Show the new account ID owns the fungible token
   */
    const accountBalances = await new AccountBalanceQuery()
        .setAccountId(aliasAccountId)
        .execute(client);
    if (!accountBalances.tokens || !accountBalances.tokens._map) {
        throw new Error('account balance shows no tokens.');
    }
    const tokenBalanceAccountId = accountBalances.tokens._map
        .get(tokenId.toString());
    if (!tokenBalanceAccountId) {
        throw new Error(`account balance does not have tokens for token id: ${tokenId}.`);
    }
    tokenBalanceAccountId.toInt() === 10
        ? console.log(`Account is created successfully using HTS 'TransferTransaction'`)
        : console.log("Creating account with HTS using public key alias failed");
    return accountId;
}


// Function to create a new child user
export  async function createChild(req, res) {
    const child = req.body;
    child.Role="child"
    try {
      const accountId =  await  createchildinblockchain();
      child.Adressblockchain = accountId.toString();
        const childcreated = await User.create(child);
        

    
        res.json(childcreated);
   
    } catch (error) {
        throw new Error('Error creating child user');
    }
}

// Function to get all children by parent ID
export  async function getAllChildrenByParentId(req, res) {
    try {
        const children = await User.find({ Parentid: req.params.parentid, Role: 'child' });
      
        res.json(children)
    } catch (error) {
        throw new Error('Error fetching children');
    }
}

// Function to get all children
export async function getAllChildren(req, res) {
    try {
        const children = await User.find({ Role: 'child' });
        res.json(children)
    } catch (error) {
        throw new Error('Error fetching children');
    }
}

// Function to delete a child by ID
export async function deleteChildById(req, res) {
    try {
        const deletedChild = await User.findByIdAndDelete(req.body.childId);
        res.json(deletedChild)
    } catch (error) {
        throw new Error('Error deleting child');
    }
}
async function getAccountIdByAlias (client, aliasAccountId){
    const accountInfo = await new AccountInfoQuery()
        .setAccountId(aliasAccountId)
        .execute(client);
    console.log("accountinfo:" + accountInfo);
    return accountInfo.accountId;
}
async function sendToken(client, tokenId, owner, aliasAccountId, sendBalance, treasuryAccPvKey) {
    const tokenTransferTx = new TransferTransaction()
        .addTokenTransfer(tokenId, owner, -sendBalance)
        .addTokenTransfer(tokenId, aliasAccountId, sendBalance)
        .freezeWith(client);
     
    // Sign the transaction with the operator key
    let tokenTransferTxSign = await tokenTransferTx.sign(treasuryAccPvKey);
    // Submit the transaction to the Hedera network
    let tokenTransferSubmit = await tokenTransferTxSign.execute(client);
    // Get transaction receipt information
    await tokenTransferSubmit.getReceipt(client);
}
