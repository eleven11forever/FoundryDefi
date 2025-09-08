'use client'

import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, sepolia, polygon, foundry } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: '借贷协议 DApp',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [
    mainnet,
    polygon,
    sepolia,
    {
      ...foundry,
      name: 'Foundry',
    },
  ],
  ssr: true
})