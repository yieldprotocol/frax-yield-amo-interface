import { ReactNode } from 'react';
import { Popover, Transition } from '@headlessui/react';

interface IPopover {
  open: boolean;
  children: ReactNode;
}

const Pop = ({ open, children }: IPopover) => (
  <Popover className="relative">
    {open && (
      <Transition show={open} enter="transition duration-100 ease-out" leave="transition duration-75 ease-out">
        <Popover.Panel static className="absolute z-10 transform translate-x-5">
          {children}
        </Popover.Panel>
      </Transition>
    )}
  </Popover>
);

export default Pop;
