import { AxiosRequestConfig, AxiosResponse, Canceler, Method } from 'axios'

export interface YiuAip {
    url: string
    method: Method
        | 'form_data' | 'FORM_DATA'
        | 'form_urlencoded' | 'FORM_URLENCODED'
}

/**
 * - D：返回data类型
 * - T：消息类型：'none' | 'modal' | 'message' | 'notification' | undefined
 */
export interface YiuRequestConfig<D = any, T = any> extends Omit<AxiosRequestConfig, 'url' | 'method'> {
    /**
     * 请求路径
     */
    url?: string
    /**
     * 请求方法
     * `FORM_DATA`、`FORM_URLENCODED`、将会被转换成`POST`
     */
    method?: Method
        | 'form_data' | 'FORM_DATA'
        | 'form_urlencoded' | 'FORM_URLENCODED'
    /**
     * 加载状态
     */
    loading?: any
    /**
     * 包含加载状态对象
     */
    loadingObj?: any
    /**
     * 加载状态对应的Key
     */
    loadingKey?: any
    loadingBeforeSendFunc?: (res: {
        loading: any
        loadingObj: any
        loadingKey: any
    }) => void
    loadingFinallySendFunc?: (res: {
        loading: any
        loadingObj: any
        loadingKey: any
    }) => void
    /**
     * 消息展示的类型
     */
    tipsType?: T
    /**
     * 成功后的处理
     * @param res 请求结果
     */
    success?: (res: AxiosResponse<D>) => void
    /**
     * 是否展示成功消息
     */
    noSuccessTips?: boolean
    /**
     * 展示成功消息的方式
     */
    showSuccessTips?: (res: {
        type: any
        content: any
        title: any
    }) => void
    successTipsTitle?: string
    /**
     * 请求成功后Tips展示的内容
     */
    successTipsContent?: string
    /**
     * 失败后的处理
     * @param err 错误对象
     */
    error?: (err: any) => void
    /**
     * 是否展示失败消息
     */
    noErrorTips?: boolean
    /**
     * 展示失败消息的方式
     */
    showErrorTips?: (res: {
        type: any
        content: any
        title: any
    }) => void
    errorTipsTitle?: string
    /**
     * 请求失败后Tips展示的内容
     */
    errorTipsContent?: string
    /**
     * 请求后的处理，无论成功、失败
     * @param res 请求结果
     */
    finally?: () => void
    /**
     * 发送请求前
     *
     * 返回`false`则不继续处理后续代码
     */
    beforeSend?: (config: AxiosRequestConfig) => boolean
    /**
     * 发送请求成功后
     *
     * 返回`false`则不继续处理后续代码
     */
    sendSuccess?: (res: AxiosResponse<D>) => boolean
    /**
     * 发送请求失败后
     *
     * 返回`false`则不继续处理后续代码
     */
    sendError?: (err: any) => boolean
    /**
     * 发送请求后
     *
     * 返回`false`则不继续处理后续代码
     */
    sendFinally?: () => boolean
    /**
     * 可以代替 url & method
     */
    api?: YiuAip
    /**
     * 是否有路径参数
     */
    hasPathData?: boolean
    /**
     * 路径参数对象
     */
    pathData?: {
        [key: string]: string | number | boolean
    }
    /**
     * 请求对应的语言
     */
    lang?: string
    /**
     * 获取当前语言
     */
    getCurrentLang?: () => string
    setLangFunc?: (aC: AxiosRequestConfig, lang: string) => void
    /**
     * 错误时是否打印日志
     */
    debug?: boolean
    /**
     * 请求是否有token
     */
    noToken?: boolean
    /**
     * token
     */
    token?: string
    /**
     * 获取当前token
     */
    getCurrentToken?: () => string
    /**
     * 设置token的函数
     */
    setTokenFunc?: (aC: AxiosRequestConfig, token: string) => void
    /**
     * 是否有取消函数
     */
    cancel: boolean
}
