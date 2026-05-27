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
import countries from '@/utils/countryAreaCode'

type Props = {};

const regexPatterns = {
    phone: /^1[3-9]\d{9}$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    idCard: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
    hkPass: /^[a-zA-Z]\d{6,10}$/,
    passport: /^[a-zA-Z]\d{5,8}$/,
    twPass: /(^\d{8}$)|(^[a-zA-Z]\d{7,9}$)/
};

const agreementList = [
    {
        isAgreed: false
    }, {
        isAgreed: false
    }, {
        isAgreed: false
    }, {
        isAgreed: false
    }, {
        isAgreed: false
    },
]
const Info = (props: Props) => {
    const router = useRouter()
    const { groupInfo } = router.query;
    const { t, i18n } = useTranslation("common", { keyPrefix: "header.registration" });
    const token = useSelector((state: any) => state.commonSlice.token);
    const dispatch = useDispatch()

    const [group, setGroup] = useState<any>();
    const [currentMatchInfo, setCurrentMatchInfo] = useState<API.MatchesListType>();

    const [photoFile, setPhotoFile] = useState<File>();
    const [photoUrl, setPhotoUrl] = useState<string>("");
    const [credentialPhotoFile, setCredentialPhotoFile] = useState<File>();
    const [credentialPhotoUrl, setCredentialPhotoUrl] = useState<string>("");

    const [name, setName] = useState<string>("");
    const [enName, setEnName] = useState<string>("");
    const [gender, setGender] = useState<string>("1");
    const [birthday, setBirthday] = useState<string>("2000-01-01");
    const [credentialType, setCredentialType] = useState<string>("1");
    const [credentialNumber, setCredentialNumber] = useState<string>("");
    const [phoneNumberAreaCode, setPhoneNumberAreaCode] = useState<number>(40);
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [nationality, setNationality] = useState<string>("");
    const [city, setCity] = useState<string>("");
    const [schoolName, setSchoolName] = useState<string>("");
    const [grade, setGrade] = useState<string>("");
    const [bloodType, setBloodType] = useState<string>("A");
    const [height, setHeight] = useState<string>("");
    const [weight, setWeight] = useState<string>("");
    const [shirtSize, setShirtSize] = useState<string>('110');
    const [shoeSize, setShoeSize] = useState<string>("");
    const [hasJoinedBefore, setHasJoinedBefore] = useState<string>("1");
    const [beforeMatchName, setBeforeMatchName] = useState<string>("");
    const [parentPhoneNumberAreaCode, setParentPhoneNumberAreaCode] = useState<number>(40);
    const [parentPhoneNumber, setParentPhoneNumber] = useState<string>("");
    const [parentEmail, setParentEmail] = useState<string>("");
    const [guardianName, setGuardianName] = useState<string>("");
    const [guardianRelationship, setGuardianRelationship] = useState<string>("");
    const [guardianWechat, setGuardianWechat] = useState<string>("");
    const [guardianPhoneNumberAreaCode, setGuardianPhoneNumberAreaCode] = useState<number>(40)
    const [guardianPhoneNumber, setGuardianPhoneNumber] = useState<string>("");
    const [emergencyPhoneNumberAreaCode, setemergencyPhoneNumberAreaCode] = useState<number>(40);
    const [emergencyPhoneNumber, setEmergencyPhoneNumber] = useState<string>("");
    const [medicationRestrictions, setMedicationRestrictions] = useState<string>("");
    const [dietaryRestrictions, setDietaryRestrictions] = useState<string>("");
    const [allergyInformation, setAllergyInformation] = useState<string>("");
    const [medicalHistory, setMedicalHistory] = useState<string>("");
    const [additionalNotes, setAdditionalNotes] = useState<string>("");
    const [sportsBackground, setSportsBackground] = useState<string>("");
    const [psychologicalNotes, setPsychologicalNotes] = useState<string>("");
    const [agreeList, setAgreeList] = useState<any>(agreementList);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [orderId, setOrderId] = useState<string>("");

    const triggerYouMeng = (category: string, action: string, label: string) => {
        (window as any)._czc && (window as any)._czc.push(["_trackEvent", category, action, label]);
    }

    const handleNext = async () => {
        if (!token) return dispatch(addToast({ message: t("loginTips"), timeout: 3000 }));
        if (!agreeList.every((item: any) => item.isAgreed === true)) return dispatch(addToast({ message: t("noAgreement"), timeout: 3000 }));
        if (name != '' && enName != '' && regexPatterns[credentialType === '1' ? 'idCard' : credentialType === '2' ? 'passport' : credentialType === '3' ? 'hkPass' : 'twPass'].test(credentialNumber) && countries[phoneNumberAreaCode].pattern.test(phoneNumber.trim()) && nationality != '' && city != '' && schoolName != '' && grade != '' && bloodType != '' && height != '' && weight != '' && shoeSize != '' && countries[parentPhoneNumberAreaCode].pattern.test(parentPhoneNumber.trim()) && regexPatterns.email.test(parentEmail.trim()) && guardianName != '' && guardianRelationship != '' && countries[guardianPhoneNumberAreaCode].pattern.test(guardianPhoneNumber.trim()) && countries[emergencyPhoneNumberAreaCode].pattern.test(emergencyPhoneNumber.trim()) && medicationRestrictions != '' && dietaryRestrictions != '' && allergyInformation != '' && medicalHistory != '' && photoFile && credentialPhotoFile) {
            if (hasJoinedBefore === "1" && beforeMatchName === '') {
                dispatch(addToast({ message: t("requiredFields"), timeout: 3000 }));
            } else {
                setIsModalOpen(true)

                // upload photoFile
                const uploadRes = await RegistrationAPI.uploadImage({ file: photoFile });
                if (uploadRes.data.code != 0) return dispatch(addToast({ message: uploadRes.data.error, timeout: 3000 }))

                // upload credential photo
                const uploadResC = await RegistrationAPI.uploadImage({ file: credentialPhotoFile });
                if (uploadResC.data.code != 0) return dispatch(addToast({ message: uploadResC.data.error, timeout: 3000 }))

                const data: API.RegistrationParams = {
                    matchGroupId: group?.id,
                    matchId: group?.matchId,
                    name: name,
                    enName: enName,
                    gender: Number(gender),
                    birthday: birthday,
                    credentialType: Number(credentialType),
                    credentialNumber: credentialNumber,
                    phoneNumber: countries[phoneNumberAreaCode].prefix + ' ' + phoneNumber,
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
                    parentPhoneNumber: countries[parentPhoneNumberAreaCode].prefix + ' ' + parentPhoneNumber,
                    parentEmail: parentEmail,
                    guardianName: guardianName,
                    guradianRelationship: guardianRelationship,
                    guardianPhoneNumber: countries[guardianPhoneNumberAreaCode].prefix + ' ' + guardianPhoneNumber,
                    guardianWechat: guardianWechat,
                    emergencyPhoneNumber: countries[emergencyPhoneNumberAreaCode].prefix + ' ' + emergencyPhoneNumber,
                    medicationRestrictions: medicationRestrictions,
                    dietaryRestrictions: dietaryRestrictions,
                    allergyInformation: allergyInformation,
                    medicalHistory: medicalHistory,
                    additionalNotes: additionalNotes,
                    sportsBackground: sportsBackground,
                    psychologicalNotes: psychologicalNotes,
                    photoUrl: uploadRes.data.data.imageUrl,
                    credentialPhotoUrl: uploadResC.data.data.imageUrl
                }

                const res = await RegistrationAPI.submitRegistration(data);
                // console.log("submitForm res", res.data);
                triggerYouMeng("赛事报名页面", '点击', '提交报名信息');
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
            let warningText = "requiredFields"
            if (!countries[phoneNumberAreaCode].pattern.test(phoneNumber.trim())) {
                warningText = "wrongPhonenumber"
            } else if (!countries[parentPhoneNumberAreaCode].pattern.test(parentPhoneNumber.trim())) {
                warningText = "wrongParentPhonenumber"
            } else if (!regexPatterns.email.test(parentEmail.trim())) {
                warningText = "wrongParentEmail"
            } else if (!countries[guardianPhoneNumberAreaCode].pattern.test(guardianPhoneNumber.trim())) {
                warningText = "wrongGuardianPhoneNumber"
            } else if (!countries[emergencyPhoneNumberAreaCode].pattern.test(emergencyPhoneNumber.trim())) {
                warningText = "wrongEmergencyPhoneNumber"
            } else if (!regexPatterns[credentialType === '1' ? 'idCard' : credentialType === '2' ? 'passport' : credentialType === '3' ? 'hkPass' : 'twPass'].test(credentialNumber)) {
                warningText = "wrongCredentialNumber"
            }

            dispatch(addToast({ message: t(warningText as any), timeout: 3000 }));

        }
    }


    const getImgFile = (file: File, isCredentialPhoto: Boolean) => {
        try {
            if (file.size > 1024 * 1024 * 5) {
                dispatch(addToast({ message: t("imgSizeError"), timeout: 3000 }));
                return false;
            }

            if (file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg' || file.type === 'image/webp') {
                const imgReader = new FileReader()

                if (isCredentialPhoto) {
                    setCredentialPhotoFile(file)
                } else {
                    setPhotoFile(file)
                }

                imgReader.onloadend = function (e) {
                    if (isCredentialPhoto) {
                        setCredentialPhotoUrl(imgReader.result as any)
                    } else {
                        setPhotoUrl(imgReader.result as any)

                    }
                };
                imgReader.readAsDataURL(file)
            } else {
                dispatch(addToast({ message: t("imgTypeError"), timeout: 3000 }));
            }
        } catch (e) {

        }

    }

    const goToPay = () => {
        triggerYouMeng("赛事报名页面", '点击', '去付款按钮');
        router.push({
            pathname: '/race/pay',
            query: {
                registrationId: orderId
            }
        })
    }

    useEffect(() => {
        if (groupInfo && token) {
            setGroup(JSON.parse(groupInfo as string));
        } else {
            // router.push('/race/registration');
        }
    }, [groupInfo]);


    const goToProtocol1 = () => {
        window.open('/protocol/matchProtocol.pdf', '_blank');
    }
    const goToProtocol2 = () => {
        window.open('/protocol/matchSafetyProtocol.pdf', '_blank');
    }

    return (
        <div className={styles.info}>
            <MatchDetailCard pageName='detail' groupInfo={group} />
            <div className={styles.group_box}>
                <div className={styles.cell_title}>
                    {t('info')}
                </div>
                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.photoUrl')}
                        <span className={styles.required_symbol}>*</span>
                    </div>
                    <div className={`${styles.info_photo} ${styles.info_ipt}`}
                        onClick={() => {
                            const fileInput = document.getElementById('photoUrlHiddenFile');
                            if (fileInput) (fileInput as HTMLInputElement).click();
                        }}>
                        {
                            photoUrl ?
                                <Image
                                    src={photoUrl}
                                    alt="photoUrl"
                                    width={100}
                                    height={100}
                                    className={styles.photoImage}
                                />
                                :
                                <div className={styles.upload_btn_plus} >+</div>
                        }
                        <input
                            id='photoUrlHiddenFile'
                            type="file"
                            style={{ display: 'none' }}
                            accept='image/png, image/jpeg, image/jpg, image/webp'
                            onChange={(event) => {
                                if (event.target.files && event.target.files[0]) {
                                    getImgFile(event.target.files[0], false);
                                }
                            }}
                        />
                    </div>
                </div>

                {/* INPUT */}
                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.name')}
                        <span className={styles.required_symbol}>*</span>
                        <span className={styles.required}>{t('infoList.nameTips')}</span>
                    </div>
                    <div className={styles.info_ipt}>
                        <input type="text" maxLength={30} onChange={(e) => setName(e.target.value)} />
                    </div>
                </div>

                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.enName')}
                        <span className={styles.required_symbol}>*</span>
                    </div>
                    <div className={styles.info_ipt}>
                        <input type="text" maxLength={30} onChange={(e) => setEnName(e.target.value)} />
                    </div>
                </div>

                {/* SELECT */}
                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.gender')}
                        <span className={styles.required_symbol}>*</span>
                    </div>
                    <div className={styles.info_ipt}>
                        <select name="gender" id="gender" onChange={(e) => setGender(e.target.value)} value={gender}>
                            <option value='1'>{t('infoList.genderList.male')}</option>
                            <option value='2'>{t('infoList.genderList.female')}</option>
                        </select>
                    </div>
                </div>

                {/* DatePicker */}
                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.birthday')}
                        <span className={styles.required_symbol}>*</span>
                    </div>
                    <div className={styles.info_ipt}>
                        <input type="date" name="Date" value={birthday} onChange={(e) => setBirthday(e.target.value)} className={styles.date_ipt} id="id_yy_input" />
                    </div>
                </div>

                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.credentialType')}
                        <span className={styles.required_symbol}>*</span>
                        <span className={styles.required}>{t('infoList.credentialTypeTips')}</span>
                    </div>
                    <div className={styles.info_ipt}>
                        <select name="credentialType" id="credentialType" onChange={(e) => { setCredentialType(e.target.value); setCredentialNumber(JSON.parse(JSON.stringify(''))) }} value={credentialType}>
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
                        <span className={styles.required_symbol}>*</span>
                        <span className={styles.required}>{t(`infoList.credentialNumberTips${credentialType}` as any) as string}</span>
                    </div>
                    <div className={styles.info_ipt}>
                        <input type="text" maxLength={50} value={credentialNumber} onChange={(e) => setCredentialNumber(e.target.value)} />
                    </div>
                </div>

                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t(`infoList.credentialPhotoTips${credentialType}` as any) as string}
                        <span className={styles.required_symbol}>*</span>
                    </div>
                    <div className={`${styles.info_credential_photo} ${styles.info_ipt}`}
                        onClick={() => {
                            const fileInput = document.getElementById('credentialPhotoUrlHiddenFile');
                            if (fileInput) (fileInput as HTMLInputElement).click();
                        }}>
                        {
                            credentialPhotoUrl ?
                                <Image
                                    src={credentialPhotoUrl}
                                    alt="credentialPhotoUrl"
                                    width={100}
                                    height={100}
                                    className={styles.credential_photo_image}
                                />
                                :
                                <div className={styles.upload_btn_plus} >+</div>
                        }
                        <input
                            id='credentialPhotoUrlHiddenFile'
                            type="file"
                            style={{ display: 'none' }}
                            accept='image/png, image/jpeg, image/jpg, image/webp'
                            onChange={(event) => {
                                if (event.target.files && event.target.files[0]) {
                                    getImgFile(event.target.files[0], true);
                                }
                            }}
                        />
                    </div>
                </div>

                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.phoneNumber')}
                        <span className={styles.required_symbol}>*</span>
                    </div>
                    <div className={styles.info_ipt_box}>
                        <div className={styles.info_ipt_prefix}>
                            <select id="selectPhone" className={styles.phone_prefix} name="prefix" onChange={(e) => setPhoneNumberAreaCode(Number(e.target.value))} value={phoneNumberAreaCode}>
                                {
                                    countries.map((item: any, idx) =>
                                        <option value={idx} key={item.code}>
                                            {`${item[i18n.language === 'zh' ? 'name' : 'enName']}(${item.prefix})`}
                                        </option>
                                    )
                                }
                            </select>
                        </div>

                        <div className={styles.info_ipt_co}>
                            <input className={styles.phone_ipt} type="text" maxLength={30} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.nationality')}
                        <span className={styles.required_symbol}>*</span>
                    </div>
                    <div className={styles.info_ipt}>
                        <input type="text" maxLength={30} value={nationality} onChange={(e) => setNationality(e.target.value)} />
                    </div>
                </div>

                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.city')}
                        <span className={styles.required_symbol}>*</span>
                    </div>
                    <div className={styles.info_ipt}>
                        <input type="text" maxLength={30} value={city} onChange={(e) => setCity(e.target.value)} />
                    </div>
                </div>

                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.schoolName')}
                        <span className={styles.required_symbol}>*</span>
                    </div>
                    <div className={styles.info_ipt}>
                        <input type="text" maxLength={30} onChange={(e) => setSchoolName(e.target.value)} />
                    </div>
                </div>

                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.grade')}
                        <span className={styles.required_symbol}>*</span>
                    </div>
                    <div className={styles.info_ipt}>
                        <input type="text" maxLength={30} onChange={(e) => setGrade(e.target.value)} />
                    </div>
                </div>


                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.bloodType')}
                        <span className={styles.required_symbol}>*</span>
                    </div>
                    <div className={styles.info_ipt}>
                        <select name="bloodType" id="bloodType" onChange={(e) => setBloodType(e.target.value)} value={bloodType}>
                            <option value='A'>A</option>
                            <option value='B'>B</option>
                            <option value='AB'>AB</option>
                            <option value='O'> O</option>
                            <option value={t('infoList.genderList.other')}> {t('infoList.genderList.other')}</option>
                        </select>
                    </div>
                </div>

                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.height')}
                        <span className={styles.required}>(cm)</span>
                        <span className={styles.required_symbol}>*</span>
                    </div>
                    <div className={styles.info_ipt}>
                        <input type="text" maxLength={30} onChange={(e) => setHeight(e.target.value)} />
                    </div>
                </div>

                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.weight')}
                        <span className={styles.required}>(kg)</span>
                        <span className={styles.required_symbol}>*</span>
                    </div>
                    <div className={styles.info_ipt}>
                        <input type="text" maxLength={30} onChange={(e) => setWeight(e.target.value)} />
                    </div>
                </div>

                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.shirtSize')}
                        <span className={styles.required}>{t('infoList.shirtsizeTips')}</span>
                        <span className={styles.required_symbol}>*</span>
                    </div>
                    <div className={styles.info_ipt} style={{ justifyContent: 'flex-start' }}>
                        {
                            ['110', '120', '130', '140', '150', '160', '170', '180'].map((size) => (
                                <div className={styles.ipt_radio} key={size} >
                                    <input className={styles.radio_box} type="radio" id={`size-${size}`} name="size" value={size} checked={size === shirtSize} onChange={(e: any) => setShirtSize(e.target.value)} />
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
                        <span className={styles.required_symbol}>*</span>
                    </div>
                    <div className={styles.info_ipt}>
                        <input type="text" maxLength={30} onChange={(e) => setShoeSize(e.target.value)} />
                    </div>
                </div>

                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.hasJoinedBefore')}
                        <span className={styles.required_symbol}>*</span>
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
                                <span className={styles.required_symbol}>*</span>
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
                        <span className={styles.required_symbol}>*</span>
                    </div>

                    <div className={styles.info_ipt_box}>
                        <div className={styles.info_ipt_prefix}>
                            <select className={styles.phone_prefix} name="prefix" id="prefix" onChange={(e) => setParentPhoneNumberAreaCode(Number(e.target.value))} value={parentPhoneNumberAreaCode}>
                                {
                                    countries.map((item: any, idx) =>
                                        <option value={idx} key={item.code}>
                                            {`${item[i18n.language === 'zh' ? 'name' : 'enName']}(${item.prefix})`}
                                        </option>
                                    )
                                }
                            </select>
                        </div>

                        <div className={styles.info_ipt_co}>
                            <input className={styles.phone_ipt} type="text" maxLength={30} value={parentPhoneNumber} onChange={(e) => setParentPhoneNumber(e.target.value)} />
                        </div>
                    </div>
                </div>



                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.parentEmail')}
                        <span className={styles.required_symbol}>*</span>
                    </div>
                    <div className={styles.info_ipt}>
                        <input type="text" maxLength={30} onChange={(e) => setParentEmail(e.target.value)} />
                    </div>
                </div>



                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.guardianName')}
                        <span className={styles.required_symbol}>*</span>
                    </div>
                    <div className={styles.info_ipt}>
                        <input type="text" maxLength={30} onChange={(e) => setGuardianName(e.target.value)} />
                    </div>
                </div>


                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.guardianRelationship')}
                        <span className={styles.required_symbol}>*</span>
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
                        <span className={styles.required_symbol}>*</span>
                    </div>

                    <div className={styles.info_ipt_box}>
                        <div className={styles.info_ipt_prefix}>
                            <select className={styles.phone_prefix} name="prefix" id="prefix" onChange={(e) => setGuardianPhoneNumberAreaCode(Number(e.target.value))} value={guardianPhoneNumberAreaCode}>
                                {
                                    countries.map((item: any, idx) =>
                                        <option value={idx} key={item.code}>
                                            {`${item[i18n.language === 'zh' ? 'name' : 'enName']}(${item.prefix})`}
                                        </option>
                                    )
                                }
                            </select>
                        </div>

                        <div className={styles.info_ipt_co}>
                            <input className={styles.phone_ipt} type="text" maxLength={30} value={guardianPhoneNumber} onChange={(e) => setGuardianPhoneNumber(e.target.value)} />
                        </div>
                    </div>
                </div>


                <div className={styles.cell_info_box}>
                    <div className={styles.info_title}>
                        {t('infoList.emergencyPhoneNumber')}
                        <span className={styles.required_symbol}>*</span>
                    </div>
                    <div className={styles.info_ipt_box}>
                        <div className={styles.info_ipt_prefix}>
                            <select className={styles.phone_prefix} name="prefix" id="prefix" onChange={(e) => setemergencyPhoneNumberAreaCode(Number(e.target.value))} value={emergencyPhoneNumberAreaCode}>
                                {
                                    countries.map((item: any, idx) =>
                                        <option value={idx} key={item.code}>
                                            {`${item[i18n.language === 'zh' ? 'name' : 'enName']}(${item.prefix})`}
                                        </option>
                                    )
                                }
                            </select>
                        </div>

                        <div className={styles.info_ipt_co}>
                            <input className={styles.phone_ipt} type="text" maxLength={30} value={emergencyPhoneNumber} onChange={(e) => setEmergencyPhoneNumber(e.target.value)} />
                        </div>
                    </div>

                </div>


                {/* TEXTAREA */}
                <div className={styles.cell_info_box} >
                    <div className={styles.info_title}>
                        {t('infoList.medicationRestrictions')}
                        <span className={styles.required_symbol}>*</span>
                    </div>
                    <div className={styles.info_ipt} style={{ height: '90px', padding: '10px' }}>
                        <textarea name="medicationRestrictions" id="medicationRestrictions" maxLength={220} onChange={(e) => setMedicationRestrictions(e.target.value)}></textarea>
                    </div>
                </div>

                <div className={styles.cell_info_box} >
                    <div className={styles.info_title}>
                        {t('infoList.dietaryRestrictions')}
                        <span className={styles.required_symbol}>*</span>
                    </div>
                    <div className={styles.info_ipt} style={{ height: '90px', padding: '10px' }}>
                        <textarea name="dietaryRestrictions" id="dietaryRestrictions" maxLength={220} onChange={(e) => setDietaryRestrictions(e.target.value)}></textarea>
                    </div>
                </div>

                <div className={styles.cell_info_box} >
                    <div className={styles.info_title}>
                        {t('infoList.allergyInformation')}
                        <span className={styles.required_symbol}>*</span>
                    </div>
                    <div className={styles.info_ipt} style={{ height: '90px', padding: '10px' }}>
                        <textarea name="allergyInformation" id="allergyInformation" maxLength={220} onChange={(e) => setAllergyInformation(e.target.value)}></textarea>
                    </div>
                </div>

                <div className={styles.cell_info_box} >
                    <div className={styles.info_title}>
                        {t('infoList.medicalHistory')}
                        <span className={styles.required_symbol}>*</span>
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
                    <div className={styles.agree_text_title}>
                        {t('agreementTitle')}
                    </div>
                </div>

                {
                    agreeList.map((item: any, idx: number) => (
                        <div className={styles.agree_title} key={idx}>
                            <input type="checkbox" id={`agree${idx}`} style={{ cursor: 'pointer' }} onChange={(e: any) => {
                                let curList = agreeList
                                curList[idx].isAgreed = e.target.checked
                                setAgreeList(JSON.parse(JSON.stringify(curList)))
                            }} />
                            <div className={styles.agree_text}>
                                {
                                    idx === 4 ?
                                        <>
                                            {t('agreement')}
                                            <span className={styles.protocol} onClick={goToProtocol1}>{t('protocol1')}</span>
                                            {t('and')}
                                            <span className={styles.protocol} onClick={goToProtocol2}>{t('protocol2')}</span>
                                            {t('suffix')}
                                        </>
                                        :
                                        <> {t(`agreement${idx + 1}` as any) as string}</>
                                }
                            </div>

                        </div>
                    ))
                }

                <div className={styles.cost_box}>
                    <div className={styles.price}>
                        {group && group.cost > 0 ? `¥${group.cost}` : ''}
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
