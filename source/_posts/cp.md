---
title: ACM刷题笔记
date: 2025-07-19 11:57:05
tags:
---
### abc410D XOR Shortest Walk
给定一个有向图，包含N个顶点和M条边。顶点编号为1到N，边编号为1到M。其中第i条边是从顶点A
i指向顶点Bi的带权有向边，权值为Wi。请找出从顶点1到顶点N的所有可行路径中，路径包含边的权值进行按位XOR运算后的最小值。
N,M<=1000，0≤Wi<2^10。
#### 解析
暴力dfs在极端情况下可能路径过多TLE，如果多条路径到达顶点u并产生相同的异或值x，每条路径都会继续向下递归，重复探索相同的子问题。考虑特殊的“顶点复用”搜索方式，本质上是一种记忆化搜索：
```cpp
#include<bits/stdc++.h>
using namespace std;
int n,m,Ans=1e9;
struct E{int to;int val;};
int vis[1005][10005];
vector<E> G[1005];
void dfs(int u,int x){
	if(vis[u][x])return;
	vis[u][x]=1;
	for(int i=0;i<G[u].size();i++){
		int v=G[u][i].to,w=G[u][i].val;
		dfs(v,x^w);
	}
}
int main(){
	cin>>n>>m;
	for(int i=1;i<=m;i++){
		int frm,to,val;cin>>frm>>to>>val;
		E e;e.to=to;e.val=val;
		G[frm].push_back(e);
	}
	dfs(1,0);
	for(int i=0;i<=10000;i++)if(vis[n][i]){cout<<i<<endl;return 0;}
	cout<<-1<<endl;
	return 0;
}
```
总状态数量最大在 $(N+M)\max{W_i}$ 量级，符合要求。