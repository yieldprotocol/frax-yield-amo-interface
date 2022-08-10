import tw from 'tailwind-styled-components';
import AssetLogo from './AssetLogo';
import Modal from './Modal';

const Button = tw.button`bg-gray-700 hover:bg-gray-500/25 border border-gray-700 hover:border-secondary-500 text-gray-50`;

type IAssetSelectModal = {
  open: boolean;
  setOpen: (open: boolean) => void;
  action: (asset: string) => void;
};

const AssetSelectModal = ({ open, setOpen, action }: IAssetSelectModal) => (
  <Modal isOpen={open} setIsOpen={setOpen}>
    {['ETH', 'USDC'].map((asset: string) => (
      <Button
        className="flex my-2 p-4 bg-gray-700 rounded-md gap-3 align-middle w-full items-center"
        onClick={() => {
          action(asset);
          setOpen(false);
        }}
        key={asset}
      >
        <AssetLogo image={asset} />
        {asset}
      </Button>
    ))}
  </Modal>
);

export default AssetSelectModal;
