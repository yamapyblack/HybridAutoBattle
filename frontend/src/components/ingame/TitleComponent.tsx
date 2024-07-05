import Image from "next/image";

const TitleComponent = () => {
  return (
    <div className=" mb-20">
      <Image
        src="/images/common/battlelayer_title.png"
        alt="battlelayer_title"
        width={480}
        height={0}
        className="w-full h-auto"
        priority={true}
      />
    </div>
  );
};

export default TitleComponent;
