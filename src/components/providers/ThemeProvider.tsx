/**
 * 主题提供者组件
 * 为整个应用提供深色/浅色主题切换功能
 */
'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

/**
 * 主题上下文提供者
 * 包装 next-themes 提供者，配置主题相关选项
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      // 主题属性名，对应 CSS 中的 class
      attribute="class"
      // 默认主题
      defaultTheme="system"
      // 启用系统主题检测
      enableSystem
      // 禁用过渡动画避免闪烁
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}