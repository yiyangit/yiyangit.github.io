---
title: nodejs项目部署实践
date: 2025-06-22 12:56:11
tags:
---

## 配置 nginx 反向代理
### 安装 nginx
```
# apt install nginx
```
### 启动服务
```
systemctl start nginx
systemctl enable nginx
```
### 关于 nginx 配置
nginx 启动时，会加载 `/etc/nginx/nginx.conf` 配置文件。
而 `/etc/nginx/nginx.conf` 会引入：
- `/etc/nginx/conf.d` 中以 .conf 结尾的配置文件
- `/etc/nginx/sites-enabled` 中任何名称的配置文件
sites-available 中拥有名为 default 的配置文件以供参考。

sites-available 用于存放网站的配置文件，用于在需要时链接到 sites-enabled 中作为需要启用的网站：
```
# vim /etc/nginx/sites-available/aihara.conf
```

```
server {
    listen 80;
    server_name aih.locklink.moe;  # 替换为你实际使用的域名或IP地址

    location / {
        proxy_pass http://localhost:8000;  # 后端服务地址
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
这里暂时没有使用 SSL。

```
# sudo ln -s /etc/nginx/sites-available/aihara.conf /etc/nginx/sites-enabled/ # 创建链接
# nginx -t # 检查 Nginx 配置文件的语法正确性
# systemctl reload nginx # 重启服务
```
## 使用 Let's Encrypt 证书
```
# apt install certbot python3-certbot-nginx -y
# sudo certbot --nginx -d example.com -d www.example.com
```
`certbot` 应该会自动为你的站点生成证书并配置好 nginx ，非常方便。

随后手动重启服务。

但是这里申请的证书有效期只有三个月，可以从申请证书时的提示信息里知道。

可以使用如下命令续期，并在续期结束后重启服务：
```
# certbot renew --renew-hook "systemctl reload nginx"
Certificate not yet due for renewal
```
这里提示还没到续期的时候，因为 Certbot 在证书到期前30天才可以续期。
## 部署 nodejs 应用
WIP
## CD/CI
WIP