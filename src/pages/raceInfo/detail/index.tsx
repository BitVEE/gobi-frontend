import getLocaleProps from "@/utils/getLocaleProps";
import { useRouter } from "next/router";
import NewsDetail from "@/components/NewsDetail";

const RaceInfoDetail = () => {
    const router = useRouter();
    const { id } = router.query;

    return (
        <NewsDetail
            id={id as string}
            showPageHeader={true}
            enableImageModal={false}
        />
    )
}

export default RaceInfoDetail;
export const getStaticProps = getLocaleProps(["common"]);