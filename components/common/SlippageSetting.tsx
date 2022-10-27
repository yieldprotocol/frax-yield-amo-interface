import { Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { CogIcon } from '@heroicons/react/outline';
import tw from 'tailwind-styled-components';
import { DEFAULT_SLIPPAGE, SLIPPAGE_KEY } from '../../constants';
import { useLocalStorage } from '../../hooks/useLocalStorage';

type ButtonProps = {
  $active: boolean;
};

const Input = tw.input`text-right caret-gray-800 dark:caret-gray-50 text-md appearance-none dark:bg-gray-800 bg-gray-200 dark:focus:text-gray-50 focus:text-gray-800 dark:text-gray-300 text-gray-800 leading-tight focus:outline-none `;
const InputWrap = tw.div<ButtonProps>`${(p: any) =>
  p.$active
    ? 'border-primary-500 hover:border-primary-500/70'
    : 'border-gray-600 hover:border-gray-500'} rounded-full flex px-2 py-1 border-[1px] items-center`;
const Button = tw.div<ButtonProps>`${(p: any) =>
  p.$active
    ? 'bg-primary-500 border-primary-500 hover:border-primary-500/70'
    : 'border-gray-600 hover:border-gray-500'} cursor-pointer rounded-full flex px-2 py-1 border-[1px] items-center`;

const SlippageSetting = () => {
  const [setting, setSetting] = useLocalStorage(SLIPPAGE_KEY, DEFAULT_SLIPPAGE);

  return (
    <Popover className="relative">
      <Popover.Button as="div" className="items-center cursor-pointer">
        <CogIcon className="w-5 h-5 dark:text-gray-200 text-gray-800" aria-hidden="true" />
      </Popover.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Popover.Panel className="mt-2 absolute right-0 origin-top-right rounded-lg shadow-lg z-50 dark:bg-gray-800 bg-gray-200 p-5 border-[1px] dark:border-gray-700 border-gray-400">
          <div className="grid gap-3">
            <div className="dark:text-gray-400 text-gray-600 text-sm text-left">Slippage Tolerance</div>
            <div className="flex justify-end gap-2">
              <Button $active={setting === DEFAULT_SLIPPAGE} onClick={() => setSetting(DEFAULT_SLIPPAGE)}>
                Auto
              </Button>
              <InputWrap $active={setting !== DEFAULT_SLIPPAGE}>
                <Input
                  name="setting"
                  type="number"
                  inputMode="decimal"
                  value={setting === DEFAULT_SLIPPAGE ? '' : setting}
                  placeholder=".5"
                  onChange={(e: any) => setSetting(e.target.value)}
                  min="0"
                />
                <span className="dark:text-gray-200 ml-[1px]">%</span>
              </InputWrap>
            </div>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};

export default SlippageSetting;
