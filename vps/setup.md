# VPSへのAPIサーバーの立て方 
OS: CentOS Stream8
```
# yum install git
# git clone https://github.com/codeforkosen/Kakomimasu.git
# curl -fsSL https://deno.land/x/install/install.sh | sh
# vi .bash_profile
export DENO_INSTALL="/root/.deno"
export PATH="$DENO_INSTALL/bin:$PATH"
# yum install nginx
# yum install https://dl.fedoraproject.org/pub/epel/epel-release-latest-8.noarch.rpm
# dnf install certbot
# dnf install python3-certbot-nginx
# dnf install nginx
# certbot certonly practice.kakomimasu.website
# certbot --nginx
# system ctl start nginx
# firewall-cmd --add-service=http --permanent
# firewall-cmd --add-service=https --permanent
# firewall-cmd --reload
# vi /etc/nginx.conf
upstream deno {
    server 127.0.0.1:8880;
}
map $http_upgrade $connection_upgrade { 
    default upgrade;
    ''      close;
} 
server {
server_name practice.kakomimasu.website; # managed by Certbot
	# root         /usr/share/nginx/html;
	location / {
	    proxy_pass http://deno;
	}
	proxy_http_version 1.1;
	proxy_set_header Host $host;
	proxy_set_header Upgrade $http_upgrade; 
	proxy_set_header Connection $connection_upgrade;
}
# nohup deno run -A apiserver.ts &
```

## systemdを使用した囲みマスサービス起動
```
# cp vps/kakomimasu.service /etc/systemd/system/kakomimasu.service
# systemctl daemon-reload
# systemctl start kakomimasu
```
