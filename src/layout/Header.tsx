import { ConnectButton } from '@rainbow-me/rainbowkit';

const Header = () => {
  return <div className="w-full flex-shrink-0 z-50 h-20 flex justify-center">
    <div className="w-full mx-auto flex justify-between items-center px-4 max-w-5xl">
      <h1 className="text-white text-3xl">WOOF Bridge</h1>
      <ConnectButton />
    </div>
  </div>
}

export default Header;