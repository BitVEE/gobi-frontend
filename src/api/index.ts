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
    getNewsDetail: (id: string) => http.get<API.APIResult<API.NewsDetail>>(`${baseURL}/article/detail?id=${id}`),

}

export const RegistrationAPI = {
    /**
     * 提交报名信息
     * @param params 报名参数
     * @returns 提交结果
     */
    submitRegistration: (params: API.RegistrationParams) => http.post<API.APIResult<API.RegistrationResult>>(`${baseURL}/match/signup/add`, params),


    /**
     * 上传图片
     * @param file 图片文件
     * @returns 上传结果
     */
    uploadImage: (params: API.UploadImageParams) => http.post<API.APIResult<API.UploadImageResult>>(`${baseURL}/upload_image`, params)

}

export const MatchAPI = {

    getMatchList: (params: API.MatchListParams) => http.get<API.APIResult<null>>(`${baseURL}/match/list`, { params }),

    getMatchDetail: (params: API.RegistrationResult) => http.get<API.APIResult<null>>(`${baseURL}/match/detail`, { params }),
}

export const PaymentAPI = {
    getPaymentInfo: (params: API.PaymentInfoParams) => http.post<API.APIResult<null>>(`${baseURL}/airwallex/create_payment_intent`, params),

}

/**
 * 成绩相关API
 */
export const ResultAPI = {
    /**
     * 获取成绩榜单列表
     * @param params 获取成绩榜单列表参数
     * @returns 成绩榜单列表
     */
    getResultRankList: (params: API.ResultRankListParams) => http.get<API.ResultRankListResult>(`${baseURL}/match/rank/list`, { params }),

    /**
     * 查看榜单成绩
     * @param params 查看榜单成绩参数
     * @returns 查看榜单成绩结果
     */
    getResultRankDetail: (params: API.ResultRankDetailParams) => http.get<API.ResultRankDetailResult>(`${baseURL}/match/rank/result`, { params }),
    /**
     * 查看成绩详情
     * @param params 查看成绩详情参数
     * @returns 查看成绩详情结果
     */
    getResultDetail: (params: API.ResultDetailParams) => http.get<API.APIResult<API.ResultDetailResult>>(`${baseURL}/match/rank/detail`, { params }),

    /**
     * 查看完赛证明
     * @param params 查看完赛证明参数
     * @returns 输出：直接返回图片流，非JSON格式
     */
    getCertificate: (params: API.CertificateParams) => http.get<Blob>(`${baseURL}/match/certificate`, { params }),
}
