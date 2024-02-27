# HTS Bot

## Description

This discord bot is intended to disburse a HTS tokens to holders of a specific NFT.
Owners of the NFT are entitled to a fetch of the faucet every 24 hours. This faucet employs sybil checks, so a user cannot send the same NFT to themselves and fetch from the faucet multiple times. If you purchase an NFT that has already been used to fetch from the faucet today, wait until the faucet reset for fetches to resume normally.

The bot is an interaction of three technologies: Hedera, Discord, and Supabase.
Interacting with these three technologies requires a hedera private key, a discord client secret key, and your Supabase key. Keep all three secret.
To minimize costs, it will be deployed on DigitalOcean as a Droplet (Ubuntu version 22.04)
and utilizes Supabase for its database.

- DigitalOcean: https://www.digitalocean.com
- Supabase: https://supabase.com/

Using the two platforms should minimize the cost of running the bot.
The keys and token details need to be saved into an environment file ( .env). Once the .env file is ready, the bot is ready to deploy on the Droplet. I recommending pasting the .env.example into a text editor like notepad and filling out the lines in it as you set up all the services.

## Wallet Setup

The best practice is to set up a dedicated wallet to fund your faucet. Create a new Hedera account, and note its token ID and private key.
Fund the wallet with your HTS token and some HBAR to cover gas. As of 2024, an HTS transfer costs $0.002 .

Add the following information to your env file:

HEDERA_OPERATOR_ID = your faucet wallet's account ID <br>
HEDERA_OPERATOR_PRIVATE_LEY = the private key of the faucet wallet (keep secret) <br>
HEDERA_TOKEN_ID = the token ID of the HTS token you wish to distribute with the faucet <br>
HEDERA_TOKEN_DECIMALS = the decimal precision of your token <br>
HEDERA_TOKEN_DRIP_RATE = how many tokens the faucet should distribute to each user per 24 hours <br>
NFT_ID = the ID of the NFT that gates access to the faucet<br>

## Discord Setup

Navigate to https://discord.com/developers/applications and create a new application
Under the "Bot" tab, give it Presence Intent, Server Message Intent, and Message Content Intent. Click "Reset token", and copy its value into DISCORD_TOKEN.
Give your bot a name and icon.

Navigate to the Oath 2 tab, and copy the CLIENT ID. Store it in your file under DISCORD_CLIENT_ID.
Go to your discord server. Discord URLs take the form of discord.com/channels/{SERVER_ID}/{CHANNEL_ID}
Copy the Server ID into DISCORD_SERVER_ID
Copy the Channel ID into DISCORD_CHANNEL_ID

Go to "URL Generator" and give the bot the "bot" scope".

Refer to the tutorial [here](https://www.youtube.com/watch?v=Q7Hgp6bg0kI&list=PL_cUvD4qzbkwA7WITceoc2_FFjQsBkwX7)

## Supabase Setup

- Supabase: https://supabase.com/

Create a new account and start a new project.
Under "Project Configuration", copy the URL into SUPABASE_URL
Locate the key labeled service_role <b>secret </b> Copy the service key into SUPABASE_SERVICE_KEY

Create a table named `fetches`, and create a column called `accountId` of type `text`.
Create a second table named `serials`, and create a column called `serial` of type `text`.

These tables can be viewed daily to see which accounts have used the faucet, and which NFTs were used.

**DO NOT SHARE YOUR SERVICE KEY AND KEEP IT ONLY TO THE BACKEND!!!**

## .env Recap

At this point every field in your env file should be filled.
Here is a recap of all the data that should be in your env file:

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

https://www.digitalocean.com
Create an account , create a Project, and deploy a Droplet. The cheapest droplet at 4/mo should be sufficient.
Navigate to your droplet. The setup will be completed within the Console.
The following commands you should be able to copy, then right click inside the console and "Paste as plain text"

1. Install nvm<br>
   `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash`

2. Close the console, and then open it again.

3. Run the last of the installs below:
   Note your node version

```
nvm install node
node -e "console.log('Running Node.js ' + process.version)"
sudo apt install git
git clone https://github.com/jbuildsdev/sauceinubot.git
cd sauceinubot
npm install
```

4. Create the .env file<br>
   `sudo nano .env`
   Paste your env values into the file. Press ctrl+o to save, and hit enter. Press ctrl+x to exit.

5. Create the service<br>
   `sudo nano /etc/systemd/system/sauceinubot.service`

```
[Unit]
Description=sauceinubot
After=multi-user.target

[Service]
ExecStart=/root/.nvm/versions/node/v21.6.2/bin/node /root/sauceinubot/src/main.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=sauceinubot
User=root

[Install]
WantedBy=multi-user.target
```

Be sure to replace the node version in ExecStart with your current node version, if it is no longer 21.6.2.
Press crtl+o to save, and ctrl+x to exit.

6. Start the service<br>
   `sudo systemctl start sauceinubot`

Check if it worked. Run the command `systemctl status sauceinubot`
You should see Active: active (running)

7. Join Bot to server<br>
   Return to the discord developer page.
   Go to URL generator, and paste the URL into the brower. Join your bot to your Discord server.

You can now begin fetching tokens from your faucet using the command /fetch accountID
