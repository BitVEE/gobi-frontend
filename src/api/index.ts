import http from '@/utils/net'
const baseURL = '/api/v1'
/**
 * 用户认证相关API
 */
export const AuthAPI = {
    /**
     * 用户登录
     * @param params 登录参数
     * @returns 登录结果
     */
    login: (params: API.LoginParams) => http.post<API.LoginResult>(`${baseURL}/user/account/login`, params),
    /**
     * 获取验证码
     * @param params 获取验证码参数
     * @returns 获取验证码结果
     */
    getVerificationCode: (params: API.VerificationCodeParams) => http.post<API.VerificationCodeResult>(`${baseURL}/user/verification`, params),
    /**
     * 用户注销
     * @returns 注销结果
     */
    logout: () => http.post<API.APIResult<null>>(`${baseURL}/user/logout`)
}
