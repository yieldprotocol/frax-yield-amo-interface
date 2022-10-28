import { getMonth } from 'date-fns';

export const copyToClipboard = (str: string) => {
  const el = document.createElement('textarea');
  el.value = str;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};

/* Trunctate a string value to a certain number of 'decimal' point */
export const cleanValue = (input: string | undefined, decimals: number = 18) => {
  const re = new RegExp(`(\\d+\\.\\d{${decimals}})(\\d)`);
  if (input !== undefined) {
    const input_ = input![0] === '.' ? '0'.concat(input!) : input;
    const inpu = input_?.match(re); // inpu = truncated 'input'... get it?
    if (inpu) {
      return inpu[1];
    }
    return input?.valueOf();
  }
  return '0.0';
};

/**
 * Number formatting if reqd.
 * */
export const nFormatter = (num: number, digits: number) => {
  const si = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'k' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'G' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'P' },
    { value: 1e18, symbol: 'E' },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  let i;
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break;
    }
  }
  return (num / si[i].value).toFixed(digits).replace(rx, '$1') + si[i].symbol;
};

export const numberWithCommas = (x: number) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const formatValue = (x: string | number, decimals: number) =>
  numberWithCommas(Number(cleanValue(x?.toString(), decimals)));

// TODO make it change based on hemisphere ( ie swap winter and summer)
export enum SeasonType {
  WINTER = 'WINTER',
  SPRING = 'SPRING',
  SUMMER = 'SUMMER',
  FALL = 'FALL',
}

export const getSeason = (dateInSecs: number): SeasonType => {
  const month: number = getMonth(new Date(dateInSecs * 1000));
  const seasons = [
    SeasonType.WINTER,
    SeasonType.WINTER,
    SeasonType.SPRING,
    SeasonType.SPRING,
    SeasonType.SPRING,
    SeasonType.SUMMER,
    SeasonType.SUMMER,
    SeasonType.SUMMER,
    SeasonType.FALL,
    SeasonType.FALL,
    SeasonType.FALL,
    SeasonType.WINTER,
  ];
  return seasons[month];
};

export const formatFyTokenSymbol = (name: string) => `${name.slice(0, -4)}`;

export const valueAtDigits = (input: string, digits: number) =>
  input && input.length <= digits ? input : `${cleanValue(input, digits)}...`;

export const hexToRgb = (hex: string) => {
  const res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  const _res = {
    r: parseInt(res![1], 16),
    g: parseInt(res![2], 16),
    b: parseInt(res![3], 16),
  };
  return `${_res.r},${_res.g}, ${_res.b}`;
};
