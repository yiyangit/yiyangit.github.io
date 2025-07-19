---
title: WSL下vscode开发环境配置记录
tags:
---
最近开始鼓捣自己的开发环境，Windows提供的WSL非常好用，但是在没人指导的情况下踩了不少坑，特此记录一下。
## 安装VScode
没啥好说的。官网 https://code.visualstudio.com/ 下载。
## 安装WSL
powershell里执行命令
`wsl --install`
等待下载安装，设置 Linux 系统用户名和密码。

随后查看发行版版本：
```bash
$ lsb_release -a
No LSB modules are available.
Distributor ID: Ubuntu
Description:    Ubuntu 24.04.2 LTS
Release:        24.04
Codename:       noble
```

发现安装的是最新的 Ubuntu LTS 版本，对我来说完全够用的。

然后再把 Windows 默认终端改成 Ubuntu。

---

打开 WSL 终端时可能会提示：
```
wsl: 检测到 localhost 代理配置，但未镜像到 wsl。nat 模式下的 wsl 不支持 localhost 代理。
```
为了解决这个问题，在 `C:\Users\你的用户名` 下创建文件 `.wslconfig` ，输入以下内容：
```
[experimental]
autoMemoryReclaim=gradual
networkingMode=mirrored
dnsTunneling=true
firewall=true
autoProxy=true
```
关闭 WSL：`wsl --shutdown`
重新启动 WSL 终端。
## 启动 VSCode
### 正确启动VSCode
这一步看似没有必要说，实际上是踩的最大的一个坑（哭）。

昨天本来以为大功告成了，实际上后来遇到各种各样的问题，都是这一步埋下的雷。

如果想让 vscode 和WSL系统无缝衔接，就**不能**在 Windows 的桌面图标/任务栏/开始菜单直接启动 vscode 。

**应该**：在 Linux 终端下，你的工作区里执行命令 `code .` 

初次启动可能会提示正在启动服务器啥的，等待即可。
### 安装扩展
在 WSL 中使用 vscode 通常必须安装 WSL 扩展来支持 vscode 和 WSL 之间的通信。
另外大部分已经安装的扩展需要重新在 WSL 的 vscode 中安装。
## 安装 Cline
Cline 是一个 AI编程 vscode 扩展，可以自主编辑代码、执行命令。如果 vscode 没有正确从 WSL 启动，那么执行命令时 Cline 没办法和终端交互，就会出现 `Shell Integration Unavailable` 。网上的各种解决方案大部分都是针对 Mac 系统，基本没有提到 WSL 的（再哭）
## 配置 git
还没摸索出来。WIP。
## 关于 pip
使用pip安装包的时候可能会出现 `error: externally-managed-environment`，这倒不是 WSL 的问题。
> externally-managed-environment 错误背后的原因：Manjaro 、Ubuntu、Fedora 以及其他的最新发行版中，正在使用 Python 包来实现此增强功能。
这个更新是为了避免「操作系统包管理器 (如pacman、yum、apt) 和 pip 等特定于 Python 的包管理工具之间的冲突」。
这些冲突包括 Python 级 API 不兼容和文件所有权冲突。
（摘自 https://www.cnblogs.com/zhaohuaxishi/p/17515019.html ）

执行
`sudo mv /usr/lib/python3.x/EXTERNALLY-MANAGED /usr/lib/python3.x/EXTERNALLY-MANAGED.bak` 即可。
