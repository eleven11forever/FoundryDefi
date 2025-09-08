/**
 * 交易操作组件集合
 * 提供存款、借款、还款、提取等核心借贷功能的用户界面
 */
'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { ArrowDownLeft, ArrowUpRight, Minus, Plus, Loader2 } from 'lucide-react'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Button, 
  Input, 
  Label 
} from '@/components/ui'
import { 
  useDepositCollateral,
  useWithdrawCollateral, 
  useBorrow, 
  useRepay,
  useDashboardData,
  useWethBalance,
  useStableCoinBalance 
} from '@/hooks/useContract'
import { formatTokenAmount, parseTokenAmount, formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

/**
 * 主交易面板组件
 * 集成所有交易功能的统一界面
 */
export function TradingPanel() {
  const { address, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState<'deposit' | 'borrow' | 'repay' | 'withdraw'>('deposit')

  // 如果钱包未连接，显示连接提示
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <div className="rounded-full bg-muted p-6">
          <ArrowDownLeft className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">连接钱包开始交易</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            请连接您的钱包以使用借贷功能
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">资产管理</h2>
        <p className="text-muted-foreground">
          存入抵押品，借出稳定币或管理您的借贷头寸
        </p>
      </div>

      {/* 标签页导航 */}
      <div className="flex space-x-1 rounded-lg bg-muted p-1">
        {[
          { key: 'deposit' as const, label: '存入抵押品', icon: Plus },
          { key: 'borrow' as const, label: '借出稳定币', icon: ArrowDownLeft },
          { key: 'repay' as const, label: '还款', icon: Minus },
          { key: 'withdraw' as const, label: '提取抵押品', icon: ArrowUpRight },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              "flex-1 flex items-center justify-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-all",
              activeTab === key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* 交易表单区域 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 左侧：交易表单 */}
        <div>
          {activeTab === 'deposit' && <DepositForm address={address} />}
          {activeTab === 'borrow' && <BorrowForm address={address} />}
          {activeTab === 'repay' && <RepayForm address={address} />}
          {activeTab === 'withdraw' && <WithdrawForm address={address} />}
        </div>

        {/* 右侧：交易信息 */}
        <TransactionInfo address={address} />
      </div>
    </div>
  )
}

/**
 * 存入抵押品表单
 */
function DepositForm({ address }: { address: `0x${string}` | undefined }) {
  const [amount, setAmount] = useState('')
  const { data: wethBalance } = useWethBalance(address)
  const { deposit, isPending, status } = useDepositCollateral()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !address) return
    
    const amountWei = parseTokenAmount(amount)
    if (amountWei > 0n) {
      deposit(amountWei)
    }
  }

  const handleMaxClick = () => {
    if (wethBalance) {
      setAmount(formatTokenAmount(wethBalance))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>存入 WETH</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 金额输入 */}
          <div className="space-y-2">
            <Label htmlFor="deposit-amount">存入金额</Label>
            <div className="flex space-x-2">
              <Input
                id="deposit-amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1"
                step="0.0001"
                min="0"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleMaxClick}
                disabled={!wethBalance}
              >
                最大
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              可用余额: {formatTokenAmount(wethBalance)} WETH
            </p>
          </div>

          {/* 交易状态显示 */}
          {status.status !== 'idle' && (
            <div className="p-3 rounded-md bg-muted">
              <p className="text-sm">
                {status.status === 'pending' && '交易处理中...'}
                {status.status === 'success' && '✅ 存入成功！'}
                {status.status === 'error' && `❌ 交易失败: ${status.error}`}
              </p>
              {status.hash && (
                <p className="text-xs text-muted-foreground mt-1">
                  交易哈希: {status.hash.slice(0, 10)}...{status.hash.slice(-8)}
                </p>
              )}
            </div>
          )}

          {/* 提交按钮 */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!amount || isPending || !wethBalance || parseTokenAmount(amount) > wethBalance}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                存入中...
              </>
            ) : (
              '存入抵押品'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

/**
 * 借出稳定币表单
 */
function BorrowForm({ address }: { address: `0x${string}` | undefined }) {
  const [amount, setAmount] = useState('')
  const { data: dashboardData } = useDashboardData(address)
  const { borrow, isPending, status } = useBorrow()

  const maxBorrow = dashboardData?.availableToBorrow ?? 0n

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !address) return
    
    const amountWei = parseTokenAmount(amount)
    if (amountWei > 0n) {
      borrow(amountWei)
    }
  }

  const handleMaxClick = () => {
    if (maxBorrow) {
      setAmount(formatTokenAmount(maxBorrow))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ArrowDownLeft className="h-5 w-5" />
          <span>借出稳定币</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 金额输入 */}
          <div className="space-y-2">
            <Label htmlFor="borrow-amount">借出金额</Label>
            <div className="flex space-x-2">
              <Input
                id="borrow-amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1"
                step="0.01"
                min="0"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleMaxClick}
                disabled={!maxBorrow || maxBorrow === 0n}
              >
                最大
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              最大可借: {formatTokenAmount(maxBorrow)} USD
            </p>
          </div>

          {/* 借贷信息 */}
          <div className="p-3 rounded-md bg-muted space-y-2">
            <div className="flex justify-between text-sm">
              <span>年利率:</span>
              <span className="font-medium">5%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>抵押率要求:</span>
              <span className="font-medium">150%</span>
            </div>
          </div>

          {/* 交易状态显示 */}
          {status.status !== 'idle' && (
            <div className="p-3 rounded-md bg-muted">
              <p className="text-sm">
                {status.status === 'pending' && '交易处理中...'}
                {status.status === 'success' && '✅ 借出成功！'}
                {status.status === 'error' && `❌ 交易失败: ${status.error}`}
              </p>
              {status.hash && (
                <p className="text-xs text-muted-foreground mt-1">
                  交易哈希: {status.hash.slice(0, 10)}...{status.hash.slice(-8)}
                </p>
              )}
            </div>
          )}

          {/* 提交按钮 */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!amount || isPending || !maxBorrow || parseTokenAmount(amount) > maxBorrow}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                借出中...
              </>
            ) : (
              '借出稳定币'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

/**
 * 还款表单
 */
function RepayForm({ address }: { address: `0x${string}` | undefined }) {
  const [amount, setAmount] = useState('')
  const { data: stableCoinBalance } = useStableCoinBalance(address)
  const { data: dashboardData } = useDashboardData(address)
  const { repay, isPending, status } = useRepay()

  const totalDebt = (dashboardData?.totalBorrowed ?? 0n) + (dashboardData?.userData?.accumulatedInterest ?? 0n)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !address) return
    
    const amountWei = parseTokenAmount(amount)
    if (amountWei > 0n) {
      repay(amountWei)
    }
  }

  const handleMaxClick = () => {
    if (stableCoinBalance && totalDebt) {
      const maxRepay = stableCoinBalance < totalDebt ? stableCoinBalance : totalDebt
      setAmount(formatTokenAmount(maxRepay))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Minus className="h-5 w-5" />
          <span>还款</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 金额输入 */}
          <div className="space-y-2">
            <Label htmlFor="repay-amount">还款金额</Label>
            <div className="flex space-x-2">
              <Input
                id="repay-amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1"
                step="0.01"
                min="0"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleMaxClick}
                disabled={!stableCoinBalance || !totalDebt}
              >
                最大
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              钱包余额: {formatTokenAmount(stableCoinBalance)} USD
            </p>
          </div>

          {/* 债务信息 */}
          <div className="p-3 rounded-md bg-muted space-y-2">
            <div className="flex justify-between text-sm">
              <span>待还本金:</span>
              <span className="font-medium">
                {formatTokenAmount(dashboardData?.totalBorrowed)} USD
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>累积利息:</span>
              <span className="font-medium">
                {formatTokenAmount(dashboardData?.userData?.accumulatedInterest)} USD
              </span>
            </div>
            <div className="flex justify-between text-sm font-medium border-t pt-2">
              <span>总债务:</span>
              <span>{formatTokenAmount(totalDebt)} USD</span>
            </div>
          </div>

          {/* 交易状态显示 */}
          {status.status !== 'idle' && (
            <div className="p-3 rounded-md bg-muted">
              <p className="text-sm">
                {status.status === 'pending' && '交易处理中...'}
                {status.status === 'success' && '✅ 还款成功！'}
                {status.status === 'error' && `❌ 交易失败: ${status.error}`}
              </p>
              {status.hash && (
                <p className="text-xs text-muted-foreground mt-1">
                  交易哈希: {status.hash.slice(0, 10)}...{status.hash.slice(-8)}
                </p>
              )}
            </div>
          )}

          {/* 提交按钮 */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!amount || isPending || !stableCoinBalance || parseTokenAmount(amount) > stableCoinBalance}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                还款中...
              </>
            ) : (
              '还款'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

/**
 * 提取抵押品表单
 */
function WithdrawForm({ address }: { address: `0x${string}` | undefined }) {
  const [amount, setAmount] = useState('')
  const { data: dashboardData } = useDashboardData(address)
  const { withdraw, isPending, status } = useWithdrawCollateral()

  const collateralAmount = dashboardData?.totalCollateral ?? 0n

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !address) return
    
    const amountWei = parseTokenAmount(amount)
    if (amountWei > 0n) {
      withdraw(amountWei)
    }
  }

  const handleMaxClick = () => {
    if (collateralAmount) {
      // 这里应该计算考虑抵押率要求后的最大可提取金额
      // 简化起见，直接使用全部抵押品金额
      setAmount(formatTokenAmount(collateralAmount))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ArrowUpRight className="h-5 w-5" />
          <span>提取抵押品</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 金额输入 */}
          <div className="space-y-2">
            <Label htmlFor="withdraw-amount">提取金额</Label>
            <div className="flex space-x-2">
              <Input
                id="withdraw-amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1"
                step="0.0001"
                min="0"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleMaxClick}
                disabled={!collateralAmount || collateralAmount === 0n}
              >
                最大
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              已存入: {formatTokenAmount(collateralAmount)} WETH
            </p>
          </div>

          {/* 提取警告 */}
          <div className="p-3 rounded-md bg-yellow-50 border border-yellow-200">
            <p className="text-sm text-yellow-800">
              ⚠️ 提取抵押品可能会影响您的健康因子，请确保提取后仍满足150%的抵押率要求。
            </p>
          </div>

          {/* 交易状态显示 */}
          {status.status !== 'idle' && (
            <div className="p-3 rounded-md bg-muted">
              <p className="text-sm">
                {status.status === 'pending' && '交易处理中...'}
                {status.status === 'success' && '✅ 提取成功！'}
                {status.status === 'error' && `❌ 交易失败: ${status.error}`}
              </p>
              {status.hash && (
                <p className="text-xs text-muted-foreground mt-1">
                  交易哈希: {status.hash.slice(0, 10)}...{status.hash.slice(-8)}
                </p>
              )}
            </div>
          )}

          {/* 提交按钮 */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!amount || isPending || !collateralAmount || parseTokenAmount(amount) > collateralAmount}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                提取中...
              </>
            ) : (
              '提取抵押品'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

/**
 * 交易信息面板
 * 显示当前市场信息和用户状态
 */
function TransactionInfo({ address }: { address: `0x${string}` | undefined }) {
  const { data: dashboardData } = useDashboardData(address)

  return (
    <Card>
      <CardHeader>
        <CardTitle>交易信息</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ETH 价格 */}
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">ETH 价格</span>
          <span className="text-sm font-medium">
            {formatCurrency(Number(formatTokenAmount(dashboardData?.ethPrice, 18, 2)))}
          </span>
        </div>

        {/* 健康因子 */}
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">健康因子</span>
          <span className={cn(
            "text-sm font-medium",
            dashboardData?.healthFactor === Infinity ? "text-green-600" :
            dashboardData?.healthFactor && dashboardData.healthFactor > 2 ? "text-green-600" :
            dashboardData?.healthFactor && dashboardData.healthFactor > 1.5 ? "text-yellow-600" :
            dashboardData?.healthFactor && dashboardData.healthFactor > 1.2 ? "text-orange-600" :
            "text-red-600"
          )}>
            {dashboardData?.healthFactor === Infinity ? '∞' : dashboardData?.healthFactor?.toFixed(2)}
          </span>
        </div>

        {/* 协议参数 */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">最低抵押率</span>
            <span className="text-sm font-medium">150%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">清算阈值</span>
            <span className="text-sm font-medium">120%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">借贷利率</span>
            <span className="text-sm font-medium">5% APY</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">清算惩罚</span>
            <span className="text-sm font-medium">10%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}