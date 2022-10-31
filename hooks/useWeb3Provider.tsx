import {
  darkTheme,
  getDefaultWallets,
  RainbowKitProvider,
  Theme,
  AvatarComponent,
  Chain,
} from '@rainbow-me/rainbowkit';
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import merge from 'lodash.merge';
import { useColorTheme } from './useColorTheme';
import useTenderly, { TENDERLY_FORK_RPC_URL } from './useTenderly';
import { ReactNode } from 'react';
import FRAXMark from '../components/common/logos/FRAXMark';

export default function Web3Provider({ children }: { children: ReactNode }) {
  const { theme: colorTheme } = useColorTheme();
  const { usingTenderly } = useTenderly();

  const mainnet: Chain = {
    ...chain.mainnet,
    blockExplorers: {
      default: usingTenderly
        ? {
            name: 'Tenderly',
            url: `https://dashboard.tenderly.co/Yield/v2/fork/${process.env.tenderlyForkId}/`,
          }
        : chain.mainnet.blockExplorers?.default!,
    },
  };

  const { chains, provider } = configureChains(
    [mainnet],
    [
      jsonRpcProvider({
        rpc: (chain) => {
          return {
            http: usingTenderly ? TENDERLY_FORK_RPC_URL : `https://mainnet.infura.io/v3/${process.env.infuraKey}`,
          };
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

  const CustomAvatar: AvatarComponent = () => {
    return <FRAXMark />;
  };

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains} theme={theme} showRecentTransactions avatar={CustomAvatar}>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
