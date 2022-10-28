import { BaseProvider, Web3Provider } from '@ethersproject/providers';
import { Contract, ethers } from 'ethers';
import { ERC20Permit, FYToken } from '../../contracts/types';

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

export interface IAsset {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  contract: ERC20Permit | FYToken;
  digitFormat: number;
}
