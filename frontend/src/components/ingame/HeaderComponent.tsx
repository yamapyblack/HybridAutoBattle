import Image from "next/image";
import { useState } from "react";
import { clearStorage } from "src/utils/debugStorage";
import { useAccount, useDisconnect, useEnsName } from "wagmi";
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
            <div className="flex justify-between items-center w-20 rounded-md text-2xl font-bold">
              <p className="">STAGE:</p>
              <p className="ml-2">{stage + 1}</p>
            </div>
            <div className="flex justify-between items-center rounded-md ml-6">
              {Array.from({ length: leftStamina }).map((_, index) => (
                <div key={index} className="mx-1">
                  <Image
                    key={index}
                    src="/images/common/life.png"
                    alt=""
                    width={24}
                    height={24}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="mr-16 mt-4 text-2xl">
            {address && (
              <button className="" onClick={() => setShowDisconnectPopup(true)}>
                {ensName
                  ? `${truncatedText(ensName, 14)}`
                  : truncatedText(address, 14)}
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
