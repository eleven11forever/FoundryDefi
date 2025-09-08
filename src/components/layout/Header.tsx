/**
 * 应用头部导航栏组件
 * 包含应用标题、钱包连接按钮、主题切换等功能
 */
'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useTheme } from 'next-themes'
import { Moon, Sun, Wallet, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

interface HeaderProps {
  className?: string
}

/**
 * 头部导航栏组件
 * 展示应用品牌、连接钱包和主题切换功能
 */
export function Header({ className }: HeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="container flex h-16 items-center justify-between px-4">
        {/* 应用品牌区域 */}
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold leading-none">借贷协议</h1>
            <span className="text-xs text-muted-foreground">DeFi Lending</span>
          </div>
        </div>

        {/* 导航菜单区域 */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <a href="#dashboard" className="transition-colors hover:text-foreground/80 text-foreground">
            仪表板
          </a>
          <a href="#lending" className="transition-colors hover:text-foreground/80 text-foreground/60">
            借贷
          </a>
          <a href="#liquidation" className="transition-colors hover:text-foreground/80 text-foreground/60">
            清算
          </a>
          <a href="#analytics" className="transition-colors hover:text-foreground/80 text-foreground/60">
            分析
          </a>
        </nav>

        {/* 功能按钮区域 */}
        <div className="flex items-center space-x-2">
          {/* 主题切换按钮 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-9 w-9"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">切换主题</span>
          </Button>

          {/* 钱包连接按钮 */}
          <div className="wallet-connect">
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
              }) => {
                // 确保组件已挂载，避免 SSR 问题
                const ready = mounted && authenticationStatus !== 'loading'
                const connected =
                  ready &&
                  account &&
                  chain &&
                  (!authenticationStatus ||
                    authenticationStatus === 'authenticated')

                return (
                  <div>
                    {(() => {
                      // 未连接状态：显示连接按钮
                      if (!connected) {
                        return (
                          <Button
                            onClick={openConnectModal}
                            className="h-9"
                          >
                            <Wallet className="mr-2 h-4 w-4" />
                            连接钱包
                          </Button>
                        )
                      }

                      // 网络错误状态：显示切换网络按钮
                      if (chain.unsupported) {
                        return (
                          <Button
                            onClick={openChainModal}
                            variant="destructive"
                            className="h-9"
                          >
                            错误网络
                          </Button>
                        )
                      }

                      // 已连接状态：显示账户信息
                      return (
                        <div className="flex items-center space-x-2">
                          {/* 网络显示 */}
                          <Button
                            onClick={openChainModal}
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-xs"
                          >
                            {chain.hasIcon && (
                              <div
                                style={{
                                  background: chain.iconBackground,
                                  width: 12,
                                  height: 12,
                                  borderRadius: 999,
                                  overflow: 'hidden',
                                  marginRight: 4,
                                }}
                              >
                                {chain.iconUrl && (
                                  <img
                                    alt={chain.name ?? 'Chain icon'}
                                    src={chain.iconUrl}
                                    style={{ width: 12, height: 12 }}
                                  />
                                )}
                              </div>
                            )}
                            {chain.name}
                          </Button>

                          {/* 账户按钮 */}
                          <Button
                            onClick={openAccountModal}
                            variant="outline"
                            className="h-9"
                          >
                            <Wallet className="mr-2 h-4 w-4" />
                            {account.displayName}
                            {account.displayBalance
                              ? ` (${account.displayBalance})`
                              : ''}
                          </Button>
                        </div>
                      )
                    })()}
                  </div>
                )
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </div>
    </header>
  )
}