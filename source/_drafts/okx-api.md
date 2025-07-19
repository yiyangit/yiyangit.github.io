---
title: OKX Python SDK 用法分析
tags:
---
最近入坑加密货币投资，一开始用的币安，但是币安界面和账户设置过于繁琐，而且广场功能对操作心态影响很大,于是转向朋友在用的 OKX（欧意）。
## API Key
连接 API 需要 API Key、Secret Key 和 Passphrase。
## REST API 和 WebSocket
### REST API
REST API调用相对简单。以获取账户余额为例：
```python
import okx.Account as Account
accountAPI = Account.AccountAPI(env.api_key, env.secret_key, env.passphrase, False, flag)
result = accountAPI.get_positions()
pprint(result)
```
输出结果的分析稍后解释。
### Websocket
```py
import asyncio
from okx.websocket.WsPrivateAsync import WsPrivateAsync

def callbackFunc(message):
    print(message)

async def main():
    ws = WsPrivateAsync(
        apiKey = env.api_key,
        passphrase = env.passphrase,
        secretKey = env.secret_key,
        url = "wss://ws.okx.com:8443/ws/v5/private",
        useServerTime=False
    )
    await ws.start()
    args = [
        {
          "channel": "account",
          "extraParams": "{\"updateInterval\": \"0\"}"
        }
    ]

    await ws.subscribe(args, callback=callbackFunc)
    await asyncio.sleep(10)

    await ws.unsubscribe(args, callback=callbackFunc)
    await asyncio.sleep(10)

asyncio.run(main())
```
## 账户余额