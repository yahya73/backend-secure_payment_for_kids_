import UserModel from "../models/User.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer'; // Import nodemailer for sending emails
import { google } from 'googleapis';
import { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar, Mnemonic } from "@hashgraph/sdk";
import { sendVerificationEmail } from './EmailVerificationController.js'
import { decryptText,encryptText,createchildinblockchain,transformString } from "./UserController.js";
import Wallet from 'ethereumjs-wallet';
import bip39 from 'bip39';
import hdkey from 'hdkey';

import {
    HDNode as ethersHdNode,
  } from '@ethersproject/hdnode';
export const registerParent = async (req, res) => {
    try {
        const { username, email, password, phoneNumber } = req.body;

       // const { accountId, mnemonic, balance} = await createHederaAccount();
      
        // Vérifier si le partenaire existe déjà
        const existingParent = await UserModel.findOne({ username });

        if (existingParent) {
            return res.status(400).json({ message: "User already exists", parent: existingParent });
        }        

        const existingEmail = await UserModel.findOne({ email });

        if (existingEmail) {
            return res.status(400).json({ message: "User with this email already exists" });
        }  

        const hashedPassword = await bcrypt.hash(password, 10);
        const {privateKey, accountId} =  await  createchildinblockchain();
        
        const newParent = new UserModel({
            username,
            email,
            password: hashedPassword,
            role: 'parent',
            image: 'default image', 
            phoneNumber,
            adressblockchain: accountId, 
            prohibitedProductTypes: ['type1', 'type2'],
            verified : false,
        });

        const parent = await newParent.save();
       
        const key =  await transformString(newParent.username);
        const encrypted = encryptText(privateKey,key);

      
       const decrypted = decryptText(encrypted.encryptedText,encrypted.iv,key);
        res.json({
            key:key,
            encrypted:encrypted.encryptedText,
            privatekey:privateKey.toString(),
            decrypted :decrypted,
            iv:encrypted.iv,
            parent
        });
        // const token = jwt.sign(
        //     { username: parent.Username, id: parent._id },
        //     process.env.JWT_KEY,
        //     { expiresIn: "1h" }
        // );        

       // await sendVerificationEmail(Email, Username);

       // res.status(200).json({ parent, mnemonic: mnemonic });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Function to generate a mnemonic phrase
const generateMnemonic = () => {
    return Mnemonic.generate();
};

// Function to generate keys from a mnemonic phrase
export async function generateKeysFromMnemonic(mnemonic)  {
   /* const hdNodeRoot = ethersHdNode.fromMnemonic(mnemonic);
    const accountHdPath = `m/44'/60'/0'/0/0`;
    const hdNode = hdNodeRoot.derivePath(accountHdPath);
  */
 
 const memonic2 = await Mnemonic.fromString(mnemonic.toString());

const privateKey = await memonic2.toStandardEd25519PrivateKey();
    // At this point the account technically does not yet exist,
    // and will need to be created when it receives its first transaction (later).
    // Convert the private key to string format as well as an EVM address.
    //const privateKey = PrivateKey.fromStringECDSA(hdNode.privateKey);
   // const privateKey = Mnemonic.fromString(mnemonic).toPrivateKey();
    const publicKey = privateKey.publicKey;
    
    return { privateKey, publicKey };
};

// Function to reset keys and return the new keys and phrase
const resetKeys = () => {
    const mnemonic = Mnemonic.generate12();
    
    const { privateKey, publicKey } = generateKeysFromMnemonic(mnemonic);
    return { mnemonic, privateKey, publicKey };
};

export const createHederaAccount = async () => {
    try {
        // Grab your Hedera testnet account ID and private key from your .env file
        const myAccountId = process.env.MY_ACCOUNT_ID;
        const myPrivateKey = PrivateKey.fromStringECDSA(process.env.MY_PRIVATE_KEY);

        // If we weren't able to grab it, we should throw a new error
        if (myAccountId == null || myPrivateKey == null) {
            throw new Error(
                "Environment variables myAccountId and myPrivateKey must be present"
            );
        }

        // Create your connection to the Hedera Network
        const client = Client.forTestnet();
        client.setOperator(myAccountId, myPrivateKey);

        // Create new keys
        const newAccountPrivateKey = await PrivateKey.generate();
        const newAccountPublicKey = newAccountPrivateKey.publicKey;

        // Create a new account with 1,000 tinybar starting balance
        const transactionResponse = await new AccountCreateTransaction()
            .setKey(newAccountPublicKey)
            .setInitialBalance(Hbar.fromTinybars(1000))
            .execute(client);

        // Get the new account ID from the transaction receipt
        const newAccountId = (await transactionResponse.getReceipt(client)).accountId;

        // Verify the account balance
        const accountBalance = await new AccountBalanceQuery()
            .setAccountId(newAccountId)
            .execute(client);

        let bcAccountId = "" + newAccountId
        // Generate mnemonic phrase for the new account
        const mnemonic = generateMnemonic();
       

        return { accountId: bcAccountId, mnemonic: await(mnemonic), balance: accountBalance.hbars.toTinybars().toString() };
    } catch (error) {
        throw new Error("Error creating Hedera account: " + error.message);
    }
};



export const getAccountDetails = async (req, res) => {
    try {
        const { accountId } = req.body;

        // Validate the input accountId
        if (!accountId) {
            return res.status(400).json({ message: "AccountId is required" });
        }

        // Initialize your Hedera client configuration
        const client = Client.forTestnet(); // or Client.forMainnet() based on your use case

        // Use your environment variables or another method to authenticate
        const myAccountId = process.env.MY_ACCOUNT_ID;
        const myPrivateKey = PrivateKey.fromStringECDSA(process.env.MY_PRIVATE_KEY);
        client.setOperator(myAccountId, myPrivateKey);

        // Fetch the account balance
        const accountBalance = await new AccountBalanceQuery()
            .setAccountId(accountId)
            .execute(client);

        const balanceInHbars = accountBalance.hbars.toTinybars();

        res.status(200).json({
            message: "Account details fetched successfully",
            accountId: accountId,
            balanceInHbars,
        });
    } catch (error) {
        console.error("Error fetching account details:", error);
        res.status(500).json({ message: "Error fetching account details" });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const email = req.params.email;
        
        // Find the user by email and update the Verified field to true
        const user = await UserModel.findOneAndUpdate(
            { email: email }, 
            { verified: true }, 
            { new: true, projection: { username: 1, email: 1, role: 1, verified: 1 } }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`Email ${email} verified`);
        res.status(200).json({ message: 'User verified with success', user }); // Respond with success message and user
    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(500).json({ message: 'Error verifying email' });
    }
};

// Route to change secret phrase
export const changeSecretPhrase = async (req, res) => {
    try {
        const { username, newSecretPhrase } = req.body;

        // Update the user's secret phrase in the database
        const user = await UserModel.findOneAndUpdate(
            { username: username },
            { secretPhrase: newSecretPhrase },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Respond with success message
        res.status(200).json({ message: 'Secret phrase changed successfully' });
    } catch (error) {
        console.error('Error changing secret phrase:', error);
        res.status(500).json({ message: 'Error changing secret phrase' });
    }
};

// Route to set a new secret phrase
export const setNewSecretPhrase = async (req, res) => {
    try {
        const { username, newSecretPhrase } = req.body;

        // Check if the user already exists
        const existingUser = await UserModel.findOne({ username });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Create a new user with the provided secret phrase
        const hashedPassword = await bcrypt.hash(newSecretPhrase, 10);
        const newUser = new UserModel({
            username,
            secretPhrase: hashedPassword,
            // Add other user properties as needed
        });

        // Save the new user to the database
        const user = await newUser.save();

        // Respond with success message
        res.status(200).json({ message: 'New secret phrase set successfully', user });
    } catch (error) {
        console.error('Error setting new secret phrase:', error);
        res.status(500).json({ message: 'Error setting new secret phrase' });
    }
};


function isValidMnemonic(mnemonic) {
    if (!bip39.validateMnemonic(mnemonic)) {
        return false;
    }
    return true;
}
export const forgetKeys = async (req, res) => {
    const mnemonic = req.body.mnemonic
    try {
        //const mnemonic = "put patch iron feed rocket peanut group embark field twice cover inform";

        if (isValidMnemonic(mnemonic)) {
            console.log("Valid mnemonic");
        }
        // Derive a private key from the mnemonic
        //const privateKey = await PrivateKey.fromMnemonic(mnemonic);
        // Derive seed from mnemonic
const seed = bip39.mnemonicToSeedSync(mnemonic);

// Derive master extended key (xprv) from seed
const root = hdkey.fromMasterSeed(seed);

// Derive private key from master extended key
const privateKey = root.privateKey.toString('hex');

        // Get the public key from the private key
       // const publicKey = privateKey.publicKey;

        console.log('Private Key:', privateKey);
        //console.log('Public Key:', publicKey);

        res.status(200).json({ privateKey: privateKey.toString() });
    } catch (error) {
        console.error('Error recovering keys:', error);
        res.status(500).json({ message: 'Error recovering keys from mnemonic' });
    }
};