const routerList = [
    { name: "home", path: '/' },
    {
        name: "race",
        children: [
            { name: "raceList.race", path: '/race/registration' },
            { name: "raceList.notice", path: '/race/notice' },
        ]
    },
    {
        name: "raceInfo",
        children: [
            { name: "raceInfoList.raceNews", path: '/raceInfo/raceNews' },
            { name: "raceInfoList.gobiStory", path: '/raceInfo/gobiStory' },
        ]
    },
    {
        name: "raceResult",
        children: [
            { name: "raceResultList.personalResult", path: '/raceResult/personal' },
            { name: "raceResultList.teamResult", path: '/raceResult/team' },
        ]
    },
    {
        name: "raceImage",
        children: [
            { name: "raceImageList.selectedAlbum", path: '/raceImage/selectedAlbum' },
            { name: "raceImageList.selectedVideo", path: '/raceImage/selectedVideo' },
        ]
    },
    {
        name: "partner",
        children: [
            { name: "partnerList.joinSchool", path: '/partner/joinSchool' },
            // { name: "partnerList.partner", path: '/partner/partner' },
        ]
    },
    {
        name: "qa",
        children: [
            { name: "qaList.raceQa", path: '/qa/raceQa' },
            { name: "qaList.healthQa", path: '/qa/healthQa' },
        ]
    },
    {
        name: "about",
        children: [
            { name: "aboutList.brandStory", path: '/about/brandStory' },
            { name: "aboutList.internationalGobieCenter", path: '/about/internationalGobieCenter' },
            { name: "aboutList.contactUs", path: '/about/contactUs' },
        ]
    },
]

export default routerList
