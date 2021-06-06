import { YiuRequestConfig } from './type'
import { AxiosRequestConfig } from 'axios'
import { checkConfig, checkPathData } from './check'
import { isFunction } from 'lodash-es'

export function transformConfig(config: YiuRequestConfig): AxiosRequestConfig | undefined {
    // 检查之前的转换
    if (!config.url && config.api?.url) {
        config.url = config.api.url
    }
    if (!config.method && config.api?.method) {
        config.method = config.api.method
    }
    // 检查
    if (!checkConfig(config)) {
        return
    }
    // 转换前的处理
    if (!transformPathData(config)) {
        return
    }
    // 转换
    let aC = config as AxiosRequestConfig
    // 转换后的处理
    transformLang(aC, config)
}

/**
 * 将`YiuHttpConfig`中的路径参数`pathData`，转换到路径`url`中
 * 转换结果：
 * - false：路径中还有{xxx}参数
 * - true：转换完成
 */
function transformPathData(config: YiuRequestConfig): boolean {
    let url = config.url
    if (config.pathData) {
        for (const key in config.pathData) {
            if (config.pathData.hasOwnProperty(key) && url) {
                url = url.replace('{' + key + '}', encodeURIComponent(config.pathData[key]))
            }
        }
    }
    config.url = url
    return checkPathData(config)
}

/**
 * 处理国际化
 */
function transformLang(aC: AxiosRequestConfig, yC: YiuRequestConfig): void {
    if (!yC.headers) yC.headers = {}
    if (!yC.lang) {
        let currentLang: string | undefined
        if (isFunction(yC.getCurrentLang)) {
            currentLang = yC.getCurrentLang()
        }
        yC.lang = currentLang
    }
    if (yC.lang) {
        if (isFunction(yC.setLangFunc)) {
            yC.setLangFunc(aC, yC.lang)
        }
    }
}

/**
 * 处理token
 */
function transformToken(aC: AxiosRequestConfig, yC: YiuRequestConfig): void {
    if (!yC.headers) yC.headers = {}
    if (!yC.noToken) {
        if (!yC.token) {
            let currentToken: string | undefined
            if (isFunction(yC.getCurrentToken)) {
                currentToken = yC.getCurrentToken()
            }
            yC.token = currentToken
        }
        if (yC.token) {
            if (isFunction(yC.setTokenFunc)) {
                yC.setTokenFunc(aC, yC.token)
            }
        }
    }
}
