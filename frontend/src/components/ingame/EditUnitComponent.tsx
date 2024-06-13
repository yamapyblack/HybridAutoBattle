import { useState, useEffect } from "react";
import Image from "next/image";
import { units } from "src/constants/units";
import { SKILLS } from "src/constants/skills";

const EditUnitComponent = ({
  index,
  unitId,
  isSub,
  setDraggedIndex,
  setDroppedIndex,
  handleDoubleClick,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleDrop = (e) => {
    console.log("handleDrop", index);
    e.preventDefault();
    setDroppedIndex({ index, isSub });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragStart = (e) => {
    console.log("handleDragStart", index);
    setDraggedIndex({ index, isSub });
    setShowTooltip(false);
  };

  const handleMouseEnter = () => {
    if (units[unitId].skillIds.length > 0) {
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    console.log("close");
    setShowTooltip(false);
  };

  return (
    <>
      <div className="p-2 relative">
        {!unitId ? (
          <>
            {isSub ? (
              <div
                style={{
                  width: "96px",
                  height: "128px",
                }}
              ></div>
            ) : (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                style={{
                  width: "96px",
                  height: "128px",
                }}
              ></div>
            )}
          </>
        ) : (
          <>
            <div
              draggable
              onDragStart={handleDragStart}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onDoubleClick={() => {
                setShowTooltip(false);
                handleDoubleClick();
              }}
            >
              <Image
                src={`/images/cards/${units[unitId].imagePath}.png`}
                alt=""
                width={96}
                height={96}
              />
            </div>
            <div className="flex justify-between">
              <div className="w-8 relative">
                <Image
                  src="/images/common/attack.png"
                  alt=""
                  width={32}
                  height={32}
                />
                <div className="absolute inset-0 flex items-center justify-center font-bold text-xl">
                  {units[unitId].attack}
                </div>
              </div>
              <div className="w-8 relative">
                <Image
                  src="/images/common/life.png"
                  alt=""
                  width={32}
                  height={32}
                />
                <div className="absolute inset-0 flex items-center justify-center font-bold text-xl">
                  {units[unitId].life}
                </div>
              </div>
            </div>
          </>
        )}
        {showTooltip && (
          <div
            className="absolute top-6 left-24 w-32 h-18 bg-darkgray rounded border-white border-solid border text-sm p-1"
            style={{ fontFamily: "Inter" }}
          >
            <p>{SKILLS[units[unitId].skillIds[0]].description}</p>
          </div>
        )}
      </div>
    </>
  );
};

// const NumberComponent = ({ value }) => {
//   const cellWidth = 30;
//   return (
//     <div
//       style={{
//         position: "absolute",
//         left: 2,
//         top: 3,
//         width: cellWidth,
//       }}
//     >
//       {value}
//     </div>
//   );
// };

export default EditUnitComponent;
