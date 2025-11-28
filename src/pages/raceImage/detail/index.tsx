import getLocaleProps from "@/utils/getLocaleProps";
import { useRouter } from "next/router";
import NewsDetail from "@/components/NewsDetail";

const RaceImageDetail = () => {
    const router = useRouter();
    const { id } = router.query;

    return (
        <NewsDetail
            id={id as string}
            showPageHeader={true}
            enableImageModal={true}
        />
    )
}

export default RaceImageDetail;
export const getStaticProps = getLocaleProps(["common"]);