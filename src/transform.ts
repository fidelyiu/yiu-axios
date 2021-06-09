import { isArray, isFunction, mapKeys, merge } from 'lodash'
import { AxiosRequestConfig, Method } from 'axios'
import { checkConfig, checkPathData } from './check'
import { stringify } from 'qs'
import { ContentTypeEnum, MethodEnum, YiuRequestConfig } from './type'

export function transformConfig(yC: YiuRequestConfig, aC?: AxiosRequestConfig): AxiosRequestConfig | undefined {
    // 检查之前的转换
    if (!aC) {
        aC = {}
    }
    transformUrl(yC)
    transformMethod(yC)
    transformContentType(yC)
    if (!checkConfig(yC, aC)) {
        return
    }
    if (!transformPathData(yC)) {
        return
    }
    transformFormUrlEncoded(yC)
    transformFormData(yC)
    // 转换
    // let aC = yC as AxiosRequestConfig
    // 转换后的处理
    transformLang(yC)
    transformToken(yC)
    aC = merge({}, yC, aC)
    return aC
}

function transformUrl(yC: YiuRequestConfig) {
    if (!yC.url && yC.api?.url) {
        yC.url = yC.api.url
    }
}

function transformMethod(yC: YiuRequestConfig) {
    if (!yC.method && yC.api?.method) {
        if (yC.api.method === MethodEnum.POST_FORM_DATA || yC.api.method === MethodEnum.POST_FORM_URLENCODED) {
            yC.method = 'POST'
            if (yC.api.method === MethodEnum.POST_FORM_DATA) {
                yC.contentType = ContentTypeEnum.FORM_DATA
            }
            if (yC.api.method === MethodEnum.POST_FORM_URLENCODED) {
                yC.contentType = ContentTypeEnum.FORM_URLENCODED
            }
        } else {
            yC.method = yC.api.method as Method
        }
    }
}

/**
 * 将`YiuHttpConfig`中的路径参数`pathData`，转换到路径`url`中
 *
 * 转换结果：
 *
 * - false：路径中还有{xxx}参数
 * - true：转换完成
 */
function transformPathData(yC: YiuRequestConfig): boolean {
    let url = yC.url
    if (url && yC.pathData) {
        for (const key in yC.pathData) {
            if (yC.pathData.hasOwnProperty(key) && url) {
                url = url.replace('{' + key + '}', encodeURIComponent(yC.pathData[key]))
            }
        }
    }
    yC.url = url
    return checkPathData(yC)
}

/**
 * 处理FormUrlEncoded
 *
 * 表单POST请求
 */
function transformFormUrlEncoded(yC: YiuRequestConfig): void {
    if (yC.contentType === ContentTypeEnum.FORM_URLENCODED) {
        if (yC.data) {
            yC.data = stringify(yC.data, { arrayFormat: 'brackets' })
        }
    }
}

/**
 * 处理FormData
 * 上传POST请求
 */
function transformFormData(yC: YiuRequestConfig): void {
    if (yC.contentType === ContentTypeEnum.FORM_DATA) {
        const formData = new window.FormData()
        if (yC.data) {
            mapKeys(yC.data, (v, k) => {
                if (isArray(v)) {
                    v.forEach((item) => {
                        formData.append(`${k}[]`, item)
                    })
                }
                formData.append(k, v)
            })
        }
        if (yC.upload?.file) {
            formData.append(yC.upload.key || 'file', yC.upload.file, yC.upload.name)
        }
        yC.data = formData
    }
}

/**
 * 处理ContentType类型
 */
function transformContentType(yC: YiuRequestConfig): void {
    if (yC.contentType) {
        if (!yC.headers) yC.headers = {}
        let charset = 'utf-8'
        if (yC.contentCharset) {
            charset = yC.contentCharset
        }
        yC.headers['Content-Type'] = `${yC.contentType};charset=${charset}`
    }
}

/**
 * 处理国际化
 */
function transformLang(yC: YiuRequestConfig): void {
    if (!yC.headers) yC.headers = {}
    if (!yC.lang
        && yC.langFunc
        && isFunction(yC.langFunc.get)) {
        yC.lang = yC.langFunc.get()
    }
    if (yC.lang
        && yC.langFunc
        && isFunction(yC.langFunc.set)) {
        yC.langFunc.set(yC, yC.lang)
    }
}

/**
 * 处理token
 */
function transformToken(yC: YiuRequestConfig): void {
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
            yC.tokenFunc.set(yC, yC.token)
        }
    }
}
