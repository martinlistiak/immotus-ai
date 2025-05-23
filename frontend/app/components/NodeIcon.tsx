import type { ObjectType } from "app/types/scene-ast";
import { IoCubeOutline, IoSquareOutline } from "react-icons/io5";
import { IoEllipseOutline } from "react-icons/io5";
import { IoSunnyOutline } from "react-icons/io5";
import { RiShapesLine } from "react-icons/ri";
import cn from "classnames";
import { LuCamera, LuGroup, LuImage, LuPyramid, LuVideo } from "react-icons/lu";
import { LuCylinder } from "react-icons/lu";
import { LuCone } from "react-icons/lu";
import { LuTorus } from "react-icons/lu";
import { GiRing } from "react-icons/gi";
import { GiCube } from "react-icons/gi";
import { BsCircle } from "react-icons/bs";
import { FaDiceD20 } from "react-icons/fa";
import { TbOctahedron } from "react-icons/tb";
import { BsHexagon } from "react-icons/bs";
import { IoTextOutline } from "react-icons/io5";
import { ImSphere } from "react-icons/im";

{
  /* <Button tool="box">
          <IoCubeOutline className="w-5 h-5" />
        </Button>
        <Button tool="sphere">
          <ImSphere className="w-5 h-5" />
        </Button>
        <Button tool="plane">
          <IoSquareOutline className="w-5 h-5" />
        </Button>
        <Button tool="cylinder">
          <LuCylinder className="w-5 h-5" />
        </Button>
        <Button tool="cone">
          <LuCone className="w-5 h-5" />
        </Button>
        <Button tool="torus">
          <LuTorus className="w-5 h-5" />
        </Button>
        <Button tool="circle">
          <BsCircle className="w-5 h-5" />
        </Button>
        <Button tool="ring">
          <GiRing className="w-5 h-5" />
        </Button>
        <Button tool="dodecahedron">
          <GiCube className="w-5 h-5" />
        </Button>
        <Button tool="icosahedron">
          <FaDiceD20 className="w-5 h-5" />
        </Button>
        <Button tool="octahedron">
          <TbOctahedron className="w-5 h-5" />
        </Button>
        <Button tool="tetrahedron">
          <LuPyramid className="w-5 h-5" />
        </Button>
        <Button tool="torusknot">
          <BsHexagon className="w-5 h-5" />
        </Button>
        <Button tool="text">
          <IoTextOutline className="w-5 h-5" />
        </Button>
        <Button tool="light">
          <IoSunnyOutline className="w-5 h-5" />
        </Button> */
}

export const NodeIcon = ({
  type,
  className,
}: {
  type: ObjectType;
  className?: string;
}) => {
  switch (type) {
    case "box":
      return (
        <IoCubeOutline
          className={cn(
            "w-[18px] h-[18px] min-w-[18px] min-h-[18px]",
            className
          )}
        />
      );
    case "sphere":
      return (
        <ImSphere
          className={cn(
            "w-[18px] h-[18px] min-w-[18px] min-h-[18px]",
            className
          )}
        />
      );
    case "mesh":
      return (
        <RiShapesLine
          className={cn(
            "w-[18px] h-[18px] min-w-[18px] min-h-[18px]",
            className
          )}
        />
      );
    case "cylinder":
      return (
        <LuCylinder
          className={cn(
            "w-[18px] h-[18px] min-w-[18px] min-h-[18px]",
            className
          )}
        />
      );
    case "cone":
      return (
        <LuCone
          className={cn(
            "w-[18px] h-[18px] min-w-[18px] min-h-[18px]",
            className
          )}
        />
      );
    case "torus":
      return (
        <LuTorus
          className={cn(
            "w-[18px] h-[18px] min-w-[18px] min-h-[18px]",
            className
          )}
        />
      );
    case "circle":
      return (
        <BsCircle
          className={cn(
            "w-[18px] h-[18px] min-w-[18px] min-h-[18px]",
            className
          )}
        />
      );
    case "ring":
      return (
        <GiRing
          className={cn(
            "w-[18px] h-[18px] min-w-[18px] min-h-[18px]",
            className
          )}
        />
      );
    case "dodecahedron":
      return (
        <GiCube
          className={cn(
            "w-[18px] h-[18px] min-w-[18px] min-h-[18px]",
            className
          )}
        />
      );
    case "icosahedron":
      return (
        <FaDiceD20
          className={cn(
            "w-[18px] h-[18px] min-w-[18px] min-h-[18px]",
            className
          )}
        />
      );
    case "octahedron":
      return (
        <TbOctahedron
          className={cn(
            "w-[18px] h-[18px] min-w-[18px] min-h-[18px]",
            className
          )}
        />
      );
    case "tetrahedron":
      return (
        <LuPyramid
          className={cn(
            "w-[18px] h-[18px] min-w-[18px] min-h-[18px]",
            className
          )}
        />
      );
    case "torusknot":
      return (
        <BsHexagon
          className={cn(
            "w-[18px] h-[18px] min-w-[18px] min-h-[18px]",
            className
          )}
        />
      );
    case "text":
      return (
        <IoTextOutline
          className={cn(
            "w-[18px] h-[18px] min-w-[18px] min-h-[18px]",
            className
          )}
        />
      );
    case "light":
      return <IoSunnyOutline className={cn("w-[18px] h-[20px]", className)} />;
    case "plane":
      return (
        <IoSquareOutline
          className={cn(
            "w-[18px] h-[18px] min-w-[18px] min-h-[18px]",
            className
          )}
        />
      );
    case "group":
      return (
        <LuGroup
          className={cn(
            "w-[18px] h-[18px] min-w-[18px] min-h-[18px]",
            className
          )}
        />
      );
    // case "camera":
    //   return <LuCamera className={cn("w-[18px] h-[18px] min-w-[18px] min-h-[18px]", className)} />;
    // case "image":
    //   return <LuImage className={cn("w-[18px] h-[18px] min-w-[18px] min-h-[18px]", className)} />;
    // case "video":
    //   return <LuVideo className={cn("w-[18px] h-[18px] min-w-[18px] min-h-[18px]", className)} />;

    default:
      return null;
  }
};
