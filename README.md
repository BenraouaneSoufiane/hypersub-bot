# Hypersub farcaster bot

Farcaster bot that enable you to follow & unfollow users automatically based on thier hypersub activity with you/your NFTs, a response to the antimofm.eth's bounty

# Installation
You'll need to farcaster ID & mnemonic phrase to generate signer to create/submit casts (follow & unfollow)

```
git clone https://github.com/BenraouaneSoufiane/hypersub-bot.git
cd hypersub-bot
npm install
```

# Generate signer
You'll need to signer's private key, if you already have a signer private key ignore this step & paste it directly to src/bot.ts, this step generate a signer & logs the private key, valid for one month
 ```
node -r ts-node/register/transpile-only ./src/signer.ts
```
# Runing the bot
```
node -r ts-node/register/transpile-only ./src/bot.ts
```
You can run it & keep it working even you quit the trminal by using nohup or pm2

## Enjoy :)
