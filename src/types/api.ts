declare namespace API {
    interface APIResult<T> {
        error: string
        code: number
        data: T
        msg: string
    }

    // 登录参数
    interface LoginParams {
        email: string
        verificationCode: string
    }
    type LoginResult = APIResult<{
        jwtToken: string
    }>

    // 验证码参数
    interface VerificationCodeParams {
        email: string
        action: string
    }
    type VerificationCodeResult = APIResult<{
        verificationCode: string
    }>
    // 报名历史参数
    interface SignupHistoryParams {
        page: number
        size: number
    }
    type SignupHistoryResult = APIResult<{
        total: number
        signUpList: SignupHistoryItem[]
    }>
    // 报名历史项
    interface SignupHistoryItem {
        id: number
        matchId: number
        matchGroupId: number
        state: number
        name: string
        enName: string
    }
    // 成绩榜单列表参数
    interface ResultRankListParams {
        matchId: number
        matchGroupId: number,
        type: number
    }
    // 成绩榜单列表结果
    type ResultRankListResult = APIResult<{
        rankList: ResultRankListItem[]
    }>
    // 成绩榜单列表项
    interface ResultRankListItem {
        id: number
        name: string
    }
    // 榜单列表详情参数
    interface ResultDetailParams {
        rankId: number
        matchId: number
        type: number
        id: number
    }
    // 榜单列表详情结果
    type ResultRankDetailResult = APIResult<{
        showStopTime: number
        pageCount: number
        rankType: number
        sortType: number
        pageNo: number
        recordCount: number
        header: ResultRankDetailHeader[],
        isSingleSeg: number,
        list: ResultRankDetailItem[],
        isSingleOrWind: number,
        status: number
    }>
    // 成绩榜单详情头
    interface ResultRankDetailHeader {
        title: string
        key: string
    }
    // 成绩榜单详情项
    interface ResultRankDetailItem {
        isMedOut: boolean,
        isCpsOk: boolean,
        tSpeed: string,
        type: string,
        isCloseDoor: boolean,
        vSpeed: string,
        penaltyTime: string,
        lag: string,
        isBowOut: boolean,
        reduceTime: string,
        isRoadFinished: boolean,
        id: string,
        state: string,
        scoreState: string,
        lagRaw: string,
        isValid: boolean,
        indexS: string,
        length: string,
        index: string,
        realTime: number,
        name: string,
        progress: number,
        time: number,
        remark1: string,
        mark: string,
        age: number,
        segScores: Score[]
    }
    // 成绩
    interface Score {
        scoreSegState: string,
        segLength: number,
        segId: number,
        segName: string,
        isValid: number,
        segTimespan: number,
        segRealTimespan: number,
        startTime: number,
        stopTime: number,
        isCloseDoor: number
    }

    // 榜单成绩详情参数
    interface ResultRankDetailParams {
        page: number
        size: number
        rankId: number
        matchId: number
        matchGroupId: number
        keyword?: string
    }
    // 榜单成绩详情结果
    type ResultDetailResult = {
        cmptName: string
        isRelayOrTogether: boolean
        isSingleOrWind: number
        header: ResultRankDetailHeader[]
        isSingleSeg: number
        memberList: ResultMember[]
        raceTimeName: string
        raceTimeType: number
        rankName: string
        roadId: number
        roadName: string
        roadNameEn: string
        roadType: number
        sortType: number
        status: string
        type: string
        totalScore: {
            circle: string
            gender: number
            id: string
            identity_no: string
            indexS: string
            isBowOut: string
            isCpsOk: string
            isKnockedOut: string
            isMedOut: string
            isValid: string
            length: number
            markNo: string
            name: string
            penaltyReason: string
            phone: string
            rank: string
            realTimespan: number
            state: string
            timeSpan_noPenalty: number
            timeSpan_penaltyTime: number
            timespan: number
        }
    }

    // 成员
    interface ResultMember {
        gender: number
        markNo: string
        name: string
        roadName: string
        segs: ResultSeg[]
        userId: number
    }
    // 跑段成绩详情
    interface ResultSeg {
        cmptId: number
        cps: ResultCp[]
        markNo: string
        roadId: number
        segId: string
        segLength: string
        segName: string
        segStartTime: string
        segStopTime: string
        segTimespan: string
    }

    // 跑段成绩详情项
    interface ResultCp {
        circleLengthStr: string
        cpDefeatRatio: string
        cpId: string
        cpIndex: string
        cpLength: string
        cpName: string
        cpRank: number
        cpStartTime: string
        cpStartTime_admin: string
        cpStartTime_admin_ms70: number
        cpStopTime: string
        cpStopTime_admin: string
        cpStopTime_admin_ms70: number
        cpTimespan: string
        segCpName: string
        speed: string
        speedRaw: number
        startCpId: string
        startSegCpName: string
    }

    // 查看个人成绩详情参数
    interface ResultPersonalDetailParams {
        matchId: number
        markNumber: string
    }
    // 查看个人成绩结果
    type ResultPersonalDetailResult = APIResult<{
        result: ResultRankDetailItem
    }>
    // 查看完赛证明参数
    interface CertificateParams {
        matchId: number
        markNumber: string
    }

    interface NewsListParams {
        type?: number
        page: number
        size: number
        tag?: string
        schoolId?: number
    }

    type NewsListItem = {
        id: number
        titleEn: string
        titleZh: string
        tag: string
        type: number
        coverUrl: string
        createdAt: string
        updatedAt: string
        contentEn?: string
        contentZh?: string
        extra?: object // 可选的额外字段
        imageList?: any// 可选的图片列表
        schoolList?: School[]
    }

    type School = {
        id: number
        order: number
        nameEn: string
        nameZh: string
        logoUrl: string
    }

    type NewsLisData = {
        total: number
        articles: NewsListItem[]
    }
    interface NewsListResult {
        data: NewsLisData
        message: any
        code: number
    }

    interface NewsDetail {
        article: NewsListItem
    }

    interface PaymentInfoParams {
        matchSignUpId: number,
        currency?: string
    }


    interface MatchListParams {
        page: number
        size: number
    }

    interface MatchesGroupInfoType {
        cost: number
        geexekMatchGroupId: number
        id: number
        matchId: number
        nameEn: string
        nameZh: string
    }

    interface MatchesListType {
        contact?: string
        coverUrl?: string
        createdAt?: number
        detailEn?: string
        detailZh?: string
        endSignUpDate?: string
        expenseInfoEn?: string
        expenseInfoZh?: string
        geexekMatchId?: number
        groups?: any
        id?: number
        insuranceInfoEn?: string
        insuranceInfoZh?: string
        joinQualificationEn?: string
        joinQualificationZh?: string
        matchDate?: string
        matchManualEn?: string
        matchManualZh?: string
        matchRulesEn?: string
        matchRulesZh?: string
        nameEn?: string
        nameZh?: string
        placeZh?: string
        placeEn?: string
        quitPolicyEn?: string
        quitPolicyZh?: string
        signUpNoticeEn?: string
        signUpNoticeZh?: string
        startSignUpDate?: string
        state?: number
        updatedAt?: number
        pdfUrlEn: string
        pdfUrlZh: string
    }

    type MatchInfoType = {
        matches: Array<MatchesListType>,
        total: number
    }


    interface RegistrationParams {
        matchId: number,
        matchGroupId: number,
        name: string,
        phoneNumber: string,
        birthday: string,
        gender: number,
        credentialType: number,
        credentialNumber: string,
        enName: string,
        nationality: string,
        city: string,
        schoolName: string,
        grade: string,
        hasJoinedBefore: number,
        beforeMatchName: string,
        parentPhoneNumber: string,
        guardianWechat: string,
        parentEmail: string,
        photoUrl?: string,
        credentialPhotoUrl?: string,
        guardianName: string,
        guardianPhoneNumber: string,
        guradianRelationship: string,
        emergencyPhoneNumber: string,
        bloodType: string,
        height: string,
        weight: string,
        shirtSize: string,
        shoeSize: string,
        medicationRestrictions: string,
        dietaryRestrictions: string,
        allergyInformation: string,
        medicalHistory: string,
        additionalNotes: string,
        sportsBackground: string,
        psychologicalNotes: string
    }

    interface RegistrationResult {
        id: string
    }

    interface UploadImageParams {
        file: File | undefined
    }

    interface UploadImageResult {
        imageUrl: string,
        variants: Array<string>
    }

    type SchoolListResult = {
        data: Array<SchoolListItem>
    }

    interface SchoolListItem {
        id: number
        order: number
        nameEn: string
        nameZh: string
        logoUrl: string
        articleCount: number
    }

}
