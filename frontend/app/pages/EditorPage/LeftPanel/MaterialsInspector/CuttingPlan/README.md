# Cutting Plan Visualization

This component generates and visualizes cutting plans for box-shaped objects made from the same material. It helps users efficiently layout their cutting patterns to minimize material waste.

## Features

- Advanced bin packing algorithm (Maximal Rectangles) that minimizes material waste
- Automatic comparison of multiple packing strategies to find the optimal solution
- Visual representation of cutting layout on an HTML canvas
- Adjustable stock panel dimensions
- Zoom control for better visibility
- Support for object rotation to optimize material usage
- Display of dimensions and object IDs
- Visual indicators for cut lines
- Waste percentage calculation and visualization

## How it Works

1. The component extracts the two largest dimensions from each box object to represent its 2D footprint
2. Multiple packing strategies are tried with different sorting criteria:
   - Sort by height (largest first)
   - Sort by width (largest first)
   - Sort by area (largest first)
   - Sort by perimeter (largest first)
   - Sort by maximum dimension (largest first)
   - Sort by dimension difference (most rectangular first)
3. For each strategy, the Maximal Rectangles algorithm places items optimally
4. The algorithm automatically chooses the strategy with the lowest waste percentage
5. Items are rotated when needed to improve material utilization
6. The final layout is rendered on an HTML canvas with dimensions, IDs, and cut lines

## Usage

The CuttingPlan component is displayed when a user clicks the saw icon in the MaterialsInspector.

```tsx
// Example usage
<CuttingPlan material={selectedMaterial} />
```

## Algorithm Details

The component uses a sophisticated Maximal Rectangles bin packing algorithm:

1. The algorithm maintains a list of free rectangular spaces
2. For each item, it finds the best position using the "Best Short Side Fit" heuristic
3. When an item is placed, the free space is split into smaller rectangles
4. Redundant rectangles (those contained within others) are removed
5. The process continues until all items are placed or no more items fit
6. Multiple sorting strategies are tried, and the best result is selected

### Best Short Side Fit Heuristic

The BSSF heuristic places each item in the free rectangle that leaves the smallest unused side length. This tends to produce layouts with minimal waste by creating larger continuous free areas.

### Waste Minimization

The algorithm compares multiple packing strategies and automatically selects the one that produces the lowest waste percentage. Waste is calculated as:

```
Waste % = 100 * (1 - Total Item Area / Used Stock Area)
```

## Future Improvements

Potential enhancements for the cutting plan visualization:

- Support for more complex shapes beyond boxes
- Kerf/blade width consideration
- Material grain direction constraints
- Manual adjustment of item positions
- Export options (PDF, SVG)
- Optimization for different cutting machines
- Guillotine constraint option (all cuts must go from one edge to another)
