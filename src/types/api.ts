declare namespace API {
    interface APIResult<T> {
        code: number
        data: T
        msg: string
    }

    // 登录参数
    interface LoginParams {
        email: string
        verificationCode: string
    }
    type LoginResult = APIResult<{
        jwtToken: string
    }>

    // 验证码参数
    interface VerificationCodeParams {
        email: string
        action: string
    }
    type VerificationCodeResult = APIResult<{
        verificationCode: string
    }>

    interface NewsListParams {
        type: number
        page: number
        size: number
    }

    type NewsListItem = {
        id: number
        titleEn: string
        titleZh: string
        tag: string
        type: number
        coverUrl: string
        createdAt: string
        updatedAt: string
        contentEn?: string
        contentZh?: string
        extra?: object // 可选的额外字段
        imageList?: any// 可选的图片列表
    }

    type NewsLisData = {
        total: number
        articles: NewsListItem[]
    }
    interface NewsListResult {
        data: NewsLisData
        message: any
        code: number
    }

    interface NewsDetail {
        article: NewsListItem[]
    }
}
