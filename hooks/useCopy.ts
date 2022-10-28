import { useEffect, useState } from 'react';
import { copyToClipboard } from '../utils/appUtils';

const useCopy = (value: string) => {
  const [copied, setCopied] = useState<boolean>(false);

  const copy = (e: ClipboardEvent) => {
    setCopied(true);
    copyToClipboard(value);
  };

  useEffect(() => {
    copied && (async () => setTimeout(() => setCopied(false), 5000))();
  }, [copied]);

  return { copied, copy };
};

export default useCopy;
