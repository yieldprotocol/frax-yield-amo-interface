import { BigNumberish, BytesLike } from 'ethers';

export namespace AMOActions {
  export enum Fn {
    ADD_LIQUIDITY = 'addLiquidity',
    REMOVE_LIQUIDITY = 'removeLiquidity',
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

    // export type FORWARD_PERMIT = [
    //   token: string,
    //   spender: string,
    //   amount: BigNumberish,
    //   deadline: BigNumberish,
    //   v: BigNumberish,
    //   r: Buffer,
    //   s: Buffer
    // ];
  }
}
