import { RxDimensions } from "react-icons/rx";
import { BsBadge3dFill } from "react-icons/bs";
import { Card } from "app/components/Card";
import { IoMoveOutline, IoAddOutline } from "react-icons/io5";
import { LuUndo2, LuRedo2, LuLogOut } from "react-icons/lu";
import type { ReactNode } from "react";
import cn from "classnames";
import { BsCursor } from "react-icons/bs";
import { CameraType, type SceneTool } from "app/types/scene-ast";
import { useSceneContext } from "../Scene/Scene.context";
import { Tooltip } from "app/components/Tooltip";
import { NodeIcon } from "app/components/NodeIcon";
import { Dropdown } from "app/components/Dropdown";
import { Avatar } from "app/components/Avatar";
import { useAuthContext } from "app/contexts/auth.context";

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
  camera,
  disabled,
  tooltipPosition = "right",
  doNotSetActiveTool = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  tool?: SceneTool | string;
  camera?: CameraType;
  disabled?: boolean;
  doNotSetActiveTool?: boolean;
  tooltipPosition?: "top" | "right" | "bottom" | "left";
}) => {
  const { activeTool, setActiveTool, activeCamera, setActiveCamera } =
    useSceneContext();
  const isSelected = activeTool === tool || activeCamera === camera;
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
          if (!camera && tool && !doNotSetActiveTool) {
            setActiveTool(tool as SceneTool);
          }
          if (camera && !tool) {
            setActiveCamera(camera);
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
  const { user, logout } = useAuthContext();
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
      <Group>
        <Button
          camera={CameraType.THREE_D}
          tooltipPosition="bottom"
          doNotSetActiveTool
        >
          <BsBadge3dFill className="w-5 h-5" />
        </Button>
        <Button
          camera={CameraType.TWO_D}
          tooltipPosition="bottom"
          doNotSetActiveTool
        >
          <RxDimensions className="w-5 h-5" />
        </Button>
      </Group>
      <Group>
        <Dropdown
          items={[
            <div
              className="text-white px-3 py-[2px] cursor-pointer hover:bg-[rgba(255,255,255,0.05)] text-sm flex items-center"
              onClick={() => logout()}
            >
              <LuLogOut className="w-3 h-3 mr-2" />
              Logout
            </div>,
          ]}
        >
          <Tooltip
            capitalize={false}
            text={
              <div className="flex flex-col items-center">
                <div>
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-gray-400">{user?.email}</div>
              </div>
            }
            initialPosition="bottom"
          >
            <Avatar
              className="ml-2 my-[4px] cursor-pointer"
              initial={user?.firstName?.charAt(0)}
            />
          </Tooltip>
        </Dropdown>
      </Group>
    </Card>
  );
};
