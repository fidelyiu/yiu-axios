import { YiuRequestConfig } from './type'
import axios, { AxiosInstance, AxiosRequestConfig, Canceler } from 'axios'
import { transformConfig } from './transform'
import { isBoolean, isFunction, merge } from 'lodash-es'

export const yiuAxios = {
    create<D = any, L = any, T = any>(c?: YiuRequestConfig<D, L, T>): YiuAxios {
        return new YiuAxios<D, L, T>(c)
    },
    send<D = any, L = any, T = any>(yC?: YiuRequestConfig<D, L, T>, a?: AxiosInstance, aC?: AxiosRequestConfig): Canceler | undefined {
        return _yiuAxios.send<D, L, T>(yC, a, aC)
    },
}


class YiuAxios<D = any, L = any, T = any, > {
    private readonly yiuConfig?: YiuRequestConfig<D, L, T>

    constructor(c?: YiuRequestConfig) {
        this.yiuConfig = c
    }

    send<D, L, T>(yC?: YiuRequestConfig<D, L, T>, a?: AxiosInstance, aC?: AxiosRequestConfig): Canceler | undefined {
        let cancel: Canceler | undefined = undefined
        if (!yC) yC = {}
        const tempConfig: YiuRequestConfig<D, L, T> = merge({}, this.yiuConfig, yC)
        let axiosConfig = transformConfig(tempConfig, aC)
        if (yC.noSend) {
            let str = axiosConfig?.url
            if (axiosConfig?.method && axiosConfig?.url) {
                str = `[${axiosConfig.method}: ${axiosConfig.url}]`
            }
            console.log(`yiu-axios：以阻止${str}请求发送`)
            console.log(axiosConfig)
            return
        }
        if (axiosConfig) {
            if (!a) {
                a = axios.create(axiosConfig)
            }
            if (tempConfig.hook
                && isFunction(tempConfig.hook.beforeSend)) {
                tempConfig.hook.beforeSend(axiosConfig)
            }
            // 开启加载
            if (tempConfig.loading && isFunction(tempConfig.loading.beforeSendFunc)) {
                try {
                    tempConfig.loading.beforeSendFunc({
                        loading: tempConfig.loading.flag,
                        loadingObj: tempConfig.loading.obj,
                        loadingKey: tempConfig.loading.key,
                    })
                } catch (e) {
                    yC.debug && console.error(e)
                }
            }
            if (tempConfig.cancel) {
                axiosConfig = {
                    cancelToken: new axios.CancelToken(function executor(c) {
                        // executor 函数接收一个 cancel 函数作为参数
                        cancel = c
                    }),
                    ...axiosConfig,
                }
            }
            a.request<D>(axiosConfig)
             .then((res) => {
                 if (tempConfig.hook
                     && isFunction(tempConfig.hook.sendSuccess)) {
                     try {
                         tempConfig.hook.sendSuccess(res)
                     } catch (e) {
                         yC?.debug && console.error(e)
                     }
                 }
                 let showSuccess = false
                 if (tempConfig.tips
                     && tempConfig.tips.success
                     && isBoolean(tempConfig.tips.success.show)) {
                     showSuccess = tempConfig.tips.success.show
                 } else if (tempConfig.tips && isBoolean(tempConfig.tips.show)) {
                     showSuccess = tempConfig.tips.show
                 }
                 if (showSuccess) {
                     try {
                         if (tempConfig.tips
                             && tempConfig.tips.success
                             && isFunction(tempConfig.tips.success.showFunc)) {
                             tempConfig.tips.success.showFunc({
                                 type: tempConfig.tips.success.type || tempConfig.tips.type,
                                 content: tempConfig.tips.success.content,
                                 title: tempConfig.tips.success.title,
                             })
                         } else if (tempConfig.tips
                             && tempConfig.tips.success
                             && isFunction(tempConfig.tips.showFunc)) {
                             tempConfig.tips.showFunc({
                                 isSuccess: true,
                                 type: tempConfig.tips.success.type || tempConfig.tips.type,
                                 content: tempConfig.tips.success.content,
                                 title: tempConfig.tips.success.title,
                             })
                         }
                     } catch (e) {
                         yC?.debug && console.error(e)
                     }
                 }
                 if (isFunction(tempConfig.success)) {
                     try {
                         tempConfig.success(res)
                     } catch (e) {
                         yC?.debug && console.error(e)
                     }
                 }
             })
             .catch((err) => {
                 if (tempConfig.hook
                     && isFunction(tempConfig.hook.sendError)) {
                     try {
                         tempConfig.hook.sendError(err)
                     } catch (e) {
                         yC?.debug && console.error(e)
                     }
                 }
                 let showError = false
                 if (tempConfig.tips
                     && tempConfig.tips.error
                     && isBoolean(tempConfig.tips.error.show)) {
                     showError = tempConfig.tips.error.show
                 } else if (tempConfig.tips && isBoolean(tempConfig.tips.show)) {
                     showError = tempConfig.tips.show
                 }
                 if (showError) {
                     try {
                         if (tempConfig.tips
                             && tempConfig.tips.error
                             && isFunction(tempConfig.tips.error.showFunc)) {
                             tempConfig.tips.error.showFunc({
                                 type: tempConfig.tips.error.type || tempConfig.tips.type,
                                 content: tempConfig.tips.error.content,
                                 title: tempConfig.tips.error.title,
                             })
                         } else if (tempConfig.tips
                             && tempConfig.tips.error
                             && isFunction(tempConfig.tips.showFunc)) {
                             tempConfig.tips.showFunc({
                                 isSuccess: false,
                                 type: tempConfig.tips.error.type || tempConfig.tips.type,
                                 content: tempConfig.tips.error.content,
                                 title: tempConfig.tips.error.title,
                             })
                         }
                     } catch (e) {
                         yC?.debug && console.error(e)
                     }
                 }
                 if (isFunction(tempConfig.error)) {
                     try {
                         tempConfig.error(err)
                     } catch (e) {
                         yC?.debug && console.error(e)
                     }
                 }
             })
             .finally(() => {
                 // 关闭加载
                 if (tempConfig.loading && isFunction(tempConfig.loading.finallySendFunc)) {
                     try {
                         tempConfig.loading.finallySendFunc({
                             loading: tempConfig.loading.flag,
                             loadingObj: tempConfig.loading.obj,
                             loadingKey: tempConfig.loading.key,
                         })
                     } catch (e) {
                         yC?.debug && console.error(e)
                     }
                 }
                 if (tempConfig.hook
                     && isFunction(tempConfig.hook.sendFinally)) {
                     try {
                         tempConfig.hook.sendFinally()
                     } catch (e) {
                         yC?.debug && console.error(e)
                     }
                 }
                 if (isFunction(tempConfig.finally)) {
                     try {
                         tempConfig.finally()
                     } catch (e) {
                         yC?.debug && console.error(e)
                     }
                 }
             })
        } else {
            yC.debug && console.error('yiu-axios：yiuConfig 转换 axios 出错，请求未发出!')
        }
        return cancel
    }
}

const _yiuAxios = new YiuAxios({})
