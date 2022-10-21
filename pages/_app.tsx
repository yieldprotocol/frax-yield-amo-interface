import { AppProps } from 'next/dist/shared/lib/router/router';
import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import dynamic from 'next/dynamic';
import Toasty from '../components/common/Toasty';

const DynamicLayout = dynamic(() => import('../components/Layout'), { ssr: false });
const DynamicWeb3Provider = dynamic(() => import('../hooks/useWeb3Provider'), { ssr: false });
const DynamicSettings = dynamic(() => import('../contexts/SettingsContext'), { ssr: false });

const MyApp = ({ Component, pageProps }: AppProps) => (
  <DynamicWeb3Provider>
    <DynamicSettings>
      <DynamicLayout>
        <Toasty />
        <Component {...pageProps} />
      </DynamicLayout>
    </DynamicSettings>
  </DynamicWeb3Provider>
);

export default MyApp;
