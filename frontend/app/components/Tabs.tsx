import cn from "classnames";

export const Tabs = ({
  tabs,
  activeTab,
  setActiveTab,
  size = "md",
}: {
  tabs: string[];
  activeTab: string;
  size?: "sm" | "md";
  setActiveTab: (tab: string) => void;
}) => {
  return (
    <div
      className={cn({
        "grid w-full": true,
        "mb-[12px]": size === "md",
        "mb-[8px]": size === "sm",
        "grid-cols-2": tabs.length === 2,
        "grid-cols-3": tabs.length === 3,
        "grid-cols-4": tabs.length === 4,
      })}
    >
      {tabs.map((tab) => (
        <div
          key={tab}
          className={cn({
            "text-gray-400 px-[4px] cursor-pointer transition-all border-gray-700 justify-center text-center":
              true,
            "text-[10px] pb-[4px] border-b-1": size === "sm",
            "text-xs pb-[8px] border-b-2": size === "md",
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
