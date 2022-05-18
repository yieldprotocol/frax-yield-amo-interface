import tw from 'tailwind-styled-components';
import { IAsset, IPool } from '../../lib/protocol/types';
import { valueAtDigits } from '../../utils/appUtils';
import AssetSelect from '../common/AssetSelect';

type DivProps = {
  $unFocused?: boolean;
};

const Container = tw.div<DivProps>`${(p) =>
  p.$unFocused
    ? 'opacity-60'
    : ''}  flex rounded-md justify-between p-1 w-full gap-2 align-middle hover:border border hover:border-gray-400 dark:hover:border-gray-600 dark:border-gray-800 dark:bg-gray-800 bg-gray-300 border-gray-300`;
const Input = tw.input`h-full caret-gray-800 dark:caret-gray-50 text-2xl appearance-none w-full dark:bg-gray-800 bg-gray-300 dark:focus:text-gray-50 focus:text-gray-800 dark:text-gray-300 text-gray-800 py-1 px-2 leading-tight focus:outline-none`;
const Inner = tw.div`grow-0 w-auto ml-3 text-center text-lg align-middle my-1 items-center`;
const AssetSelectOuter = tw.div`grow min-w-fit`;
const AssetSelectWrap = tw.div`flex justify-end p-1`;
const MaxButton = tw.button`float-right justify-end flex items-center gap-1 my-[1px] text-xs mr-1 dark:text-gray-300 text-gray-700 hover:text-gray-600 dark:hover:text-gray-400`;

interface IInputWrap {
  name: string;
  value: string;
  item: IAsset | IPool | undefined;
  balance: string;
  handleChange: (name: string, value: string) => void;
  disabled?: boolean;
  unFocused?: boolean;
  useMax?: () => void;
  pool?: IPool;
}

const InputWrap = ({ name, value, item, balance, handleChange, disabled, unFocused, useMax, pool }: IInputWrap) => (
  <Container $unFocused={unFocused}>
    <Inner>
      <Input
        name={name}
        type="number"
        inputMode="decimal"
        value={value}
        placeholder="0.0"
        onChange={(e) => handleChange(name, e.target.value)}
        min="0"
        disabled={disabled}
      />
    </Inner>
    <AssetSelectOuter>
      <AssetSelectWrap>
        <AssetSelect item={item} isFyToken={item?.symbol.includes('FY') || false} pool={pool} />
      </AssetSelectWrap>
      {item && (
        <MaxButton onClick={useMax}>
          <div>AMO Balance:</div>
          <div>{valueAtDigits(balance, 6)}</div>
        </MaxButton>
      )}
    </AssetSelectOuter>
  </Container>
);

export default InputWrap;
