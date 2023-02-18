# $PACT Bot

## Description
This discord bot is intended to disburse a HTS token known as $PACT. 
To minimize costs, it will be deployed on DigitalOcean as a Droplet (Ubuntu version 22.04) 
and utilizes Supabase for its database.
- DigitalOcean: https://www.digitalocean.com
- Supabase: https://supabase.com/

Using the two platforms should minimize the cost of running the bot.

## Discord Setup
Refer to the tutorial [here](https://www.youtube.com/watch?v=Q7Hgp6bg0kI&list=PL_cUvD4qzbkwA7WITceoc2_FFjQsBkwX7)

## Supabase Setup
Create a table named ``prayers``, then locate your service key.
**DO NOT SHARE YOUR SERVICE KEY AND KEEP IT ONLY TO THE BACKEND!!!**

## .env Setup
Make a copy of the .env.sample and rename it as .env. Leave it in the root directory of the project.
The names should be self explanatory, but refer to the comments below for additional details.

*DISCORD_CLIENT_ID*<br>
Your Discord bot's ID from the Discord Developer Portal<br><br>
*DISCORD_CHANNEL_ID*<br>
Your Discord Channel's ID obtained after enabling Developer Mode<br><br>
*DISCORD_SERVER_ID*<br>
Your Discord Server's ID obtained after enabling Developer Mode<br><br>
*DISCORD_TOKEN*<br>
Your Discord bot's token given upon bot creation<br><br>
*HEDERA_NETWORK*<br>
Testnet, Mainnet, and Previewnet are all valid choices here<br><br>
*HEDERA_OPERATOR_ID*<br>
Your Hedera Account ID that will be paying for all TX fees<br><br>
*HEDERA_OPERATOR_PRIVATE_KEY*<br>
Your Hedera Private Key associated to the account ID above<br>**REMEMBER NOT TO SHARE THIS, AND KEEP IT TO THE BACKEND TO NOT LEAK OF THIS CRUCIAL SECRET**<br><br>
*HEDERA_TOKEN_DECIMALS*<br>
The decimals of the HTS token that will be disbursed<br><br>
*HEDERA_TOKEN_DRIP_RATE*<br>
Can be a float or integer, depends on how much of the token you want to be disbursed<br><br>
*HEDERA_TOKEN_ID*<br>
The token of the HTS token that will be disbursed<br><br>
*HEDERA_REST_API_VERSION*<br>
Set this to v1, as Hedera does not have any other versions of the rest api at this time<br><br>
*SUPABASE_SERVICE_KEY*<br>
Obtained from your Supabase settings after starting a new project<br>**REMEMBER NOT TO SHARE THIS, AND KEEP IT TO THE BACKEND TO NOT LEAK OF THIS CRUCIAL SECRET**<br><br>
*SUPABASE_URL*<br>
Obtained from your Supabase settings after starting a new project<br><br>

## Bot Deployment on DigitalOcean Droplet
1. Install nvm<br>
```curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash```

2. Logout of the terminal and back in

3. Run the last of the installs below:

```
nvm install node
node -e "console.log('Running Node.js ' + process.version)"
sudo apt install git
git clone https://github.com/hhe44/pactbot.git
cd pactbot
npm install
```

4. Create the service<br>
```sudo nano /etc/systemd/system/pactbot.service```

```
[Unit]
Description=Pactbot
After=multi-user.target

[Service]
ExecStart=/root/.nvm/versions/node/v19.6.1/bin/node /root/pactbot/src/main.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=ss-server
User=root

[Install]
WantedBy=multi-user.target
```
5. Start the service<br>
```sudo systemctl start pactbot.service```