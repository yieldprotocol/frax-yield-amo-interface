import { BigNumber, BigNumberish, BytesLike } from 'ethers';

export namespace AMOActions {
  export enum Fn {
    ADD_LIQUIDITY = 'addLiquidityToAMM',
    REMOVE_LIQUIDITY = 'removeLiquidityFromAMM',
    INCREASE_RATES = 'increaseRates',
    DECREASE_RATES = 'decreaseRates',
    ADD_SERIES = 'addSeries',
    SHOW_ALLOCATIONS = 'showAllocations',
  }

  export namespace Args {
    export type ADD_LIQUIDITY = [
      seriesId_bytes6: BytesLike,
      fraxAmount: BigNumberish,
      fyFraxAmount: BigNumberish,
      minRatio: BigNumberish,
      maxRatio: BigNumberish
    ];

    export type REMOVE_LIQUIDITY = [
      seriesId_bytes6: BytesLike,
      poolAmount: BigNumberish,
      minRatio: BigNumberish,
      maxRatio: BigNumberish
    ];

    export type INCREASE_RATES = [seriesId_bytes6: BytesLike, fraxAmount: BigNumberish, minFraxReceived: BigNumberish];

    export type DECREASE_RATES = [
      seriesId_bytes6: BytesLike,
      fraxAmount: BigNumberish,
      minFyFraxReceived: BigNumberish
    ];

    export type ADD_SERIES = [seriesId_bytes6: BytesLike, fyToken: string, pool: string];

    export type SHOW_ALLOCATIONS = [seriesId_bytes6: BytesLike];
  }

  export namespace Res {
    export type SHOW_ALLOCATIONS = [
      fraxInContract: BigNumber,
      fraxAsCollateral: BigNumber,
      fraxInLP: BigNumber,
      fyFraxInContract: BigNumber,
      fyFraxInLP: BigNumber,
      LPOwned: BigNumber
    ];
  }
}

export namespace LadleActions {
  export enum Fn {
    FORWARD_PERMIT = 'forwardPermit',
  }

  export namespace Args {
    export type FORWARD_PERMIT = [
      token: string,
      spender: string,
      amount: BigNumberish,
      deadline: BigNumberish,
      v: BigNumberish,
      r: BytesLike,
      s: BytesLike
    ];
  }
}
