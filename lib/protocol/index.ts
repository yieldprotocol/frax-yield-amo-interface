import { format } from 'date-fns';
import { BigNumber, ethers } from 'ethers';
import { FRAX_AMO } from '../../constants';
import { Pool__factory } from '../../contracts/types';
import { IAMOAllocations, IAsset, IContractMap, IPoolMap, IPoolRoot, Provider } from './types';
import { hexToRgb, cleanValue, formatFyTokenSymbol, getSeason, SeasonType } from '../../utils/appUtils';
import yieldEnv from '../../config/yieldEnv';
import { CONTRACTS_TO_FETCH } from '../../hooks/protocol/useContracts';
import * as contractTypes from '../../contracts/types';
import { ERC20Permit__factory } from '../../contracts/types/factories/ERC20Permit__factory';
import { FYToken__factory } from '../../contracts/types/factories/FYToken__factory';
import { PoolAddedEvent } from '../../contracts/types/Ladle';
import { SeriesAddedEvent } from '../../contracts/types/Cauldron';
import { calculateRate, getTimeStretchYears } from '../../utils/yieldMath';
import { formatUnits } from 'ethers/lib/utils';
import { JsonRpcSigner } from '@ethersproject/providers';

const { seasonColors } = yieldEnv;
const invalidPools = ['0x57002Dd4609fd79f65e2e2a4bE9aa6e901Af9D9C'];

const formatMaturity = (maturity: number) => format(new Date(maturity * 1000), 'MMMM dd, yyyy');

/**
 * Gets all relevant pool addresses from events given a provider
 *
 * @param ladle relevant ladle contract
 * @param fromBlock the starting block for fetching events
 * @returns  {string[]}
 */
export const getPoolAddresses = async (ladle: contractTypes.Ladle, fromBlock?: number): Promise<string[]> => {
  const poolAddedEvents = await ladle.queryFilter('PoolAdded' as ethers.EventFilter, fromBlock);
  return poolAddedEvents.map((e: PoolAddedEvent) => e.args.pool).filter((p) => !invalidPools.includes(p)) as string[];
};

/**
 * Gets all relevant seriesEntities addresses from events given a provider
 *
 * @param cauldron relevant cauldron contract
 * @param fromBlock the starting block for fetching events
 * @returns  {SeriesAddedEvent[]}
 */
export const getSeriesEvents = async (
  cauldron: contractTypes.Cauldron,
  fromBlock?: number
): Promise<SeriesAddedEvent[]> => await cauldron.queryFilter('SeriesAdded' as ethers.EventFilter, fromBlock);

/**
 * Gets all pool data
 *
 * @param provider
 * @param chainId currently connected chain id or mainnet as default
 * @param account user's account address if there is a connected account
 * @param poolAddresses
 * @param seriesAddedEvents
 * @returns  {IPoolMap}
 */
export const getPools = async (
  provider: Provider,
  chainId: number = 1,
  account: string | undefined = undefined,
  poolAddresses: string[] | undefined,
  seriesAddedEvents: SeriesAddedEvent[] | undefined
): Promise<IPoolMap | undefined> => {
  if (!poolAddresses || !seriesAddedEvents) throw new Error('no pool addresses or series events detected');

  console.log('fetching pools');

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
      const amoAddress = yieldEnv.addresses[chainId][FRAX_AMO];

      // only frax
      if (base.symbol.toLowerCase() !== 'frax') {
        return { ...(await pools) };
      }

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
        lpTokenBalance_: formatUnits(lpTokenBalance, decimals),
        baseReserves,
        baseReserves_: formatUnits(baseReserves, decimals),
        fyTokenReserves,
        fyTokenReserves_: formatUnits(fyTokenReserves, decimals),
        getTimeTillMaturity,
        contract: poolContract,
        totalSupply,
        seriesId,
        base,
        fyToken,
        interestRate: calculateRate(fyTokenReserves, baseReserves, timeStretchYears).toString(),
        timeStretchYears_: timeStretchYears.toString(),
        amoAllocations: await showAllocations(provider, amoAddress, seriesId, decimals),
      } as IPoolRoot;

      return { ...(await pools), [address]: _chargePool(newPool, chainId) };
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

export const getContracts = (providerOrSigner: Provider | JsonRpcSigner, chainId: number): IContractMap | undefined => {
  const { addresses } = yieldEnv;
  const chainAddrs = addresses[chainId];

  if (!chainAddrs) return undefined;

  return Object.keys(chainAddrs).reduce((contracts: IContractMap, name: string) => {
    if (CONTRACTS_TO_FETCH.includes(name)) {
      try {
        const contract: ethers.Contract = contractTypes[`${name}__factory`].connect(chainAddrs[name], providerOrSigner);
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
 * @param provider
 * @param amoAddress
 * @param seriesId
 * @param decimals
 * @returns { BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber }
 *  fraxInContract, // [0] Unallocated Frax
    fraxAsCollateral, // [1] Frax being used as collateral to borrow fyFrax
    fraxInLP, // [2] The Frax our LP tokens can lay claim to
    fyFraxInContract, // [3] fyFrax sitting in AMO, should be 0
    fyFraxInLP, // [4] fyFrax our LP can claim
    LPOwned // [5] number of LP tokens
 */
export const showAllocations = async (
  provider: Provider,
  amoAddress: string,
  seriesId: string | undefined,
  decimals: number
): Promise<IAMOAllocations | undefined> => {
  if (!seriesId) return undefined;

  const contract = contractTypes.AMO__factory.connect(amoAddress, provider);

  let fraxInContract: BigNumber;
  let fraxAsCollateral: BigNumber;
  let fraxInLP: BigNumber;
  let fyFraxInContract: BigNumber;
  let fyFraxInLP: BigNumber;
  let LPOwned: BigNumber;

  try {
    [fraxInContract, fraxAsCollateral, fraxInLP, fyFraxInContract, fyFraxInLP, LPOwned] =
      await contract.showAllocations(seriesId);
  } catch (e) {
    return undefined;
  }

  return {
    fraxInContract,
    fraxAsCollateral,
    fraxInLP,
    fyFraxInContract,
    fyFraxInLP,
    LPOwned,
    fraxInContract_: formatUnits(fyFraxInContract, decimals),
    fraxAsCollateral_: formatUnits(fraxAsCollateral, decimals),
    fraxInLP_: formatUnits(fraxInLP, decimals),
    fyFraxInContract_: formatUnits(fyFraxInContract, decimals),
    fyFraxInLP_: formatUnits(fyFraxInLP, decimals),
    LPOwned_: formatUnits(LPOwned, decimals),
  };
};
