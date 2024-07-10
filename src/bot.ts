import { FarcasterNetwork, makeCastAdd, getSSLHubRpcClient, NobleEd25519Signer } from '@farcaster/hub-nodejs';
import { hexToBytes } from "@noble/hashes/utils";




const hubRpcEndpoint = "hub-grpc.pinata.cloud";
const FID = 510172; // of the bot
const SIGNER = "0x60c68de4a52800830f7e7ae9bde5c0f871bd3eda8733473e7f57998cdb304b42";
const RFID = 4923; // receiver FID (who will receive bot notifications)



(async()=>{

 

 // Set up the signer
 const privateKeyBytes = hexToBytes(SIGNER.slice(2));
 const ed25519Signer = new NobleEd25519Signer(privateKeyBytes);

 const dataOptions = {
   fid: FID,
   network: FarcasterNetwork.MAINNET,
 };


const client = getSSLHubRpcClient(hubRpcEndpoint);
let records = {};


client.$.waitForReady(Date.now() + 5000, async (e) => {
  if (e) {
    console.error(`Failed to connect to ${hubRpcEndpoint}:`, e);
    process.exit(1);
  } else {
    console.log(`Connected to ${hubRpcEndpoint}`);


    const castsResult = await client.getCastsByFid({ fid: 396644 }); // get casts of hypersub notifier
    castsResult.map((casts) => {
        casts.messages.map((cast) => {
          // fetch only for today's casts
          if(cast.data.timestamp > 	( (Date.now()/1000)-1609459946 - (3600*24) )){
            console.log('Cast text:'+cast.data.castAddBody.text);
            console.log('Cast id/timestamp:'+parseFloat(cast.data.timestamp));
            console.log('Designer FID:'+cast.data.castAddBody.mentions[0]);
            if(records[cast.data.castAddBody.mentions[0]]){
              records[cast.data.castAddBody.mentions[0]].push(parseFloat(cast.data.timestamp));
            }else{
              records[cast.data.castAddBody.mentions[0]]=[parseFloat(cast.data.timestamp)];
            }
          }      
        })
        console.log(records);
    });
    
    //fetch for new casts each minute, you can reduce interval
    const bot = setInterval(async function(){
      const castsResult = await client.getCastsByFid({ fid: 396644 }); // get casts of hypersub notifier
      castsResult.map((casts) => {
        casts.messages.map(async (cast) => {
          // fetch only for today's casts, notify the user & black list the cast
          if(cast.data.timestamp > ((Date.now()/1000) -1609459946 - (3600*24) ) && records[cast.data.castAddBody.mentions[0]].length >= 5 && records[cast.data.castAddBody.mentions[0]].indexOf(cast.data.timestamp) < 0 ){
            cast.data.castAddBody.mentions.splice(0,1);
            cast.data.castAddBody.mentions.unshift(RFID);
            const castWithMentions = await makeCastAdd(
              {
                text: cast.data.castAddBody.text,
                embeds: [],
                embedsDeprecated: [],
                mentions: cast.data.castAddBody.mentions,
                mentionsPositions: cast.data.castAddBody.mentionsPositions,
              },
              dataOptions,
              ed25519Signer,
            );
            castWithMentions.map(async (castAdd) => {
              const r = await client.submitMessage(castAdd);
              if(r.isOk() && records[cast.data.castAddBody.mentions[0]]){
                records[cast.data.castAddBody.mentions[0]].push(cast.data.timestamp);
                console.log(r);
              }
            });            
          }
          if(cast.data.timestamp < ((Date.now()/1000) -1609459946 - (3600*24) )){
            if(records[cast.data.castAddBody.mentions[0]]){
              records[cast.data.castAddBody.mentions[0]].splice(records[cast.data.castAddBody.mentions[0]].indexOf(cast.data.timestamp),1);
            }
          }

        })

      })


    },60000);

    client.close();
  }
});



})()

  
  
