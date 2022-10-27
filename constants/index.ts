import { BigNumber, ethers } from 'ethers';

export const FRAX_ADDRESS = '0x853d955acef822db058eb8505911ed77f175b99e';

// contract names
export const CAULDRON = 'Cauldron';
export const LADLE = 'Ladle';
export const FRAX_AMO = 'AMO';
export const TIMELOCK = 'Timelock';

/* util constants */
export const MAX_256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
export const MAX_128 = '0xffffffffffffffffffffffffffffffff';

export const ZERO_BN = ethers.constants.Zero;
export const ONE_BN = ethers.constants.One;
export const MINUS_ONE_BN = ethers.constants.One.mul(-1);

export const WAD_RAY_BN = BigNumber.from('1000000000000000000000000000');
export const WAD_BN = BigNumber.from('1000000000000000000');

export const SECONDS_PER_YEAR: number = 365 * 24 * 60 * 60;

export const ETH_BYTES = ethers.utils.formatBytes32String('ETH-A');

export const BLANK_ADDRESS = ethers.constants.AddressZero;

// localStorage keys
export const THEME_KEY = 'frax-amo-theme';
export const SLIPPAGE_KEY = 'frax-amo-slippageTolerance';
export const DEFAULT_SLIPPAGE = '.5'; // .5%
export const USE_TENDERLY_KEY = 'frax-amo-use-tenderly';
export const TENDERLY_RPC_URL_KEY = 'frax-amo-tenderly-rpc-url';
export const TENDERLY_FORK_ID = '48aa91dc-c833-4124-a108-d61354bdbc01';
