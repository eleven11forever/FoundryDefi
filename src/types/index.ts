export interface UserData {
  collateralAmount: bigint
  borrowedAmount: bigint
  lastUpdateTime: bigint
  accumulatedInterest: bigint
}

export interface TokenBalance {
  symbol: string
  balance: bigint
  formattedBalance: string
  usdValue?: number
}

export interface DashboardData {
  ethPrice: bigint
  totalCollateral: bigint
  totalBorrowed: bigint
  availableToBorrow: bigint
  healthFactor: number
  isLiquidatable: boolean
  userData: UserData
}

export interface TransactionStatus {
  hash?: string
  status: 'idle' | 'pending' | 'success' | 'error'
  error?: string
}

export type TransactionType = 
  | 'deposit'
  | 'withdraw' 
  | 'borrow'
  | 'repay'
  | 'liquidate'
  | 'approve'