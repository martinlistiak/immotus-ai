import { Card } from "app/components/Card";
import { IoCubeOutline, IoSunnyOutline, IoMoveOutline } from "react-icons/io5";
import { GiMeshNetwork } from "react-icons/gi";
import { LuUndo2, LuRedo2 } from "react-icons/lu";
import type { ReactNode } from "react";
import cn from "classnames";
import { BsCursor } from "react-icons/bs";
import type { SceneTool } from "app/types/scene-ast";
import { useSceneContext } from "../Scene/Scene.context";
const Group = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex items-center h-full w-fit not-last:border-r-2 not-last:mr-2 not-last:pr-2 border-gray-600">
      {children}
    </div>
  );
};

const Button = ({
  children,
  onClick,
  tool,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  tool?: SceneTool;
  disabled?: boolean;
}) => {
  const { activeTool, setActiveTool } = useSceneContext();
  const isSelected = activeTool === tool;
  return (
    <div
      className={cn(
        "w-8 h-8 hover:bg-[rgba(255,255,255,0.05)] flex items-center justify-center text-white cursor-pointer rounded-sm",
        {
          "bg-active cursor-default hover:bg-active": isSelected,
          "!cursor-default opacity-50 hover:bg-transparent": disabled,
        }
      )}
      onClick={() => {
        if (tool) {
          setActiveTool(tool);
        }
        onClick?.();
      }}
    >
      {children}
    </div>
  );
};

export const Toolbar = () => {
  const { undo, redo, history, historyIndex } = useSceneContext();
  return (
    <Card className="fixed top-4 left-[50%] translate-x-[-50%] flex h-12">
      <Group>
        <Button
          disabled={historyIndex === 0}
          onClick={() => {
            undo();
          }}
        >
          <LuUndo2 className="w-5 h-5" />
        </Button>
        <Button
          disabled={historyIndex === history.length - 1}
          onClick={() => {
            redo();
          }}
        >
          <LuRedo2 className="w-5 h-5" />
        </Button>
      </Group>
      <Group>
        <Button tool="box">
          <IoCubeOutline className="w-5 h-5" />
        </Button>
        <Button tool="light">
          <IoSunnyOutline className="w-5 h-5" />
        </Button>
        {/* <Button tool="mesh">
          <GiMeshNetwork className="w-5 h-5" />
        </Button> */}
      </Group>
      <Group>
        <Button tool="move">
          <IoMoveOutline className="w-5 h-5" />
        </Button>
        <Button tool="select">
          <BsCursor className="w-5 h-5" />
        </Button>
      </Group>
    </Card>
  );
};
