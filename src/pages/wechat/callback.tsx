import { setToken } from "@/redux/slice/commonSlice";
import { store } from "@/redux/store";
import getLocaleProps from "@/utils/getLocaleProps";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useTranslation } from "next-i18next";


export default function WechatCallbackPage() {
  const { t } = useTranslation("common")
  const { query } = useRouter()
  const jwtToken = query.jwtToken as string

  useEffect(() => {
    if (jwtToken) {
      store.dispatch(setToken(jwtToken));
      window.location.href = '/';
    }
  }, [jwtToken]);

  return <div style={{ height: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <h1>{t("common.loginProcessing")}</h1>
  </div>
}

export const getStaticProps = getLocaleProps(["common"]);