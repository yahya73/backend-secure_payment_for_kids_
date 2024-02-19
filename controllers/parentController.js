import UserModel from "../models/User.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar, Mnemonic } from "@hashgraph/sdk";

export const registerParent = async (req, res) => {
    try {
        const { Username, Email, Password, PhoneNumber } = req.body;

        const { accountId, mnemonic, balance} = await createHederaAccount();

        // Vérifier si le partenaire existe déjà
        const existingParent = await UserModel.findOne({ Username });

        if (existingParent) {
            return res.status(400).json({ message: "User already exists", parent: existingParent });
        }        

        const existingEmail = await UserModel.findOne({ Email });

        if (existingEmail) {
            return res.status(400).json({ message: "User with this email already exists" });
        }  

        const hashedPassword = await bcrypt.hash(Password, 10);

        const newParent = new UserModel({
            Username,
            Email,
            Password: hashedPassword,
            Role: 'parent',
            image: 'default image', 
            PhoneNumber,
            Adressblockchain: accountId, 
            ProhibitedProductTypes: ['type1', 'type2'],
            Verified : false,
        });

        const parent = await newParent.save();

        // const token = jwt.sign(
        //     { username: parent.Username, id: parent._id },
        //     process.env.JWT_KEY,
        //     { expiresIn: "1h" }
        // );        

        // Send verification email
        // await sendVerificationEmail(Email, Username);

        res.status(200).json({ parent, mnemonic: mnemonic });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Function to generate a mnemonic phrase
const generateMnemonic = () => {
    return Mnemonic.generate();
};

// Function to generate keys from a mnemonic phrase
const generateKeysFromMnemonic = (mnemonic) => {
    const privateKey = Ed25519PrivateKey.fromMnemonic(mnemonic);
    const publicKey = privateKey.publicKey;
    return { privateKey, publicKey };
};

// Function to reset keys and return the new keys and phrase
const resetKeys = () => {
    const mnemonic = Mnemonic.generate();
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
        console.log("account id : " ,bcAccountId)
        console.log(await(mnemonic))
        console.log("balance : ", accountBalance.hbars.toTinybars().toString() )

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

