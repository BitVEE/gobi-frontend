import { useRouter } from 'next/router'
import getLocaleProps from "@/utils/getLocaleProps";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useSelector, useDispatch } from 'react-redux';
import { init, createElement } from '@airwallex/components-sdk';

import { PaymentAPI } from '@/api';
import styles from './pay.module.scss'
import MatchDetailCard from '@/components/MatchDetailCard';
import Modal from '@/components/Modal';
import { addToast } from "@/redux/slice/toastSlice";

type Props = {};

const Info = (props: Props) => {
    const router = useRouter()
    const { groupInfo, matchDetail, registrationId } = router.query;
    const { t, i18n } = useTranslation("common", { keyPrefix: "header.registration" });
    const token = useSelector((state: any) => state.commonSlice.token);
    const dispatch = useDispatch();

    const [group, setGroup] = useState<any>();
    const [currentMatchInfo, setCurrentMatchInfo] = useState<API.MatchesListType>();
    const [orderId, setOrderId] = useState<string>("");

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isPaid, setIsPaid] = useState<boolean>(false);
    const [isPaying, setIsPaying] = useState<boolean>(false);

    const handlePayment = async () => {
        // dispatch(addToast({
        //     message: t("noPaymentMethods"),
        //     timeout: 3000
        // }))
        // setIsModalOpen(true)
    }

    const initPayment = async () => {

        try {
            // initialize payment systems

            if (orderId) {

                await init({
                    env: 'prod',
                    locale: i18n.language as any,
                    enabledElements: ["payments"]
                })

                const infoData: any = await PaymentAPI.getPaymentInfo({
                    matchSignUpId: Number(orderId),
                    currency: "CNY"
                })
                // console.log(infoData.data)
                if (!infoData.data.clientSecret) {
                    dispatch(addToast({
                        message: t("noPaymentMethods"),
                        timeout: 3000
                    }))
                    return
                }

                const element = await createElement('dropIn', {
                    intent_id: infoData.data.intentId,
                    client_secret: infoData.data.clientSecret,
                    currency: infoData.data.currency,
                    appearance: {
                        mode: 'light',
                        variables: {
                            colorBrand: '#FF6A14',
                        },
                    },
                });

                element?.mount('dropIn');
            }

        } catch (error) {
            console.error(error);
        }
    }


    useEffect(() => {
        if (!token) {
            dispatch(addToast({
                message: t("loginTips"),
                timeout: 3000
            }))
        }
        if (groupInfo && matchDetail && registrationId) {
            setGroup(JSON.parse(groupInfo as string));
            setCurrentMatchInfo(JSON.parse(matchDetail as string));
            setOrderId(registrationId as string || "");
        }
    }, [groupInfo, matchDetail, registrationId, token]);

    useEffect(() => {
        initPayment()

        const onReady = (event: CustomEvent): void => {
            // console.log(`Element is mounted: ${JSON.stringify(event.detail)}`);
        };

        const onSuccess = (event: CustomEvent): void => {
            console.log(`Confirm success with ${JSON.stringify(event.detail)}`);
            setIsPaying(true)
            setIsModalOpen(true)
            PaymentAPI.getPaymentResult({ matchSignUpId: Number(orderId) }).then((res: any) => {
                console.log(res.data.intent)
                setIsPaying(false)
                if (res.data) {
                    setIsPaid(true)
                } else {
                    setIsPaid(false)
                }

            }).catch(err => {
                setIsPaying(false)
                setIsPaid(false)
            })
        };

        const onError = (event: CustomEvent) => {
            const { error } = event.detail;
            console.error('There is an error', error);
            try {
                if (error?.code === "unauthorized") {
                    initPayment()
                }
            } catch (e) {

            }
        };

        const domElement = document.getElementById('dropIn');
        domElement?.addEventListener('onReady', onReady as EventListener);
        domElement?.addEventListener('onSuccess', onSuccess as EventListener);
        domElement?.addEventListener('onError', onError as EventListener);
        return () => {
            domElement?.removeEventListener('onReady', onReady as EventListener);
            domElement?.removeEventListener('onSuccess', onSuccess as EventListener);
            domElement?.removeEventListener('onError', onError as EventListener);
        };
    }, [router, orderId]);

    return (
        <div className={styles.pay}>
            <div className={styles.detail_box}>
                {currentMatchInfo && <MatchDetailCard matchDetail={currentMatchInfo} groupInfo={group} />}
            </div>
            <div className={styles.payment_methods_box} id="dropIn" style={{
                width: '85%',
                margin: '48px auto',
            }}>

            </div>

            {/* <div className={styles.payment_box}>
                <div className={styles.cost_box}>
                    <div className={styles.price}>
                        {group ? `¥${group.cost}` : '¥0'}
                    </div >
                    <div className={styles.pay_btn} onClick={handlePayment}>
                        {t('pay')}
                    </div >
                </div >
            </div > */}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={t(isPaying ? 'paying' : isPaid ? 'congratulationPay' : 'payFail')}
            >
                <div className={styles.modal_content}>
                    {
                        isPaying ? <Image
                            src='/images/icons/loading.svg'
                            alt="loading"
                            width={120}
                            height={200}
                            className={styles.loadingIcon}
                        /> :
                            <div className={styles.congratulation_box}>
                                <Image src={`/images/icons/${isPaid ? 'checked' : 'fail'}.svg`} width={24} height={24} alt='checked' className={styles.checkedIcon} ></Image>
                                <div className={styles.text}>{t(isPaid ? 'paySuccess' : "payFail")}</div>
                                <div className={styles.btn_group}>
                                    <div className={styles.go_to_pay} onClick={() => router.push('/')}>{t('goToHome')}</div>
                                    <div className={styles.go_to_pay} onClick={() => router.push('/user')}>{t('goToOrderDetail')}</div>
                                </div>
                            </div>
                    }
                </div>
            </Modal>
        </div >
    )
}

export default Info
export const getStaticProps = getLocaleProps(["common"]);
