export const SITE_ORIGIN = 'https://youthultragobi.exploring.cn';

export type ShareMetaKey =
  | 'home'
  | 'raceRegistration'
  | 'raceNotice'
  | 'raceInfo'
  | 'racePay'
  | 'raceNews'
  | 'gobiStory'
  | 'raceInfoDetail'
  | 'personalResult'
  | 'teamResult'
  | 'resultDetail'
  | 'selectedAlbum'
  | 'selectedVideo'
  | 'selectedLive'
  | 'raceImageDetail'
  | 'museum'
  | 'museumDetail'
  | 'joinSchool'
  | 'qa'
  | 'brandStory'
  | 'creator'
  | 'contactUs'
  | 'resources'
  | 'resourceSuccess'
  | 'resourceDownload'
  | 'login'
  | 'user';

const SHARE_ROUTE_MAP: Record<string, ShareMetaKey> = {
  '/': 'home',
  '/race/registration': 'raceRegistration',
  '/race/notice': 'raceNotice',
  '/race/info': 'raceInfo',
  '/race/pay': 'racePay',
  '/raceInfo/raceNews': 'raceNews',
  '/raceInfo/gobiStory': 'gobiStory',
  '/raceInfo/detail': 'raceInfoDetail',
  '/raceResult/personal': 'personalResult',
  '/raceResult/team': 'teamResult',
  '/raceResult/detail': 'resultDetail',
  '/raceImage/selectedAlbum': 'selectedAlbum',
  '/raceImage/selectedVideo': 'selectedVideo',
  '/raceImage/selectedLive': 'selectedLive',
  '/raceImage/detail': 'raceImageDetail',
  '/museum': 'museum',
  '/partner/joinSchool': 'joinSchool',
  '/qa': 'qa',
  '/about/brandStory': 'brandStory',
  '/about/creator': 'creator',
  '/about/contactUs': 'contactUs',
  '/resources': 'resources',
  '/resources/success': 'resourceSuccess',
  '/resources/download': 'resourceDownload',
  '/login': 'login',
  '/user': 'user',
};

interface ShareImageAsset {
  path: string;
  type: 'image/jpeg' | 'image/png';
  width: number;
  height: number;
}

const HOME_SHARE_IMAGE: ShareImageAsset = {
  path: '/images/home/poster.png',
  type: 'image/png',
  width: 1440,
  height: 779,
};

const REGISTRATION_SHARE_IMAGE: ShareImageAsset = {
  path: '/images/title_bg/registration.png',
  type: 'image/png',
  width: 1440,
  height: 443,
};

const RACE_INFO_SHARE_IMAGE: ShareImageAsset = {
  path: '/images/title_bg/race_info_page_bg.png',
  type: 'image/png',
  width: 1440,
  height: 443,
};

const RACE_RESULT_SHARE_IMAGE: ShareImageAsset = {
  path: '/images/title_bg/race_result_page_bg.png',
  type: 'image/png',
  width: 1440,
  height: 443,
};

const RACE_IMAGE_SHARE_IMAGE: ShareImageAsset = {
  path: '/images/title_bg/race_image_page_bg.png',
  type: 'image/png',
  width: 1440,
  height: 443,
};

const MUSEUM_SHARE_IMAGE: ShareImageAsset = {
  path: '/images/title_bg/museum.jpg',
  type: 'image/jpeg',
  width: 1440,
  height: 960,
};

const PARTNER_SHARE_IMAGE: ShareImageAsset = {
  path: '/images/partner/flags.png',
  type: 'image/png',
  width: 1440,
  height: 443,
};

const QA_SHARE_IMAGE: ShareImageAsset = {
  path: '/images/q%26a/qa_header.png',
  type: 'image/png',
  width: 1440,
  height: 443,
};

const ABOUT_SHARE_IMAGE: ShareImageAsset = {
  path: '/images/about/header.png',
  type: 'image/png',
  width: 1440,
  height: 443,
};

const RESOURCE_SHARE_IMAGE: ShareImageAsset = {
  path: '/images/resources/hero.jpg',
  type: 'image/jpeg',
  width: 3402,
  height: 2268,
};

const SHARE_IMAGE_MAP: Record<ShareMetaKey, ShareImageAsset> = {
  home: HOME_SHARE_IMAGE,
  raceRegistration: REGISTRATION_SHARE_IMAGE,
  raceNotice: REGISTRATION_SHARE_IMAGE,
  raceInfo: REGISTRATION_SHARE_IMAGE,
  racePay: REGISTRATION_SHARE_IMAGE,
  raceNews: RACE_INFO_SHARE_IMAGE,
  gobiStory: RACE_INFO_SHARE_IMAGE,
  raceInfoDetail: RACE_INFO_SHARE_IMAGE,
  personalResult: RACE_RESULT_SHARE_IMAGE,
  teamResult: RACE_RESULT_SHARE_IMAGE,
  resultDetail: RACE_RESULT_SHARE_IMAGE,
  selectedAlbum: RACE_IMAGE_SHARE_IMAGE,
  selectedVideo: RACE_IMAGE_SHARE_IMAGE,
  selectedLive: RACE_IMAGE_SHARE_IMAGE,
  raceImageDetail: RACE_IMAGE_SHARE_IMAGE,
  museum: MUSEUM_SHARE_IMAGE,
  museumDetail: MUSEUM_SHARE_IMAGE,
  joinSchool: PARTNER_SHARE_IMAGE,
  qa: QA_SHARE_IMAGE,
  brandStory: ABOUT_SHARE_IMAGE,
  creator: ABOUT_SHARE_IMAGE,
  contactUs: ABOUT_SHARE_IMAGE,
  resources: RESOURCE_SHARE_IMAGE,
  resourceSuccess: RESOURCE_SHARE_IMAGE,
  resourceDownload: RESOURCE_SHARE_IMAGE,
  login: {
    path: '/images/title_bg/login_page_bg.png',
    type: 'image/png',
    width: 1440,
    height: 920,
  },
  user: {
    path: '/images/title_bg/user_page_bg.png',
    type: 'image/png',
    width: 1440,
    height: 443,
  },
};

const NO_INDEX_PATHNAMES = new Set(['/403', '/404', '/wechat_login/callback']);

function normalizePath(value: string) {
  const withoutQueryOrHash = value.split('#')[0].split('?')[0] || '/';
  const withLeadingSlash = withoutQueryOrHash.startsWith('/')
    ? withoutQueryOrHash
    : `/${withoutQueryOrHash}`;
  const withoutLocale = withLeadingSlash.replace(/^\/(?:en|zh)(?=\/|$)/, '') || '/';

  return withoutLocale.length > 1
    ? withoutLocale.replace(/\/+$/, '')
    : withoutLocale;
}

function getShareMetaKey(path: string, pathname: string): ShareMetaKey {
  if (pathname === '/museum/[id]' || /^\/museum\/[^/]+$/.test(path)) {
    return 'museumDetail';
  }

  return SHARE_ROUTE_MAP[path] || 'home';
}

function getSafeSharePath(path: string, noIndex: boolean) {
  if (noIndex) return '/';
  if (path === '/resources/success' || path === '/resources/download') {
    return '/resources';
  }
  return path;
}

function buildShareUrl(path: string, locale?: string) {
  if (locale === 'en') {
    return path === '/'
      ? `${SITE_ORIGIN}/en`
      : `${SITE_ORIGIN}/en${path}`;
  }

  return path === '/'
    ? `${SITE_ORIGIN}/`
    : `${SITE_ORIGIN}${path}`;
}

export interface ShareMetaResolution {
  key: ShareMetaKey;
  shareUrl: string;
  imageUrl: string;
  imageType: ShareImageAsset['type'];
  imageWidth: number;
  imageHeight: number;
  noIndex: boolean;
}

export function resolveShareMeta(
  asPath: string,
  pathname: string,
  locale?: string,
): ShareMetaResolution {
  const path = normalizePath(asPath || pathname);
  const normalizedPathname = normalizePath(pathname);
  const noIndex = NO_INDEX_PATHNAMES.has(normalizedPathname);
  const safePath = getSafeSharePath(path, noIndex);
  const key = noIndex ? 'home' : getShareMetaKey(path, normalizedPathname);
  const image = SHARE_IMAGE_MAP[key];

  return {
    key,
    shareUrl: buildShareUrl(safePath, locale),
    imageUrl: `${SITE_ORIGIN}${image.path}`,
    imageType: image.type,
    imageWidth: image.width,
    imageHeight: image.height,
    noIndex,
  };
}
