import getLocaleProps from "@/utils/getLocaleProps";
import { useTranslation } from "next-i18next";

export default function Home() {
  const { t } = useTranslation("common");
  return (
    <div className="dd">
      GOBI
    </div>
  )
}
export const getStaticProps = getLocaleProps(["common"]);