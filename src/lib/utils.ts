import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatUnits, parseUnits } from 'viem'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTokenAmount(
  amount: bigint | undefined,
  decimals: number = 18,
  precision: number = 4
): string {
  if (!amount) return '0'
  return Number(formatUnits(amount, decimals)).toFixed(precision)
}

export function formatCurrency(
  amount: number | string,
  currency: string = 'USD'
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numAmount)
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(2)}%`
}

export function parseTokenAmount(amount: string, decimals: number = 18): bigint {
  try {
    return parseUnits(amount, decimals)
  } catch {
    return BigInt(0)
  }
}

export function shortenAddress(address: string, chars: number = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export function calculateHealthFactor(
  collateralValue: bigint,
  debt: bigint,
  liquidationThreshold: number = 120
): number {
  if (debt === BigInt(0)) return Infinity
  const collateralValueNum = Number(formatUnits(collateralValue, 18))
  const debtNum = Number(formatUnits(debt, 18))
  return (collateralValueNum * liquidationThreshold) / (debtNum * 100)
}

export function getHealthFactorColor(healthFactor: number): string {
  if (healthFactor === Infinity) return 'text-green-600'
  if (healthFactor > 2) return 'text-green-600'
  if (healthFactor > 1.5) return 'text-yellow-600'
  if (healthFactor > 1.2) return 'text-orange-600'
  return 'text-red-600'
}

export function formatHealthFactor(healthFactor: number): string {
  if (healthFactor === Infinity) return '∞'
  return healthFactor.toFixed(2)
}