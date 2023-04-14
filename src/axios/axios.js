import commBnsConfig from '../commBns/commBnsConfig'
import axios from 'axios'
import router from '../routes.js'

// axios默认配置
axios.defaults.timeout = 10000;   // 超时时间
const CancelToken = axios.CancelToken;
//整理数据

let _axiosPromiseCancel = [];

// 路由请求拦截
// http request 拦截器
axios.interceptors.request.use(
    config => {
        if (config.headers['Content-Type'] === '') {
            config.headers['Content-Type'] = 'application/json'
        }
        //如果没有token，添加token
        if (localStorage.getItem('token') && (config.headers.Authorization == '' || !config.headers.hasOwnProperty('Authorization'))) {
            config.headers.Authorization = localStorage.getItem('token');
        }
        config.cancelToken = new CancelToken((cancel) => {     
            _axiosPromiseCancel.push(cancel);
        });
        return config;
    },
    error => {
        console.log("在request拦截器显示错误：", error.response)
        return Promise.reject(error.response);
    }
);

const strAppKey = commBnsConfig.FunGetPersistentData("signinData").appKey;
// 路由响应拦截
// http response 拦截器
axios.interceptors.response.use(
    response => {
        if (response.data.code === 40101 ||response.data.code === 40103 ||response.data.code === 40105) {
            _axiosPromiseCancel.forEach(e=>{
                e && e()
             });
             _axiosPromiseCancel = [];
            if (localStorage.getItem('refreshToken')) {
                console.log("token无效");
                refreshToken(response);
            }
            else {
                toLogin();
            }
        }
        else {
            return response;
        }
    },
    async error => {
        if(axios.isCancel(error)) {
            console.log("该请求中断");
            return Promise.reject("请求中断");
        }

        if (error.response && (error.response.status === 401 || (error.response.status === 400 && error.response.data.message === 'token错误'))) {
            // 配置中断请求：当返回token失效后，其他请求中断
            _axiosPromiseCancel.forEach(e=>{
                e && e()
             });
             _axiosPromiseCancel = [];
            let response = error.response;
            if (localStorage.getItem('refreshToken')) {
                console.log("token无效");
                refreshToken(response);
            }
            else {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');

                // if (router.currentRoute.path !== '/login') {
                //     toLogin();
                // }

            }
            return Promise.reject('登录失效');
        }
        else {
            return Promise.reject(error.response)   // 返回接口返回的错误信息
        }

    }
);

/**
 * 刷新token
 * @returns 
 */
async function refreshToken(response) {
    
}

function toLogin() {
    //跳转到登录页面

}

export default axios;
