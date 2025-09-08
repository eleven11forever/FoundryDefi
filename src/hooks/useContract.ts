/**
 * 自定义 Hook 集合
 * 提供与智能合约交互的通用功能，包括数据读取、交易执行等
 */
'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { formatUnits } from 'viem'
import { 
  getContractAddresses, 
  LENDING_PROTOCOL_ABI, 
  STABLE_COIN_ABI, 
  MOCK_WETH_ABI 
} from '@/lib/contracts'
import { DashboardData, UserData, TransactionStatus } from '@/types'
import { calculateHealthFactor } from '@/lib/utils'
import { useState } from 'react'

// ====================== 合约读取 Hooks ======================

/**
 * 获取用户在借贷协议中的详细数据
 * @param userAddress 用户钱包地址
 * @returns 用户的抵押品、借款、利息等信息
 */
export function useUserData(userAddress: `0x${string}` | undefined) {
  const chainId = useChainId()
  const addresses = getContractAddresses(chainId)
  
  return useReadContract({
    address: addresses.LENDING_PROTOCOL,
    abi: LENDING_PROTOCOL_ABI,
    functionName: 'users',
    args: userAddress ? [userAddress] : undefined,
    // 每30秒重新获取用户数据
    query: {
      enabled: !!userAddress,
      refetchInterval: 30000,
    }
  })
}

/**
 * 获取用户的总债务（本金 + 利息）
 * @param userAddress 用户钱包地址
 */
export function useUserTotalDebt(userAddress: `0x${string}` | undefined) {
  const chainId = useChainId()
  const addresses = getContractAddresses(chainId)
  
  return useReadContract({
    address: addresses.LENDING_PROTOCOL,
    abi: LENDING_PROTOCOL_ABI,
    functionName: 'getTotalDebt',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: 30000,
    }
  })
}

/**
 * 获取用户最大可借款金额
 * @param userAddress 用户钱包地址
 */
export function useMaxBorrowAmount(userAddress: `0x${string}` | undefined) {
  const chainId = useChainId()
  const addresses = getContractAddresses(chainId)
  
  return useReadContract({
    address: addresses.LENDING_PROTOCOL,
    abi: LENDING_PROTOCOL_ABI,
    functionName: 'getMaxBorrowAmount',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: 30000,
    }
  })
}

/**
 * 获取 ETH 当前价格
 * 通过 Chainlink 价格预言机获取
 */
export function useEthPrice() {
  const chainId = useChainId()
  const addresses = getContractAddresses(chainId)
  
  return useReadContract({
    address: addresses.LENDING_PROTOCOL,
    abi: LENDING_PROTOCOL_ABI,
    functionName: 'getLatestPrice',
    // 每分钟更新价格
    query: {
      refetchInterval: 60000,
    }
  })
}

/**
 * 检查用户是否可以被清算
 * @param userAddress 用户钱包地址
 */
export function useIsLiquidatable(userAddress: `0x${string}` | undefined) {
  const chainId = useChainId()
  const addresses = getContractAddresses(chainId)
  
  return useReadContract({
    address: addresses.LENDING_PROTOCOL,
    abi: LENDING_PROTOCOL_ABI,
    functionName: 'isLiquidatable',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: 30000,
    }
  })
}

// ====================== 代币余额 Hooks ======================

/**
 * 获取用户的 WETH 余额
 * @param userAddress 用户钱包地址
 */
export function useWethBalance(userAddress: `0x${string}` | undefined) {
  const chainId = useChainId()
  const addresses = getContractAddresses(chainId)
  
  return useReadContract({
    address: addresses.MOCK_WETH,
    abi: MOCK_WETH_ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: 15000,
    }
  })
}

/**
 * 获取用户的稳定币余额
 * @param userAddress 用户钱包地址
 */
export function useStableCoinBalance(userAddress: `0x${string}` | undefined) {
  const chainId = useChainId()
  const addresses = getContractAddresses(chainId)
  
  return useReadContract({
    address: addresses.STABLE_COIN,
    abi: STABLE_COIN_ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: 15000,
    }
  })
}

// ====================== 综合数据 Hook ======================

/**
 * 获取用户仪表板所需的所有数据
 * 整合多个合约调用，提供完整的用户状态信息
 * @param userAddress 用户钱包地址
 */
export function useDashboardData(userAddress: `0x${string}` | undefined) {
  // 获取各项基础数据
  const { data: userData } = useUserData(userAddress)
  const { data: totalDebt } = useUserTotalDebt(userAddress)
  const { data: maxBorrow } = useMaxBorrowAmount(userAddress)
  const { data: ethPrice } = useEthPrice()
  const { data: isLiquidatable } = useIsLiquidatable(userAddress)

  // 使用 React Query 处理数据组合和计算
  return useQuery({
    queryKey: ['dashboardData', userAddress, userData, totalDebt, maxBorrow, ethPrice, isLiquidatable],
    queryFn: (): DashboardData => {
      if (!userData || !ethPrice) {
        // 返回默认空数据
        return {
          ethPrice: 0n,
          totalCollateral: 0n,
          totalBorrowed: 0n,
          availableToBorrow: 0n,
          healthFactor: Infinity,
          isLiquidatable: false,
          userData: {
            collateralAmount: 0n,
            borrowedAmount: 0n,
            lastUpdateTime: 0n,
            accumulatedInterest: 0n,
          }
        }
      }

      // 计算抵押品价值（USD）
      const collateralValue = (userData[0] * ethPrice) / 10n**18n

      // 计算健康因子
      const healthFactor = totalDebt && totalDebt > 0n
        ? calculateHealthFactor(collateralValue, totalDebt)
        : Infinity

      return {
        ethPrice,
        totalCollateral: userData[0], // collateralAmount
        totalBorrowed: userData[1],   // borrowedAmount
        availableToBorrow: maxBorrow || 0n,
        healthFactor,
        isLiquidatable: isLiquidatable || false,
        userData: {
          collateralAmount: userData[0],
          borrowedAmount: userData[1],
          lastUpdateTime: userData[2],
          accumulatedInterest: userData[3],
        }
      }
    },
    enabled: !!userAddress,
    // 缓存30秒，避免频繁计算
    staleTime: 30000,
  })
}

// ====================== 交易执行 Hooks ======================

/**
 * 通用交易执行 Hook
 * 提供交易状态管理和错误处理
 */
export function useTransaction() {
  const [status, setStatus] = useState<TransactionStatus>({
    status: 'idle'
  })

  // Wagmi 写入合约 Hook
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  
  // 等待交易确认
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // 更新交易状态
  const updateStatus = (newStatus: Partial<TransactionStatus>) => {
    setStatus(prev => ({ ...prev, ...newStatus }))
  }

  // 重置状态
  const reset = () => {
    setStatus({ status: 'idle' })
  }

  return {
    writeContract,
    status: {
      ...status,
      status: isPending || isConfirming ? 'pending' : 
              isSuccess ? 'success' : 
              error ? 'error' : 'idle',
      hash,
      error: error?.message
    },
    updateStatus,
    reset,
    isPending: isPending || isConfirming,
    isSuccess,
    error
  }
}

/**
 * 存入抵押品
 * @param amount 存入金额（以 wei 为单位）
 */
export function useDepositCollateral() {
  const transaction = useTransaction()
  const chainId = useChainId()
  const addresses = getContractAddresses(chainId)

  const deposit = (amount: bigint) => {
    transaction.writeContract({
      address: addresses.LENDING_PROTOCOL,
      abi: LENDING_PROTOCOL_ABI,
      functionName: 'depositCollateral',
      args: [amount],
    })
  }

  return {
    deposit,
    ...transaction
  }
}

/**
 * 提取抵押品
 * @param amount 提取金额（以 wei 为单位）
 */
export function useWithdrawCollateral() {
  const transaction = useTransaction()
  const chainId = useChainId()
  const addresses = getContractAddresses(chainId)

  const withdraw = (amount: bigint) => {
    transaction.writeContract({
      address: addresses.LENDING_PROTOCOL,
      abi: LENDING_PROTOCOL_ABI,
      functionName: 'withdrawCollateral',
      args: [amount],
    })
  }

  return {
    withdraw,
    ...transaction
  }
}

/**
 * 借出稳定币
 * @param amount 借出金额（以 wei 为单位）
 */
export function useBorrow() {
  const transaction = useTransaction()
  const chainId = useChainId()
  const addresses = getContractAddresses(chainId)

  const borrow = (amount: bigint) => {
    transaction.writeContract({
      address: addresses.LENDING_PROTOCOL,
      abi: LENDING_PROTOCOL_ABI,
      functionName: 'borrow',
      args: [amount],
    })
  }

  return {
    borrow,
    ...transaction
  }
}

/**
 * 还款
 * @param amount 还款金额（以 wei 为单位）
 */
export function useRepay() {
  const transaction = useTransaction()
  const chainId = useChainId()
  const addresses = getContractAddresses(chainId)

  const repay = (amount: bigint) => {
    transaction.writeContract({
      address: addresses.LENDING_PROTOCOL,
      abi: LENDING_PROTOCOL_ABI,
      functionName: 'repay',
      args: [amount],
    })
  }

  return {
    repay,
    ...transaction
  }
}