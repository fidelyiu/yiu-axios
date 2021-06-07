# Yiu Axios
基于axios的二次封装。

[`axios`](https://github.com/axios/axios) 库已经很好了，但是在发送请求时各种繁琐的细节，使得我们在项目使用 `axios` 的时候，始终需要二次封装。

`yiu-axios` 对 `axios` 进行一点二次封装，方便我们在项目中再次进行三次封装。

### 1.配置优先级
axios配置 >> yiu-axios配置 >> yiu-axios默认配置 >> axios默认配置

### 2.简单使用
```typescript

```

### 3.三次封装
这里拿 `vue3` 的自动 `loading` 作为案例。

```typescript
import { yiuAxios } from 'yiu-axios'
import axios, { Canceler } from 'axios'
import { YiuRequestConfig } from 'yiu-axios/dist/type'

const defYiuAxios = yiuAxios.create({
    baseURL: 'http://localhost:8080/',
    // timeout: 1000,
    debug: true,
})
const defAxios = axios.create()

export function yiuHttp<D = any, T = any>(c: YiuRequestConfig<D, T>): Canceler | undefined {
    return defYiuAxios.send(c, defAxios)
}

```

