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