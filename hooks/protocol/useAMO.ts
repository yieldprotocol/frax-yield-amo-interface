import { BigNumberish, ContractTransaction, PayableOverrides } from 'ethers';
import { useSigner } from 'wagmi';
import { LADLE, WRAP_ETH_MODULE } from '../../constants';
import { Ladle, Pool, WrapEtherModule } from '../../contracts/types';
import { LadleActions, RoutedActions } from '../../lib/tx/operations';
import { ILadleAction } from '../../lib/tx/types';
import useContracts from './useContracts';

const useLadle = () => {
  const contracts = useContracts();
  const { data: signer } = useSigner();
  const ladle = contracts ? (contracts[LADLE]?.connect(signer!) as Ladle) : undefined;
  const wrapEthModule = contracts ? (contracts[WRAP_ETH_MODULE]?.connect(signer!) as WrapEtherModule) : undefined;

  /**
   * Formatted representation of the batch function that allows for easier filtering/ignoring of actions
   * @param actions encoded string array of ladle actions (i.e using the forwardPermit(...args) function here returns the encoded string representation of the action)
   * @param overrides optional
   * @returns
   */
  const batch = (actions: ILadleAction[], overrides?: PayableOverrides): Promise<ContractTransaction | undefined> =>
    _batch(
      actions.filter((a) => !a.ignoreIf).map((a) => a.action),
      overrides
    );

  const _batch = async (
    actions: Array<string>,
    overrides?: PayableOverrides
  ): Promise<ContractTransaction | undefined> => ladle?.batch(actions, overrides);

  const forwardDaiPermitAction = (
    token: string,
    spender: string,
    nonce: BigNumberish,
    deadline: BigNumberish,
    allowed: boolean,
    v: BigNumberish,
    r: Buffer,
    s: Buffer
  ): string | undefined =>
    ladle?.interface.encodeFunctionData(LadleActions.Fn.FORWARD_DAI_PERMIT, [
      token,
      spender,
      nonce,
      deadline,
      allowed,
      v,
      r,
      s,
    ]);

  const forwardPermitAction = (
    token: string,
    spender: string,
    amount: BigNumberish,
    deadline: BigNumberish,
    v: BigNumberish,
    r: Buffer,
    s: Buffer
  ): string | undefined =>
    ladle?.interface.encodeFunctionData(LadleActions.Fn.FORWARD_PERMIT, [token, spender, amount, deadline, v, r, s]);

  const transferAction = (token: string, receiver: string, wad: BigNumberish): string | undefined =>
    ladle?.interface.encodeFunctionData(LadleActions.Fn.TRANSFER, [token, receiver, wad]);

  const routeAction = (target: string, calldata: string): string | undefined =>
    ladle?.interface.encodeFunctionData(LadleActions.Fn.ROUTE, [target, calldata]);

  const moduleCallAction = (target: string, calldata: string): string | undefined =>
    ladle?.interface.encodeFunctionData(LadleActions.Fn.MODULE, [target, calldata]);

  const sellBaseAction = (poolContract: Pool, to: string, min: BigNumberish): string | undefined =>
    routeAction(poolContract.address, poolContract.interface.encodeFunctionData(RoutedActions.Fn.SELL_BASE, [to, min]));

  const sellFYTokenAction = (poolContract: Pool, to: string, min: BigNumberish): string | undefined =>
    routeAction(
      poolContract.address,
      poolContract.interface.encodeFunctionData(RoutedActions.Fn.SELL_FYTOKEN, [to, min])
    );

  const mintWithBaseAction = (
    poolContract: Pool,
    to: string,
    remainder: string,
    fyTokenToBuy: BigNumberish,
    minRatio: BigNumberish,
    maxRatio: BigNumberish
  ): string | undefined =>
    routeAction(
      poolContract.address,
      poolContract.interface.encodeFunctionData(RoutedActions.Fn.MINT_WITH_BASE, [
        to,
        remainder,
        fyTokenToBuy,
        minRatio,
        maxRatio,
      ])
    );

  const mintAction = (
    poolContract: Pool,
    to: string,
    remainder: string,
    minRatio: BigNumberish,
    maxRatio: BigNumberish
  ): string | undefined =>
    routeAction(
      poolContract.address,
      poolContract.interface.encodeFunctionData(RoutedActions.Fn.MINT_POOL_TOKENS, [to, remainder, minRatio, maxRatio])
    );

  const burnForBaseAction = (
    poolContract: Pool,
    to: string,
    minRatio: BigNumberish,
    maxRatio: BigNumberish
  ): string | undefined =>
    routeAction(
      poolContract.address,
      poolContract.interface.encodeFunctionData(RoutedActions.Fn.BURN_FOR_BASE, [to, minRatio, maxRatio])
    );

  const burnAction = (
    poolContract: Pool,
    baseTo: string,
    fyTokenTo: string,
    minRatio: BigNumberish,
    maxRatio: BigNumberish
  ): string | undefined =>
    routeAction(
      poolContract.address,
      poolContract.interface.encodeFunctionData(RoutedActions.Fn.BURN_POOL_TOKENS, [
        baseTo,
        fyTokenTo,
        minRatio,
        maxRatio,
      ])
    );

  const wrapETHAction = (poolContract: Pool, etherWithSlippage: BigNumberish): string | undefined =>
    moduleCallAction(
      wrapEthModule?.address!,
      wrapEthModule?.interface.encodeFunctionData(RoutedActions.Fn.WRAP, [poolContract.address, etherWithSlippage])!
    );

  const exitETHAction = (receiver: string): string | undefined =>
    ladle?.interface.encodeFunctionData(LadleActions.Fn.EXIT_ETHER, [receiver]);

  const redeemFYToken = (seriesId: string, receiver: string, wad: BigNumberish): string | undefined =>
    ladle?.interface.encodeFunctionData(LadleActions.Fn.REDEEM, [seriesId, receiver, wad]);

  return {
    forwardDaiPermitAction,
    forwardPermitAction,
    batch,
    transferAction,
    routeAction,
    sellBaseAction,
    sellFYTokenAction,
    mintWithBaseAction,
    mintAction,
    burnForBaseAction,
    burnAction,
    wrapETHAction,
    exitETHAction,
    redeemFYToken,
    ladleContract: ladle,
  };
};

export default useLadle;
