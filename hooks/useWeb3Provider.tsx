import { darkTheme, getDefaultWallets, RainbowKitProvider, Theme } from '@rainbow-me/rainbowkit';
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import merge from 'lodash.merge';
import { useColorTheme } from './useColorTheme';
import { URLS } from '../config/chains';
import useTenderly from './useTenderly';
import { ReactNode } from 'react';

export default function Web3Provider({ children }: { children: ReactNode }) {
  const { theme: colorTheme } = useColorTheme();
  const { usingTenderly, tenderlyRpcUrl } = useTenderly();

  const { chains, provider } = configureChains(
    [chain.mainnet],
    [
      jsonRpcProvider({
        rpc: (chain) => {
          return { http: usingTenderly ? tenderlyRpcUrl : URLS[chain.id][0] };
        },
      }),
    ]
  );

  const { connectors } = getDefaultWallets({ appName: 'Frax AMO', chains });
  const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
  });

  const theme = merge(colorTheme === 'dark' ? darkTheme() : undefined, {
    colors: {
      accentColor: '#60a5fab3',
    },

    fonts: { body: 'inter' },
    radii: {
      actionButton: '.75rem',
      connectButton: '.75rem',
      menuButton: '.75rem',
      modal: '.75rem',
      modalMobile: '.75rem',
    },
  } as Theme);

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains} theme={theme} showRecentTransactions>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
