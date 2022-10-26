import Skeleton from 'react-loading-skeleton';
import tw from 'tailwind-styled-components';
import SkeletonWrap from '../common/SkeletonWrap';

type DivProps = {
  $unfocused?: boolean;
  $disabled?: boolean;
};

const Container = tw.div<DivProps>`${(p) => (p.$unfocused ? 'opacity-60' : '')} 

  ${(p) => (p.$disabled ? 'dark:border-gray-600' : '')} 
  
    w-full items-center flex rounded-md justify-between p-1 gap-2 align-middle hover:border border hover:border-gray-400 dark:hover:border-gray-600 dark:border-gray-800 dark:bg-gray-800 bg-gray-300 border-gray-300`;
const InputContainer = tw.div`w-full flex items-center rounded-md caret-gray-800 dark:caret-gray-50 text-2xl dark:bg-gray-800 bg-gray-200 dark:focus:text-gray-50 focus:text-gray-800 dark:text-gray-300 text-gray-800 py-1 px-2 leading-tight focus:outline-none`;

interface IInterestRateInput {
  label: string;
  rate: string;
  setRate: (rate: string) => void;
  disabled?: boolean;
  unfocused?: boolean;
  loading?: boolean;
}

const Text = tw.div`text-2xl`;
const Input = tw.input`w-full text-right text-2xl focus:outline-none dark:bg-gray-800 bg-gray-200 py-3 px-3`;
const SkeletonWrappy = tw.div`w-full text-right text-2xl focus:outline-none dark:bg-gray-800 bg-gray-200 py-3 px-3`;

const InterestRateInput = ({
  label,
  rate,
  setRate,
  disabled = false,
  unfocused = false,
  loading = false,
}: IInterestRateInput) => (
  <Container $unfocused={unfocused} $disabled={disabled}>
    <div className="p-1 text-center w-24">{label}</div>

    <InputContainer>
      {loading ? (
        <SkeletonWrappy>
          <SkeletonWrap width={50} />
        </SkeletonWrappy>
      ) : (
        <Input
          type="number"
          inputMode="decimal"
          value={rate}
          placeholder="0.0"
          onChange={(e) => setRate(e.target.value)}
          min="0"
          disabled={disabled}
        />
      )}
      <Text>%</Text>
    </InputContainer>
  </Container>
);

export default InterestRateInput;
