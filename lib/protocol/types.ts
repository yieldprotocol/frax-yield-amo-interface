import { BaseProvider, Web3Provider } from '@ethersproject/providers';
import { BigNumber, Contract, ethers } from 'ethers';
import { ERC20Permit, FYToken } from '../../contracts/types';
import { IDomain, ISignable } from '../tx/types';

export type Provider = Web3Provider | ethers.providers.InfuraProvider | ethers.providers.JsonRpcProvider | BaseProvider;

export interface IContractMap {
  [name: string]: Contract | null;
}

export interface IPoolMap {
  [address: string]: IPool;
}

export interface IPoolRoot {
  address: string;
  name: string;
  symbol: string;
  maturity: number;
  seriesId: string;
  fyTokenAddress: string;
  baseAddress: string;

  base: IAsset;
  fyToken: IAsset;

  isMature: boolean;
}

export interface IPool extends IPoolRoot {
  displayName: string;
  season: string;
  startColor: string;
  endColor: string;
  color: string;
  alternateColor: string;
  textColor: string;
  oppStartColor: string;
  oppEndColor: string;
  oppTextColor: string;
  maturity_: string;
}

export interface IAsset extends ISignable {
  address: string;
  version: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: BigNumber;
  balance_: string;
  digitFormat: number;
  domain: IDomain;

  contract: ERC20Permit | FYToken;
  getAllowance: (account: string, spender: string) => Promise<BigNumber>;
}
