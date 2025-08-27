import { useRouter } from 'next/router'
import getLocaleProps from "@/utils/getLocaleProps";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useSelector, useDispatch } from 'react-redux';

import { RegistrationAPI } from '@/api';
import styles from './info.module.scss'
import MatchDetailCard from '@/components/MatchDetailCard';
import Modal from '@/components/Modal';
import { addToast } from "@/redux/slice/toastSlice";

type Props = {};

const Info = (props: Props) => {
    const router = useRouter()
    const { groupInfo, matchDetail } = router.query;
    const { t, i18n } = useTranslation("common", { keyPrefix: "header.registration" });
    const token = useSelector((state: any) => state.commonSlice.token);
    const dispatch = useDispatch()

    const [group, setGroup] = useState<any>();
    const [currentMatchInfo, setCurrentMatchInfo] = useState<API.MatchesListType>();

    const [photoUrl, setPhotoUrl] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [enName, setEnName] = useState<string>("");
    const [gender, setGender] = useState<string>("1");
    const [birthday, setBirthday] = useState<string>("2000-01-01");
    const [credentialType, setCredentialType] = useState<string>("1");
    const [credentialNumber, setCredentialNumber] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [nationality, setNationality] = useState<string>("");
    const [city, setCity] = useState<string>("");
    const [schoolName, setSchoolName] = useState<string>("");
    const [grade, setGrade] = useState<string>("");
    const [bloodType, setBloodType] = useState<string>("");
    const [height, setHeight] = useState<string>("");
    const [weight, setWeight] = useState<string>("");
    const [shirtSize, setShirtSize] = useState<string>('110');
    const [shoeSize, setShoeSize] = useState<string>("");
    const [hasJoinedBefore, setHasJoinedBefore] = useState<string>("1");
    const [beforeMatchName, setBeforeMatchName] = useState<string>("");
    const [parentPhoneNumber, setParentPhoneNumber] = useState<string>("");
    const [parentEmail, setParentEmail] = useState<string>("");
    const [guardianName, setGuardianName] = useState<string>("");
    const [guardianRelationship, setGuardianRelationship] = useState<string>("");
    const [guardianWechat, setGuardianWechat] = useState<string>("");
    const [guardianPhoneNumber, setGuardianPhoneNumber] = useState<string>("");
    const [emergencyPhoneNumber, setEmergencyPhoneNumber] = useState<string>("");
    const [medicationRestrictions, setMedicationRestrictions] = useState<string>("");
    const [dietaryRestrictions, setDietaryRestrictions] = useState<string>("");
    const [allergyInformation, setAllergyInformation] = useState<string>("");
    const [medicalHistory, setMedicalHistory] = useState<string>("");
    const [additionalNotes, setAdditionalNotes] = useState<string>("");
    const [sportsBackground, setSportsBackground] = useState<string>("");
    const [psychologicalNotes, setPsychologicalNotes] = useState<string>("");
    const [isAgreed, setIsAgreed] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [orderId, setOrderId] = useState<string>("");

    const handleNext = async () => {
        if (!token) return dispatch(addToast({ message: t("loginTips"), timeout: 3000 }));
        if (!isAgreed) return dispatch(addToast({ message: t("noAgreement"), timeout: 3000 }));
        if (name != '' && enName != '' && credentialNumber != '' && phoneNumber != '' && nationality != '' && city != '' && schoolName != '' && grade != '' && bloodType != '' && height != '' && weight != '' && shoeSize != '' && parentPhoneNumber != '' && parentEmail != '' && guardianName != '' && guardianRelationship != '' && guardianWechat != '' && guardianPhoneNumber != '' && emergencyPhoneNumber != '' && medicationRestrictions != '' && dietaryRestrictions != '' && allergyInformation != '' && medicalHistory != '' && additionalNotes != '' && sportsBackground != '' && photoUrl != '') {
            if (hasJoinedBefore === "1" && beforeMatchName === '') {
                dispatch(addToast({ message: t("requiredFields"), timeout: 3000 }));
            } else {
                setIsModalOpen(true)
                // uploadImage
                const uploadRes = await RegistrationAPI.uploadImage({ image: photoUrl.replace(/.*;base64,/, '') });
                const imageUrl = uploadRes.data.data.imageUrl + '/' + uploadRes.data.data.variants[0];
                console.log("imageUrl", imageUrl);
                setPhotoUrl(imageUrl);

                const data: API.RegistrationParams = {
                    matchGroupId: group?.id,
                    matchId: group?.matchId,
                    name: name,
                    enName: enName,
                    gender: Number(gender),
                    birthday: birthday,
                    credentialType: Number(credentialType),
                    credentialNumber: credentialNumber,
                    phoneNumber: phoneNumber,
                    nationality: nationality,
                    city: city,
                    schoolName: schoolName,
                    grade: grade,
                    bloodType: bloodType,
                    height: height,
                    weight: weight,
                    shirtSize: shirtSize,
                    shoeSize: shoeSize,
                    hasJoinedBefore: Number(hasJoinedBefore),
                    beforeMatchName: beforeMatchName,
                    parentPhoneNumber: parentPhoneNumber,
                    parentEmail: parentEmail,
                    guardianName: guardianName,
                    guradianRelationship: guardianRelationship,
                    guardianPhoneNumber: guardianPhoneNumber,
                    guardianWechat: guardianWechat,
                    emergencyPhoneNumber: emergencyPhoneNumber,
                    medicationRestrictions: medicationRestrictions,
                    dietaryRestrictions: dietaryRestrictions,
                    allergyInformation: allergyInformation,
                    medicalHistory: medicalHistory,
                    additionalNotes: additionalNotes,
                    sportsBackground: sportsBackground,
                    psychologicalNotes: psychologicalNotes,
                    photoUrl: imageUrl
                }

                const res = await RegistrationAPI.submitRegistration(data);
                console.log("submitForm res", res.data);
                if (res.data.code === 0) {
                    setIsSubmitted(true);
                    setOrderId(res.data.data.id);
                } else {
                    setIsSubmitted(false);
                    setIsModalOpen(false)
                    dispatch(addToast({ message: res.data.error || t('registrationFailed'), timeout: 3000 }));

                }

            }
        } else {
            dispatch(addToast({ message: t("requiredFields"), timeout: 3000 }));

        }
    }


    const getImgFile = (file: File) => {
        try {
            if (file.size > 1024 * 1024 * 5) {
                return false;
            }

            if (file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg' || file.type === 'image/webp') {
                const imgReader = new FileReader()
                imgReader.onloadend = function (e) {
                    setPhotoUrl(imgReader.result as any)
                };
                imgReader.readAsDataURL(file)
            } else {
                // dispatch(addToast({ message: t("fileTypeError"), timeout: 3000 }));
            }
        } catch (e) {

        }

    }

    const goToPay = () => {
        router.push({
            pathname: '/race/pay',
            query: {
                matchDetail: JSON.stringify(currentMatchInfo),
                groupInfo: JSON.stringify(group),
                registrationId: orderId
            }
        })
    }

    useEffect(() => {
        if (groupInfo && matchDetail && token) {
            setGroup(JSON.parse(groupInfo as string));
            setCurrentMatchInfo(JSON.parse(matchDetail as string));
        } else {
            // router.push('/race/registration');
        }
    }, [groupInfo, matchDetail]);

    return (
        <div className={styles.info}>
            <div className={styles.detail_box}>
                {currentMatchInfo && <MatchDetailCard matchDetail={currentMatchInfo} />}
            </div>

            <div className={styles.group_box}>
                <div className={styles.cell_title}>
                    {t('group')}
                </div>
                <div className={styles.cell_content}>
                    <div className={styles.cell_name}>
                        {t('group')}
                    </div>
                    <div className={styles.group_name}>
                        {group?.[i18n.language === 'zh' ? 'nameZh' : 'nameEn'] || t('nodataText')}
                    </div>
                </div>

                <div className={styles.cell_content}>
                    <div className={styles.cell_name}>
                        {t('cost')}
                    </div>
                    <div className={styles.group_name}>{`¥${group?.cost}/${t('person')}`}</div>
                </div>
            </div>

            <div className={styles.group_box}>
                <div className={styles.cell_title}>
                    {t('info')}
                </div>

                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.avatar')}
                    </div>
                    <div className={`${styles.info_avatar} ${styles.info_ipt}`}
                        onClick={() => {
                            const fileInput = document.getElementById('hiddenFile');
                            if (fileInput) (fileInput as HTMLInputElement).click();
                        }}>
                        {
                            photoUrl ?
                                <Image
                                    src={photoUrl}
                                    alt="Avatar"
                                    width={100}
                                    height={100}
                                    className={styles.avatarImage}
                                />
                                :
                                <div className={styles.upload_btn_plus} >+</div>
                        }
                        <input
                            id='hiddenFile'
                            type="file"
                            style={{ display: 'none' }}
                            accept='image/png, image/jpeg, image/jpg, image/webp, image/gif'
                            onChange={(event) => {
                                if (event.target.files && event.target.files[0]) {
                                    getImgFile(event.target.files[0]);
                                }
                            }}
                        />
                    </div>
                </div>

                {/* INPUT */}
                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.name')}
                    </div>
                    <div className={styles.info_ipt}>
                        <input type="text" maxLength={30} onChange={(e) => setName(e.target.value)} />
                    </div>
                </div>

                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.enName')}
                    </div>
                    <div className={styles.info_ipt}>
                        <input type="text" maxLength={30} onChange={(e) => setEnName(e.target.value)} />
                    </div>
                </div>

                {/* SELECT */}
                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.gender')}
                    </div>
                    <div className={styles.info_ipt}>
                        <select name="gender" id="gender" onChange={(e) => setGender(e.target.value)} value={gender}>
                            <option value='1'>{t('infoList.genderList.male')}</option>
                            <option value='2'>{t('infoList.genderList.female')}</option>
                            <option value='3'> {t('infoList.genderList.other')}</option>
                        </select>
                    </div>
                </div>

                {/* DatePicker */}
                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.birthday')}
                    </div>
                    <div className={styles.info_ipt}>
                        <input type="date" name="Date" value={birthday} onChange={(e) => setBirthday(e.target.value)} className={styles.date_ipt} id="id_yy_input" />
                    </div>
                </div>

                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.credentialType')}
                    </div>
                    <div className={styles.info_ipt}>
                        <select name="credentialType" id="credentialType" onChange={(e) => setCredentialType(e.target.value)} value={credentialType}>
                            <option value='1'>{t('infoList.credentialTypeList.1')}</option>
                            <option value='2'>{t('infoList.credentialTypeList.2')}</option>
                            <option value='3'> {t('infoList.credentialTypeList.3')}</option>
                            <option value='4'> {t('infoList.credentialTypeList.4')}</option>
                        </select>
                    </div>
                </div>

                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.credentialNumber')}
                        <span className={styles.required}>{t('infoList.credentialNumberTips')}</span>
                    </div>
                    <div className={styles.info_ipt}>
                        <input type="text" maxLength={50} onChange={(e) => setCredentialNumber(e.target.value)} />
                    </div>
                </div>

                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.phoneNumber')}
                    </div>
                    <div className={styles.info_ipt}>
                        <input type="text" maxLength={30} onChange={(e) => setPhoneNumber(e.target.value)} />
                    </div>
                </div>

                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.nationality')}
                    </div>
                    <div className={styles.info_ipt}>
                        <input type="text" maxLength={30} onChange={(e) => setNationality(e.target.value)} />
                    </div>
                </div>

                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.city')}
                    </div>
                    <div className={styles.info_ipt}>
                        <input type="text" maxLength={30} onChange={(e) => setCity(e.target.value)} />
                    </div>
                </div>

                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.schoolName')}
                    </div>
                    <div className={styles.info_ipt}>
                        <input type="text" maxLength={30} onChange={(e) => setSchoolName(e.target.value)} />
                    </div>
                </div>

                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.grade')}
                    </div>
                    <div className={styles.info_ipt}>
                        <input type="text" maxLength={30} onChange={(e) => setGrade(e.target.value)} />
                    </div>
                </div>


                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.bloodType')}
                    </div>
                    <div className={styles.info_ipt}>
                        <input type="text" maxLength={30} onChange={(e) => setBloodType(e.target.value)} />
                    </div>
                </div>

                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.height')}
                        <span className={styles.required}>(cm)</span>
                    </div>
                    <div className={styles.info_ipt}>
                        <input type="text" maxLength={30} onChange={(e) => setHeight(e.target.value)} />
                    </div>
                </div>

                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.weight')}
                        <span className={styles.required}>(kg)</span>
                    </div>
                    <div className={styles.info_ipt}>
                        <input type="text" maxLength={30} onChange={(e) => setWeight(e.target.value)} />
                    </div>
                </div>

                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.shirtSize')}
                        <span className={styles.required}>{t('infoList.shirtsizeTips')}</span>
                    </div>
                    <div className={styles.info_ipt} style={{ justifyContent: 'flex-start' }}>
                        {
                            ['110', '120', '130', '140', '150', '160', '170', '180'].map((size) => (
                                <div className={styles.ipt_radio} key={size} >
                                    <input type="radio" id={`size-${size}`} name="size" value={size} checked={size === shirtSize} onChange={(e: any) => setShirtSize(e.target.value)} />
                                    <label htmlFor={`size-${size}`} className={styles.ipt_radio_label}>{`${size}cm`}</label>
                                </div>
                            ))
                        }
                    </div>
                </div>

                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.shoeSize')}
                        <span className={styles.required}>{t('infoList.shoeSizeTips')}</span>
                    </div>
                    <div className={styles.info_ipt}>
                        <input type="text" maxLength={30} onChange={(e) => setShoeSize(e.target.value)} />
                    </div>
                </div>

                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.hasJoinedBefore')}
                    </div>
                    <div className={styles.info_ipt}>
                        <select name="hasJoinedBefore" id="hasJoinedBefore" onChange={(e) => { setHasJoinedBefore(e.target.value); e.target.value === '0' ? setBeforeMatchName('') : '' }} value={hasJoinedBefore}>
                            <option value='1'>{t('infoList.yes')}</option>
                            <option value='0'> {t('infoList.no')}</option>
                        </select>
                    </div>
                </div>

                {
                    hasJoinedBefore === "1" && (
                        <div className={styles.cell_info_box}>
                            <div className={styles.info_title}>
                                {t('infoList.beforeMatchName')}
                                <span className={styles.required}>{t('infoList.beforeMatchNameTips')}</span>
                            </div>
                            <div className={styles.info_ipt}>
                                <input type="text" maxLength={30} onChange={(e) => setBeforeMatchName(e.target.value)} />
                            </div>
                        </div>
                    )
                }


                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.parentPhoneNumber')}
                    </div>
                    <div className={styles.info_ipt}>
                        <input type="text" maxLength={30} onChange={(e) => setParentPhoneNumber(e.target.value)} />
                    </div>
                </div>



                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.parentEmail')}
                    </div>
                    <div className={styles.info_ipt}>
                        <input type="text" maxLength={30} onChange={(e) => setParentEmail(e.target.value)} />
                    </div>
                </div>



                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.guardianName')}
                    </div>
                    <div className={styles.info_ipt}>
                        <input type="text" maxLength={30} onChange={(e) => setGuardianName(e.target.value)} />
                    </div>
                </div>


                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.guardianRelationship')}
                    </div>
                    <div className={styles.info_ipt}>
                        <input type="text" maxLength={30} onChange={(e) => setGuardianRelationship(e.target.value)} />
                    </div>
                </div>




                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.guardianWechat')}
                    </div>
                    <div className={styles.info_ipt}>
                        <input type="text" maxLength={30} onChange={(e) => setGuardianWechat(e.target.value)} />
                    </div>
                </div>




                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.guardianPhoneNumber')}
                    </div>
                    <div className={styles.info_ipt}>
                        <input type="text" maxLength={30} onChange={(e) => setGuardianPhoneNumber(e.target.value)} />
                    </div>
                </div>


                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.emergencyPhoneNumber')}
                    </div>
                    <div className={styles.info_ipt}>
                        <input type="text" maxLength={30} onChange={(e) => setEmergencyPhoneNumber(e.target.value)} />
                    </div>
                </div>


                {/* TEXTAREA */}
                <div className={styles.cell_info_box} >
                    <div className={styles.info_title}>
                        {t('infoList.medicationRestrictions')}
                    </div>
                    <div className={styles.info_ipt} style={{ height: '90px', padding: '10px' }}>
                        <textarea name="medicationRestrictions" id="medicationRestrictions" maxLength={220} onChange={(e) => setMedicationRestrictions(e.target.value)}></textarea>
                    </div>
                </div>

                <div className={styles.cell_info_box} >
                    <div className={styles.info_title}>
                        {t('infoList.dietaryRestrictions')}
                    </div>
                    <div className={styles.info_ipt} style={{ height: '90px', padding: '10px' }}>
                        <textarea name="dietaryRestrictions" id="dietaryRestrictions" maxLength={220} onChange={(e) => setDietaryRestrictions(e.target.value)}></textarea>
                    </div>
                </div>

                <div className={styles.cell_info_box} >
                    <div className={styles.info_title}>
                        {t('infoList.allergyInformation')}
                    </div>
                    <div className={styles.info_ipt} style={{ height: '90px', padding: '10px' }}>
                        <textarea name="allergyInformation" id="allergyInformation" maxLength={220} onChange={(e) => setAllergyInformation(e.target.value)}></textarea>
                    </div>
                </div>

                <div className={styles.cell_info_box} >
                    <div className={styles.info_title}>
                        {t('infoList.medicalHistory')}
                    </div>
                    <div className={styles.info_ipt} style={{ height: '90px', padding: '10px' }}>
                        <textarea name="medicalHistory" id="medicalHistory" maxLength={220} onChange={(e) => setMedicalHistory(e.target.value)}></textarea>
                    </div>
                </div> <div className={styles.cell_info_box} >
                    <div className={styles.info_title}>
                        {t('infoList.additionalNotes')}
                    </div>
                    <div className={styles.info_ipt} style={{ height: '90px', padding: '10px' }}>
                        <textarea name="additionalNotes" id="additionalNotes" maxLength={220} onChange={(e) => setAdditionalNotes(e.target.value)}></textarea>
                    </div>
                </div>

                <div className={styles.cell_info_box} >
                    <div className={styles.info_title}>
                        {t('infoList.sportsBackground')}
                        <span className={styles.required}>{t('infoList.sportsBackgroundTips')}</span>
                    </div>
                    <div className={styles.info_ipt} style={{ height: '90px', padding: '10px' }}>
                        <textarea placeholder={t('infoList.sportsBackgroundPalceholder')} name="sportsBackground" id="sportsBackground" maxLength={220} onChange={(e) => setSportsBackground(e.target.value)}></textarea>
                    </div>
                </div>

                <div className={styles.cell_info_box} >
                    <div className={styles.info_title}>
                        {t('infoList.psychologicalNotes')}
                        <span className={styles.required}>{t('infoList.psychologicalNotesTips')}</span>
                    </div>
                    <div className={styles.info_ipt} style={{ height: '90px', padding: '10px' }}>
                        <textarea placeholder={t('infoList.psychologicalNotesPalaceholder')} name="psychologicalNotes" id="psychologicalNotes" maxLength={220} onChange={(e) => setPsychologicalNotes(e.target.value)}></textarea>
                    </div>
                </div>
            </div>

            <div className={styles.payment_box}>
                <div className={styles.agree_title}>
                    <input type="checkbox" id="agree" style={{ cursor: 'pointer' }} onChange={(e: any) => setIsAgreed(e.target.checked)} />
                    <div className={styles.agree_text}>
                        {t('agreement')}
                        <span className={styles.protocol}>{t('protocol1')}</span>
                        {t('and')}
                        <span className={styles.protocol}>{t('protocol2')}</span>
                    </div>
                </div>

                <div className={styles.cost_box}>
                    <div className={styles.price}>
                        {group ? `¥${group.cost}` : '¥0'}
                    </div >
                    <div className={styles.pay_btn} onClick={handleNext}>
                        {t('next')}
                    </div >
                </div >
            </div >

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={t(isSubmitted ? 'congratulation' : 'submitting')}
            >
                <div className={styles.modal_content}>
                    {
                        isSubmitted ?
                            <div className={styles.congratulation_box}>
                                <div className={styles.text}>{t('congratulationText')}</div>
                                <div className={styles.go_to_pay} onClick={goToPay}>{t('goToPay')}</div>
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
