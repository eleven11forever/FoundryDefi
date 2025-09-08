/**
 * BigInt 序列化工具
 * 解决 React Query 和其他 JSON 序列化问题
 */

// 全局配置 BigInt 序列化支持
declare global {
  interface BigInt {
    toJSON(): string
  }
}

// 添加 BigInt 的 toJSON 方法
BigInt.prototype.toJSON = function() {
  return this.toString()
}

/**
 * 安全地将包含 BigInt 的对象转换为可序列化的对象
 */
export function serializeBigInt(obj: any): any {
  if (typeof obj === 'bigint') {
    return obj.toString()
  }
  
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt)
  }
  
  if (obj && typeof obj === 'object') {
    const serialized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeBigInt(value)
    }
    return serialized
  }
  
  return obj
}

/**
 * 将字符串转换回 BigInt（用于反序列化）
 */
export function deserializeBigInt(obj: any, bigIntKeys: string[] = []): any {
  if (Array.isArray(obj)) {
    return obj.map(item => deserializeBigInt(item, bigIntKeys))
  }
  
  if (obj && typeof obj === 'object') {
    const deserialized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      if (bigIntKeys.includes(key) && typeof value === 'string') {
        deserialized[key] = BigInt(value)
      } else {
        deserialized[key] = deserializeBigInt(value, bigIntKeys)
      }
    }
    return deserialized
  }
  
  return obj
}