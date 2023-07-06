import { FC, PropsWithChildren } from "react";
import Header from "./Header";

const Layout: FC<PropsWithChildren> = ({children}) => {
  return <div className="w-screen h-screen flex flex-col bg-black">
    <Header />
    <div className="w-full flex-1">
      {children}
    </div>
  </div>
}

export default Layout;
