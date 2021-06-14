# Yiu Axios

基于axios的二次封装。

[`axios`](https://github.com/axios/axios) 库已经很好了，但是在发送请求时各种繁琐的细节，使得我们在项目使用 `axios` 的时候，始终需要二次封装。

`yiu-axios` 对 `axios` 进行一点二次封装，方便我们在项目中再次进行三次封装。

换种方式理解，你可以认为 `yiu-axios` 是使用 `axios` 为基础的 `http` **发送器**。

以下 `YC` 为 `YiuRequestConfig` 的简写， `AC` 为 `AxiosRequestConfig` 的简写。

## 安装

npm：

```bash
npm i yiu-axios
```

yarn：

```bash
yarn add yiu-axios
```

浏览器无其他依赖：

```html

<script src="https://unpkg.com/yiu-axios@1.0.54/yiu-axios.iife.min.js"></script>
```

浏览器有其他依赖：

```html

<script src="https://unpkg.com/lodash@4.17.21/lodash.min.js"></script>
<script src="https://unpkg.com/axios/dist/axios.min.js"></script>
<script src="https://unpkg.com/yiu-axios@1.0.54/yiu-axios.onlib.iife.min.js"></script>

<script>
    console.log(YiuAxios)
    // YiuAxios.yiuAxios.create()
    // YiuAxios.yiuAxios.send()
</script>
```

# 1.简单使用

## 1.1.yiuAxios.send()

这将使用 `yiu-axios` 中默认的 `yiuAxios` 实例。

```typescript
import { yiuAxios } from 'yiu-axios'
import { MethodEnum } from 'yiu-axios/type'

yiuAxios.send({
    api: {
        url: '/hello',
        method: MethodEnum.GET,
    },
})
```

## 1.2.yiuAxios.create()

这样你就可以维护多个 `axios` 和 `yiu-axios` 的实例了。

```typescript
import { yiuAxios } from 'yiu-axios'
import { MethodEnum } from 'yiu-axios/type'
import axios from 'axios'

const defYiuAxios = yiuAxios.create({
    baseURL: 'http://localhost:8080/',
    timeout: 6000,
})

const defAxios = axios.create()

defYiuAxios.send({
    api: {
        url: '/hello',
        method: MethodEnum.GET,
    },
}, defAxios)
```

## 1.3.yiuAxios.sendPromise()

返回一个`Promise`，方法主要用于并发请求。不然也没必要转`Promise`。

此时是没有返回取消方法的，`YC` 没有 `success`、`error`、`finally`方法。

```typescript
import { yiuAxios } from 'yiu-axios'
import { MethodEnum } from 'yiu-axios/type'

Promise.all(
    [
        yiuAxios.sendPromise({
            api: {
                url: '/hello1',
                method: MethodEnum.GET,
            },
        }),
        yiuAxios.sendPromise({
            api: {
                url: '/hello2',
                method: MethodEnum.GET,
            },
        })
    ]
)
       .then(function (results) {
           const acct = results[0];
           const perm = results[1];
       });


```

## 1.4.yiuAxios.sendPromiseAndCanceler()

返回一个对象。

即又返回Promise，也返回取消函数。

取消函数由`YC.cancel`控制，此时`YC` 没有 `success`、`error`、`finally`方法。

```
{
    promise: Promise<AxiosResponse<D>>,
    canceler?: Canceler
}
```

## 1.5.node

```typescript
var YiuAxios = require("yiu-axios");

YiuAxios.yiuAxios.send({
    api: {
        url: '/hello',
        method: 'get',
        noMethod: true
    },
    debug: true,
    contentType: 'application/json'
});
```

# 2.配置优先级

- `AC` >> `YC` >> `默认YC` >> `默认AC`
- `yC.url` >> `YC.api.url`
- `yC.method` >> `YC.api.method`

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
            method: MethodEnum.GET,
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

而且 `YC.api.method` 中比 `AC.method` 多两种类型：`POST_FORM_DATA`、`POST_FORM_URLENCODED`。

如果你设置了这两种类型，最终都会发送 `POST` 请求， 并且会处理`YC.contentType` 和 `YC.data` 的编码。

注意：

- 不管 `YC.contentType` 有没有值， `YC.api.method` 的 `POST_FORM_DATA`、`POST_FORM_URLENCODED` 都将覆盖该值。
- 如果你设置了 `AC.method`，那么 `YC.api.method` 将不会作用在最终的请求上。

在 `debug` 模式下会检查 `YC.api.method` 的值是否规范。因为有些项目可能就是需要传入字符串，此时字符串如果乱填可能会影响 `yiu-axios` 判断。

如果你确定你的填值确实不在 `yiu-axios` 指定值内，那么可以将 `noMethod` 指定为 `true` ，从而取消控制台警告。

```typescript
import { yiuAxios } from 'yiu-axios'
import { MethodEnum } from 'yiu-axios/type'
import axios from 'axios'

yiuAxios.send({
    api: {
        url: '/hello',
        method: MethodEnum.GET,
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

最典型的场景就是 `vue2` 中 `data` 的 `boolean` 值， 你可以通过传入 `this` 和 `booleanName` 来修改 `vue2` 中的变量。

```typescript
const yiuAxiosInstance = yiuAxios.create<any, { value: boolean }>({
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
        method: MethodEnum.GET,
    },
    loading: {
        obj: loadingFlag,
        key: 'isLoading',
    },
}, axios.create())

```

### 3.2.2.flag

为什么有`obj`+`key`还需要`flag`? 如果 `flag` 是 `vue3` 的 `Ref`，那么是不是会轻松许多?

```typescript
const yiuAxiosInstance = yiuAxios.create<any, { value: boolean }>({
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
        method: MethodEnum.GET,
    },
    loading: {
        flag: loadingFlag,
    },
}, axios.create())

```

## 3.3.success、error、finally、isError

三个请求的必要事件。

`isError` 用于判断请求是否是失败的函数。一个返回`200`的请求在需求上不一定是成功的请求。 如果 `isError` 返回 `true` 那么将会调用 `error`，而不会调用 `success`。

```typescript
yiuAxios.send({
    api: {
        url: '/hello',
        method: MethodEnum.GET,
    },
    isError: (res) => {
        return res?.data?.type === 'error'
    },
    success: (res) => {
        console.log(res)
    },
    error: (err) => {
        if (err.status && err.status >= 200 && err.status < 300) {
            // 请求成功，被isError判定错误
        } else if (error.response) {
            // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
        } else if (error.request) {
            // 请求已经成功发起，但没有收到响应
            // `error.request` 在浏览器中是 XMLHttpRequest 的实例，
            // 而在node.js中是 http.ClientRequest 的实例
            console.log(error.request);
        } else {
            // 发送请求时出了点问题
            console.log('Error', error.message);
        }
        console.log(err)
    },
    finally: () => {
    },
})
```

## 3.4.tips

消息展示

- `type`：消息展示的类型，由`YC`的第三个泛型控制。
- `show`：请求后是否展示消息
- `showFunc`：展示成功消息的方法
    - `isSuccess`：是否是成功消息
    - `type`：消息类型
    - `result`：请求后的结果
    - `content`：消息内容
    - `title`：消息标题
- `success`：成功后的消息配置
    - `type`：同上级`type`，比上级的优先级高
    - `show`：同上级`show`，比上级的优先级高
    - `showFunc`：同上级`showFunc`，比上级的优先级高
        - `type`：消息类型
        - `result`：请求成功后的结果
        - `content`：消息内容
        - `title`：消息标题
- `error`：成功后的消息配置
    - 同`success`

```typescript
const yiuAxiosInstance = yiuAxios.create<any, any, 'console' | 'other'>({
    tips: {
        type: 'other',
        show: true,
        showFunc: ({ isSuccess, result, type, title, content }) => {
            const typeStr = isSuccess ? '成功' : '失败'
            console.log('请求结果', result)
            switch (type) {
                case 'other':
                    console.warn(`${typeStr}-${title}：${content}`)
                    break
                case 'console':
                default:
                    console.log(`${typeStr}-${title}：${content}`)
            }
        },
        success: {
            title: '成功默认标题',
            content: '成功默认内容',
        },
        error: {
            title: '失败默认标题',
            content: '失败默认内容',
        },
    },
})

yiuAxiosInstance.send(
    {
        api: {
            url: '/yiu',
            method: MethodEnum.GET,
        },
    },
    axios.create(),
)

```

## 3.5.hook

请求的钩子函数。

- `beforeSend`：
    - 发送请求前，返回 `false` 则不继续处理后续代码。
    - 参数 `config` 为 `AC`，即最终交给 `axios` 发送请求的配置对象，此处你可以修改它。
    - 参数中存在 `YC` 的字段，但是此时 `YC` 以转换成 `AC`，所以请关注 `AC` 字段。
- `beforeSuccess`：
    - 执行 `success` 前，返回 `false` 则不继续处理后续代码。
    - 参数 `res` 为请求成功后的结果。
- `beforeError`：
    - 执行 `error` 前，返回 `false` 则不继续处理后续代码。
    - 参数 `err` 为请求失败后的结果。
- `beforeFinally`：
    - 执行 `finally` 前，返回`false`则不继续处理后续代码。

```typescript
const yiuAxiosInstance = yiuAxios.create({
    hook: {
        beforeSend: (ac) => {
            console.log('发送请求前')
            console.log(ac)
            ac.headers['AnyUpdate'] = 'AnyUpdate'
            return true
        },
        beforeSuccess: (res) => {
            console.log('执行 success 前')
            console.log(res)
            return true
        },
        beforeError: (err) => {
            console.log('执行 error 前')
            console.log(err)
            return true
        },
        beforeFinally: () => {
            console.log('执行 finally 前')
            return true
        },
    },
})

yiuAxiosInstance.send(
    {
        api: {
            url: '/yiu',
            method: MethodEnum.GET,
        },
    },
    axios.create(),
)

```

## 3.6.pathHasBracket

`YC.api.url` 中是否有 `{}`。如果有的话，默认会报错，停止请求，因为这是链接参数的定义关键字。

如果该字段为true，那么请手动检查链接是否正确。

如果 `pathHasBracket` 和 `pathData` 配合使用还不能满足需求，那么直接使用 `AC.url`。

```typescript
const yiuAxiosInstance = yiuAxios.create({
    baseURL: 'http://localhost:8080',
    pathHasBracket: true,
})

yiuAxiosInstance.send(
    {
        api: {
            url: '/yiu?str={hello}',
            method: MethodEnum.GET,
        },
    },
    axios.create(),
)
```

## 3.7.pathData

路径参数，该对象的 `key` 对应的 `value` 将自动映射到 路径中的 `{key}`。

`YC.url` 和 `YC.api.url` 是不允许有 `{}` 字符串存在的，如果有，将不会发送请求。

开启 `debug` 后，未发送的请求会在控制台打印它的错误。

如果需求有 `{}` 请配合 `pathHasBracket` 使用。

但是在检查 `url` 前还是会进行 `pathData` 的转换， 所以如果 `pathHasBracket` 和 `pathData` 配合使用还不能满足需求， 请手动拼接 `AC.url`，因为 `yiu-axios`
不关心 `AC` 的配置。

```typescript
const yiuAxiosInstance = yiuAxios.create({
    baseURL: 'http://localhost:8080',
    debug: true,
})

yiuAxiosInstance.send(
    {
        api: {
            url: '/yiu?str={hello}&num={num}',
            method: MethodEnum.GET,
        },
        pathData: {
            hello: 'Fidel',
            num: 15,
        },
    },
    axios.create(),
)
```

## 3.8.lang & langFunc

- `lang`：当前请求的语言。
- `langFunc`：语言配置方式。
    - `get`：当 `lang` 不存在时才执行，获取当前语言。
    - `set`：要将该语言设置在哪里的函数。
        - 第一个参数 `YC`，
        - 第二个参数 `lang`，如果 `YC.lang` 不存在，那么会执行 `YC.langFunc.get` 方法，然后再赋值给 `YC.lang`。

只有 `lang` 或 `get` 方法值有效时，才会执行 `set` 方法。

```typescript
const yiuAxiosInstance = yiuAxios.create({
    baseURL: 'http://localhost:8080',
    langFunc: {
        get: () => {
            // 比如从项目状态中获取语言信息
            return 'zh-CN'
        },
        set: (yC, lang) => {
            if (yC && lang) {
                yC.headers['Accept-Language'] = lang
            }
        },
    },
})

yiuAxiosInstance.send(
    {
        api: {
            url: '/yiu',
            method: MethodEnum.GET,
        },
        lang: 'en-US'
    },
    axios.create(),
)

```

## 3.9.debug

当有些 `YC` 不满足要求时，请求将不发送。此时你可以使用 `debug` 来查看不发送的原因。

`yiu-axios` 会将错误打印在控制台，比如下面的 `{}`。

```typescript
yiuAxios.send({
    debug: true,
    api: {
        url: '/{id}/hello',
        method: MethodEnum.GET,
    },
}, axios.create())
```

## 3.10.noToken & token & tokenFunc

- `noToken`：这个请求是否需要设置 `token`，如果为 `true` 将不会处理 `token` 和 `tokenFunc`。
- `token`：该请求的 `token` 值。
- `tokenFunc`：`token` 设置相关配置
    - `get`：当 `token` 不存在时才执行，获取当前 `token`。
    - `set`：设置token的函数。
        - 第一个参数 `YC`，
        - 第二个参数 `token`，如果 `YC.token` 不存在，那么会执行 `YC.tokenFunc.get` 方法，然后再赋值给 `YC.token`。

```typescript
const yiuAxiosInstance = yiuAxios.create({
    baseURL: 'http://localhost:8080',
    tokenFunc: {
        get: () => {
            // 比如从项目状态中获取语言信息
            return 'my-token'
        },
        set: (yC, token) => {
            if (yC && token) {
                yC.headers['Authorization'] = token
            }
        },
    },
})

yiuAxiosInstance.send(
    {
        api: {
            url: '/yiu',
            method: MethodEnum.GET,
        },
    },
    axios.create(),
)
```

## 3.11.cancel

是否生成取消函数。

```typescript
const cancelFunc = yiuAxios.send(
    {
        baseURL: 'http://localhost:8080',
        api: {
            url: '/yiu',
            method: MethodEnum.GET,
        },
        cancel: true,
    },
    axios.create(),
)

setTimeout(() => {
    if (cancelFunc) {
        cancelFunc()
    }
}, 1000)
```

## 3.12.contentType & contentCharset

请求头类型，将自动设置到 `YC.headers['Content-Type']` 中。

- `contentType`：会被 `YC.aip.method` 影响。
- `noContentTypeCheck`：是否检查`contentType`。
- `contentCharset`：`Content`的编码，默认值：`utf-8` 。

`ContentTypeEnum` 类型：

- `NONE`：无 `contentType`
- `JSON`：`application/json`
- `HTML`：`text/html`
- `TEXT`：`text/plain`
- `XML`：`application/xml`
- `JS`：`application/javascript`
- `FORM_URLENCODED`：`application/x-www-form-urlencoded`
- `FORM_DATA`：`multipart/form-data`

如果不是 `ts` 直接按照上面的字符串赋值赋值即可。

在 `debug` 模式下会检查 `YC.contentType` 的值是否规范。因为有些项目可能就是需要传入字符串，此时字符串如果乱填可能会影响 `yiu-axios` 判断。

如果你确定你的填值确实不在 `yiu-axios` 指定值内，那么可以将 `noContentTypeCheck` 指定为 `true` ，从而取消控制台警告。

```typescript
import { ContentTypeEnum, MethodEnum } from 'yiu-axios/type'

yiuAxios.send(
    {
        baseURL: 'http://localhost:8080',
        api: {
            url: '/yiu',
            method: MethodEnum.GET,
        },
        contentType: ContentTypeEnum.JSON,
    },
    axios.create(),
)
```

## 3.13.upload

上传文件的配置。

上传文件时，请将`YC.api.method`或`YC.contentType`设置为`FORM_DATA`，否则不处理`upload`字段。

- `file`：文件
- `key`：文件在`FormData`中的`Key`，默认为`'file'`
- `name`：上传的文件名

`yiu-axios`会将`data`和`upload`字段处理进`FORM_DATA`中。

```typescript
// <input id="inputElement" name="file" type="file" accept="image/png, image/gif, image/jpeg" />
import { ContentTypeEnum, MethodEnum } from 'yiu-axios/type'

let inputElement = <HTMLInputElement>document.getElementById('inputElement')
if (inputElement && inputElement.files) {
    const file = inputElement.files[0]
    yiuAxios.send(
        {
            api: {
                url: '/yiu',
                method: MethodEnum.POST_FORM_DATA,
            },
            upload: { file },
            data: { name: 'Fidel Yiu' },
        },
        axios.create(),
    )
}

```

## 3.14.noSend

不发送请求，而是在所有检测成功之后，在控制台打印出`AC`、`YC`。供开发者进行检查正确性。

```typescript
yiuAxios.send(
    {
        baseURL: 'http://localhost:8080',
        api: {
            url: '/yiu',
            method: MethodEnum.GET,
        },
        noSend: true,
    },
    axios.create(),
)
```

# 4.三次封装

这里拿 `vue3` 的自动 `loading` 作为案例。

```typescript
import { yiuAxios } from 'yiu-axios'
import axios, { Canceler } from 'axios'
import { YiuRequestConfig } from 'yiu-axios/type'
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
import { MethodEnum } from 'yiu-axios/type'
import { yiuHttp } from '/@/utils/http'

export default defineComponent({
    setup() {
        const name = ref('Fidel')
        const loading = ref(false)
        yiuHttp({
            api: {
                method: MethodEnum.GET,
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

