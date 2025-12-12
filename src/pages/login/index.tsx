import getLocaleProps from "@/utils/getLocaleProps";
import { useTranslation } from "next-i18next";
import styles from '@/styles/login.module.scss'
import Image from 'next/image';
import { useEffect, useState } from "react";
import { AuthAPI } from "@/api";
import { useRouter } from "next/router";
import { ErrorCode, ErrorCodeMap } from "@/utils/map";
import { useDispatch } from "react-redux";
import { addToast } from "@/redux/slice/toastSlice";
import { setUserInfo } from "@/redux/slice/commonSlice";
import BindProfile from "@/components/BindProfile";

const Login = () => {
    const router = useRouter()
    const dispatch = useDispatch();
    const { t } = useTranslation("common");
    const [email, setEmail] = useState('')
    const [code, setCode] = useState('')
    const [isGetCodeing, setIsGetCodeing] = useState(false)
    const [isAgreementChecked, setIsAgreementChecked] = useState(false);
    const [countdown, setCountdown] = useState(0)
    const [emailError, setEmailError] = useState<boolean>(false)
    const [codeError, setCodeError] = useState<boolean>(false)
    const [agreementError, setAgreementError] = useState<boolean>(false)
    const [isLogin, setIsLogin] = useState(false)
    // 是否显示绑定档案表单（默认不显示，登录成功后根据用户信息判断）
    const [showBindForm, setShowBindForm] = useState(false)

    useEffect(() => {
        if (countdown > 0) {
            setTimeout(() => { setCountdown(countdown - 1) }, 1000)
        }
    }, [countdown])


    const sendCode = async () => {
        if (isGetCodeing) {
            return
        }
        setIsGetCodeing(true)
        try {
            await AuthAPI.getVerificationCode({
                email,
                action: 'login',
            })
            setCountdown(60)
        } catch (error) {
            setCountdown(0)
        } finally {
            setIsGetCodeing(false)
        }
    }

    const handleGetCode = async () => {
        if (countdown > 0) {
            return
        }
        if (!email) {
            setEmailError(true)
            return
        }
        setEmailError(false)
        await sendCode()
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (isLogin) {
            return
        }
        // 校验邮箱
        if (!email) {
            setEmailError(true)
            return
        }
        setEmailError(false)
        // 校验验证码
        if (!code) {
            setCodeError(true)
            return
        }
        setCodeError(false)
        // 校验协议
        if (!isAgreementChecked) {
            setAgreementError(true)
            return
        }
        setAgreementError(false)
        setIsLogin(true)
        try {
            await AuthAPI.login({
                email,
                verificationCode: code,
            }).then(async (res) => {
                if (res.data.code === 0) {
                    // 登录成功后，token 会在全局响应拦截器中自动写入 Redux

                    let hasMatchDocument = false
                    // 登录成功后获取用户信息
                    try {
                        const userRes = await AuthAPI.getUserInfo()
                        if (userRes.data.code === 0 && userRes.data.data) {
                            dispatch(setUserInfo(userRes.data.data))
                            hasMatchDocument = userRes.data.data.hasMatchDocument
                        }
                    } catch (err) {
                        // 获取用户信息失败时，不影响后续流程
                    }

                    dispatch(addToast({
                        message: t("login.loginSuccess")
                    }))

                    // 根据是否已绑定档案决定下一步
                    if (hasMatchDocument) {
                        // 已绑定档案，直接跳转首页
                        router.push('/' + router.locale)
                    } else {
                        // 未绑定档案，展示绑定档案表单
                        setShowBindForm(true)
                    }
                } else {
                    dispatch(addToast({
                        message: t(`errorCode.${ErrorCodeMap[res.data.code as ErrorCode]}` as any),
                    }))
                }
            }).finally(() => {
                setIsLogin(false)
            })
        } catch (error) {
            setIsLogin(false)
        }
    }

    // 如果显示绑定表单，渲染绑定UI
    if (showBindForm) {
        return (
            <div className={styles.login}>
                <div className={`${styles.loginContainer} ${styles.bindContainer}`}>
                    <BindProfile
                        showSkipButton={true}
                        redirectPath={'/' + router.locale}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.login}>
            <div className={styles.loginContainer}>
                <Image
                    src="/images/login/login_header_bg.png"
                    alt="GOBI"
                    width={200}
                    height={93}
                    className={styles.loginHeader}
                />
                <form className={styles.loginForm} onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="email">{t("login.emailLogin")}</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t("login.emailPlaceholder")}
                        />
                        {emailError && (
                            <div className={styles.errorMessage}>
                                {t("login.emailFormatError")}
                            </div>
                        )}
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="code">{t("login.codePlaceholder")}</label>
                        <div className={styles.codeInput}>
                            <input
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder={t("login.codePlaceholder")}
                            />
                            <button type="button" disabled={isGetCodeing} className={styles.getCodeButton} onClick={handleGetCode}>
                                {isGetCodeing ? (
                                    <Image
                                        src='/images/icons/loading.svg'
                                        alt="loading"
                                        width={30}
                                        height={30}
                                        className={styles.spinner}
                                    />
                                ) : countdown > 0 ? `${countdown}s` : t("login.getCode")}
                            </button>
                        </div>
                        {codeError && (
                            <div className={styles.errorMessage}>
                                {t("login.codeError")}
                            </div>
                        )}
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.codeInput}>
                            <input type="checkbox" className={styles.checkbox} checked={isAgreementChecked} onChange={(e) => setIsAgreementChecked(e.target.checked)} />
                            {t("login.agreement")}
                            <a href="/protocol/user.pdf" >{t("login.userAgreement")}</a>
                        </label>
                        {agreementError && (
                            <div className={styles.errorMessage}>
                                {t("login.agreementError")}
                            </div>
                        )}
                    </div>
                    <button type="submit" className={styles.loginButton}>
                        {isLogin && (
                            <Image
                                src='/images/icons/loading-white.svg'
                                alt="loading"
                                width={30}
                                height={30}
                                className={styles.spinner}
                            />
                        )}
                        {t("login.login")}
                    </button>
                    <div onClick={() => window.location.href = '/api/v1/user/account/wechat/login'} className={styles.wechatLoginLink}>
                        {t("login.wechatLogin")}
                    </div>
                </form>
            </div >
        </div >
    )
}

export default Login
export const getStaticProps = getLocaleProps(["common"]);