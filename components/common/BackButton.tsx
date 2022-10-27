import { ArrowLeftIcon } from '@heroicons/react/20/solid';

const BackButton = (props: any) => (
  <ArrowLeftIcon
    className="my-auto h-6 w-6 hover:text-primary-400 hover:cursor-pointer"
    onClick={props.onClick}
    {...props}
  />
);

export default BackButton;
