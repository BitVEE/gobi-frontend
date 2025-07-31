import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { I18nNamespaces } from '@/types/i18next';

const getLocaleProps =
    (namespaces: (keyof I18nNamespaces)[]): GetStaticProps =>
        async ({ locale }) => ({
            props: {
                ...(await serverSideTranslations(locale!, namespaces)),
            },
        });

export default getLocaleProps;
