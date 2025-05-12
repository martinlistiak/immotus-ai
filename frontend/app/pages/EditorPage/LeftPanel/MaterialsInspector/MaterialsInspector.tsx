import { useEffect, useMemo, useState } from "react";
import { useSceneContext } from "../../Scene/Scene.context";
import type {
  BoxAttributes,
  ObjectAttributes,
  SceneObjects,
} from "app/types/scene-ast";
import type {
  BaseObjectWithMaterialAttributes,
  AbstractSyntaxTree,
} from "app/types/scene-ast";
import { GiCircularSaw } from "react-icons/gi";
import { ColorInput } from "app/components/ColorInput";
import { Input } from "app/components/Input";
import { Tooltip } from "app/components/Tooltip";
import { CuttingPlan } from "./CuttingPlan/CuttingPlan";
import { isValidColor } from "app/utils/utils";
import { produce } from "immer";

export type UniqueMaterialsWithSquareMetersAndVolume = {
  material: {
    squareMeters: number;
    totalVolume: number;
    color: string;
    roughness: number;
    metalness: number;
  };
  objects: AbstractSyntaxTree<ObjectAttributes>[];
};

const generateUniqueMaterials = (scene: SceneObjects) => {
  const uniqueMaterials = scene
    ?.filter(
      (object) =>
        (object.attributes as BaseObjectWithMaterialAttributes).material
    )
    .reduce((acc, object: AbstractSyntaxTree<ObjectAttributes>) => {
      let material = (object.attributes as BaseObjectWithMaterialAttributes)
        .material;
      const materialJson = JSON.stringify(material);
      if (!acc[materialJson]) {
        acc[materialJson] = [object];
      } else {
        acc[materialJson].push(object);
      }
      return acc;
    }, {} as Record<string, AbstractSyntaxTree<ObjectAttributes>[]>);

  const uniqueMaterialsWithSquareMetersAndVolume = Object.entries(
    uniqueMaterials || {}
  )
    .map(([materialJson, objects]) => {
      return {
        material: {
          ...(JSON.parse(
            materialJson
          ) as BaseObjectWithMaterialAttributes["material"]),
          squareMeters: objects
            .filter((object) => object.type === "box")
            .reduce((acc, object) => {
              const sidesOrderedBySize = [
                (object.attributes as BoxAttributes).scale.x,
                (object.attributes as BoxAttributes).scale.y,
                (object.attributes as BoxAttributes).scale.z,
              ].sort((a, b) => a - b);
              return acc + sidesOrderedBySize[1] * sidesOrderedBySize[2];
            }, 0),
          totalVolume: objects.reduce((acc, object) => {
            return (
              acc +
              (object.attributes as BoxAttributes).scale.x *
                (object.attributes as BoxAttributes).scale.y *
                (object.attributes as BoxAttributes).scale.z
            );
          }, 0),
        },
        objects,
      };
    })
    .sort((a, b) => b.material.squareMeters - a.material.squareMeters);

  return uniqueMaterialsWithSquareMetersAndVolume;
};

export const MaterialsInspector = () => {
  const { scene, dispatchScene } = useSceneContext();
  const [uniqueMaterials, setUniqueMaterials] = useState<
    UniqueMaterialsWithSquareMetersAndVolume[]
  >([]);
  const [selectedMaterial, setSelectedMaterial] =
    useState<UniqueMaterialsWithSquareMetersAndVolume | null>(null);

  useEffect(() => {
    const uniqueMaterialsWithSquareMetersAndVolume = generateUniqueMaterials(
      scene!.objects
    );

    setUniqueMaterials(uniqueMaterialsWithSquareMetersAndVolume);
  }, [scene]);

  const updateMaterial = (
    originalColor: string,
    originalMetalness: number,
    originalRoughness: number,
    value: string,
    type: "color" | "metalness" | "roughness"
  ) => {
    if (type === "color" && !isValidColor(value) && value !== originalColor) {
      return;
    }

    const updatedScene = produce(scene, (draft) => {
      draft?.objects.forEach((object) => {
        const objectTyped =
          object as AbstractSyntaxTree<BaseObjectWithMaterialAttributes>;
        if (
          objectTyped?.attributes?.material &&
          objectTyped.attributes.material.color === originalColor &&
          objectTyped.attributes.material.metalness === originalMetalness &&
          objectTyped.attributes.material.roughness === originalRoughness
        ) {
          // @ts-ignore
          objectTyped.attributes.material[type] =
            type === "color" ? value : Number(value);
        }
      });
    });

    dispatchScene({
      type: "SET_SCENE",
      payload: {
        scene: updatedScene!,
      },
    });
  };

  const validateInputOnBlur = (
    originalColor: string,
    originalMetalness: number,
    originalRoughness: number,
    type: "color" | "metalness" | "roughness"
  ) => {
    return (e: React.FocusEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const numValue = Number(value);
      if (isNaN(numValue) && type !== "color") {
        e.target.value = "0";
        updateMaterial(
          originalColor,
          originalMetalness,
          originalRoughness,
          "0",
          type
        );
      }
    };
  };

  return (
    <div className="p-2">
      {uniqueMaterials?.map((uniqueMaterial, i) => {
        return (
          <div
            key={i}
            className="text-[11px] mb-3 border-b border-white/10 pb-4"
          >
            <div className="flex items-center gap-x-2 mb-2 justify-between">
              <div className="text-white font-semibold">Material {i + 1}</div>
              <Tooltip text="Cutting plan">
                <GiCircularSaw
                  onClick={() =>
                    setSelectedMaterial(
                      uniqueMaterial as unknown as UniqueMaterialsWithSquareMetersAndVolume
                    )
                  }
                  className="text-white/50 w-6 h-6 hover:text-white cursor-pointer hover:bg-gray-800 rounded-sm p-1"
                />
              </Tooltip>
            </div>

            <div>
              <div className="grid grid-cols-[70px_1fr] justify-end gap-x-1 gap-y-1 text-[11px] items-center">
                <div>Color</div>
                <ColorInput
                  value={uniqueMaterial.material.color}
                  onChange={(e) => {
                    updateMaterial(
                      uniqueMaterial.material.color,
                      uniqueMaterial.material.metalness,
                      uniqueMaterial.material.roughness,
                      e.target.value,
                      "color"
                    );
                  }}
                />
                <div>Metalness</div>
                <Input
                  type="text"
                  value={uniqueMaterial.material.metalness}
                  onChange={(e) => {
                    updateMaterial(
                      uniqueMaterial.material.color,
                      uniqueMaterial.material.metalness,
                      uniqueMaterial.material.roughness,
                      e.target.value,
                      "metalness"
                    );
                  }}
                  onBlur={validateInputOnBlur(
                    uniqueMaterial.material.color,
                    uniqueMaterial.material.metalness,
                    uniqueMaterial.material.roughness,
                    "metalness"
                  )}
                />
                <div>Roughness</div>
                <Input
                  type="text"
                  value={uniqueMaterial.material.roughness}
                  onChange={(e) => {
                    updateMaterial(
                      uniqueMaterial.material.color,
                      uniqueMaterial.material.metalness,
                      uniqueMaterial.material.roughness,
                      e.target.value,
                      "roughness"
                    );
                  }}
                  onBlur={validateInputOnBlur(
                    uniqueMaterial.material.color,
                    uniqueMaterial.material.metalness,
                    uniqueMaterial.material.roughness,
                    "roughness"
                  )}
                />
                <div className="font-semibold">Total area</div>
                <div>{uniqueMaterial.material.squareMeters.toFixed(2)} m²</div>
                <div className="font-semibold">Volume</div>
                <div>{uniqueMaterial.material.totalVolume.toFixed(2)} m³</div>
              </div>
            </div>
          </div>
        );
      })}
      {selectedMaterial && (
        <CuttingPlan
          material={selectedMaterial}
          onClose={() => setSelectedMaterial(null)}
        />
      )}
    </div>
  );
};
