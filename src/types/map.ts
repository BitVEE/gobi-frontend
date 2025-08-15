// 报名状态
export enum SignupStateValue {
    ALL = 'all',
    WAIT_PAY = 'waitPay',
    PAY_SUCCESS = 'paySuccess',
    REFUND = 'refund',
    PAY_FAIL = 'payFail'
}
// 报名状态映射
export type SignupStateMapType = Record<number, SignupStateValue>;
export const SignupStateMap: SignupStateMapType = {
    0: SignupStateValue.ALL,
    1: SignupStateValue.WAIT_PAY,
    2: SignupStateValue.PAY_SUCCESS,
    3: SignupStateValue.REFUND,
    4: SignupStateValue.PAY_FAIL
};

// 成绩榜单类型
export enum ResultRankTypeValue {
    PersonalTotalRank = "个人总榜",
    MenTotalRank = "男子总榜",
    MenFirstDayRank = "第一天男榜",
    MenSecondDayRank = "第二天男榜",
    MenThirdDayRank = "第三天男榜",
    WomenTotalRank = "女子总榜",
    WomenFirstDayRank = "第一天女榜",
    WomenSecondDayRank = "第二天女榜",
    WomenThirdDayRank = "第三天女榜",
    TeamTotalRank = "团队总榜",
    TeamFirstDayRank = "第一天团队榜",
    TeamSecondDayRank = "第二天团队榜",
    TeamThirdDayRank = "第三天团队榜"
}

// 创建反向映射对象
const chineseToRankType: Record<string, keyof typeof ResultRankTypeValue> = {};

for (const key in ResultRankTypeValue) {
    if (Object.prototype.hasOwnProperty.call(ResultRankTypeValue, key)) {
        const value = ResultRankTypeValue[key as keyof typeof ResultRankTypeValue];
        chineseToRankType[value] = key as keyof typeof ResultRankTypeValue;
    }
}

/**
 * 根据中文名称获取对应的枚举键
 * @param chineseName 中文名称
 * @returns 对应的枚举键，未找到则返回 undefined
 */
export function getRankTypeByChinese(chineseName: string): keyof typeof ResultRankTypeValue | undefined {
    return chineseToRankType[chineseName];
}

// 完赛状态映射
export enum CompletionStateValue {
    all = '全部',
    completed = '完赛',
    notCompleted = '未完赛'
}

// 创建反向映射对象
const chineseToCompletionState: Record<string, keyof typeof CompletionStateValue> = {};

for (const key in CompletionStateValue) {
    if (Object.prototype.hasOwnProperty.call(CompletionStateValue, key)) {
        const value = CompletionStateValue[key as keyof typeof CompletionStateValue];
        chineseToCompletionState[value] = key as keyof typeof CompletionStateValue;
    }
}

/**
 * 根据中文名称获取对应的枚举键
 * @param chineseName 中文名称
 * @returns 对应的枚举键，未找到则返回 undefined
 */
export function getCompletionStateByChinese(chineseName: string): keyof typeof CompletionStateValue | undefined {
    return chineseToCompletionState[chineseName];
}

// 性别映射
export enum GenderValue {
    all = '全部',
    male = '男',
    female = '女'
}
// 创建反向映射对象
const chineseToGender: Record<string, keyof typeof GenderValue> = {};

for (const key in GenderValue) {
    if (Object.prototype.hasOwnProperty.call(GenderValue, key)) {
        const value = GenderValue[key as keyof typeof GenderValue];
        chineseToGender[value] = key as keyof typeof GenderValue;
    }
}

/**
 * 根据中文名称获取对应的枚举键
 * @param chineseName 中文名称
 * @returns 对应的枚举键，未找到则返回 undefined
 */
export function getGenderByChinese(chineseName: string): keyof typeof GenderValue | undefined {
    return chineseToGender[chineseName];
}