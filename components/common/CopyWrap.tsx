import { CheckCircleIcon, ClipboardDocumentIcon } from '@heroicons/react/20/solid';
import { useState, useEffect, ReactNode } from 'react';
import { copyToClipboard } from '../../utils/appUtils';
import InfoIcon from './InfoIcon';

interface Props {
  children: ReactNode;
  value: string;
  label: string;
}

const CopyWrap = ({ children, value, label }: Props) => {
  const [copied, setCopied] = useState<boolean>(false);

  const copy = (e: any) => {
    e.stopPropagation();
    setCopied(true);
    copyToClipboard(value);
  };

  useEffect(() => {
    copied && (async () => setTimeout(() => setCopied(false), 5000))();
  }, [copied]);

  return (
    <div className="flex gap-2 hover:text-gray-600 cursor-pointer items-center" onClick={(e: any) => copy(e)}>
      {children}
      {copied ? (
        <CheckCircleIcon className="h-4 w-4" />
      ) : (
        <InfoIcon infoText={label}>
          <ClipboardDocumentIcon className="h-4 w-4" />
        </InfoIcon>
      )}
    </div>
  );
};

export default CopyWrap;
