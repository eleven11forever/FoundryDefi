# DeFi 借贷协议 Frontend

这是一个基于 Next.js、TypeScript、Wagmi、Viem 和 RainbowKit 开发的去中心化借贷协议前端应用。

## 🌟 功能特性

### 🔐 钱包连接
- 集成 RainbowKit，支持 MetaMask、WalletConnect 等多种钱包
- 优美的钱包连接界面，支持深色/浅色主题自动切换
- 安全的钱包状态管理和会话保持

### 📊 实时数据看板
- **健康因子监控**：实时显示借贷头寸的安全程度
- **资产概览**：总抵押品、总借款、可借额度一目了然
- **余额管理**：WETH 和稳定币余额实时更新
- **借贷详情**：本金、利息、更新时间等详细信息

### 💰 资产管理
- **存入抵押品**：支持 WETH 作为抵押品存入
- **借出稳定币**：根据抵押率计算可借额度
- **还款功能**：支持部分或全额还款，优先偿还利息
- **提取抵押品**：在满足抵押率的前提下提取资产

### 🔄 交易执行
- 基于 Wagmi + Viem 的高效区块链交互
- 实时交易状态跟踪和错误处理
- 交易确认和成功反馈
- Gas 费用估算和优化

### 📱 响应式设计
- 适配桌面、平板、手机等多种设备
- 现代化的 UI 设计语言
- 流畅的动画和交互体验
- 支持深色/浅色主题切换

## 🛠 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **Web3 库**: Wagmi v2, Viem v2
- **钱包连接**: RainbowKit v2
- **数据管理**: TanStack Query (React Query) v5
- **样式**: Tailwind CSS + shadcn/ui
- **图标**: Lucide React
- **主题**: next-themes

## 🚀 快速开始

### 环境要求
- Node.js 18.17 或更高版本
- pnpm、yarn 或 npm

### 安装依赖
```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install
# 或
yarn install
# 或
pnpm install
```

### 环境配置
```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑环境变量
# 至少需要配置 NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
```

### 启动开发服务器
```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📋 环境变量配置

### 必需配置
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`: WalletConnect 项目 ID
- `NEXT_PUBLIC_STABLE_COIN_ADDRESS`: 稳定币合约地址
- `NEXT_PUBLIC_LENDING_PROTOCOL_ADDRESS`: 借贷协议合约地址
- `NEXT_PUBLIC_WETH_ADDRESS`: WETH 代币合约地址

### 可选配置
- `NEXT_PUBLIC_DEFAULT_CHAIN_ID`: 默认网络 ID
- `NEXT_PUBLIC_RPC_URL`: 自定义 RPC 节点
- `NEXT_PUBLIC_INFURA_ID`: Infura 项目 ID
- `NEXT_PUBLIC_ALCHEMY_ID`: Alchemy API 密钥

## 🏗 项目结构

```
frontend/
├── src/
│   ├── app/                 # Next.js 应用路由
│   │   ├── layout.tsx       # 根布局组件
│   │   └── page.tsx         # 主页面
│   ├── components/          # React 组件
│   │   ├── dashboard/       # 数据看板组件
│   │   ├── trading/         # 交易面板组件
│   │   ├── layout/          # 布局组件
│   │   ├── providers/       # 上下文提供者
│   │   └── ui/              # 通用 UI 组件
│   ├── hooks/               # 自定义 Hook
│   │   └── useContract.ts   # 智能合约交互 Hook
│   ├── lib/                 # 工具库
│   │   ├── contracts.ts     # 合约 ABI 和地址
│   │   ├── utils.ts         # 通用工具函数
│   │   └── wagmi.ts         # Wagmi 配置
│   ├── styles/              # 样式文件
│   │   └── globals.css      # 全局样式
│   └── types/               # TypeScript 类型定义
│       └── index.ts         # 通用类型
├── public/                  # 静态资源
├── .env.example            # 环境变量模板
├── package.json            # 项目配置
├── tailwind.config.js      # Tailwind 配置
├── tsconfig.json           # TypeScript 配置
└── next.config.js          # Next.js 配置
```

## 🔧 主要组件说明

### Web3Provider
- 集成 Wagmi、RainbowKit 和 React Query
- 提供全局的 Web3 功能和数据缓存
- 配置钱包连接和网络支持

### Dashboard
- 实时显示用户借贷状况
- 健康因子、抵押品、债务等关键指标
- 自动刷新和错误处理

### TradingPanel
- 提供存款、借款、还款、提取功能
- 表单验证和交易状态管理
- 实时计算可操作金额

### useContract Hook
- 封装智能合约读写操作
- 统一的错误处理和状态管理
- 自动数据缓存和同步

## 🔗 与智能合约集成

本前端应用与以下智能合约交互：

1. **StableCoin**: ERC20 稳定币合约
2. **LendingProtocol**: 核心借贷逻辑合约
3. **MockWETH**: WETH 代币合约（测试用）

### 合约方法调用
- 读操作：通过 `useReadContract` 获取链上数据
- 写操作：通过 `useWriteContract` 执行交易
- 事件监听：自动刷新相关数据

## 📱 响应式设计

- **桌面端**: 完整功能，双栏布局
- **平板端**: 自适应栅格，保持功能完整性
- **移动端**: 单栏布局，简化操作流程
- **主题**: 支持深色/浅色模式，跟随系统设置

## ⚠️ 注意事项

1. **合约地址**: 部署合约后需更新 `src/lib/contracts.ts` 中的地址
2. **网络配置**: 确保前端支持的网络与合约部署网络一致
3. **WalletConnect**: 需要在 WalletConnect 官网创建项目获取 Project ID
4. **测试网络**: 建议先在测试网络（Sepolia）进行测试
5. **资金安全**: 本应用为演示用途，请勿在主网使用大量资金

## 🚀 部署指南

### Vercel 部署（推荐）
1. 将代码推送到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 自动部署完成

### 其他平台
支持部署到 Netlify、AWS、Google Cloud 等平台。

## 🤝 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 🆘 支持

如遇问题，请：
1. 查看 [FAQ](docs/FAQ.md)
2. 提交 [Issue](https://github.com/your-repo/issues)
3. 加入讨论群组

---

**⚠️ 风险提示**: 本项目仅供学习和实验使用，DeFi 协议存在智能合约风险、市场风险等，请谨慎使用并充分了解相关风险。