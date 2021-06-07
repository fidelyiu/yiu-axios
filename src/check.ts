import { YiuRequestConfig } from './type'
import { AxiosRequestConfig } from 'axios'

/**
 * 检查请求配置是否正确
 *
 * 正确 >> ture
 * 错误 >> false
 */
export function checkConfig(yC: YiuRequestConfig, aC: AxiosRequestConfig): boolean {
    return checkUrl(yC, aC)
        && checkMethod(yC, aC)
}

/**
 * 检查url是否正确
 *
 * - 正确 >> ture
 * - 错误 >> false
 */
export function checkUrl(yC: YiuRequestConfig, aC: AxiosRequestConfig): boolean {
    if (aC.url) {
        return true
    } else {
        if (!yC.url) {
            yC.debug && console.error('yiu-axios：config中未定义url!')
            return false
        }
        return true
    }
}

/**
 * 检查method是否正确
 *
 * - 正确 >> ture
 * - 错误 >> false
 */
export function checkMethod(config: YiuRequestConfig, aC: AxiosRequestConfig): boolean {
    if (aC.method) {
        return true
    } else {
        if (!config.method) {
            config.debug && console.error('yiu-axios：config中未定义method!')
            return false
        }
        return true
    }
}

/**
 * 检查路径参数是否正确
 *
 * - 正确 >> ture
 * - 错误 >> false
 */
export function checkPathData(yC: YiuRequestConfig): boolean {
    if (yC.pathHasBracket) {
        return true
    }
    if (yC.url) {
        const result = yC.url.match(/{.*?}/g)
        if (result && result.length) {
            yC.debug && console.error(`yiu-axios：config中path还有路径参数 ${result} 未转换，请在pathData中定义这些参数!`)
            return false
        }
        return true
    }
    return false
}
