import tw from 'tailwind-styled-components';
import { PlusIcon, BoltIcon, FireIcon, ArrowsUpDownIcon } from '@heroicons/react/20/solid';

type IconProps = {
  $hasToggle: boolean;
};

const Container = tw.div`relative flex justify-center items-center w-full`;
const Outer = tw.div`flex items-center justify-end relative w-full`;
const IconWrap = tw.div`absolute left-0 right-0 flex items-center justify-center`;
const IconInner = tw.div<IconProps>`${(p: any) =>
  p.$hasToggle
    ? 'hover:cursor-pointer text-primary-500 dark:hover:border-primary-500/30 hover:border-primary-500/30'
    : ''} rounded-[10px] dark:bg-gray-800 border-2 dark:border-gray-900 bg-gray-100 border-gray-300 p-1 z-10`;

interface IIcon {
  toggleDirection?: () => void;
  isPlusIcon?: boolean;
  isBolt?: boolean;
  isFire?: boolean;
}

const Icon = ({ toggleDirection, isPlusIcon, isBolt, isFire }: IIcon) => (
  <Container>
    <Outer>
      <IconWrap>
        <IconInner onClick={toggleDirection} $hasToggle={!!toggleDirection && !isPlusIcon}>
          {isPlusIcon ? (
            <PlusIcon className="justify-self-center text-primary-500" height={18} width={18} />
          ) : isBolt ? (
            <BoltIcon className="justify-self-center text-yellow-500" height={18} width={18} />
          ) : isFire ? (
            <FireIcon className="justify-self-center text-orange-500" height={18} width={18} />
          ) : (
            <ArrowsUpDownIcon className="justify-self-center text-primary-500" height={18} width={18} />
          )}
        </IconInner>
      </IconWrap>
    </Outer>
  </Container>
);

export default Icon;
