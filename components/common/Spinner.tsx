import tw from 'tailwind-styled-components';

const Style = tw.div`spinner-border animate-spin inline-block w-6 h-6 border-4 rounded-full border-primary-200 border-t-primary-400`;

const Spinner = () => <Style />;

export default Spinner;
