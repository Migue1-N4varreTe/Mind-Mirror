import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HexagonalBoard as HexBoard, HexCoordinates, HexCell } from '../lib/hexagonalGeometry';

interface Props {
  board: HexBoard;
  onCellClick: (coords: HexCoordinates) => void;
  size?: number;
  temporalCycle?: number;
  playerTurn?: boolean;
  heatmapData?: Map<string, number>;
  showPredictions?: boolean;
  predictions?: Map<string, number>;
}

export const HexagonalBoard: React.FC<Props> = ({
  board,
  onCellClick,
  size = 40,
  temporalCycle = 0,
  playerTurn = true,
  heatmapData,
  showPredictions = false,
  predictions
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  useEffect(() => {
    if (temporalCycle > 0) {
      board.updateTemporalCells(temporalCycle);
    }
  }, [temporalCycle, board]);

  const getCellColor = (cell: HexCell): string => {
    if (!cell.isVisible) return 'rgba(0,0,0,0.1)';
    
    // Heatmap coloring
    if (heatmapData && heatmapData.has(cell.id)) {
      const intensity = heatmapData.get(cell.id)! / 10; // normalize to 0-1
      return `rgba(255, ${255 - intensity * 200}, ${255 - intensity * 200}, 0.7)`;
    }

    switch (cell.type) {
      case 'player':
        return '#00f5ff'; // cyan
      case 'ai':
        return '#ff1744'; // red
      case 'special':
        return '#ffd700'; // gold
      default:
        return hoveredCell === cell.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)';
    }
  };

  const getCellStroke = (cell: HexCell): string => {
    if (cell.temporalState === 'appearing') return '#00ff00';
    if (cell.temporalState === 'disappearing') return '#ff0000';
    return '#333';
  };

  const getPredictionOpacity = (cell: HexCell): number => {
    if (!showPredictions || !predictions) return 0;
    const prob = predictions.get(cell.id) || 0;
    return prob * 0.5; // max 50% opacity
  };

  const generateHexagonPath = (centerX: number, centerY: number): string => {
    const points: string[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = centerX + size * Math.cos(angle);
      const y = centerY + size * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return `M ${points.join(' L ')} Z`;
  };

  const visibleCells = board.getVisibleCells();
  const boardBounds = visibleCells.reduce(
    (bounds, cell) => {
      const pixel = board.hexToPixel(cell.coordinates, size);
      return {
        minX: Math.min(bounds.minX, pixel.x - size),
        maxX: Math.max(bounds.maxX, pixel.x + size),
        minY: Math.min(bounds.minY, pixel.y - size),
        maxY: Math.max(bounds.maxY, pixel.y + size)
      };
    },
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
  );

  const svgWidth = boardBounds.maxX - boardBounds.minX + size * 2;
  const svgHeight = boardBounds.maxY - boardBounds.minY + size * 2;
  const offsetX = -boardBounds.minX + size;
  const offsetY = -boardBounds.minY + size;

  return (
    <div className="flex justify-center items-center p-8">
      <motion.svg
        ref={svgRef}
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="border border-white/20 rounded-xl bg-black/20 backdrop-blur-sm"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background grid */}
        <defs>
          <pattern
            id="hexGrid"
            patternUnits="userSpaceOnUse"
            width={size * 3}
            height={size * Math.sqrt(3)}
          >
            <path
              d={`M 0 ${size * Math.sqrt(3) / 2} L ${size * 1.5} 0 L ${size * 3} ${size * Math.sqrt(3) / 2} L ${size * 3} ${size * Math.sqrt(3)} L ${size * 1.5} ${size * Math.sqrt(3) * 1.5} L 0 ${size * Math.sqrt(3)}`}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#hexGrid)" />

        <AnimatePresence>
          {visibleCells.map((cell) => {
            const pixel = board.hexToPixel(cell.coordinates, size);
            const centerX = pixel.x + offsetX;
            const centerY = pixel.y + offsetY;
            const hexPath = generateHexagonPath(centerX, centerY);

            return (
              <motion.g
                key={cell.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: cell.isVisible ? 1 : 0.3, 
                  opacity: cell.isVisible ? 1 : 0.3 
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 25,
                  duration: cell.temporalState === 'appearing' ? 0.5 : 0.3
                }}
              >
                {/* Main hexagon */}
                <path
                  d={hexPath}
                  fill={getCellColor(cell)}
                  stroke={getCellStroke(cell)}
                  strokeWidth={cell.temporalState !== 'stable' ? 3 : 1}
                  className={`cursor-pointer transition-all duration-200 ${
                    playerTurn && cell.type === 'empty' ? 'hover:fill-white/30' : ''
                  }`}
                  onClick={() => onCellClick(cell.coordinates)}
                  onMouseEnter={() => setHoveredCell(cell.id)}
                  onMouseLeave={() => setHoveredCell(null)}
                />

                {/* Prediction overlay */}
                {showPredictions && (
                  <path
                    d={hexPath}
                    fill={`rgba(0, 255, 0, ${getPredictionOpacity(cell)})`}
                    pointerEvents="none"
                  />
                )}

                {/* Cell content icons */}
                {cell.type !== 'empty' && (
                  <motion.g
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {cell.type === 'player' && (
                      <circle
                        cx={centerX}
                        cy={centerY}
                        r={size * 0.3}
                        fill="#00f5ff"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    )}
                    {cell.type === 'ai' && (
                      <polygon
                        points={`${centerX},${centerY - size * 0.3} ${centerX + size * 0.25},${centerY + size * 0.15} ${centerX - size * 0.25},${centerY + size * 0.15}`}
                        fill="#ff1744"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    )}
                    {cell.type === 'special' && (
                      <motion.g
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      >
                        <polygon
                          points={`${centerX},${centerY - size * 0.3} ${centerX + size * 0.15},${centerY - size * 0.1} ${centerX + size * 0.3},${centerY} ${centerX + size * 0.15},${centerY + size * 0.1} ${centerX},${centerY + size * 0.3} ${centerX - size * 0.15},${centerY + size * 0.1} ${centerX - size * 0.3},${centerY} ${centerX - size * 0.15},${centerY - size * 0.1}`}
                          fill="#ffd700"
                          stroke="#ffffff"
                          strokeWidth="1"
                        />
                      </motion.g>
                    )}
                  </motion.g>
                )}

                {/* Temporal state indicators */}
                {cell.temporalState === 'appearing' && (
                  <motion.circle
                    cx={centerX}
                    cy={centerY}
                    r={size * 0.8}
                    fill="none"
                    stroke="#00ff00"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                )}

                {cell.temporalState === 'disappearing' && (
                  <motion.circle
                    cx={centerX}
                    cy={centerY}
                    r={size * 0.8}
                    fill="none"
                    stroke="#ff0000"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}

                {/* Coordinate labels (for debugging) */}
                {process.env.NODE_ENV === 'development' && (
                  <text
                    x={centerX}
                    y={centerY + 4}
                    textAnchor="middle"
                    fontSize="8"
                    fill="white"
                    pointerEvents="none"
                  >
                    {cell.coordinates.q},{cell.coordinates.r}
                  </text>
                )}
              </motion.g>
            );
          })}
        </AnimatePresence>

        {/* Temporal cycle indicator */}
        {temporalCycle > 0 && (
          <motion.text
            x={20}
            y={30}
            fill="white"
            fontSize="14"
            fontWeight="bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Ciclo Temporal: {temporalCycle}
          </motion.text>
        )}
      </motion.svg>
    </div>
  );
};
