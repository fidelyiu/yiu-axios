import { YiuRequestConfig } from './type'

/**
 * 检查请求配置是否正确
 * @param config 请求配置
 *
 * 正确 >> ture
 * 错误 >> false
 */
export function checkConfig(config: YiuRequestConfig): boolean {
    return checkUrl(config)
        && checkMethod(config)
}

/**
 * 检查url是否正确
 *
 * - 正确 >> ture
 * - 错误 >> false
 */
export function checkUrl(config: YiuRequestConfig): boolean {
    if (!config.url) {
        config.debug && console.error('yiu-http：config中未定义url!')
        return false
    }
    return true
}

/**
 * 检查method是否正确
 *
 * - 正确 >> ture
 * - 错误 >> false
 */
export function checkMethod(config: YiuRequestConfig): boolean {
    if (!config.method) {
        config.debug && console.error('yiu-http：config中未定义method!')
        return false
    }
    return true
}

/**
 * 检查路径参数是否正确
 *
 * - 正确 >> ture
 * - 错误 >> false
 */
export function checkPathData(config: YiuRequestConfig): boolean {
    if (config.url) {
        const result = config.url.match(/{.*?}/g)
        if (result && result.length) {
            config.debug && console.error(`yiu-axios：config中path还有路径参数 ${result} 未转换，请在pathData中定义这些参数!`)
            return false
        }
        return true
    }
    return false
}
