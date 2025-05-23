import { useState } from "react";
import { Slider } from "./Slider";

export const SliderExample = () => {
  const [range, setRange] = useState<[number, number]>([25, 75]);

  return (
    <div className="p-4 max-w-lg">
      <h2 className="text-lg font-semibold mb-4">Range Slider Example</h2>

      <div className="mb-4">
        <Slider min={0} max={100} value={range} onChange={setRange} step={1} />
      </div>

      <div className="flex justify-between text-sm">
        <div>Min value: {range[0]}</div>
        <div>Max value: {range[1]}</div>
      </div>

      <div className="mt-6">
        <h3 className="text-md font-medium mb-2">Disabled Example</h3>
        <Slider
          min={0}
          max={100}
          value={[30, 70]}
          onChange={() => {}}
          disabled={true}
        />
      </div>
    </div>
  );
};
