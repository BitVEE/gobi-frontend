import React from "react";
import getLocaleProps from "@/utils/getLocaleProps";
import Image from "next/image";
import styles from "@/styles/error.module.scss"


const Forbidden = () => {
    return <div className={styles.error}>
        <Image className={styles.image} width={2180} height={1360} src="/images/403.png" alt="404"></Image>
    </div>
}

export default Forbidden
export const getStaticProps = getLocaleProps(["common"]);