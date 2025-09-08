/**
 * 应用主页面
 * 整合数据看板和交易面板，提供完整的 DeFi 借贷体验
 */
'use client'

import { Dashboard } from '@/components/dashboard/Dashboard'
import { TradingPanel } from '@/components/trading/TradingPanel'

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* 页面标题区域 */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          DeFi 借贷协议
        </h1>
        <p className="text-xl text-muted-foreground">
          安全、透明、高效的去中心化借贷平台
        </p>
      </div>

      {/* 主要功能区域 */}
      <div className="space-y-8">
        {/* 数据看板 - 显示用户当前状态和关键指标 */}
        <section>
          <Dashboard />
        </section>

        {/* 分隔线 */}
        <div className="border-t" />

        {/* 交易面板 - 提供借贷操作功能 */}
        <section>
          <TradingPanel />
        </section>
      </div>

      {/* 协议信息区域 */}
      <section className="mt-12 pt-8 border-t">
        <div className="grid gap-8 md:grid-cols-3">
          {/* 安全性说明 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">🔒 安全可靠</h3>
            <p className="text-sm text-muted-foreground">
              基于经过审计的智能合约，采用过度抵押机制确保资金安全，
              所有交易都在链上透明执行。
            </p>
          </div>

          {/* 去中心化特性 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">🌐 完全去中心化</h3>
            <p className="text-sm text-muted-foreground">
              无需中介机构，用户完全掌控自己的资产，
              通过智能合约自动化执行借贷逻辑。
            </p>
          </div>

          {/* 实时清算 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">⚡ 实时清算</h3>
            <p className="text-sm text-muted-foreground">
              集成 Chainlink 价格预言机，实时监控抵押品价值，
              自动触发清算保护协议安全。
            </p>
          </div>
        </div>
      </section>

      {/* 风险提示 */}
      <section className="mt-8 p-6 rounded-lg bg-yellow-50 border border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800">
        <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-3">
          ⚠️ 风险提示
        </h3>
        <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
          <p>
            • DeFi 协议存在智能合约风险、市场风险和技术风险，请充分了解后谨慎使用。
          </p>
          <p>
            • 价格波动可能导致抵押品被清算，请密切关注您的健康因子。
          </p>
          <p>
            • 本协议为实验性质，仅供学习和测试使用，请勿投入超出承受能力的资金。
          </p>
        </div>
      </section>
    </div>
  )
}