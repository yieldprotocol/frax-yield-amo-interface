import { secondsToFrom } from '@yield-protocol/ui-math';
import { formatDistanceStrict } from 'date-fns';
import { useEffect, useState } from 'react';

const useTimeTillMaturity = (maturity: number) => {
  const [secondsTillMaturity, setSecondsTillMaturity] = useState<number>(0);

  useEffect(() => {
    if (maturity) {
      const _secondsTillMaturity = Number(secondsToFrom(maturity.toString()));
      _secondsTillMaturity > 0 ? setSecondsTillMaturity(_secondsTillMaturity) : setSecondsTillMaturity(0);
    }
  }, [maturity]);

  const timeTillMaturity_ = formatDistanceStrict(
    new Date(1, 1, 0, 0, 0, 0),
    new Date(1, 1, 0, 0, 0, secondsTillMaturity)
  );

  return timeTillMaturity_;
};

export default useTimeTillMaturity;
