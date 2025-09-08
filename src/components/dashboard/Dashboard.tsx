/**
 * 数据看板组件
 * 显示用户的借贷状况、健康因子、可用余额等关键信息
 */
'use client'

import { useAccount } from 'wagmi'
import { RefreshCw, TrendingUp, TrendingDown, AlertTriangle, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { useDashboardData, useWethBalance, useStableCoinBalance } from '@/hooks/useContract'
import { formatTokenAmount, formatCurrency, getHealthFactorColor, formatHealthFactor } from '@/lib/utils'
import { cn } from '@/lib/utils'

/**
 * 主数据看板组件
 * 整合显示用户的完整财务状况
 */
export function Dashboard() {
  const { address, isConnected } = useAccount()

  // 如果钱包未连接，显示连接提示
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <div className="rounded-full bg-muted p-6">
          <TrendingUp className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">连接钱包开始使用</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            请连接您的钱包以查看您的借贷状况和资产信息
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">数据看板</h2>
          <p className="text-muted-foreground">
            监控您的借贷状况和资产安全
          </p>
        </div>
        <RefreshButton />
      </div>

      {/* 关键指标卡片网格 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <HealthFactorCard address={address} />
        <TotalCollateralCard address={address} />
        <TotalBorrowedCard address={address} />
        <AvailableToBorrowCard address={address} />
      </div>

      {/* 详细信息区域 */}
      <div className="grid gap-6 md:grid-cols-2">
        <AssetBalanceCard address={address} />
        <BorrowingDetailsCard address={address} />
      </div>
    </div>
  )
}

/**
 * 刷新按钮组件
 * 手动触发数据刷新
 */
function RefreshButton() {
  const handleRefresh = () => {
    // 触发页面刷新，重新获取所有数据
    window.location.reload()
  }

  return (
    <Button onClick={handleRefresh} variant="outline" size="sm">
      <RefreshCw className="mr-2 h-4 w-4" />
      刷新数据
    </Button>
  )
}

/**
 * 健康因子卡片
 * 显示用户借贷头寸的安全程度
 */
function HealthFactorCard({ address }: { address: `0x${string}` | undefined }) {
  const { data: dashboardData, isLoading } = useDashboardData(address)

  const healthFactor = dashboardData?.healthFactor ?? Infinity
  const isLiquidatable = dashboardData?.isLiquidatable ?? false

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">健康因子</CardTitle>
        <AlertTriangle 
          className={cn(
            "h-4 w-4",
            isLiquidatable ? "text-red-500" : "text-green-500"
          )} 
        />
      </CardHeader>
      <CardContent>
        <div className={cn(
          "text-2xl font-bold",
          getHealthFactorColor(healthFactor)
        )}>
          {isLoading ? (
            <div className="animate-pulse bg-muted h-8 w-16 rounded" />
          ) : (
            formatHealthFactor(healthFactor)
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {isLiquidatable ? "⚠️ 面临清算风险" : "✅ 安全范围内"}
        </p>
      </CardContent>
    </Card>
  )
}

/**
 * 总抵押品卡片
 * 显示用户存入的抵押品总价值
 */
function TotalCollateralCard({ address }: { address: `0x${string}` | undefined }) {
  const { data: dashboardData, isLoading } = useDashboardData(address)

  const collateralAmount = dashboardData?.totalCollateral ?? 0n
  const ethPrice = dashboardData?.ethPrice ?? 0n

  // 计算USD价值
  const usdValue = collateralAmount && ethPrice ? 
    (collateralAmount * ethPrice) / 10n**18n : 0n

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">总抵押品</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            <div className="bg-muted h-8 w-24 rounded" />
            <div className="bg-muted h-4 w-16 rounded" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">
              {formatTokenAmount(collateralAmount)} ETH
            </div>
            <p className="text-xs text-muted-foreground">
              ≈ {formatCurrency(Number(formatTokenAmount(usdValue, 18, 2)))}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * 总借款卡片
 * 显示用户当前的债务总额
 */
function TotalBorrowedCard({ address }: { address: `0x${string}` | undefined }) {
  const { data: dashboardData, isLoading } = useDashboardData(address)

  const borrowedAmount = dashboardData?.totalBorrowed ?? 0n

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">总借款</CardTitle>
        <TrendingDown className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            <div className="bg-muted h-8 w-20 rounded" />
            <div className="bg-muted h-4 w-12 rounded" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">
              {formatTokenAmount(borrowedAmount)} USD
            </div>
            <p className="text-xs text-muted-foreground">
              稳定币借款
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * 可借款额度卡片
 * 显示用户还能借出多少资金
 */
function AvailableToBorrowCard({ address }: { address: `0x${string}` | undefined }) {
  const { data: dashboardData, isLoading } = useDashboardData(address)

  const availableAmount = dashboardData?.availableToBorrow ?? 0n

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">可借额度</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            <div className="bg-muted h-8 w-20 rounded" />
            <div className="bg-muted h-4 w-16 rounded" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">
              {formatTokenAmount(availableAmount)} USD
            </div>
            <p className="text-xs text-muted-foreground">
              剩余借款能力
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * 资产余额卡片
 * 显示用户钱包中的各种代币余额
 */
function AssetBalanceCard({ address }: { address: `0x${string}` | undefined }) {
  const { data: wethBalance, isLoading: wethLoading } = useWethBalance(address)
  const { data: stableCoinBalance, isLoading: stableLoading } = useStableCoinBalance(address)

  return (
    <Card>
      <CardHeader>
        <CardTitle>资产余额</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* WETH 余额 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-xs font-medium text-blue-600">WETH</span>
            </div>
            <div>
              <p className="text-sm font-medium">Wrapped Ether</p>
              <p className="text-xs text-muted-foreground">抵押品代币</p>
            </div>
          </div>
          <div className="text-right">
            {wethLoading ? (
              <div className="animate-pulse bg-muted h-5 w-16 rounded" />
            ) : (
              <p className="text-sm font-medium">
                {formatTokenAmount(wethBalance)} WETH
              </p>
            )}
          </div>
        </div>

        {/* 稳定币余额 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-xs font-medium text-green-600">USD</span>
            </div>
            <div>
              <p className="text-sm font-medium">Stable Coin</p>
              <p className="text-xs text-muted-foreground">协议稳定币</p>
            </div>
          </div>
          <div className="text-right">
            {stableLoading ? (
              <div className="animate-pulse bg-muted h-5 w-16 rounded" />
            ) : (
              <p className="text-sm font-medium">
                {formatTokenAmount(stableCoinBalance)} USD
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * 借贷详情卡片
 * 显示用户借贷头寸的详细信息
 */
function BorrowingDetailsCard({ address }: { address: `0x${string}` | undefined }) {
  const { data: dashboardData, isLoading } = useDashboardData(address)

  const userData = dashboardData?.userData

  return (
    <Card>
      <CardHeader>
        <CardTitle>借贷详情</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="bg-muted h-4 w-20 rounded" />
                <div className="bg-muted h-4 w-16 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">抵押品数量</span>
              <span className="text-sm font-medium">
                {formatTokenAmount(userData?.collateralAmount)} ETH
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">借款本金</span>
              <span className="text-sm font-medium">
                {formatTokenAmount(userData?.borrowedAmount)} USD
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">累积利息</span>
              <span className="text-sm font-medium">
                {formatTokenAmount(userData?.accumulatedInterest)} USD
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">最后更新时间</span>
              <span className="text-sm font-medium">
                {userData?.lastUpdateTime ? 
                  new Date(Number(userData.lastUpdateTime) * 1000).toLocaleString() : 
                  '暂无数据'
                }
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}