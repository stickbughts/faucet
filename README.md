# HTS Bot

## Description

This discord bot is intended to disburse a HTS tokens to holders of a specific NFT.
The bot is an interaction of three technologies: Hedera, Discord, and Supabase.
Interacting with these three technologies requires a hedera private key, a discord client secret key, and your Supabase key. Keep all three secret.
To minimize costs, it will be deployed on DigitalOcean as a Droplet (Ubuntu version 22.04)
and utilizes Supabase for its database.

- DigitalOcean: https://www.digitalocean.com
- Supabase: https://supabase.com/

Using the two platforms should minimize the cost of running the bot.

## Wallet Setup

The best practice is to set up a dedicated wallet to fund your faucet. Create a new Hedera account, and note its token ID and private key.
Fund the wallet with your HTS token and some HBAR to cover gas.

## Discord Setup

Navigate to https://discord.com/developers/applications and create a new application
Under the "Bot" tab, give it Presence Intent, Server Message Intent, and Message Content Intent
Under the OAuth2 tab, click Reset Secret. Store your bot's Secret Key.

Refer to the tutorial [here](https://www.youtube.com/watch?v=Q7Hgp6bg0kI&list=PL_cUvD4qzbkwA7WITceoc2_FFjQsBkwX7)

## Supabase Setup

Create a table named `pulls`, then locate your service key.
**DO NOT SHARE YOUR SERVICE KEY AND KEEP IT ONLY TO THE BACKEND!!!**

## .env Setup

Make a copy of the .env.sample and rename it as .env. Leave it in the root directory of the project.
The names should be self explanatory, but refer to the comments below for additional details.

_DISCORD_CLIENT_ID_<br>
Your Discord bot's ID from the Discord Developer Portal<br><br>
_DISCORD_CHANNEL_ID_<br>
Your Discord Channel's ID obtained after enabling Developer Mode<br><br>
_DISCORD_SERVER_ID_<br>
Your Discord Server's ID obtained after enabling Developer Mode<br><br>
_DISCORD_TOKEN_<br>
Your Discord bot's token given upon bot creation<br><br>
_HEDERA_NETWORK_<br>
Testnet, Mainnet, and Previewnet are all valid choices here<br><br>
_HEDERA_OPERATOR_ID_<br>
Your Hedera Account ID that will be paying for all TX fees<br><br>
_HEDERA_OPERATOR_PRIVATE_KEY_<br>
Your Hedera Private Key associated to the account ID above<br>**REMEMBER NOT TO SHARE THIS, AND KEEP IT TO THE BACKEND TO NOT LEAK OF THIS CRUCIAL SECRET**<br><br>
_HEDERA_TOKEN_DECIMALS_<br>
The decimals of the HTS token that will be disbursed<br><br>
_HEDERA_TOKEN_DRIP_RATE_<br>
Can be a float or integer, depends on how much of the token you want to be disbursed<br><br>
_HEDERA_TOKEN_ID_<br>
The token of the HTS token that will be disbursed<br><br>
_HEDERA_REST_API_VERSION_<br>
Set this to v1, as Hedera does not have any other versions of the rest api at this time<br><br>
_SUPABASE_SERVICE_KEY_<br>
Obtained from your Supabase settings after starting a new project<br>**REMEMBER NOT TO SHARE THIS, AND KEEP IT TO THE BACKEND TO NOT LEAK OF THIS CRUCIAL SECRET**<br><br>
_SUPABASE_URL_<br>
Obtained from your Supabase settings after starting a new project<br><br>

## Bot Deployment on DigitalOcean Droplet

1. Install nvm<br>
   `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash`

2. Logout of the terminal and back in

3. Run the last of the installs below:

```
nvm install node
node -e "console.log('Running Node.js ' + process.version)"
sudo apt install git
git clone https://github.com/jbuildsdev/htsBot.git
cd htsbot
npm install
```

4. Create the service<br>
   `sudo nano /etc/systemd/system/htsbot.service`

```
[Unit]
Description=htsbot
After=multi-user.target

[Service]
ExecStart=/root/.nvm/versions/node/v19.6.1/bin/node /root/htsbot/src/main.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=htsbot
User=root

[Install]
WantedBy=multi-user.target
```

5. Start the service<br>
   `sudo systemctl start htsbot.service`
