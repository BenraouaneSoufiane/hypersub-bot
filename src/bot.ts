import { FarcasterNetwork, makeLinkAdd, makeLinkRemove, getSSLHubRpcClient, NobleEd25519Signer } from '@farcaster/hub-nodejs';
import { hexToBytes } from "@noble/hashes/utils";




const hubRpcEndpoint = "hub-grpc.pinata.cloud";
const FID = 1234; // of the bot
const SIGNER = "0x60c68de4a52800830f7e7ae9bde5c0f871bd3eda8733473e7f57998cdb304b42";



(async()=>{

 

 // Set up the signer
 const privateKeyBytes = hexToBytes(SIGNER.slice(2));
 const ed25519Signer = new NobleEd25519Signer(privateKeyBytes);

 const dataOptions = {
   fid: FID,
   network: FarcasterNetwork.MAINNET,
 };


const client = getSSLHubRpcClient(hubRpcEndpoint);


client.$.waitForReady(Date.now() + 5000, async (e) => {
  if (e) {
    console.error(`Failed to connect to ${hubRpcEndpoint}:`, e);
    process.exit(1);
  } else {
    console.log(`Connected to ${hubRpcEndpoint}`);
    
    //fetch for new casts each minute, you can reduce interval
    const bot = setInterval(async function(){
      const castsResult = await client.getCastsByFid({ fid: 396644 }); // get casts of hypersub notifier
      castsResult.map((casts) => {
        casts.messages.map(async (cast) => {
          // fetch casts
          if( cast.data.castAddBody.mentions[0] == FID ){ // check if the cast concern antimofm.eth

            if(cast.data.timestamp > ((Date.now()/1000) -1609459946 - (3600*24) ) ){ // follow the subscriber as long as he have recent activity with you
              const follow = await makeLinkAdd({ type: "follow", targetFid: cast.data.castAddBody.mentions[1] }, dataOptions, ed25519Signer); // follow the subscriber
              follow.map(async(message)=>{
                  const r = await client.submitMessage(message);
                  console.log(r);
              });
            }else if(cast.data.timestamp > ((Date.now()/1000) -1609459946 - (3600*24*5) )){ // unfollow the subscriber as he has 5 days without activity
              const follow = await makeLinkRemove({ type: "unfollow", targetFid: cast.data.castAddBody.mentions[1] }, dataOptions, ed25519Signer); // follow the subscriber
              follow.map(async(message)=>{
                  const r = await client.submitMessage(message);
                  console.log(r);
              });
            }
                   
          }
         

        })

      })


    },60000);

    client.close();
  }
});



})()

  
  
