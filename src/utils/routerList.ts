
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
            { name: "raceImageList.selectedLive", path: '/raceImage/selectedLive' },
        ]
    },
    { name: "museum", path: '/museum' },
    { name: "partner", path: '/partner/joinSchool' },
    { name: "qa", path: '/qa' },
    {
        name: "about",
        children: [
            { name: "aboutList.brandStory", path: '/about/brandStory' },
            { name: "aboutList.creator", path: '/about/creator' },
            // { name: "aboutList.internationalGobieCenter", path: '/about/internationalGobieCenter' },
            { name: "aboutList.contactUs", path: '/about/contactUs' },
            { name: "aboutList.officialWebsite", path: "", link: 'https://www.ultragobiseries.com/' },
            { name: "aboutList.resources", path: '/resources' },
        ]
    },
]

export default routerList
