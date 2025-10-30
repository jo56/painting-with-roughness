import { useCallback, useEffect, useRef, useState } from 'react';
import type { BrushType } from '../types';

export interface UsePaintSettingsReturn {
  palette: string[];
  selectedColor: number;
  brushSize: number;
  tool: string;
  brushType: BrushType;
  sprayDensity: number;
  diagonalThickness: number;
  blendMode: string;
  customColor: string;
  isSavingColor: boolean;
  brushTypeRef: React.RefObject<BrushType>;
  sprayDensityRef: React.RefObject<number>;
  diagonalThicknessRef: React.RefObject<number>;
  setPalette: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedColor: (color: number) => void;
  setBrushSize: (size: number) => void;
  setTool: (tool: string) => void;
  setBrushType: (type: BrushType) => void;
  setSprayDensity: (density: number) => void;
  setDiagonalThickness: (thickness: number) => void;
  setBlendMode: (mode: string) => void;
  setCustomColor: (color: string) => void;
  setIsSavingColor: (saving: boolean) => void;
  handlePaletteClick: (index: number) => void;
}

export function usePaintSettings(): UsePaintSettingsReturn {
  const [palette, setPalette] = useState([
    '#000000', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4',
    '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'
  ]);
  const [selectedColor, setSelectedColor] = useState(1);
  const [brushSize, setBrushSize] = useState(2);
  const [tool, setTool] = useState('brush');
  const [brushType, setBrushType] = useState<BrushType>('square');
  const [sprayDensity, setSprayDensity] = useState(0.2);
  const [diagonalThickness, setDiagonalThickness] = useState(5);
  const [blendMode, setBlendMode] = useState('replace');
  const [customColor, setCustomColor] = useState('#ffffff');
  const [isSavingColor, setIsSavingColor] = useState(false);

  const brushTypeRef = useRef<BrushType>('square');
  const sprayDensityRef = useRef(sprayDensity);
  const diagonalThicknessRef = useRef(diagonalThickness);

  useEffect(() => { brushTypeRef.current = brushType; }, [brushType]);
  useEffect(() => { sprayDensityRef.current = sprayDensity; }, [sprayDensity]);
  useEffect(() => { diagonalThicknessRef.current = diagonalThickness; }, [diagonalThickness]);

  const handlePaletteClick = useCallback((index: number) => {
    if (isSavingColor) {
      setPalette(p => {
        const newPalette = [...p];
        newPalette[index] = customColor;
        return newPalette;
      });
      setIsSavingColor(false);
      setSelectedColor(index);
    } else {
      setSelectedColor(index);
    }
  }, [isSavingColor, customColor]);

  return {
    palette,
    selectedColor,
    brushSize,
    tool,
    brushType,
    sprayDensity,
    diagonalThickness,
    blendMode,
    customColor,
    isSavingColor,
    brushTypeRef,
    sprayDensityRef,
    diagonalThicknessRef,
    setPalette,
    setSelectedColor,
    setBrushSize,
    setTool,
    setBrushType,
    setSprayDensity,
    setDiagonalThickness,
    setBlendMode,
    setCustomColor,
    setIsSavingColor,
    handlePaletteClick,
  };
}
