import { Fragment, useContext } from 'react';
import tw from 'tailwind-styled-components';
import { Menu, Transition } from '@headlessui/react';
import { DotsVerticalIcon } from '@heroicons/react/solid';
import Toggle from './common/Toggle';
import { Settings, SettingsContext } from '../contexts/SettingsContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { USE_TENDERLY_KEY } from '../constants';

type ButtonProps = {
  $active: boolean;
};

const ItemWrap = tw.div<ButtonProps>`${(p) =>
  p.$active
    ? 'dark:text-gray-50 text-gray-800'
    : 'dark:text-gray-400 text-gray-600'} flex rounded-md items-center w-full px-2 py-2`;

const SettingsDropdown = () => {
  const {
    state: { usingTenderly },
    dispatch,
  } = useContext(SettingsContext);
  const [, setUseTenderly] = useLocalStorage(USE_TENDERLY_KEY, JSON.stringify(false));

  return (
    <div>
      <Menu as="div" className="relative inline-block text-left">
        {({ open }) => (
          <>
            <Menu.Button className="inline-flex justify-between gap-2 align-middle w-full dark:bg-gray-700/50 px-1.5 py-2 dark:text-gray-50 text-gray-800 rounded-md bg-gray-100 border-[1px] dark:border-gray-700 border-gray-200 dark:hover:border-gray-600 hover:border-gray-300">
              <DotsVerticalIcon className="my-auto w-5 h-5 dark:text-gray-50 text-gray-800" aria-hidden="true" />
            </Menu.Button>
            <Transition
              show={open}
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-5 origin-top-right bg-gray-500/25 rounded-md shadow-md focus:outline-none whitespace-nowrap">
                <div className="px-1 py-1">
                  <Menu.Item disabled>
                    {({ active }) => (
                      <ItemWrap $active={active}>
                        <Toggle
                          label="Tenderly Mode"
                          enabled={usingTenderly}
                          setEnabled={() => {
                            dispatch({ type: Settings.USING_TENDERLY, payload: !usingTenderly });
                            setUseTenderly(!usingTenderly);
                          }}
                        />
                      </ItemWrap>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
    </div>
  );
};

export default SettingsDropdown;
