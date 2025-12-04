import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { addToast } from "@/redux/slice/toastSlice";
import { MatchAPI, SchoolAPI, UserMatchDocumentAPI } from "@/api";
import SelectDropdown from "@/components/SelectDropdown";
import Image from "next/image";
import styles from "./bindProfile.module.scss";

export interface ParticipantForm {
    raceId: string | number;
    groupId: string | number;
    participantNumber: string;
}

export interface BindProfileProps {
    onSubmit?: (data: { participantForms: ParticipantForm[]; schoolId: string | number }) => Promise<void> | void;
    onSkip?: () => void;
    showSkipButton?: boolean;
    redirectPath?: string; // 提交或跳过后的跳转路径，默认为首页
}

const BindProfile: React.FC<BindProfileProps> = ({
    onSubmit,
    onSkip,
    showSkipButton = true,
    redirectPath,
}) => {
    const { t, i18n } = useTranslation("common");
    const router = useRouter();
    const dispatch = useDispatch();

    // 绑定档案相关状态
    const [participantForms, setParticipantForms] = useState<ParticipantForm[]>([
        { raceId: "", groupId: "", participantNumber: "" }
    ]);
    const [schoolId, setSchoolId] = useState<string | number>("");
    const [matchList, setMatchList] = useState<API.MatchesListType[]>([]);
    const [schoolList, setSchoolList] = useState<API.SchoolListItem[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bindErrors, setBindErrors] = useState<{
        participantForms?: boolean;
        schoolId?: boolean;
    }>({});

    // 流程步骤状态: 'form' | 'querying' | 'result' | 'binding' | 'success' | 'error' | 'notFound'
    const [step, setStep] = useState<'form' | 'querying' | 'result' | 'binding' | 'success' | 'error' | 'notFound'>('form');
    const [queryResults, setQueryResults] = useState<API.UserInfoByMarkNumberResultItem[]>([]);
    const [bindErrorInfo, setBindErrorInfo] = useState<{ name?: string; markNumber?: string }>({});

    // 获取赛事列表和学校列表
    useEffect(() => {
        fetchBindData();
    }, []);

    const fetchBindData = async () => {
        if (loadingData) return;
        setLoadingData(true);
        try {
            const [matchRes, schoolRes] = await Promise.all([
                MatchAPI.getMatchList({ page: 1, size: 100 }),
                SchoolAPI.getSchoolList()
            ]);

            if (matchRes.data.code === 0) {
                const data = matchRes.data.data as API.MatchInfoType | null;
                if (data) {
                    setMatchList(data.matches);
                }
            }

            if (schoolRes.data.code === 0) {
                setSchoolList(schoolRes.data.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch bind data:", error);
        } finally {
            setLoadingData(false);
        }
    };

    // 绑定档案相关函数
    const handleAddMore = () => {
        setParticipantForms([
            ...participantForms,
            { raceId: "", groupId: "", participantNumber: "" }
        ]);
    };

    const handleRemove = (index: number) => {
        if (participantForms.length === 1) {
            // 至少保留一项
            return;
        }
        const newForms = participantForms.filter((_, idx) => idx !== index);
        setParticipantForms(newForms);
    };

    const updateParticipantForm = (index: number, field: keyof ParticipantForm, value: string | number) => {
        const newForms = [...participantForms];
        newForms[index] = { ...newForms[index], [field]: value };
        // 如果选择了赛事，重置组别
        if (field === 'raceId') {
            newForms[index].groupId = "";
        }
        setParticipantForms(newForms);
    };

    const handleSkip = () => {
        if (onSkip) {
            // 如果传入了自定义回调，使用自定义回调
            onSkip();
        } else {
            // 默认行为：跳转到指定路径或首页
            const path = redirectPath || '/' + router.locale;
            router.push(path);
        }
    };

    // 查询用户报名信息
    const handleQueryUserInfo = async () => {
        // 验证表单
        const hasEmptyForm = participantForms.some(
            form => !form.raceId || !form.groupId || !form.participantNumber
        );

        if (hasEmptyForm) {
            setBindErrors({ participantForms: true });
            dispatch(addToast({
                message: t("bindProfile.participantFormsError" as any)
            }));
            return;
        }

        if (!schoolId) {
            setBindErrors({ schoolId: true });
            dispatch(addToast({
                message: t("bindProfile.schoolError" as any)
            }));
            return;
        }

        setBindErrors({});
        setStep('querying');
        setIsSubmitting(true);

        try {
            // 构建查询参数
            const queryParams: API.UserInfoByMarkNumberParams = {
                data: participantForms.map(form => ({
                    matchId: Number(form.raceId),
                    matchGroupId: Number(form.groupId),
                    markNumber: form.participantNumber
                }))
            };

            const response = await UserMatchDocumentAPI.getUserInfoByMarkNumber(queryParams);

            if (response.data.code === 0 && response.data.data && response.data.data.data) {
                const results = response.data.data.data;
                setQueryResults(results);

                if (results.length === 0) {
                    setStep('notFound');
                } else {
                    setStep('result');
                }
            } else {
                setStep('notFound');
            }
        } catch (error) {
            console.error("Failed to query user info:", error);
            setStep('notFound');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 绑定档案
    const handleBindDocument = async () => {
        setStep('binding');
        setIsSubmitting(true);

        try {
            // 构建绑定参数
            const bindParams: API.AddMatchDocumentParams = {
                documentList: queryResults.map(result => ({
                    matchId: result.matchId,
                    matchGroupId: result.matchGroupId,
                    markNumber: result.markNumber,
                    name: result.name,
                    gender: result.gender
                })),
                schoolId: Number(schoolId)
            };

            const response = await UserMatchDocumentAPI.addMatchDocument(bindParams);

            if (response.data.code === 0) {
                setStep('success');
            } else {
                // 绑定失败，保存错误信息用于显示
                if (queryResults.length > 0) {
                    setBindErrorInfo({
                        name: queryResults[0].name,
                        markNumber: queryResults[0].markNumber
                    });
                }
                setStep('error');
            }
        } catch (error: any) {
            console.error("Failed to bind document:", error);
            // 绑定失败，保存错误信息用于显示
            if (queryResults.length > 0) {
                setBindErrorInfo({
                    name: queryResults[0].name,
                    markNumber: queryResults[0].markNumber
                });
            }
            setStep('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 重新填写
    const handleReset = () => {
        setStep('form');
        setQueryResults([]);
        setBindErrorInfo({});
    };

    // 知道了（成功/失败后）
    const handleConfirm = () => {
        if (step === 'success') {
            // 成功后的跳转
            if (onSubmit) {
                onSubmit({ participantForms, schoolId });
            } else {
                const path = redirectPath || '/' + router.locale;
                router.push(path);
            }
        } else {
            // 失败后返回表单
            handleReset();
        }
    };

    // 获取赛事选项
    const getRaceOptions = (): Array<{ label: string; value: string | number }> => {
        const options: Array<{ label: string; value: string | number }> = [{ label: t("bindProfile.selectRacePlaceholder" as any), value: "" }];
        matchList.forEach(match => {
            const name = i18n.language === 'zh' ? match.nameZh : match.nameEn;
            if (name && match.id) {
                options.push({ label: name, value: match.id });
            }
        });
        return options;
    };

    // 获取组别选项
    const getGroupOptions = (raceId: string | number): Array<{ label: string; value: string | number }> => {
        const options: Array<{ label: string; value: string | number }> = [{ label: t("bindProfile.selectGroupPlaceholder" as any), value: "" }];
        if (!raceId) return options;

        const match = matchList.find(m => m.id === raceId);
        if (match && match.groups) {
            match.groups.forEach((group: API.MatchesGroupInfoType) => {
                const name = i18n.language === 'zh' ? group.nameZh : group.nameEn;
                if (name && group.id) {
                    options.push({ label: name, value: group.id });
                }
            });
        }
        return options;
    };

    // 获取学校选项
    const getSchoolOptions = (): Array<{ label: string; value: string | number }> => {
        const options: Array<{ label: string; value: string | number }> = [{ label: t("bindProfile.selectSchoolPlaceholder" as any), value: "" }];
        schoolList.forEach(school => {
            const name = i18n.language === 'zh' ? school.nameZh : school.nameEn;
            if (name) {
                options.push({ label: name, value: school.id });
            }
        });
        return options;
    };

    // 获取性别文本
    const getGenderText = (gender: number): string => {
        if (gender === 1) return t("bindProfile.gender.male" as any);
        if (gender === 2) return t("bindProfile.gender.female" as any);
        return t("bindProfile.gender.other" as any);
    };

    // 获取组别名称
    const getGroupName = (matchId: number, matchGroupId: number): string => {
        const match = matchList.find(m => m.id === matchId);
        if (match && match.groups) {
            const group = match.groups.find((g: API.MatchesGroupInfoType) => g.id === matchGroupId);
            if (group) {
                return i18n.language === 'zh' ? group.nameZh : group.nameEn;
            }
        }
        return '';
    };


    // 渲染表单步骤
    const renderFormStep = () => (
        <>
            {/* 说明文字 */}
            <div className={styles.description}>
                <p>
                    {t("bindProfile.description" as any)}{" "}
                    <a href="/protocol/user.pdf" className={styles.privacyLink}>{t("bindProfile.privacyPolicy" as any)}</a>
                </p>
            </div>

            {/* 参赛号部分 */}
            <div className={styles.formSection}>
                <div className={styles.labelRow}>
                    <label className={styles.label}>
                        {t("bindProfile.raceNumberLabel" as any)} <span className={styles.required}>{t("bindProfile.required" as any)}</span>
                    </label>
                    <span className={styles.hint}>{t("bindProfile.raceNumberHint" as any)}</span>
                </div>

                {participantForms.map((form, index) => (
                    <div key={index} className={styles.inputRow}>
                        <div className={styles.inputFields}>
                            <SelectDropdown
                                value={form.raceId}
                                options={getRaceOptions()}
                                onChange={(value) => updateParticipantForm(index, "raceId", value)}
                                placeholder={t("bindProfile.selectRacePlaceholder" as any)}
                            />
                            <SelectDropdown
                                value={form.groupId}
                                options={getGroupOptions(form.raceId)}
                                onChange={(value) => updateParticipantForm(index, "groupId", value)}
                                placeholder={t("bindProfile.selectGroupPlaceholder" as any)}
                                disabled={!form.raceId}
                            />
                            <input
                                type="text"
                                className={styles.textInput}
                                placeholder={t("bindProfile.participantNumberPlaceholder" as any)}
                                value={form.participantNumber}
                                onChange={(e) => updateParticipantForm(index, "participantNumber", e.target.value)}
                            />
                        </div>
                        <button
                            type="button"
                            className={styles.removeButton}
                            onClick={() => handleRemove(index)}
                            disabled={participantForms.length === 1}
                            aria-label={t("bindProfile.deleteParticipantAria" as any)}
                        >
                        </button>
                    </div>
                ))}

                <button
                    type="button"
                    className={styles.addMoreButton}
                    onClick={handleAddMore}
                >
                    {t("bindProfile.addMoreButton" as any)}
                </button>

                <p className={styles.addMoreHint}>
                    {t("bindProfile.addMoreHint" as any)}
                </p>
                {bindErrors.participantForms && (
                    <div className={styles.errorMessage}>
                        {t("bindProfile.participantFormsError" as any)}
                    </div>
                )}
            </div>

            {/* 参赛学校部分 */}
            <div className={styles.formSection}>
                <div className={styles.labelRow}>
                    <label className={styles.label}>
                        {t("bindProfile.schoolLabel" as any)} <span className={styles.required}>{t("bindProfile.required" as any)}</span>
                    </label>
                </div>

                <div className={styles.inputRow}>
                    <SelectDropdown
                        style={{ width: "100%" }}
                        value={schoolId}
                        options={getSchoolOptions()}
                        onChange={setSchoolId}
                        placeholder={t("bindProfile.selectSchoolPlaceholder" as any)}
                    />
                </div>
                {bindErrors.schoolId && (
                    <div className={styles.errorMessage}>
                        {t("bindProfile.schoolError" as any)}
                    </div>
                )}
            </div>

            {/* 底部按钮 */}
            <div className={styles.actionButtons}>
                {showSkipButton && (
                    <button
                        type="button"
                        className={styles.skipButton}
                        onClick={handleSkip}
                        disabled={isSubmitting || loadingData}
                    >
                        {t("bindProfile.skipButton" as any)}
                    </button>
                )}
                <button
                    type="button"
                    className={styles.nextButton}
                    onClick={handleQueryUserInfo}
                    disabled={isSubmitting || loadingData}
                >
                    {isSubmitting && (
                        <Image
                            src='/images/icons/loading-white.svg'
                            alt="loading"
                            width={20}
                            height={20}
                            className={styles.spinner}
                        />
                    )}
                    {t("header.registration.next")}
                </button>
            </div>
        </>
    );

    // 渲染查询中状态
    const renderQueryingStep = () => (
        <div className={styles.loadingContainer}>
            <Image
                src='/images/icons/loading.svg'
                alt="loading"
                width={40}
                height={40}
            />
            <p className={styles.loadingText}>{t("bindProfile.querying" as any)}</p>
        </div>
    );

    // 渲染查询结果（单条或多条）
    const renderResultStep = () => {
        const isMultiple = queryResults.length > 1;
        return (
            <>
                <div className={styles.resultHeader}>
                    <p className={styles.resultTitle}>
                        {isMultiple
                            ? t("bindProfile.foundMultiple" as any)
                            : t("bindProfile.foundSingle" as any)
                        }
                    </p>
                </div>

                <div className={styles.resultList}>
                    {queryResults.map((result, index) => (
                        <div key={index} className={styles.resultItem}>
                            <div className={styles.resultField}>
                                <div className={styles.resultValue}>{result.name}</div>
                                <div className={styles.resultLabel}>{t("bindProfile.name" as any)}</div>
                            </div>
                            <div className={styles.resultDivider}></div>
                            <div className={styles.resultField}>
                                <div className={styles.resultValue}>{getGenderText(result.gender)}</div>
                                <div className={styles.resultLabel}>{t("bindProfile.genderLabel" as any)}</div>
                            </div>
                            <div className={styles.resultDivider}></div>
                            <div className={styles.resultField}>
                                <div className={styles.resultValue}>{result.markNumber}</div>
                                <div className={styles.resultLabel}>{t("bindProfile.markNumber" as any)}</div>
                            </div>
                            <div className={styles.resultDivider}></div>
                            <div className={styles.resultField}>
                                <div className={styles.resultValue}>{getGroupName(result.matchId, result.matchGroupId)}</div>
                                <div className={styles.resultLabel}>{t("bindProfile.group" as any)}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.actionButtons}>
                    <button
                        type="button"
                        className={styles.bindButton}
                        onClick={handleBindDocument}
                        disabled={isSubmitting}
                    >
                        {isSubmitting && (
                            <Image
                                src='/images/icons/loading-white.svg'
                                alt="loading"
                                width={20}
                                height={20}
                                className={styles.spinner}
                            />
                        )}
                        {t("bindProfile.bindDocument" as any)}
                    </button>
                </div>
            </>
        );
    };

    // 渲染未找到结果
    const renderNotFoundStep = () => (
        <>
            <div className={styles.notFoundImage}>
                <Image
                    src='/images/404.png'
                    alt="not found"
                    width={335}
                    height={209}
                />
            </div>
            <div className={styles.notFoundText}>
                <p>{t("bindProfile.notFoundText" as any)}</p>
            </div>
            <div className={styles.actionButtons}>
                <button
                    type="button"
                    className={styles.resetButton}
                    onClick={handleReset}
                >
                    {t("bindProfile.resetForm" as any)}
                </button>
            </div>
        </>
    );

    // 渲染绑定成功
    const renderSuccessStep = () => {
        const firstName = queryResults.length > 0 ? queryResults[0].name : '';
        let successText = t("bindProfile.bindSuccessText" as any);
        successText = successText.replace('{{name}}', `<strong>${firstName}</strong>`);
        return (
            <>
                <div className={styles.successImage}>
                    <Image
                        src='/images/result_query/success.png'
                        alt="success"
                        width={335}
                        height={209}
                    />
                </div>
                <div className={styles.successContent}>
                    <h2 className={styles.successTitle}>{t("bindProfile.bindSuccessTitle" as any)}</h2>
                    <p className={styles.successText} dangerouslySetInnerHTML={{ __html: successText }}></p>
                </div>
                <div className={styles.actionButtons}>
                    <button
                        type="button"
                        className={styles.confirmButton}
                        onClick={handleConfirm}
                    >
                        {t("bindProfile.confirm" as any)}
                    </button>
                </div>
            </>
        );
    };

    // 渲染绑定失败
    const renderErrorStep = () => {
        const errorName = bindErrorInfo.name || (queryResults.length > 0 ? queryResults[0].name : '');
        const errorMarkNumber = bindErrorInfo.markNumber || (queryResults.length > 0 ? queryResults[0].markNumber : '');
        let errorText = t("bindProfile.bindErrorText" as any);
        errorText = errorText.replace('{{name}}', `<strong>${errorName}</strong>`);
        errorText = errorText.replace('{{markNumber}}', `<strong>${errorMarkNumber}</strong>`);
        return (
            <>
                <div className={styles.errorImage}>
                    <Image
                        src='/images/403.png'
                        alt="error"
                        width={335}
                        height={209}
                    />
                </div>
                <div className={styles.errorContent}>
                    <h2 className={styles.errorTitle}>{t("bindProfile.bindErrorTitle" as any)}</h2>
                    <p className={styles.errorText} dangerouslySetInnerHTML={{ __html: errorText }}></p>
                </div>
                <div className={styles.actionButtons}>
                    <button
                        type="button"
                        className={styles.confirmButton}
                        onClick={handleConfirm}
                    >
                        {t("bindProfile.confirm" as any)}
                    </button>
                </div>
            </>
        );
    };

    return (
        <div className={styles.bindContainer}>
            {/* 标题部分 */}
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <h1 className={styles.title}>{t("bindProfile.title" as any)}</h1>
                    <div className={styles.titleUnderline}></div>
                </div>
            </div>

            {/* 根据步骤渲染不同内容 */}
            {step === 'form' && renderFormStep()}
            {step === 'querying' && renderQueryingStep()}
            {step === 'result' && renderResultStep()}
            {step === 'binding' && renderQueryingStep()}
            {step === 'notFound' && renderNotFoundStep()}
            {step === 'success' && renderSuccessStep()}
            {step === 'error' && renderErrorStep()}
        </div>
    );
};

export default BindProfile;

