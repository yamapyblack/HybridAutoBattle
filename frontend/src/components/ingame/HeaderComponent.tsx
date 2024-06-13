import Image from "next/image";
import { useState, useEffect } from "react";
import { clearStorage } from "src/utils/debugStorage";
import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from "wagmi";
import { truncatedText } from "src/utils/Utils";
import PopupComponent from "src/components/ingame/PopupComponent";

const HeaderComponent = ({ stage, leftStamina }) => {
  const { address } = useAccount();
  const [showDisconnectPopup, setShowDisconnectPopup] = useState(false);
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });

  return (
    <>
      {showDisconnectPopup && (
        <PopupComponent
          title={"Disconnect?"}
          description={""}
          clickOk={disconnect}
          isCancel={true}
          clickCancel={() => {
            setShowDisconnectPopup(false);
          }}
        />
      )}

      <header className="p-2">
        <div className="flex justify-between">
          {/* Stamina and Stage */}
          <div className="flex ml-16 mt-4">
            <div className="flex justify-between items-center w-20 rounded-md bg-darkgray  mr-2 pl-2 pr-2">
              <Image
                src="/images/edit/stage.png"
                alt=""
                width={16}
                height={16}
              />
              <div className="text-lg font-bold">{stage + 1}</div>
            </div>
            <div className="flex justify-between items-center w-20 rounded-md bg-darkgray mr-2 pl-2 pr-2">
              <Image
                src="/images/common/life.png"
                alt=""
                width={16}
                height={16}
              />
              <div className="text-lg font-bold">{leftStamina}</div>
            </div>
          </div>
          <div className="flex mr-16 mt-4 justify-between items-center rounded-md bg-darkgray py-1.5 px-4">
            <div className="mr-3">
              <Image
                src="/images/common/wallet_icon.png"
                alt=""
                width={18}
                height={18}
              />
            </div>
            {address && (
              <button
                className=" text-gray-300"
                onClick={() => setShowDisconnectPopup(true)}
              >
                {ensName
                  ? `${truncatedText(ensName, 12)}`
                  : truncatedText(address, 12)}
              </button>
            )}
          </div>
        </div>
        {process.env.NEXT_PUBLIC_DEBUG_MODE === "true" && (
          <button onClick={clearStorage}>Clear Local Storage</button>
        )}
      </header>
    </>
  );
};

export default HeaderComponent;
