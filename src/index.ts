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

    send<D = any, T = any, >(c: YiuRequestConfig<D, T>, a?: AxiosInstance): Canceler | undefined {
        let cancel: Canceler | undefined = undefined
        const tempConfig: YiuRequestConfig<D, T> = Object.assign({}, this.yiuConfig, c)
        let axiosConfig = transformConfig(tempConfig)
        if (axiosConfig) {
            if (!a) {
                a = axios.create(axiosConfig)
            }
            if (isFunction(tempConfig.beforeSend)) {
                tempConfig.beforeSend(axiosConfig)
            }
            // 开启加载
            if (isFunction(tempConfig.loadingBeforeSendFunc)) {
                try {
                    tempConfig.loadingBeforeSendFunc({
                        loading: c.loading,
                        loadingObj: c.loadingObj,
                        loadingKey: c.loadingKey,
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
                 if (isFunction(tempConfig.sendSuccess)) {
                     try {
                         tempConfig.sendSuccess(res)
                     } catch (e) {
                         c.debug && console.error(e)
                     }
                 }
                 if (!tempConfig.noSuccessTips && isFunction(tempConfig.showSuccessTips)) {
                     try {
                         tempConfig.showSuccessTips({
                             type: tempConfig.tipsType,
                             content: tempConfig.successTipsContent,
                             title: tempConfig.successTipsTitle,
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
                 if (isFunction(tempConfig.sendError)) {
                     try {
                         tempConfig.sendError(err)
                     } catch (e) {
                         c.debug && console.error(e)
                     }
                 }
                 if (!tempConfig.noErrorTips && isFunction(tempConfig.showErrorTips)) {
                     try {
                         tempConfig.showErrorTips({
                             type: tempConfig.tipsType,
                             content: tempConfig.errorTipsContent,
                             title: tempConfig.errorTipsTitle,
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
                 if (isFunction(tempConfig.loadingFinallySendFunc)) {
                     try {
                         tempConfig.loadingFinallySendFunc({
                             loading: c.loading,
                             loadingObj: c.loadingObj,
                             loadingKey: c.loadingKey,
                         })
                     } catch (e) {
                         c.debug && console.error(e)
                     }
                 }
                 if (isFunction(tempConfig.sendFinally)) {
                     try {
                         tempConfig.sendFinally()
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
