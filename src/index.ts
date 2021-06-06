import { YiuRequestConfig } from './type'
import axios, { AxiosInstance, Canceler } from 'axios'
import { transformConfig } from './transform'
import { isFunction } from 'lodash-es'

export const yiuAxios = {
    create: function (c: YiuRequestConfig): YiuAxios {
        return new YiuAxios(c)
    },
}

export class YiuAxios {
    yiuConfig: YiuRequestConfig

    constructor(c: YiuRequestConfig) {
        this.yiuConfig = c
    }

    send<D = any, L = any, T = any, >(c: YiuRequestConfig<D, L, T>, a?: AxiosInstance): Canceler | undefined {
        let cancel: Canceler | undefined = undefined
        const tempConfig: YiuRequestConfig<D, T> = Object.assign({}, this.yiuConfig, c)
        let axiosConfig = transformConfig(tempConfig)
        if (axiosConfig) {
            if (!a) {
                a = axios.create(axiosConfig)
            }
            if (isFunction(tempConfig.hook?.beforeSend)) {
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
                    c.debug && console.error(e)
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
                 if (isFunction(tempConfig.hook?.sendSuccess)) {
                     try {
                         tempConfig.hook.sendSuccess(res)
                     } catch (e) {
                         c.debug && console.error(e)
                     }
                 }
                 if (tempConfig.tips?.success
                     && tempConfig.tips.success.show
                     && isFunction(tempConfig.tips.success.showFunc)) {
                     try {
                         tempConfig.tips.success.showFunc({
                             type: tempConfig.tips.success.type || tempConfig.tips.type,
                             content: tempConfig.tips.success.content,
                             title: tempConfig.tips.success.title,
                         })
                     } catch (e) {
                         c.debug && console.error(e)
                     }
                 }
                 if (isFunction(tempConfig.success)) {
                     try {
                         tempConfig.success(res)
                     } catch (e) {
                         c.debug && console.error(e)
                     }
                 }
             })
             .catch((err) => {
                 if (isFunction(tempConfig.hook?.sendError)) {
                     try {
                         tempConfig.hook.sendError(err)
                     } catch (e) {
                         c.debug && console.error(e)
                     }
                 }
                 if (tempConfig.tips?.error
                     && tempConfig.tips.error.show
                     && isFunction(tempConfig.tips.error.showFunc)) {
                     try {
                         tempConfig.tips.error.showFunc({
                             type: tempConfig.tips.error.type || tempConfig.tips.type,
                             content: tempConfig.tips.error.content,
                             title: tempConfig.tips.error.title,
                         })
                     } catch (e) {
                         c.debug && console.error(e)
                     }
                 }
                 if (isFunction(tempConfig.error)) {
                     try {
                         tempConfig.error(err)
                     } catch (e) {
                         c.debug && console.error(e)
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
                         c.debug && console.error(e)
                     }
                 }
                 if (isFunction(tempConfig.hook?.sendFinally)) {
                     try {
                         tempConfig.hook.sendFinally()
                     } catch (e) {
                         c.debug && console.error(e)
                     }
                 }
                 if (isFunction(tempConfig.finally)) {
                     try {
                         tempConfig.finally()
                     } catch (e) {
                         c.debug && console.error(e)
                     }
                 }
             })
        }
        return cancel
    }
}
