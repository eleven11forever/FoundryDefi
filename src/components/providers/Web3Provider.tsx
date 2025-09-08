/**
 * Web3 提供者组件
 * 集成 Wagmi, RainbowKit 和 React Query，为整个应用提供 Web3 功能支持
 */
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit'
import { config } from '@/lib/wagmi'
import { useState } from 'react'
import { useTheme } from 'next-themes'

// 引入 RainbowKit 的样式
import '@rainbow-me/rainbowkit/styles.css'

interface Web3ProviderProps {
  children: React.ReactNode
}

/**
 * Web3 上下文提供者
 * 为应用提供区块链交互、钱包连接和数据查询功能
 */
export function Web3Provider({ children }: Web3ProviderProps) {
  // 创建 React Query 客户端，配置缓存和重试策略
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // 5分钟缓存时间，适合区块链数据的更新频率
        staleTime: 5 * 60 * 1000,
        // 失败后重试3次
        retry: 3,
        // 重试延迟递增
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        // 交易失败后不自动重试
        retry: false,
      }
    }
  }))

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProviderWrapper>
          {children}
        </RainbowKitProviderWrapper>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

/**
 * RainbowKit 主题包装组件
 * 根据系统主题自动切换钱包连接界面的深色/浅色模式
 */
function RainbowKitProviderWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()

  return (
    <RainbowKitProvider
      // 根据当前主题选择对应的 RainbowKit 主题
      theme={theme === 'dark' ? darkTheme() : lightTheme()}
      // 设置应用信息，在钱包连接时显示
      appInfo={{
        appName: '借贷协议 DApp',
        disclaimer: ({ Text, Link }) => (
          <Text>
            连接钱包即表示您同意我们的{' '}
            <Link href="/terms">服务条款</Link> 和{' '}
            <Link href="/privacy">隐私政策</Link>
          </Text>
        ),
      }}
      // 显示最近使用的钱包
      showRecentTransactions={true}
      // 自定义钱包连接模式
      modalSize="compact"
    >
      {children}
    </RainbowKitProvider>
  )
}