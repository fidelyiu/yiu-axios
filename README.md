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

