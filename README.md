# Yiu Axios
基于axios的二次封装。

[`axios`](https://github.com/axios/axios) 库已经很好了，但是在发送请求时各种繁琐的细节，使得我们在项目使用 `axios` 的时候，始终需要二次封装。

`yiu-axios` 对 `axios` 进行一点二次封装，方便我们在项目中再次进行三次封装。

换种方式理解，你可以认为 `yiu-axios` 是使用 `axios` 为基础的 `http` **发送器**。

以下 `YC` 为 `YiuRequestConfig` 的简写， `AC` 为 `AxiosRequestConfig` 的简写。

# 1.简单使用

## 1.1.yiuAxios.send()
这将使用 `yiu-axios` 中默认的 `yiuAxios` 实例。
```typescript
import { yiuAxios } from 'yiu-axios'

yiuAxios.send({
    api: {
        url: '/hello',
        method: 'GET',
    },
})
```

## 1.2.yiuAxios.create()
这样你就可以维护多个 `axios` 和 `yiu-axios` 的实例了。
```typescript
import { yiuAxios } from 'yiu-axios'
import axios from 'axios'

const defYiuAxios = yiuAxios.create({
    baseURL: 'http://localhost:8080/',
    timeout: 6000,
})

const defAxios = axios.create()

defYiuAxios.send({
    api: {
        url: '/hello',
        method: 'GET',
    },
}, defAxios)
```


# 2.配置优先级
`axios配置` >> `yiu-axios配置` >> `yiu-axios默认配置` >> `axios默认配置`

以下案例最终将发送 `http://localhost:8080/axios` 的 `GET` 请求。
```typescript
const defYiuAxios = yiuAxios.create({
    // yiu-axios的默认配置
    baseURL: 'http://localhost:8080/',
    timeout: 6000,
})

const defAxios = axios.create({
    // axios的默认配置
    baseURL: 'http://localhost:8081/',
    timeout: 6000,
})

defYiuAxios.send(
    {
        // yiu-axios的配置
        api: {
            url: '/yiu',
            method: 'GET',
        },
    },
    defAxios,
    {
        // axios的配置
        url: '/axios'
    },
)

```


# 3.yiu-axios的配置

## 3.1.api
将 `url`、`method` 提出来到 `api` 中是因为，我想将项目中的所有的接口都以这种方式的对象维护起来，方便同意管理。

而且 `YC.api.method` 中比 `AC.method` 多两种类型：`FORM_DATA`、`FORM_URLENCODED`。

如果你设置了这两种类型，最终都会发送 `POST` 请求，
并且会处理 `YC.data` 会自动进行编码处理。

但要注意，如果你设置了 `AC.method`，那么 `YC.api.method` 将不会作用在最终的请求上。

```typescript
import { yiuAxios } from 'yiu-axios'
import axios from 'axios'

yiuAxios.send({
    api: {
        url: '/hello',
        method: 'GET',
    },
}, axios.create())
```


## 3.2.loading
这也是我编写 `yiu-axios` 的主要原因，项目中那么多 `loading`，全部自己维护实在太难了。

- `flag`：
  - 可直接修改加载标识的对象。
  - 类型受 `YC` 的第二泛型影响。
  - 比如 `vue3` 的 `ref(false)` 、任意 `object`。
- `key`：
  - 不能直接修改的加载标识名。
  - 比如一般的 `boolean` 变量，这样的变量在方法中是不可修改的。
  - 配合 `obj` 一起使用。
- `obj`：
  - `key` 标识的父对象。
  - `key` 本身不可修改，但是可以通过 `obj[key]` 修改 `key`
  - 配合 `key` 一起使用。
- `beforeSendFunc`：
  - 在请求前要如何修改 `loading`
  - 参数依次为：`flag`、`obj`、`key`。
- `finallySendFunc`：
  - 在请求后要如何修改 `loading`
  - 参数依次为：`flag`、`obj`、`key`。


### 3.2.1.obj + key
基本所有情况都可以使用这种`obj` + `key`方式解决。

最典型的场景就是 `vue2` 中 `data` 的 `boolean` 值，
你可以通过传入 `this` 和 `booleanName` 来修改 `vue2` 中的变量。

```typescript
const yiuAxiosInstance = yiuAxios.create<any, {value: boolean}>({
    baseURL: 'http://localhost:8080/',
    timeout: 6000,
    loading: {
        beforeSendFunc: function ({ loadingObj, loadingKey }) {
            if (loadingObj && loadingKey) {
                loadingObj[loadingKey] = true
            }
        },
        finallySendFunc: function ({ loadingObj, loadingKey }) {
            if (loadingObj && loadingKey) {
                loadingObj[loadingKey] = false
            }
        },
    },
})

let loadingFlag = {
    isLoading: false
}

yiuAxiosInstance.send({
    api: {
        url: '/hello',
        method: 'GET',
    },
    loading: {
        obj: loadingFlag,
        key: 'isLoading',
    },
}, axios.create())

```


### 3.2.2.flag
为什么有`obj`+`key`还需要`flag`?
如果 `flag` 是 `vue3` 的 `Ref`，那么是不是会轻松许多?

```typescript
const yiuAxiosInstance = yiuAxios.create<any, {value: boolean}>({
    baseURL: 'http://localhost:8080/',
    timeout: 6000,
    loading: {
        beforeSendFunc: function ({ loading }) {
            if (loading) {
                loading.value = true
            }
        },
        finallySendFunc: function ({ loading }) {
            if (loading) {
                loading.value = false
            }
        },
    },
})

let loadingFlag = {
    value: false
}

yiuAxiosInstance.send({
    api: {
        url: '/hello',
        method: 'GET',
    },
    loading: {
        flag: loadingFlag,
    },
}, axios.create())

```

## 3.3.success、error、finally
三个请求的必要事件。
```typescript
yiuAxios.send({
    api: {
        url: '/hello',
        method: 'GET',
    },
    success: (res) => {
        console.log(res)
    },
    error: (err) => {
        console.log(err)
    },
    finally: () => {
    },
})
```


## 3.4.tips
消息展示


# 3.三次封装
这里拿 `vue3` 的自动 `loading` 作为案例。

```typescript
import { yiuAxios } from 'yiu-axios'
import axios, { Canceler } from 'axios'
import { YiuRequestConfig } from 'yiu-axios/dist/type'
import { Ref } from 'vue'

const defYiuAxios = yiuAxios.create<any, Ref<boolean>>({
    baseURL: 'http://localhost:8080/',
    timeout: 6000,
    loading: {
        beforeSendFunc: function ({ loading }) {
            if (loading) {
                loading.value = true
            }
        },
        finallySendFunc: function ({ loading }) {
            if (loading) {
                loading.value = false
            }
        },
    },
})
const defAxios = axios.create()

export function yiuHttp<D = any, T = any>(c: YiuRequestConfig<D, T>): Canceler | undefined {
    return defYiuAxios.send(c, defAxios)
}

```

使用
```typescript
import { defineComponent, ref } from 'vue'
import { yiuHttp } from '/@/utils/http'

export default defineComponent({
    setup() {
        const name = ref('Fidel')
        const loading = ref(false)
        yiuHttp({
            api: {
                method: 'GET',
                url: '/hello',
            },
            loading: {
                flag: loading,
            },
            finally: () => {
                name.value = 'Yiu'
            },
        })
        return {
            name,
            loading,
        }
    },
})
```

