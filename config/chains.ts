import { TENDERLY_FORK_RPC_URL } from '../hooks/useTenderly';

export const VALID_CHAINS = [0, 1]; // 0 is tenderly, which is the corresponding live chain's (mainnet) data plus tenderly specific data

// tenderly chain id is 0, but has a corresponding 'real' chain
export const TENDERLY_MAPPED_CHAIN = 1; // which chain the tenderly environment corresponds to

const rpcUrls: { [chainId: number]: string } = {
  0: TENDERLY_FORK_RPC_URL,
  1: `https://mainnet.infura.io/v3/${process.env.infuraKey}`,
};

export default rpcUrls;
