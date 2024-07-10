# Hypersub farcaster bot

This project allow you to receive notifications about active designer (mints) on your farcaster account, automatically ignore un-active designer

# Installation
You'll need to farcaster ID (typiclly to create new user, or add existing) & mnemonic phrase to generate signer to create/submit casts

```
git clone https://github.com/BenraouaneSoufiane/hypersub-bot.git
cd hypersub-bot
npm install
```

# Generate signer
You'll need to signer private key, if you already have a signer priivate key ignore this step & paste it directly to src/bot.ts, this step generate a signer & logs the private key valid for one month
 ```
node -r ts-node/register/transpile-only ./src/signer.ts
```
# Runing the bot
```
node -r ts-node/register/transpile-only ./src/index.ts
```
You can run it & keep it working even you quit the trminal by using nohup or pm2

## Enjoy :)
