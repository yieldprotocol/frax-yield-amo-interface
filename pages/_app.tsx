import { AppProps } from 'next/dist/shared/lib/router/router';
import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import 'react-loading-skeleton/dist/skeleton.css';
import dynamic from 'next/dynamic';
import Toasty from '../components/common/Toasty';
import Script from 'next/script';

const DynamicLayout = dynamic(() => import('../components/Layout'), { ssr: false });
const DynamicWeb3Provider = dynamic(() => import('../hooks/useWeb3Provider'), { ssr: false });
const DynamicSettings = dynamic(() => import('../contexts/SettingsContext'), { ssr: false });

const MyApp = ({ Component, pageProps }: AppProps) => (
  <>
    <Script src="/scripts/themeScript.js" strategy="beforeInteractive" type="text/javascript" />
    <DynamicSettings>
      <DynamicWeb3Provider>
        <DynamicLayout>
          <Toasty />
          <Component {...pageProps} />
        </DynamicLayout>
      </DynamicWeb3Provider>
    </DynamicSettings>
  </>
);

export default MyApp;
