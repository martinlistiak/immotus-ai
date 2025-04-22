import { Card } from "app/components/Card";
import {
  IoCubeOutline,
  IoSunnyOutline,
  IoMoveOutline,
  IoSquareOutline,
  IoTextOutline,
  IoAddOutline,
} from "react-icons/io5";
import { ImSphere } from "react-icons/im";
import { GiCube, GiCubeforce, GiRing } from "react-icons/gi";
import { TbOctahedron } from "react-icons/tb";
import { FaDiceD20 } from "react-icons/fa";
import {
  LuUndo2,
  LuRedo2,
  LuCone,
  LuTorus,
  LuCylinder,
  LuPyramid,
} from "react-icons/lu";
import type { ReactNode } from "react";
import cn from "classnames";
import {
  BsCursor,
  BsCircle,
  BsDiamond,
  BsHexagon,
  BsTriangle,
} from "react-icons/bs";
import type { SceneTool } from "app/types/scene-ast";
import { useSceneContext } from "../Scene/Scene.context";
import { Tooltip } from "app/components/Tooltip";
import { NodeIcon } from "app/components/NodeIcon";
import { Dropdown } from "app/components/Dropdown";
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
  tooltipPosition = "right",
  doNotSetActiveTool = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  tool?: SceneTool | string;
  disabled?: boolean;
  doNotSetActiveTool?: boolean;
  tooltipPosition?: "top" | "right" | "bottom" | "left";
}) => {
  const { activeTool, setActiveTool } = useSceneContext();
  const isSelected = activeTool === tool;
  return (
    // tooltip
    <Tooltip text={tool!} initialPosition={tooltipPosition}>
      <div
        className={cn(
          "w-8 h-8 hover:bg-[rgba(255,255,255,0.05)] flex items-center justify-center text-white cursor-pointer rounded-sm",
          {
            "bg-active cursor-default hover:bg-active": isSelected,
            "!cursor-default opacity-50 hover:bg-transparent": disabled,
          }
        )}
        onClick={() => {
          if (tool && !doNotSetActiveTool) {
            setActiveTool(tool as SceneTool);
          }
          onClick?.();
        }}
      >
        {children}
      </div>
    </Tooltip>
  );
};

export const Toolbar = () => {
  const { undo, redo, history, historyIndex } = useSceneContext();
  return (
    <Card className="fixed top-4 left-[50%] translate-x-[-50%] flex h-12">
      <Group>
        <Button
          tooltipPosition="bottom"
          disabled={historyIndex === 0}
          tool="undo"
          doNotSetActiveTool
          onClick={() => {
            undo();
          }}
        >
          <LuUndo2 className="w-5 h-5" />
        </Button>
        <Button
          tool="redo"
          tooltipPosition="bottom"
          disabled={historyIndex === history.length - 1}
          doNotSetActiveTool
          onClick={() => {
            redo();
          }}
        >
          <LuRedo2 className="w-5 h-5" />
        </Button>
      </Group>
      <Group>
        {/* Dropdown for object types */}
        <Dropdown
          items={[
            <Button tool="box">
              <NodeIcon type="box" className="w-5 h-5" />
            </Button>,
            <Button tool="sphere">
              <NodeIcon type="sphere" className="w-5 h-5" />
            </Button>,
            <Button tool="plane">
              <NodeIcon type="plane" className="w-5 h-5" />
            </Button>,
            <Button tool="cylinder">
              <NodeIcon type="cylinder" className="w-5 h-5" />
            </Button>,
            <Button tool="cone">
              <NodeIcon type="cone" className="w-5 h-5" />
            </Button>,
            <Button tool="torus">
              <NodeIcon type="torus" className="w-5 h-5" />
            </Button>,
            <Button tool="circle">
              <NodeIcon type="circle" className="w-5 h-5" />
            </Button>,
            <Button tool="ring">
              <NodeIcon type="ring" className="w-5 h-5" />
            </Button>,
            <Button tool="dodecahedron">
              <NodeIcon type="dodecahedron" className="w-5 h-5" />
            </Button>,
            <Button tool="icosahedron">
              <NodeIcon type="icosahedron" className="w-5 h-5" />
            </Button>,
            <Button tool="octahedron">
              <NodeIcon type="octahedron" className="w-5 h-5" />
            </Button>,
            <Button tool="tetrahedron">
              <NodeIcon type="tetrahedron" className="w-5 h-5" />
            </Button>,
            <Button tool="torusknot">
              <NodeIcon type="torusknot" className="w-5 h-5" />
            </Button>,
            <Button tool="text">
              <NodeIcon type="text" className="w-5 h-5" />
            </Button>,
            <Button tool="light">
              <NodeIcon type="light" className="w-5 h-5" />
            </Button>,
          ]}
        >
          <Button tool="Add Object" tooltipPosition="bottom" doNotSetActiveTool>
            <IoAddOutline className="w-5 h-5" />
          </Button>
        </Dropdown>
      </Group>
      <Group>
        <Button tool="move" tooltipPosition="bottom">
          <IoMoveOutline className="w-5 h-5" />
        </Button>
        <Button tool="select" tooltipPosition="bottom">
          <BsCursor className="w-5 h-5" />
        </Button>
      </Group>
    </Card>
  );
};
