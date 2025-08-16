import React from 'react';
import { cn } from '@/lib/utils';

interface HexagonalBoardProps {
  size?: number;
  className?: string;
  children?: React.ReactNode;
}

export function HexagonalBoard({ size = 8, className, children }: HexagonalBoardProps) {
  return (
    <div 
      className={cn(
        "grid gap-1 justify-center items-center p-4",
        className
      )}
      style={{
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        gridTemplateRows: `repeat(${size}, 1fr)`
      }}
    >
      {children}
    </div>
  );
}

export default HexagonalBoard;
