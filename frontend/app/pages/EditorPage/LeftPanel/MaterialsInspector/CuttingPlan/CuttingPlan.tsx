import { Input } from "app/components/Input";
import { Modal } from "app/components/Modal";
import type { UniqueMaterialsWithSquareMetersAndVolume } from "../MaterialsInspector";
import { Tooltip } from "app/components/Tooltip";
import { useEffect, useRef, useState } from "react";
import type {
  AbstractSyntaxTree,
  BoxAttributes,
  ObjectAttributes,
} from "app/types/scene-ast";

// Represents a rectangular item to be cut
interface CutItem {
  width: number; // in mm
  height: number; // in mm
  id: string;
  type: string;
  color: string;
  rotation: number; // 0 or 90 degrees
  area?: number; // Optional area field for sorting
}

// Represents a position in the stock panel
interface Position {
  x: number;
  y: number;
}

// Represents a placed item in the cutting plan
interface PlacedItem extends CutItem, Position {}

// Free rectangle in the bin packing algorithm
interface FreeRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Result of a packing attempt
interface PackingResult {
  placedItems: PlacedItem[];
  usedArea: number;
  totalArea: number;
  wastePercentage: number;
  maxHeight: number;
}

export const CuttingPlan = ({
  material,
  onClose,
}: {
  material: UniqueMaterialsWithSquareMetersAndVolume; // Using the first element type
  onClose: () => void;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [stockPanelWidth, setStockPanelWidth] = useState<number>(4000);
  const [stockPanelLength, setStockPanelLength] = useState<number | undefined>(
    undefined
  );
  const [cuttingPlan, setCuttingPlan] = useState<PlacedItem[]>([]);
  const [wastePercentage, setWastePercentage] = useState<number>(0);
  const [scale, setScale] = useState<number>(0.1); // 1mm = 0.1px
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [fontScale, setFontScale] = useState<number>(1); // Font size multiplier

  // Get device pixel ratio for high-resolution rendering
  const getDevicePixelRatio = (): number => {
    return window.devicePixelRatio || 1;
  };

  // Convert 3D objects to 2D rectangles for cutting
  const getCutItems = (): CutItem[] => {
    const items: CutItem[] = [];

    if (material.objects) {
      material.objects.forEach(
        (object: AbstractSyntaxTree<ObjectAttributes>) => {
          // Only consider box objects for now
          if (object.type === "box") {
            const attrs = object.attributes as BoxAttributes;

            // Get the two largest dimensions of the box
            // We're assuming cutting is done from sheet material, so we take the
            // two largest dimensions for the cutting plan
            const dimensions = [
              attrs.scale.x * 1000, // Convert to mm
              attrs.scale.y * 1000,
              attrs.scale.z * 1000,
            ].sort((a, b) => b - a);

            items.push({
              width: dimensions[0],
              height: dimensions[1],
              id: object.id,
              type: object.type,
              color: attrs.material.color,
              rotation: 0,
              area: dimensions[0] * dimensions[1],
            });
          }
        }
      );
    }

    return items;
  };

  // Try different packing strategies and select the best one
  const createCuttingPlan = () => {
    if (!stockPanelWidth) return;

    const items = getCutItems();
    if (items.length === 0) return;

    const maxLength = stockPanelLength || 100000; // If no length specified, use a large value

    // Try different packing strategies and take the best result
    const results: PackingResult[] = [];

    // Strategy 1: Sort by height descending
    const heightSortedItems = [...items].sort((a, b) => b.height - a.height);
    results.push(packItems(heightSortedItems, stockPanelWidth, maxLength));

    // Strategy 2: Sort by width descending
    const widthSortedItems = [...items].sort((a, b) => b.width - a.width);
    results.push(packItems(widthSortedItems, stockPanelWidth, maxLength));

    // Strategy 3: Sort by area descending
    const areaSortedItems = [...items].sort(
      (a, b) => (b.area || 0) - (a.area || 0)
    );
    results.push(packItems(areaSortedItems, stockPanelWidth, maxLength));

    // Strategy 4: Sort by perimeter descending
    const perimeterSortedItems = [...items].sort(
      (a, b) => 2 * (b.width + b.height) - 2 * (a.width + a.height)
    );
    results.push(packItems(perimeterSortedItems, stockPanelWidth, maxLength));

    // Strategy 5: Sort by max dimension descending
    const maxDimensionSortedItems = [...items].sort(
      (a, b) => Math.max(b.width, b.height) - Math.max(a.width, a.height)
    );
    results.push(
      packItems(maxDimensionSortedItems, stockPanelWidth, maxLength)
    );

    // Strategy 6: Sort by difference between dimensions descending (squareness)
    const squarenessSortedItems = [...items].sort(
      (a, b) => Math.abs(b.width - b.height) - Math.abs(a.width - a.height)
    );
    results.push(packItems(squarenessSortedItems, stockPanelWidth, maxLength));

    // Find the best result based on waste percentage
    const bestResult = results.reduce(
      (best, current) =>
        current.wastePercentage < best.wastePercentage ? current : best,
      results[0]
    );

    setCuttingPlan(bestResult.placedItems);
    setWastePercentage(bestResult.wastePercentage);
  };

  // Pack items using Maximal Rectangles algorithm
  const packItems = (
    items: CutItem[],
    stockWidth: number,
    stockLength: number
  ): PackingResult => {
    // Deep copy items to avoid modifying originals
    const itemsToPack = JSON.parse(JSON.stringify(items)) as CutItem[];
    const placedItems: PlacedItem[] = [];

    // List of free rectangles, starting with the whole stock panel
    const freeRects: FreeRectangle[] = [
      { x: 0, y: 0, width: stockWidth, height: stockLength },
    ];

    // Try to place each item
    for (const item of itemsToPack) {
      // Try to place the item in original orientation
      let placed = findPositionForItem(item, freeRects, placedItems);

      // If placement failed, try rotating the item
      if (!placed) {
        // Swap dimensions
        const rotatedItem = {
          ...item,
          width: item.height,
          height: item.width,
          rotation: 90,
        };
        placed = findPositionForItem(rotatedItem, freeRects, placedItems);
      }
    }

    // Calculate metrics
    let maxHeight = 0;
    let totalItemArea = 0;

    for (const item of placedItems) {
      const itemBottom = item.y + item.height;
      maxHeight = Math.max(maxHeight, itemBottom);
      totalItemArea += item.width * item.height;
    }

    const usedArea = maxHeight * stockWidth;
    const wastePercentage =
      usedArea > 0 ? 100 * (1 - totalItemArea / usedArea) : 100;

    return {
      placedItems,
      usedArea,
      totalArea: totalItemArea,
      wastePercentage,
      maxHeight,
    };
  };

  // Split a free rectangle after an item is placed
  const splitFreeRectangle = (
    rect: FreeRectangle,
    item: PlacedItem,
    freeRects: FreeRectangle[]
  ): void => {
    // Remove the original rectangle
    const index = freeRects.indexOf(rect);
    if (index !== -1) {
      freeRects.splice(index, 1);
    }

    // Create up to four new rectangles from the leftover space

    // Right of the item
    if (item.x + item.width < rect.x + rect.width) {
      freeRects.push({
        x: item.x + item.width,
        y: rect.y,
        width: rect.x + rect.width - (item.x + item.width),
        height: rect.height,
      });
    }

    // Below the item
    if (item.y + item.height < rect.y + rect.height) {
      freeRects.push({
        x: rect.x,
        y: item.y + item.height,
        width: rect.width,
        height: rect.y + rect.height - (item.y + item.height),
      });
    }

    // Left of the item
    if (item.x > rect.x) {
      freeRects.push({
        x: rect.x,
        y: rect.y,
        width: item.x - rect.x,
        height: rect.height,
      });
    }

    // Above the item
    if (item.y > rect.y) {
      freeRects.push({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: item.y - rect.y,
      });
    }
  };

  // Remove redundant free rectangles (those that are fully contained within others)
  const pruneFreeRectangles = (freeRects: FreeRectangle[]): void => {
    // First, check for intersections and split overlapping rectangles
    for (let i = 0; i < freeRects.length; i++) {
      for (let j = i + 1; j < freeRects.length; j++) {
        if (rectanglesIntersect(freeRects[i], freeRects[j])) {
          // Instead of complicated splitting, we'll just ensure they don't overlap
          // by adjusting dimensions - this is simpler but may be less optimal
          if (
            freeRects[i].x < freeRects[j].x &&
            freeRects[i].x + freeRects[i].width > freeRects[j].x
          ) {
            // Adjust width of rect i to avoid overlap
            freeRects[i].width = freeRects[j].x - freeRects[i].x;
          } else if (
            freeRects[i].y < freeRects[j].y &&
            freeRects[i].y + freeRects[i].height > freeRects[j].y
          ) {
            // Adjust height of rect i to avoid overlap
            freeRects[i].height = freeRects[j].y - freeRects[i].y;
          }
        }
      }
    }

    // Then remove rectangles that are contained within others as before
    for (let i = 0; i < freeRects.length; i++) {
      for (let j = i + 1; j < freeRects.length; j++) {
        // Skip if either rectangle has zero dimensions after adjustments
        if (freeRects[i].width <= 0 || freeRects[i].height <= 0) {
          freeRects.splice(i, 1);
          i--;
          break;
        }
        if (freeRects[j].width <= 0 || freeRects[j].height <= 0) {
          freeRects.splice(j, 1);
          j--;
          continue;
        }

        // Check if rect i is contained in rect j
        if (
          freeRects[i].x >= freeRects[j].x &&
          freeRects[i].y >= freeRects[j].y &&
          freeRects[i].x + freeRects[i].width <=
            freeRects[j].x + freeRects[j].width &&
          freeRects[i].y + freeRects[i].height <=
            freeRects[j].y + freeRects[j].height
        ) {
          // Remove rect i
          freeRects.splice(i, 1);
          i--;
          break;
        }

        // Check if rect j is contained in rect i
        if (
          freeRects[j].x >= freeRects[i].x &&
          freeRects[j].y >= freeRects[i].y &&
          freeRects[j].x + freeRects[j].width <=
            freeRects[i].x + freeRects[i].width &&
          freeRects[j].y + freeRects[j].height <=
            freeRects[i].y + freeRects[i].height
        ) {
          // Remove rect j
          freeRects.splice(j, 1);
          j--;
        }
      }
    }
  };

  // Check if two rectangles intersect
  const rectanglesIntersect = (
    r1: FreeRectangle,
    r2: FreeRectangle
  ): boolean => {
    return !(
      r1.x + r1.width <= r2.x ||
      r2.x + r2.width <= r1.x ||
      r1.y + r1.height <= r2.y ||
      r2.y + r2.height <= r1.y
    );
  };

  // Check if an item intersects with any already placed items
  const intersectsWithPlacedItems = (
    item: CutItem & Position,
    placedItems: PlacedItem[]
  ): boolean => {
    for (const placedItem of placedItems) {
      // Check if this item overlaps with a placed item
      if (
        !(
          item.x + item.width <= placedItem.x ||
          placedItem.x + placedItem.width <= item.x ||
          item.y + item.height <= placedItem.y ||
          placedItem.y + placedItem.height <= item.y
        )
      ) {
        return true; // Intersection found
      }
    }
    return false; // No intersections
  };

  // Find the best position for an item using Best Short Side Fit heuristic
  const findPositionForItem = (
    item: CutItem,
    freeRects: FreeRectangle[],
    placedItems: PlacedItem[]
  ): boolean => {
    let bestScore = Number.MAX_VALUE;
    let bestRect: FreeRectangle | null = null;
    let bestX = 0;
    let bestY = 0;

    // Find the free rectangle with the best score for this item
    for (let i = 0; i < freeRects.length; i++) {
      const rect = freeRects[i];

      // Check if the item fits in the rectangle
      if (rect.width >= item.width && rect.height >= item.height) {
        // Create a potential placement
        const potentialPlacement = {
          ...item,
          x: rect.x,
          y: rect.y,
        };

        // Skip if this placement would intersect with already placed items
        if (intersectsWithPlacedItems(potentialPlacement, placedItems)) {
          continue;
        }

        // Calculate score (smaller is better)
        // Best Short Side Fit: place the item into the rectangle that leaves the smallest leftover side
        const leftoverWidth = rect.width - item.width;
        const leftoverHeight = rect.height - item.height;
        const score = Math.min(leftoverWidth, leftoverHeight);

        if (score < bestScore) {
          bestScore = score;
          bestRect = rect;
          bestX = rect.x;
          bestY = rect.y;
        }
      }
    }

    // If no suitable rectangle was found
    if (bestRect === null) {
      return false;
    }

    // Place the item
    const placedItem: PlacedItem = {
      ...item,
      x: bestX,
      y: bestY,
    };
    placedItems.push(placedItem);

    // Split the rectangle and update free rectangles list
    splitFreeRectangle(bestRect, placedItem, freeRects);

    // Remove redundant rectangles
    pruneFreeRectangles(freeRects);

    return true;
  };

  // Draw the cutting plan on the canvas
  const drawCuttingPlan = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Calculate the used length
    let maxY = 0;
    cuttingPlan.forEach((item) => {
      maxY = Math.max(maxY, item.y + item.height);
    });

    // Get device pixel ratio
    const dpr = getDevicePixelRatio();

    // Set the logical canvas size
    const logicalWidth = stockPanelWidth * scale;
    const logicalHeight = (stockPanelLength || maxY + 500) * scale;

    // Set display size (CSS pixels)
    // canvas.style.width = `${logicalWidth}px`;
    // canvas.width
    canvas.style.height = `${logicalWidth}px`;
    canvas.style.height = `${logicalHeight}px`;

    // Set actual size in memory (scaled for high-DPI displays)
    canvas.width = logicalWidth * dpr;
    canvas.height = logicalHeight * dpr;

    // Scale the context to account for the pixel ratio
    ctx.scale(dpr, dpr);

    // Enable font smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Clear canvas
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, logicalWidth, logicalHeight);

    // Draw grid
    ctx.strokeStyle = "#cccccc";
    ctx.lineWidth = 0.5;

    // Draw vertical grid lines every 500mm
    for (let x = 0; x <= stockPanelWidth; x += 500) {
      ctx.beginPath();
      ctx.moveTo(x * scale, 0);
      ctx.lineTo(x * scale, logicalHeight);
      ctx.stroke();
    }

    // Draw horizontal grid lines every 500mm
    const maxHeight = stockPanelLength || maxY + 500;
    for (let y = 0; y <= maxHeight; y += 500) {
      ctx.beginPath();
      ctx.moveTo(0, y * scale);
      ctx.lineTo(logicalWidth, y * scale);
      ctx.stroke();
    }

    // Draw waste area indication
    if (maxY > 0) {
      ctx.fillStyle = "rgba(255, 0, 0, 0.05)";
      ctx.fillRect(0, 0, stockPanelWidth * scale, maxY * scale);
    }

    // Draw placed items
    cuttingPlan.forEach((item) => {
      // Draw rectangle for each item
      ctx.fillStyle = item.color;
      ctx.fillRect(
        item.x * scale,
        item.y * scale,
        item.width * scale,
        item.height * scale
      );

      // Draw border
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1;
      ctx.strokeRect(
        item.x * scale,
        item.y * scale,
        item.width * scale,
        item.height * scale
      );

      if (showDimensions) {
        // Calculate optimal font size based on item dimensions and scale
        const itemWidth = item.width * scale;
        const itemHeight = item.height * scale;
        const baseFontSize = Math.max(10 * fontScale, 10); // Minimum 10px font size
        const fontSize = Math.min(
          baseFontSize,
          Math.max(10, Math.min(itemWidth / 8, itemHeight / 4))
        );

        // Determine text color based on background brightness
        ctx.fillStyle =
          parseInt(item.color.substring(1), 16) < 0x7f7f7f
            ? "#ffffff"
            : "#000000";

        // Set font with pixel size specification for crisp rendering
        ctx.font = `${fontSize}px Arial, sans-serif`;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        // Apply a subtle background for better readability
        const idText = item.id;
        const dimensionsText = `${Math.round(item.width)}×${Math.round(
          item.height
        )}mm`;
        const textX = item.x * scale + 5;
        const textY1 = item.y * scale + 5;
        const textY2 = textY1 + fontSize + 3;
        const textWidth1 = ctx.measureText(idText).width;
        const textWidth2 = ctx.measureText(dimensionsText).width;

        // Text background
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.fillRect(textX - 2, textY1 - 1, textWidth1 + 4, fontSize + 2);
        ctx.fillRect(textX - 2, textY2 - 1, textWidth2 + 4, fontSize + 2);

        // Draw text
        ctx.fillStyle =
          parseInt(item.color.substring(1), 16) < 0x7f7f7f
            ? "#ffffff"
            : "#000000";

        // Draw ID
        ctx.fillText(idText, textX, textY1);

        // Draw dimensions
        ctx.fillText(dimensionsText, textX, textY2);
      }
    });

    // Draw cutout marks
    cuttingPlan.forEach((item) => {
      ctx.strokeStyle = "#ff0000";
      ctx.lineWidth = 1;

      // Top edge
      drawDashedLine(
        ctx,
        item.x * scale,
        item.y * scale,
        (item.x + item.width) * scale,
        item.y * scale
      );

      // Right edge
      drawDashedLine(
        ctx,
        (item.x + item.width) * scale,
        item.y * scale,
        (item.x + item.width) * scale,
        (item.y + item.height) * scale
      );

      // Bottom edge
      drawDashedLine(
        ctx,
        item.x * scale,
        (item.y + item.height) * scale,
        (item.x + item.width) * scale,
        (item.y + item.height) * scale
      );

      // Left edge
      drawDashedLine(
        ctx,
        item.x * scale,
        item.y * scale,
        item.x * scale,
        (item.y + item.height) * scale
      );
    });
  };

  const drawDashedLine = (
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) => {
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  // Update cutting plan when stock dimensions change
  useEffect(() => {
    createCuttingPlan();
  }, [stockPanelWidth, stockPanelLength, material]);

  // Redraw when cutting plan changes
  useEffect(() => {
    drawCuttingPlan();
  }, [cuttingPlan, scale, showDimensions, fontScale]);

  useEffect(() => {
    if (material) {
      setIsOpen(true);
    }
  }, [material]);

  //   const piecesThatDidNotFit = getCutItems().filter(
  //     (item) =>
  //       (item.width > stockPanelWidth || item.height > stockPanelWidth) &&
  //       (item.height > (stockPanelLength || 100000) ||
  //         item.width > (stockPanelLength || 100000))
  //   );

  const piecesThatDidNotFit = getCutItems().filter(
    (item) => !cuttingPlan.find((planItem) => planItem.id === item.id)
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);
        onClose();
      }}
      className="overflow-auto"
    >
      <div className="flex flex-col gap-4 max-h-[calc(90vh-48px)]">
        <div className="flex items-start flex-col gap-2 mb-4">
          <div className="text-sm font-medium">Cutting Plan</div>
          <div className="text-xs text-gray-500">
            With specialized algorithms, we can calculate the best way to cut
            the material from the stock panel.
          </div>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex flex-col gap-1">
            <div className="text-sm font-medium">Stock panel width</div>
            <Input
              type="number"
              value={stockPanelWidth}
              suffix="mm"
              onChange={(e) => setStockPanelWidth(Number(e.target.value))}
            />
          </div>
          <Tooltip text="Keep empty for unlimited length">
            <div className="flex flex-col gap-1">
              <div className="text-sm font-medium">Stock panel length</div>
              <Input
                type="number"
                value={stockPanelLength}
                suffix="mm"
                onChange={(e) => {
                  const value = e.target.value
                    ? Number(e.target.value)
                    : undefined;
                  setStockPanelLength(value);
                }}
              />
            </div>
          </Tooltip>
          <div className="flex items-center gap-2 mt-[22px]">
            <input
              type="checkbox"
              id="showDimensions"
              checked={showDimensions}
              onChange={(e) => setShowDimensions(e.target.checked)}
            />
            <label htmlFor="showDimensions" className="text-sm">
              Show dimensions
            </label>
          </div>
        </div>

        {/* <div className="flex items-center gap-2 mb-4">
          <div className="flex flex-col gap-1">
            <div className="text-sm font-medium">Zoom</div>
            <Input
              type="number"
              value={scale * 100}
              suffix="%"
              onChange={(e) => setScale(Number(e.target.value) / 100)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-sm font-medium">Font Size</div>
            <Input
              type="number"
              value={fontScale * 100}
              suffix="%"
              onChange={(e) => setFontScale(Number(e.target.value) / 100)}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showDimensions"
              checked={showDimensions}
              onChange={(e) => setShowDimensions(e.target.checked)}
            />
            <label htmlFor="showDimensions" className="text-sm">
              Show dimensions
            </label>
          </div>
        </div> */}

        <div className="flex justify-center overflow-auto max-h-[500px]">
          <canvas
            ref={canvasRef}
            // className="min-w-full min-h-auto"
            style={{
              imageRendering: "auto",
            }}
          />
        </div>

        <div className="flex items-start flex-col gap-1 mt-2">
          <div className="text-xs text-gray-500">
            <span className="font-medium">Legend:</span> Red dashed lines
            indicate cut lines.
          </div>
          {piecesThatDidNotFit.length > 0 && (
            <div className="text-xs font-bold text-red-500">
              <span className="font-medium">
                Items that did not fit ({piecesThatDidNotFit.length}):
              </span>{" "}
              {piecesThatDidNotFit
                .map((item) => `${item.id}, (${item.width}x${item.height}mm)`)
                .join(", ")}
            </div>
          )}
          <div className="text-xs text-gray-500">
            <span className="font-medium">Items:</span> {cuttingPlan.length}{" "}
            pieces
          </div>
          <div className="text-xs text-gray-500">
            <span className="font-medium">Material utilization:</span>{" "}
            {material.material.squareMeters.toFixed(2)} m²
          </div>
          <div className="text-xs text-gray-500">
            <span className="font-medium">Waste percentage:</span>{" "}
            {wastePercentage.toFixed(2)}%
          </div>
        </div>
      </div>
    </Modal>
  );
};
