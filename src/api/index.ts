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
    logout: () => http.post<API.APIResult<null>>(`${baseURL}/user/account/logout`),
    /**
     * 查看报名历史
     * @param params 分页参数
     * @returns 报名历史
     */
    getSignupHistory: (params: API.SignupHistoryParams) => http.get<API.SignupHistoryResult>(`${baseURL}/match/signup/list`, { params }),
}


/**
 * 新闻相关API
 */
export const NewsAPI = {
    /**
     * 获取新闻列表
     * @param params 分页参数
     * @returns 新闻列表
     */
    getNewsList: (params: API.NewsListParams) => http.get<API.NewsListResult>(`${baseURL}/article/list`, { params }),
    /**
     * 获取新闻详情
     * @param id 新闻ID
     * @returns 新闻详情
     */
    getNewsDetail: (id: string) => http.get<API.NewsDetail>(`${baseURL}/article/detail/${id}`),

}

export const MatchAPI = {

    getMatchList: (params: API.MatchListParams) => http.get<API.APIResult<null>>(`${baseURL}/match/list`, { params }),
}
