import { setToken } from "@/redux/slice/commonSlice";
import { store } from "@/redux/store";
import getLocaleProps from "@/utils/getLocaleProps";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useTranslation } from "next-i18next";
import { addToast } from "@/redux/slice/toastSlice";


export default function WechatCallbackPage() {
  const { t } = useTranslation("common")
  const router = useRouter()
  const { query } = router
  const jwtToken = query.jwt_token as string

  useEffect(() => {
    if (jwtToken) {
      store.dispatch(setToken(jwtToken));
      store.dispatch(addToast({
        message: t("login.loginSuccess"),
      }))
      router.push('/')
    }
  }, [jwtToken]);

  return <div style={{ height: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <h2>{t("common.loginProcessing")}</h2>
  </div>
}

export const getStaticProps = getLocaleProps(["common"]);