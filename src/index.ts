import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, Canceler } from 'axios'
import { transformConfig } from './transform'
import { YiuRequestConfig } from './type'
import { isBoolean, isFunction, merge } from 'lodash'

export const yiuAxios = {
    create<D = any, L = any, T = any>(c?: YiuRequestConfig<D, L, T>): YiuAxios {
        return new YiuAxios<D, L, T>(c)
    },

    send<D, L, T>(yC?: YiuRequestConfig<D, L, T>, a?: AxiosInstance, aC?: AxiosRequestConfig): Canceler {
        return _yiuAxios.send<D, L, T>(yC, a, aC)
    },

    sendPromise<D, L, T>(yC?: Omit<YiuRequestConfig<D, L, T>, 'success' | 'error' | 'finally'>, a?: AxiosInstance, aC?: AxiosRequestConfig): Promise<AxiosResponse<D>> {
        return _yiuAxios.sendPromise<D, L, T>(yC, a, aC)
    },

    sendPromiseAndCanceler<D, L, T>(yC?: Omit<YiuRequestConfig<D, L, T>, 'success' | 'error' | 'finally'>, a?: AxiosInstance, aC?: AxiosRequestConfig): {
        promise: Promise<AxiosResponse<D>>,
        canceler?: Canceler,
    } {
        return _yiuAxios.sendPromiseAndCanceler<D, L, T>(yC, a, aC)
    },
}


class YiuAxios<D = any, L = any, T = any, > {
    private readonly yiuConfig?: YiuRequestConfig<D, L, T>

    constructor(c?: YiuRequestConfig) {
        this.yiuConfig = c
    }

    send<D, L, T>(yC?: YiuRequestConfig<D, L, T>, a?: AxiosInstance, aC?: AxiosRequestConfig): Canceler {
        const result = this.sendPromiseAndCanceler<D, L, T>(yC, a, aC)
        let showDebug
        if (isBoolean(yC.debug)) {
            showDebug = yC.debug
        } else if (isBoolean(this.yiuConfig.debug)) {
            showDebug = yC.debug
        }
        if (result.promise) {
            result.promise.then((res) => {
                let successFunc
                if (isFunction(yC.success)) {
                    successFunc = yC.success
                } else if (isFunction(this.yiuConfig.success)) {
                    successFunc = yC.success
                }
                try {
                    if (successFunc) {
                        successFunc(res)
                    }
                } catch (e) {
                    showDebug && console.error(e)
                }
            }).catch((err) => {
                let errorFunc
                if (isFunction(yC.error)) {
                    errorFunc = yC.error
                } else if (isFunction(this.yiuConfig.error)) {
                    errorFunc = yC.error
                }
                try {
                    if (errorFunc) {
                        errorFunc(err)
                    }
                } catch (e) {
                    showDebug && console.error(e)
                }
            }).finally(() => {
                let finallyFunc
                if (isFunction(yC.finally)) {
                    finallyFunc = yC.finally
                } else if (isFunction(this.yiuConfig.finally)) {
                    finallyFunc = yC.finally
                }
                try {
                    if (finallyFunc) {
                        finallyFunc()
                    }
                } catch (e) {
                    showDebug && console.error(e)
                }
            })
        }
        return result.canceler
    }

    sendPromise<D, L, T>(yC?: Omit<YiuRequestConfig<D, L, T>, 'success' | 'error' | 'finally'>, a?: AxiosInstance, aC?: AxiosRequestConfig): Promise<AxiosResponse<D>> {
        return this.sendPromiseAndCanceler({ ...yC, cancel: false }, a, aC).promise
    }

    sendPromiseAndCanceler<D, L, T>(yC?: Omit<YiuRequestConfig<D, L, T>, 'success' | 'error' | 'finally'>, a?: AxiosInstance, aC?: AxiosRequestConfig): {
        promise: Promise<AxiosResponse<D>>,
        canceler?: Canceler,
    } {
        let cancel: Canceler | undefined = undefined
        const p = new Promise<AxiosResponse<D>>((resolve, reject) => {
            if (!yC) yC = {}
            const tempConfig: YiuRequestConfig<D, L, T> = merge({}, this.yiuConfig, yC as YiuRequestConfig)
            let axiosConfig = transformConfig(tempConfig, aC)
            if (yC.noSend) {
                let str = axiosConfig?.url
                if (axiosConfig?.method && axiosConfig?.url) {
                    str = `[${axiosConfig.method}: ${axiosConfig.url}]`
                }
                console.log(`yiu-axios：以阻止${str}请求发送`)
                console.log('AxiosRequestConfig：')
                console.log(axiosConfig)
                console.log('YiuRequestConfig：')
                console.log(tempConfig)
                return
            }
            if (axiosConfig) {
                if (!a) {
                    a = axios.create(axiosConfig)
                }
                if (tempConfig.hook
                    && isFunction(tempConfig.hook.beforeSend)) {
                    if (!tempConfig.hook.beforeSend(axiosConfig)) {
                        return
                    }
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
                         && isFunction(tempConfig.hook.beforeSuccess)) {
                         try {
                             if (!tempConfig.hook.beforeSuccess(res)) {
                                 return
                             }
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
                                     result: res,
                                     content: tempConfig.tips.success.content,
                                     title: tempConfig.tips.success.title,
                                 })
                             } else if (tempConfig.tips
                                 && tempConfig.tips.success
                                 && isFunction(tempConfig.tips.showFunc)) {
                                 tempConfig.tips.showFunc({
                                     isSuccess: true,
                                     type: tempConfig.tips.success.type || tempConfig.tips.type,
                                     result: res,
                                     content: tempConfig.tips.success.content,
                                     title: tempConfig.tips.success.title,
                                 })
                             }
                         } catch (e) {
                             yC?.debug && console.error(e)
                         }
                     }
                     resolve(res)
                 })
                 .catch((err) => {
                     if (tempConfig.hook
                         && isFunction(tempConfig.hook.beforeError)) {
                         try {
                             if (!tempConfig.hook.beforeError(err)) {
                                 return
                             }
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
                                     result: err,
                                     content: tempConfig.tips.error.content,
                                     title: tempConfig.tips.error.title,
                                 })
                             } else if (tempConfig.tips
                                 && tempConfig.tips.error
                                 && isFunction(tempConfig.tips.showFunc)) {
                                 tempConfig.tips.showFunc({
                                     isSuccess: false,
                                     result: err,
                                     type: tempConfig.tips.error.type || tempConfig.tips.type,
                                     content: tempConfig.tips.error.content,
                                     title: tempConfig.tips.error.title,
                                 })
                             }
                         } catch (e) {
                             yC?.debug && console.error(e)
                         }
                     }
                     reject(err)
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
                         && isFunction(tempConfig.hook.beforeFinally)) {
                         try {
                             tempConfig.hook.beforeFinally()
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
        })

        return {
            canceler: cancel,
            promise: p,
        }
    }
}

const _yiuAxios = new YiuAxios({})
