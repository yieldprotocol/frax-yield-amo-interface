import { format } from 'date-fns';
import { BigNumber, ethers } from 'ethers';
import { CAULDRON, FRAX_AMO, LADLE } from '../../constants';
import { Pool__factory } from '../../contracts/types';
import { IAsset, IContractMap, IPoolMap, IPoolRoot, Provider } from './types';
import { hexToRgb, cleanValue, formatFyTokenSymbol, getSeason, SeasonType } from '../../utils/appUtils';
import yieldEnv from '../../config/yieldEnv';
import { CONTRACTS_TO_FETCH } from '../../hooks/protocol/useContracts';
import * as contractTypes from '../../contracts/types';
import { ERC20Permit__factory } from '../../contracts/types/factories/ERC20Permit__factory';
import { FYToken__factory } from '../../contracts/types/factories/FYToken__factory';
import { PoolAddedEvent } from '../../contracts/types/Ladle';
import { SeriesAddedEvent } from '../../contracts/types/Cauldron';
import { calculateRate, getTimeStretchYears } from '../../utils/yieldMath';

const { seasonColors } = yieldEnv;

const formatMaturity = (maturity: number) => format(new Date(maturity * 1000), 'MMMM dd, yyyy');

/**
 * Gets all pool data
 *
 * @param provider
 * @param contractMap the contracts to use for events
 * @param chainId currently connected chain id or mainnet as default
 * @param account user's account address if there is a connected account
 * @returns  {IPoolMap}
 */
export const getPools = async (
  provider: Provider,
  contractMap: IContractMap,
  chainId: number = 1,
  account: string | undefined = undefined
): Promise<IPoolMap | undefined> => {
  const Ladle = contractMap[LADLE] as contractTypes.Ladle;
  const Cauldron = contractMap[CAULDRON] as contractTypes.Cauldron;
  if (!Ladle || !Cauldron) return undefined;

  console.log('fetching pools');

  const poolAddedEvents = await Ladle.queryFilter('PoolAdded' as ethers.EventFilter);
  const poolAddresses: string[] = poolAddedEvents.map((e: PoolAddedEvent) => e.args.pool);
  const seriesAddedEvents = await Cauldron.queryFilter('SeriesAdded' as ethers.EventFilter);
  const fyTokenToSeries: Map<string, string> = seriesAddedEvents.reduce(
    (acc: Map<string, string>, e: SeriesAddedEvent) =>
      acc.has(e.args.fyToken) ? acc : acc.set(e.args.fyToken, e.args.seriesId),
    new Map()
  );

  try {
    return poolAddresses.reduce(async (pools: any, x) => {
      const address = x;
      const poolContract = Pool__factory.connect(address, provider);
      const [
        name,
        version,
        decimals,
        maturity,
        ts,
        g1,
        g2,
        fyTokenAddress,
        baseAddress,
        lpTokenBalance,
        baseReserves,
        fyTokenReserves,
        totalSupply,
      ] = await Promise.all([
        poolContract.name(),
        poolContract.version(),
        poolContract.decimals(),
        poolContract.maturity(),
        poolContract.ts(),
        poolContract.g1(),
        poolContract.g2(),
        poolContract.fyToken(),
        poolContract.base(),
        account ? poolContract.balanceOf(account) : ethers.constants.Zero,
        poolContract.getBaseBalance(),
        poolContract.getFYTokenBalance(),
        poolContract.totalSupply(),
      ]);

      const base = await getAsset(provider, baseAddress, account);
      const fyToken = await getAsset(provider, fyTokenAddress, account, true);
      const getTimeTillMaturity = () => maturity - Math.round(new Date().getTime() / 1000);
      const seriesId = fyTokenToSeries.get(fyToken.address);
      const timeStretchYears = getTimeStretchYears(ts);

      const newPool = {
        address,
        name,
        symbol: `FY${base.symbol} ${format(new Date(maturity * 1000), 'MMM yyyy')}`,
        version,
        decimals,
        maturity,
        ts,
        g1,
        g2,
        isMature: maturity < (await provider.getBlock('latest')).timestamp,
        lpTokenBalance,
        lpTokenBalance_: ethers.utils.formatUnits(lpTokenBalance, decimals),
        baseReserves,
        baseReserves_: ethers.utils.formatUnits(baseReserves, decimals),
        fyTokenReserves,
        fyTokenReserves_: ethers.utils.formatUnits(fyTokenReserves, decimals),
        getTimeTillMaturity,
        contract: poolContract,
        totalSupply,
        seriesId,
        base,
        fyToken,
        interestRate: calculateRate(fyTokenReserves, baseReserves, timeStretchYears).toString(),
        timeStretchYears_: timeStretchYears.toString(),
        // ...showAllocations(),
      } as IPoolRoot;

      // only frax
      if (base.symbol.toLowerCase() === 'frax') {
        return { ...(await pools), [address]: _chargePool(newPool, chainId) };
      } else {
        return { ...(await pools) };
      }
    }, {});
  } catch (e) {
    console.log('error fetching pools', e);
  }
};

/* add on extra/calculated ASYNC series info and contract instances */
const _chargePool = (_pool: IPoolRoot, _chainId: number) => {
  const season = getSeason(_pool.maturity);
  const oppSeason = (_season: SeasonType) => getSeason(_pool.maturity + 23670000);
  const [startColor, endColor, textColor]: string[] = seasonColors[_chainId][season];
  const [oppStartColor, oppEndColor, oppTextColor]: string[] = seasonColors[_chainId][oppSeason(season)];

  return {
    ..._pool,
    displayName: `${_pool.base.symbol} ${formatMaturity(_pool.maturity)}`,
    maturity_: formatMaturity(_pool.maturity),
    season,
    startColor,
    endColor,
    color: `linear-gradient(${startColor}, ${endColor})`,
    alternateColor: `linear-gradient(270deg, rgba(${hexToRgb(startColor)}, .8) 1.04%, rgba(${hexToRgb(
      endColor
    )}, .5) 98.99%) 0% 0% / 200% 200%`,
    textColor,
    oppStartColor,
    oppEndColor,
    oppTextColor,
  };
};

export const getContracts = (provider: Provider, chainId: number): IContractMap | undefined => {
  if (!chainId || !provider) return undefined;

  const { addresses } = yieldEnv;
  const chainAddrs = addresses[chainId];

  if (!chainAddrs) return undefined;

  return Object.keys(chainAddrs).reduce((contracts: IContractMap, name: string) => {
    if (CONTRACTS_TO_FETCH.includes(name)) {
      try {
        const contract: ethers.Contract = contractTypes[`${name}__factory`].connect(chainAddrs[name], provider);
        return { ...contracts, [name]: contract || null };
      } catch (e) {
        console.log(`could not connect directly to contract ${name}`);
        return contracts;
      }
    }
    return undefined;
  }, {});
};

/**
 * Gets token/asset data and balances if there is an account provided
 * @param tokenAddress
 * @param account can be null if there is no account
 * @param isFyToken optional
 * @param isEthBased optional: for getting the eth balance
 * @returns
 */
export const getAsset = async (
  provider: Provider,
  tokenAddress: string,
  account: string | null = null,
  isFyToken: boolean = false
): Promise<IAsset> => {
  const ERC20 = ERC20Permit__factory.connect(tokenAddress, provider);
  const FYTOKEN = FYToken__factory.connect(tokenAddress, provider);

  const [symbol, decimals, name] = await Promise.all([
    isFyToken ? FYTOKEN.symbol() : ERC20.symbol(),
    isFyToken ? FYTOKEN.decimals() : ERC20.decimals(),
    isFyToken ? FYTOKEN.name() : ERC20.name(),
  ]);

  const balance = account ? await getBalance(provider, tokenAddress, account, isFyToken) : ethers.constants.Zero;

  const contract = isFyToken ? FYTOKEN : ERC20;
  const getAllowance = async (acc: string, spender: string) =>
    isFyToken ? FYTOKEN.allowance(acc, spender) : ERC20.allowance(acc, spender);
  const symbol_ = symbol === 'WETH' ? 'ETH' : symbol;

  return {
    address: tokenAddress,
    version: symbol === 'USDC' ? '2' : '1',
    name,
    symbol: isFyToken ? formatFyTokenSymbol(symbol) : symbol_,
    decimals,
    balance,
    balance_: cleanValue(ethers.utils.formatUnits(balance, decimals), decimals),
    contract,
    getAllowance,
    digitFormat: 4,
  };
};

/**
 * returns the user's token (either base or fyToken) balance in BigNumber
 * @param tokenAddress
 * @param isFyToken optional
 * @returns {BigNumber}
 */
export const getBalance = (
  provider: Provider,
  tokenAddress: string,
  account: string,
  isFyToken: boolean = false
): Promise<BigNumber> | BigNumber => {
  const contract = isFyToken
    ? FYToken__factory.connect(tokenAddress, provider)
    : ERC20Permit__factory.connect(tokenAddress, provider);

  try {
    return contract.balanceOf(account);
  } catch (e) {
    console.log('error getting balance for', tokenAddress);
    return ethers.constants.Zero;
  }
};

/**
 * returns the output of showAllocations from the amo
 * @param seriesId
 * @returns {[ BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber ]}
 *  fraxInContract, // [0] Unallocated Frax
    fraxAsCollateral, // [1] Frax being used as collateral to borrow fyFrax
    fraxInLP, // [2] The Frax our LP tokens can lay claim to
    fyFraxInContract, // [3] fyFrax sitting in AMO, should be 0
    fyFraxInLP, // [4] fyFrax our LP can claim
    LPOwned // [5] number of LP tokens
 */
export const showAllocations = (seriesId: string) => {
  // const contract = FraxAmo__factory.connect(FRAX_AMO, provider)
  // return contract.showAllocations()
};
