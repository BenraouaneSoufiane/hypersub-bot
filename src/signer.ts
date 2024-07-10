import { keyGatewayABI, KEY_GATEWAY_ADDRESS, CHAIN, ViemLocalEip712Signer } from '@farcaster/hub-nodejs';
import {ed25519 }from '@noble/curves/ed25519';
import { toHex, fromHex, createWalletClient, publicActions, http } from 'viem';
import { optimism } from "viem/chains";
import { mnemonicToAccount, toAccount } from "viem/accounts";


const MNEMONIC = ''; // used to generate signer for/of the bot if you don't have
const fid = 1234; // of the bot
(async()=>{
const OP_PROVIDER_URL = "https://opt-mainnet.g.alchemy.com/v2/BdptFAC-8nMGC0SjwY38mJ9A_b-A7Enj"; // Alchemy or Infura url


const account = mnemonicToAccount(MNEMONIC);
const walletClient = createWalletClient({
    account,
    chain: optimism,
    transport: http(OP_PROVIDER_URL),
  }).extend(publicActions);
const KeyContract = { abi: keyGatewayABI, address: KEY_GATEWAY_ADDRESS, chain: CHAIN };



    const privateKey = ed25519.utils.randomPrivateKey();
    const publicKey = toHex(ed25519.getPublicKey(privateKey));
    console.log(`Created new signer for test with private key: ${toHex(privateKey)}`);
  
    // To add a key, we need to sign the metadata with the fid of the app we're adding the key on behalf of
    // We'll use our own fid and custody address for simplicity. This can also be a separate App specific fid.
    const localAccount = toAccount(account);
    const eip712signer = new ViemLocalEip712Signer(localAccount);
    console.log(eip712signer);  
    const metadata = await eip712signer.getSignedKeyRequestMetadata({
      requestFid: BigInt(fid),
      key: fromHex(publicKey,'bytes'),
      deadline: BigInt(Math.floor(Date.now() / 1000) + (3600*24*30)), //  30 days from now
    });
  
    const metadataHex = toHex(metadata.unwrapOr(new Uint8Array()));
    console.log(metadataHex);
    const { request: signerAddRequest } = await walletClient.simulateContract({
      ...KeyContract,
      functionName: "add",
      args: [1, publicKey, 1, metadataHex], // keyType, publicKey, metadataType, metadata
    });
  
    const signerAddTxHash = await walletClient.writeContract(signerAddRequest);
    console.log(`Waiting for signer add tx to confirm: ${signerAddTxHash}`);
    await walletClient.waitForTransactionReceipt({ hash: signerAddTxHash });
    console.log(`Registered new signer with public key: ${toHex(publicKey)}`);
    console.log("Sleeping 30 seconds to allow hubs to pick up the signer tx");
    await new Promise((resolve) => setTimeout(resolve, 30000));
})() 

    
 