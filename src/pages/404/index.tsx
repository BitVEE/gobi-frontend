import React from "react";
import { useTranslation } from "next-i18next";
import getLocaleProps from "@/utils/getLocaleProps";


const Error = () => {
    const { t } = useTranslation("common");
    return <div style={{ height: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <h1>{t("common.notFind")}</h1>
    </div>
}

export default Error
export const getStaticProps = getLocaleProps(["common"]);