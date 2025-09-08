/**
 * 主应用布局组件
 * 整合所有提供者和全局样式，为应用提供统一的布局结构
 */
import { Inter } from 'next/font/google'
import { Web3Provider } from '@/components/providers/Web3Provider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Header } from '@/components/layout/Header'
import '@/styles/globals.css'

// 配置字体
const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'DeFi 借贷协议',
  description: '安全、透明、高效的去中心化借贷平台',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        {/* 主题提供者 - 管理深色/浅色主题 */}
        <ThemeProvider>
          {/* Web3 提供者 - 管理钱包连接、区块链交互和数据缓存 */}
          <Web3Provider>
            <div className="relative flex min-h-screen flex-col">
              {/* 全局头部导航 */}
              <Header />
              
              {/* 主要内容区域 */}
              <main className="flex-1">
                <div className="container mx-auto px-4 py-6">
                  {children}
                </div>
              </main>
              
              {/* 页脚 */}
              <footer className="border-t py-6 md:py-0">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
                  <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                      由{' '}
                      <a
                        href="#"
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium underline underline-offset-4"
                      >
                        DeFi Labs
                      </a>{' '}
                      构建。源代码可在{' '}
                      <a
                        href="#"
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium underline underline-offset-4"
                      >
                        GitHub
                      </a>{' '}
                      上找到。
                    </p>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>© 2024 借贷协议</span>
                  </div>
                </div>
              </footer>
            </div>
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  )
}