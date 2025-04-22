import cn from "classnames";

export const Tabs = ({
  tabs,
  activeTab,
  setActiveTab,
}: {
  tabs: string[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => {
  return (
    <div
      className={cn({
        "grid w-full mb-[12px]": true,
        "grid-cols-2": tabs.length === 2,
        "grid-cols-3": tabs.length === 3,
        "grid-cols-4": tabs.length === 4,
      })}
    >
      {tabs.map((tab) => (
        <div
          key={tab}
          className={cn({
            "text-xs text-gray-400 py-[4px] px-[4px] rounded-t-sm cursor-pointer transition-all border-b-2 border-transparent justify-center text-center":
              true,
            "text-white border-white": activeTab === tab,
          })}
          onClick={() => setActiveTab(tab)}
        >
          {tab}
        </div>
      ))}
    </div>
  );
};
