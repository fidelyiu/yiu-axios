import { ContentTypeEnum, YiuRequestConfig } from './type'
import { AxiosRequestConfig } from 'axios'
import { checkConfig, checkPathData } from './check'
import { isArray, isFunction, mapKeys } from 'lodash-es'
import qs from 'qs'

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
    transformFormUrlEncoded(config)
    transformFormData(config)
    transformContentType(config)
    // 转换
    let aC = config as AxiosRequestConfig
    // 转换后的处理
    transformLang(aC, config)
    transformToken(aC, config)
    return aC
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
 * 处理FormUrlEncoded
 * 表单POST请求
 * @param config
 */
function transformFormUrlEncoded(config: YiuRequestConfig): void {
    if (config.method === 'FORM_URLENCODED') {
        config.method = 'POST'
        config.contentType = ContentTypeEnum.FORM_URLENCODED
        if (config.data) {
            config.data = qs.stringify(config.data, { arrayFormat: 'brackets' })
        }
    }
}

/**
 * 处理FormData
 * 上传POST请求
 */
function transformFormData(config: YiuRequestConfig): void {
    if (config.method === 'FORM_DATA') {
        config.method = 'POST'
        config.contentType = ContentTypeEnum.FORM_DATA
        const formData = new window.FormData()
        if (config.data) {
            mapKeys(config.data, (v, k) => {
                if (isArray(v)) {
                    v.forEach((item) => {
                        formData.append(`${k}[]`, item)
                    })
                }
                formData.append(k, v)
            })
        }
        if (config.upload?.file) {
            formData.append(config.upload.key || 'file', config.upload.file, config.upload.name)
        }
        config.data = formData
    }
}

/**
 * 处理ContentType类型
 */
function transformContentType(config: YiuRequestConfig): void {
    if (config.contentType) {
        if (!config.headers) config.headers = {}
        config.headers['Content-Type'] = config.contentType
    }
}

/**
 * 处理国际化
 */
function transformLang(aC: AxiosRequestConfig, yC: YiuRequestConfig): void {
    if (!yC.headers) yC.headers = {}
    if (!yC.lang
        && yC.langFunc
        && isFunction(yC.langFunc.get)) {
        yC.lang = yC.langFunc.get()
    }
    if (yC.lang
        && yC.langFunc
        && isFunction(yC.langFunc.set)) {
        yC.langFunc.set(aC, yC.lang)
    }
}

/**
 * 处理token
 */
function transformToken(aC: AxiosRequestConfig, yC: YiuRequestConfig): void {
    if (!yC.headers) yC.headers = {}
    if (!yC.noToken) {
        if (!yC.token
            && yC.tokenFunc
            && isFunction(yC.tokenFunc.get)) {
            yC.token = yC.tokenFunc.get()
        }
        if (yC.token
            && yC.tokenFunc
            && isFunction(yC.tokenFunc.set)) {
            yC.tokenFunc.set(aC, yC.token)
        }
    }
}
