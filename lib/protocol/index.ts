import { format } from 'date-fns';
import { BigNumber, Contract, ethers } from 'ethers';
import { CAULDRON, FRAX_ADDRESS, FRAX_AMO, LADLE } from '../../constants';
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
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';

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
  const pools = poolAddedEvents.map((e: PoolAddedEvent) => e.args.pool);
  const filtered = pools.filter((p) => !invalidPools.includes(p)) as string[];
  return filtered;
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
 * @param contractMap
 * @param chainId currently connected chain id or mainnet as default
 * @param usingTenderly if using tenderly testing environment
 * @param tenderlyContractMap if using tenderly testing environment, contract map
 * @param tenderlyStartBlock if using tenderly testing environment, start block
 *
 * @returns  {IPoolMap}
 */
export const getPools = async (
  provider: Provider,
  contractMap: IContractMap,
  chainId: number = 1,
  usingTenderly = false,
  tenderlyContractMap?: IContractMap,
  tenderlyStartBlock?: number,
  tenderlyProvider?: JsonRpcProvider
): Promise<IPoolMap | undefined> => {
  console.log('fetching pools');

  const account = (yieldEnv.addresses as any)[chainId][FRAX_AMO];
  const ladle = contractMap[LADLE] as contractTypes.Ladle;
  const cauldron = contractMap[CAULDRON] as contractTypes.Cauldron;

  // get all pool addresses from current chain and tenderly (if using)
  let poolAddresses: string[];
  let seriesAddedEvents: SeriesAddedEvent[];

  poolAddresses = await getPoolAddresses(ladle);
  seriesAddedEvents = await getSeriesEvents(cauldron);

  if (usingTenderly && tenderlyContractMap && tenderlyStartBlock) {
    const tenderlyLadle = tenderlyContractMap[LADLE] as contractTypes.Ladle;
    const tenderlyCauldron = tenderlyContractMap[CAULDRON] as contractTypes.Cauldron;

    const poolSet = new Set([...poolAddresses, ...(await getPoolAddresses(tenderlyLadle, tenderlyStartBlock))]);
    const seriesSet = new Set([...seriesAddedEvents, ...(await getSeriesEvents(tenderlyCauldron, tenderlyStartBlock))]);
    poolAddresses = Array.from(poolSet.values());
    seriesAddedEvents = Array.from(seriesSet.values());
  }

  const fyTokenToSeries: Map<string, string> = seriesAddedEvents.reduce(
    (acc: Map<string, string>, e: SeriesAddedEvent) =>
      acc.has(e.args.fyToken) ? acc : acc.set(e.args.fyToken, e.args.seriesId),
    new Map()
  );

  return poolAddresses.reduce(async (pools: any, x) => {
    const address = x;
    const poolContract = Pool__factory.connect(address, usingTenderly ? tenderlyProvider! : provider);

    try {
      // only frax
      const baseAddress = await poolContract.base();
      if (baseAddress.toLowerCase() !== FRAX_ADDRESS) return await pools;

      const [name, maturity, fyTokenAddress, symbol] = await Promise.all([
        poolContract.name(),
        poolContract.maturity(),
        poolContract.fyToken(),
        poolContract.symbol(),
      ]);

      const base = await getAsset(provider, baseAddress, account, false, chainId);
      const fyToken = await getAsset(provider, fyTokenAddress, account, true, chainId);
      const seriesId = fyTokenToSeries.get(fyTokenAddress);

      const newPool = {
        address,
        name,
        maturity,
        symbol,
        seriesId,
        fyTokenAddress,
        baseAddress,
        base,
        fyToken,
        isMature: maturity < (await provider.getBlock('latest')).timestamp,
      } as IPoolRoot;

      return { ...(await pools), [address]: _chargePool(newPool, chainId) };
    } catch (e) {
      console.log('error fetching pool', e);
    }
  }, {});
};

/* add on extra/calculated ASYNC series info and contract instances */
const _chargePool = (_pool: IPoolRoot, _chainId: number) => {
  const season = getSeason(_pool.maturity);
  const oppSeason = (_season: SeasonType) => getSeason(_pool.maturity + 23670000);
  const [startColor, endColor, textColor]: string[] = (seasonColors as any)[_chainId][season];
  const [oppStartColor, oppEndColor, oppTextColor]: string[] = (seasonColors as any)[_chainId][oppSeason(season)];

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
  const chainAddrs = (addresses as any)[chainId];

  return Object.keys(chainAddrs).reduce((contracts: IContractMap, name: string) => {
    if (CONTRACTS_TO_FETCH.includes(name)) {
      const contract = (contractTypes as any)[`${name}__factory`].connect(
        chainAddrs[name],
        providerOrSigner
      ) as Contract;
      return { ...contracts, [name]: contract };
    }
    return contracts;
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
  isFyToken: boolean = false,
  chainId: number
): Promise<IAsset> => {
  const ERC20 = ERC20Permit__factory.connect(tokenAddress, provider);
  const FYTOKEN = FYToken__factory.connect(tokenAddress, provider);

  const [symbol, decimals, name] = await Promise.all([
    isFyToken ? FYTOKEN.symbol() : ERC20.symbol(),
    isFyToken ? FYTOKEN.decimals() : ERC20.decimals(),
    isFyToken ? FYTOKEN.name() : ERC20.name(),
  ]);

  let version: string;

  try {
    version = isFyToken ? await FYTOKEN.version() : await ERC20.version();
  } catch (error) {
    version = '1';
    console.log('🦄 ~ file: index.ts ~ line 251 ~ error', error);
  }

  const balance = account ? await getBalance(provider, tokenAddress, account, isFyToken) : ethers.constants.Zero;

  const contract = isFyToken ? FYTOKEN : ERC20;
  const getAllowance = async (acc: string, spender: string) =>
    isFyToken ? FYTOKEN.allowance(acc, spender) : ERC20.allowance(acc, spender);
  const symbol_ = symbol === 'WETH' ? 'ETH' : symbol;

  return {
    address: tokenAddress,
    domain: { name, version, chainId, verifyingContract: contract.address },
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
