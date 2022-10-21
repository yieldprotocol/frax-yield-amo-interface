import React, { createContext, Dispatch, ReactNode, useEffect, useReducer } from 'react';
import { USE_TENDERLY_KEY } from '../constants';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface ISettingsContextState {
  useTenderly: boolean;
}

type SettingsContextAction = UseTenderlyAction;

export type UseTenderlyAction = {
  type: Settings.USE_TENDERLY;
  payload: boolean;
};

export enum Settings {
  USE_TENDERLY = 'useTenderly',
}

const initState: ISettingsContextState = {
  useTenderly: false,
};

const SettingsContext = createContext<{ state: ISettingsContextState; dispatch: Dispatch<SettingsContextAction> }>({
  state: initState,
  dispatch: () => undefined,
});

const reducer = (state: ISettingsContextState, action: SettingsContextAction): ISettingsContextState => ({
  ...state,
  [action.type]: action.payload,
});

const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initState);
  const [useTenderly] = useLocalStorage(USE_TENDERLY_KEY, JSON.stringify(false));

  /* Update all settings in state based on localStorage */
  useEffect(() => {
    dispatch({ type: Settings.USE_TENDERLY, payload: useTenderly as boolean });
  }, [useTenderly]);

  return <SettingsContext.Provider value={{ state, dispatch }}>{children}</SettingsContext.Provider>;
};

export { SettingsContext };
export default SettingsProvider;
