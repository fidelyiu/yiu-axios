import { AxiosRequestConfig, AxiosResponse, Method } from 'axios'

export type YiuMethod = Method
    | 'form_data' | 'FORM_DATA'
    | 'form_urlencoded' | 'FORM_URLENCODED'

export const enum ContentTypeEnum {
    NONE = '',
    JSON = 'application/json;charset=UTF-8',
    HTML = 'text/html;charset=UTF-8',
    TEXT = 'text/plain;charset=UTF-8',
    XML = 'application/xml;charset=UTF-8',
    JS = 'application/javascript;charset=UTF-8',
    FORM_URLENCODED = 'application/x-www-form-urlencoded;charset=UTF-8',
    FORM_DATA = 'multipart/form-data;charset=UTF-8',
}

export interface YiuAip {
    url: string
    method: YiuMethod
}

/**
 * - D：返回data类型
 * - L：loading.flag类型
 * - T：消息类型：'none' | 'modal' | 'message' | 'notification' | undefined
 */
export interface YiuRequestConfig<D = any, L = any, T = any> extends AxiosRequestConfig {
    /**
     * 可以代替 url & method
     */
    api?: YiuAip
    /**
     * 加载相关配置
     */
    loading?: {
        /**
         * 加载状态
         * `e.g.`：比如vue3的 ref(false)这样的变量，可以直接修改
         */
        flag?: L
        /**
         * 包含加载状态对象
         * `e.g.`：如果是普通的boolean，方法是修改不了的，所以传入boolean的父对象，比如vue2的 this
         */
        obj?: any
        /**
         * 加载状态对应的Key
         * `e.g.`：如果是普通的boolean，方法是修改不了的，所以传入boolean的在父对象中的Key，比如vue2的 data中的key
         */
        key?: any
        /**
         * 在请求前要如何修改loading
         * @param res
         */
        beforeSendFunc?: (res: {
            loading?: L
            loadingObj?: any
            loadingKey?: any
        }) => void
        /**
         * 在请求后要如何修改loading
         * @param res
         */
        finallySendFunc?: (res: {
            loading?: L
            loadingObj?: any
            loadingKey?: any
        }) => void
    }
    /**
     * 成功后的处理
     * @param res 请求结果
     */
    success?: (res: AxiosResponse<D>) => void
    /**
     * 失败后的处理
     * @param err 错误对象
     */
    error?: (err: any) => void
    /**
     * 请求后的处理，无论成功、失败
     * @param res 请求结果
     */
    finally?: () => void
    /**
     * 消息相关配置
     */
    tips?: {
        /**
         * 消息展示的类型
         */
        type?: T
        /**
         * 是否展示消息
         */
        show?: boolean
        /**
         * 展示成功消息的方式
         */
        showFunc?: (res: {
            isSuccess?: boolean
            type?: T
            result?: any
            content?: any
            title?: any
        }) => void
        /**
         * 成功Tips的配置
         */
        success?: {
            /**
             * 消息展示的类型，比上级的优先级高
             */
            type?: T
            /**
             * 是否展示成功消息，比上级的优先级高
             */
            show?: boolean
            /**
             * 展示成功消息的方式，比上级的优先级高
             */
            showFunc?: (res: {
                type?: T
                result?: any
                content?: any
                title?: any
            }) => void
            /**
             * 请求成功后Tips展示的标题
             */
            title?: string
            /**
             * 请求成功后Tips展示的内容
             */
            content?: string
        }
        /**
         * 失败Tips的配置
         */
        error?: {
            /**
             * 消息展示的类型，比上级的优先级高
             */
            type?: T
            /**
             * 是否展示失败消息，比上级的优先级高
             */
            show?: boolean
            /**
             * 展示失败消息的方式，比上级的优先级高
             */
            showFunc?: (res: {
                type?: any
                result?: any
                content?: any
                title?: any
            }) => void
            /**
             * 请求失败后Tips展示的标题
             */
            title?: string
            /**
             * 请求失败后Tips展示的内容
             */
            content?: string
        }
    }
    /**
     * 钩子函数
     */
    hook?: {
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
        beforeSuccess?: (res: AxiosResponse<D>) => boolean
        /**
         * 发送请求失败后
         *
         * 返回`false`则不继续处理后续代码
         */
        beforeError?: (err: any) => boolean
        /**
         * 发送请求后
         *
         * 返回`false`则不继续处理后续代码
         */
        beforeFinally?: () => boolean
    }
    /**
     * 路径有没有花括号，否则路径中包含{}会报错，停止请求，因为这是链接参数的定义关键字
     *
     * 如果该字段为true，那么请手动检查链接是否正确
     *
     * 如果 pathHasBracket 和 pathData 配合使用还不能满足需求，那么直接使用url
     */
    pathHasBracket?: boolean
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
     * 语言函数相关配置
     */
    langFunc?: {
        /**
         * 当lang不存在时才执行，获取当前语言
         */
        get?: () => string
        /**
         * 要将该语言设置在哪里
         *
         * 比如：config.headers['Accept-Language'] = lang
         */
        set?: (yC: AxiosRequestConfig, lang: string) => void
    }
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
     * token设置相关配置
     */
    tokenFunc?: {
        /**
         * 当token不存在时才执行，获取当前token
         */
        get?: () => string
        /**
         * 设置token的函数
         *
         * 要将token设置在哪里比如：config.headers['Authorization'] = token
         */
        set?: (yC: AxiosRequestConfig, token: string) => void
    }
    /**
     * 是否有取消函数
     */
    cancel?: boolean
    /**
     * Content-Type
     */
    contentType?: ContentTypeEnum
    /**
     * 上传相关配置
     *
     * 上传文件，请将`contentType`设置为`FORM_DATA`，否则不处理
     */
    upload?: {
        /**
         * 上传的文件
         */
        file?: File | Blob
        /**
         * 文件在FormData中的Key
         */
        key?: string
        /**
         * 上传的文件名
         */
        name?: string
    }
    /**
     * 是否不发送请求
     *
     * 不发送请求就打印 axios 请求配置
     */
    noSend?: boolean
}
