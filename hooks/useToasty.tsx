import { toast } from 'react-toastify';
import tw from 'tailwind-styled-components';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/20/solid';

const Body = tw.div`flex gap-3 items-center align-middle`;
const Text = tw.div` text-sm`;
const Spinner = tw.div`spinner-border animate-spin h-5 w-5 border-5 rounded-full border-primary-200 border-t-secondary-400`;
const A = tw.a`dark:hover:underline dark:decoration-gray-50`;

const Inner = ({ msg, link }: { msg: string; link?: string }) => (
  <Body>
    {link ? (
      <A href={link} target="_blank" rel="noreferrer" className="etherscan-link">
        <Text>{msg}</Text>
      </A>
    ) : (
      <Text>{msg}</Text>
    )}
  </Body>
);

const Pending = ({ msg, link }: { msg: string; link?: string }) => (
  <Body>
    {/* <Spinner /> */}
    <Inner msg={msg} link={link} />
  </Body>
);

const Success = ({ msg, link }: { msg: string; link?: string }) => (
  <Body>
    <CheckCircleIcon color="#10b981" height="25px" width="25px" />
    <Inner msg={msg} link={link} />
  </Body>
);

const Error = ({ msg, link }: { msg: string; link?: string }) => (
  <Body>
    <ExclamationCircleIcon color="#ef4444" height="25px" width="25px" />
    <Inner msg={msg} link={link} />
  </Body>
);

const useToasty = () => {
  const toasty = (promise: () => Promise<void>, msg: string, link?: string) =>
    toast.promise(promise, {
      pending: {
        render() {
          return <Pending msg={msg} link={link} />;
        },
        icon: true,
      },
      success: {
        render() {
          return <Success msg={msg} link={link} />;
        },
        icon: false,
      },
      error: {
        render() {
          return <Error msg={msg} link={link} />;
        },
        icon: false,
      },
    });

  return { toasty };
};

export default useToasty;
