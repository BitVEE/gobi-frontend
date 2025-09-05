import axios, { Axios, AxiosHeaders, AxiosRequestConfig } from 'axios'
import { store } from '../redux/store';
import { clearToken, setToken } from '../redux/slice/commonSlice';

// request intercept for API
axios.interceptors.request.use(
  config => {
    const token = store.getState().commonSlice.token
    if (!config.headers) {
      config.headers = new AxiosHeaders()
    }
    
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json'
    }
    config.headers['Authorization'] = token ? `Bearer ${token}` : ''
    return config
  },
  error => {
    return Promise.reject(error);
  }
);

// response intercept for API
axios.interceptors.response.use(
  response => {
    if (response.data?.code === 2004) {
      store.dispatch(clearToken());
    }
    if (response.data?.data?.jwtToken) {
      store.dispatch(setToken(response.data.data.jwtToken));
    }
    //todo
    return response;
  },
  err => {
    return Promise.reject(err);
  }
);

interface Request extends Axios {
  <T = any, D = any>(config: AxiosRequestConfig<D>): Promise<T>;
}


export function createReques(baseURL?: string, config?: (instance: Request) => void) {
  const instance = axios.create({
    baseURL: baseURL ?? '',
    timeout: 60000 * 10,
    headers: {
      'Content-Type': 'application/json'
    }
  }) as Request;
  config ? config(instance) : configRequest(instance);
  return instance;
}

export function configRequest(request: Request) {
  request.interceptors.request.use(
    (config) => {
      return config;
    },
    (error) => {
      console.log(error);
    },
  );
  request.interceptors.response.use(
    (res) => {
      if (res.status != 200) {
        return {
          success: false,
          Code: -1,
          Msg: res.statusText,
          Data: res.data,
        };
      }
      res.data.success = res.data.Code === 0;
      return res.data || res;
    },
    (error) => {
      console.error('request err: %o', error.message);
      return {
        success: false,
        Code: -1,
        Msg: error.message,
        Data: {},
      };
      // don't throw error
      return Promise.reject(error);
    },
  );
}
const net = {
  get<T>(url: string, params?: object) {
    return axios.get<T>(url, params)
  },
  post<T>(url: string, data?: object, config?: object) {
    return axios.post<T>(url, data, config)
  },
  delete<T>(url: string, data?: object) {
    return axios.delete<T>(url, { data })
  },
  put<T>(url: string, data?: object) {
    return axios.put<T>(url, data)
  },
  patch<T>(url: string, data?: object) {
    return axios.patch<T>(url, data)
  }
}

export default net
