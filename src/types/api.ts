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
}
