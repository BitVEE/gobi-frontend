import { useRouter } from 'next/router'
import getLocaleProps from "@/utils/getLocaleProps";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useSelector, useDispatch } from 'react-redux';

import { RegistrationAPI } from '@/api';
import styles from './pay.module.scss'
import MatchDetailCard from '@/components/MatchDetailCard';
import Modal from '@/components/Modal';
import { addToast } from "@/redux/slice/toastSlice";

type Props = {};

const Info = (props: Props) => {
    const router = useRouter()
    const { groupInfo, matchDetail, registrationId } = router.query;
    const { t } = useTranslation("common", { keyPrefix: "header.registration" });
    const token = useSelector((state: any) => state.commonSlice.token);
    const dispatch = useDispatch();

    const [group, setGroup] = useState<any>();
    const [currentMatchInfo, setCurrentMatchInfo] = useState<API.MatchesListType>();
    const [orderId, setOrderId] = useState<string>("");

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isPaid, setIsPaid] = useState<boolean>(false);

    const handleNext = async () => {
        dispatch(addToast({
            message: t("noPaymentMethods"),
            timeout: 3000
        }))
    }


    useEffect(() => {
        if (groupInfo && matchDetail && registrationId && token) {
            setGroup(JSON.parse(groupInfo as string));
            setCurrentMatchInfo(JSON.parse(matchDetail as string));
            setOrderId(registrationId as string || "");
        } else {
            // router.push('/race/registration');
        }
    }, [groupInfo, matchDetail, registrationId]);

    return (
        <div className={styles.pay}>
            <div className={styles.detail_box}>
                {currentMatchInfo && <MatchDetailCard matchDetail={currentMatchInfo} />}
            </div>
            <div className={styles.payment_methods_box}>

            </div>

            <div className={styles.payment_box}>
                <div className={styles.cost_box}>
                    <div className={styles.price}>
                        {group ? `¥${group.cost}` : '¥0'}
                    </div >
                    <div className={styles.pay_btn} onClick={handleNext}>
                        {t('pay')}
                    </div >
                </div >
            </div >

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={t(isPaid ? 'paySuccess' : 'paying')}
            >
                <div className={styles.modal_content}>
                    {
                        isPaid ?
                            <div className={styles.congratulation_box}>
                                <Image src='/images/icons/checked.svg' width={24} height={24} alt='checked' className={styles.checkedIcon} ></Image>
                                <div className={styles.text}>{t('paySuccess')}</div>
                                <div className={styles.go_to_pay} onClick={() => router.push('/user')}>{t('goToPay')}</div>
                            </div>

                            :
                            <Image
                                src='/images/icons/loading.svg'
                                alt="loading"
                                width={120}
                                height={200}
                                className={styles.loadingIcon}
                            />
                    }

                </div>
            </Modal>
        </div >
    )
}

export default Info
export const getStaticProps = getLocaleProps(["common"]);
