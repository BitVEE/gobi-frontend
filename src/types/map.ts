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