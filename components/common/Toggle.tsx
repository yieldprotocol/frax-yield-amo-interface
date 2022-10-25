import { Switch } from '@headlessui/react';

interface IToggle {
  enabled: boolean;
  setEnabled: (bool: boolean) => void;
  label: string;
  disabled?: boolean;
}

const Toggle = ({ enabled, setEnabled, label, disabled }: IToggle) => (
  <Switch.Group>
    <div className="flex gap-2 items-center">
      <Switch
        checked={enabled}
        onChange={setEnabled}
        className={`${
          enabled ? 'bg-gray-500' : 'dark:bg-gray-700 bg-gray-400'
        } relative inline-flex items-center h-6 rounded-full w-11`}
        disabled={disabled}
      >
        <span
          className={`${
            enabled ? 'translate-x-6' : 'translate-x-1'
          } inline-block w-4 h-4 transform bg-gray-300 rounded-full ease-in-out duration-200`}
        />
      </Switch>
      <Switch.Label className={`text-sm ${disabled ? '' : 'hover:cursor-pointer'}`}>{label}</Switch.Label>
    </div>
  </Switch.Group>
);

export default Toggle;
