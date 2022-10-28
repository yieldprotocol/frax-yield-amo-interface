import { format } from 'date-fns';
import { Contract } from 'ethers';
import { LADLE } from '../../constants';
import { Pool__factory } from '../../contracts/types';
import { IAsset, IContractMap, IPoolMap, IPoolRoot, Provider } from './types';
import { hexToRgb, formatFyTokenSymbol, getSeason, SeasonType } from '../../utils/appUtils';
import yieldEnv from '../../config/yieldEnv';
import { CONTRACTS_TO_FETCH } from '../../hooks/protocol/useContracts';
import * as contractTypes from '../../contracts/types';
import { ERC20Permit__factory } from '../../contracts/types/factories/ERC20Permit__factory';
import { FYToken__factory } from '../../contracts/types/factories/FYToken__factory';
import { PoolAddedEvent, PoolAddedEventFilter } from '../../contracts/types/Ladle';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { FRAX_ADDRESS } from '../../config/assets';

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
export const getPoolAddedEvents = async (ladle: contractTypes.Ladle, fromBlock?: number): Promise<PoolAddedEvent[]> => {
  const poolAddedEvents = await ladle.queryFilter('PoolAdded' as PoolAddedEventFilter, fromBlock);
  return poolAddedEvents.filter((e) => !invalidPools.includes(e.args.pool)); // omit invalid pools
};

/**
 * Gets all pool data
 *
 * @param provider connected provider or default chain provider
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

  const ladle = contractMap[LADLE] as contractTypes.Ladle;

  // get all pool addresses from current chain and tenderly (if using)
  let poolsAdded: PoolAddedEvent[];

  poolsAdded = await getPoolAddedEvents(ladle);

  if (usingTenderly && tenderlyContractMap && tenderlyStartBlock) {
    const tenderlyLadle = tenderlyContractMap[LADLE] as contractTypes.Ladle;

    const poolSet = new Set([...poolsAdded, ...(await getPoolAddedEvents(tenderlyLadle, tenderlyStartBlock))]);
    poolsAdded = Array.from(poolSet.values());
  }

  return poolsAdded.reduce(async (pools: any, x) => {
    const { seriesId, pool: address } = x.args;
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

      const base = await getAsset(provider, baseAddress, false);
      const fyToken = await getAsset(provider, fyTokenAddress, true);

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
      return pools;
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
 * @param provider
 * @param address token address
 * @param isFyToken optional
 * @returns
 */
export const getAsset = async (provider: Provider, address: string, isFyToken: boolean = false): Promise<IAsset> => {
  let contract: contractTypes.ERC20Permit | contractTypes.FYToken;

  if (isFyToken) {
    contract = FYToken__factory.connect(address, provider);
  } else {
    contract = ERC20Permit__factory.connect(address, provider);
  }

  const [symbol, decimals, name] = await Promise.all([contract.symbol(), contract.decimals(), contract.name()]);

  return {
    address,
    name,
    symbol: isFyToken ? formatFyTokenSymbol(symbol) : symbol,
    decimals,
    contract,
    digitFormat: 4,
  };
};
