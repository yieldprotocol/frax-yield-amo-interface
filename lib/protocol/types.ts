import { BaseProvider, Web3Provider } from '@ethersproject/providers';
import { BigNumber, Contract, ethers } from 'ethers';
import { ERC20Permit, FYToken, Pool } from '../../contracts/types';
import { ISignable } from '../tx/types';

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
  version: string;
  decimals: number;
  maturity: number;
  ts: BigNumber;
  g1: BigNumber;
  g2: BigNumber;

  isMature: boolean;
  getTimeTillMaturity: () => number;

  lpTokenBalance: BigNumber;
  lpTokenBalance_: string;
  baseReserves: BigNumber;
  baseReserves_: string;
  fyTokenReserves: BigNumber;
  fyTokenReserves_: string;
  totalSupply: BigNumber;
  seriesId: string;

  base: IAsset;
  fyToken: IAsset;

  contract: Pool;

  interestRate: string; // market interest rate
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

  contract: ERC20Permit | FYToken;
  getAllowance: (account: string, spender: string) => Promise<BigNumber>;
}
