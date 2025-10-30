import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createEmptyGrid, cloneGrid } from './utils/grid';
import { componentToHex, rgbToHex } from './utils/color';
import type { Direction, SpreadPattern, BrushType } from './types';
import * as movementAlgorithms from './algorithms/movement';
import * as cellularAlgorithms from './algorithms/cellular';
import * as chaosAlgorithms from './algorithms/chaos';
import { PaintStudioUI } from './components/PaintStudioUI';
import * as drawingUtils from './utils/drawing';

const GRID_COLOR = '#27272a';

export default function ModularSettingsPaintStudio(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const isMouseDown = useRef(false);
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const autoDotsRef = useRef<number | null>(null);
  const autoShapesRef = useRef<number | null>(null);
  const dotsRunningRef = useRef(false);
  const shapesRunningRef = useRef(false);
  const pressedKeys = useRef(new Set<string>());
  const walkers = useRef<{r: number, c: number, color: number}[]>([]);
  const strobeStateRef = useRef(true); // true: expand, false: contract
  const ripplesRef = useRef<{r: number, c: number, color: number, radius: number, maxRadius: number}[]>([]);
  const clearButtonRef = useRef<HTMLButtonElement | null>(null);

  const defaults = {
    cellSize: 10,
    rows: 100,
    cols: 165,
    showGrid: false,
    backgroundColor: '#0a0a0a',
    brushSize: 2,
    selectedColor: 1,
    spreadProbability: 0.2,
    autoSpreadSpeed: 3,
    autoDotsSpeed: 2,
    autoShapesSpeed: 1,
    blendMode: 'replace',
    spreadPattern: 'random' as SpreadPattern,
    pulseSpeed: 10,
    pulseOvertakes: true,
    pulseDirection: 'bottom-right' as Direction,
    directionalBias: 'down' as Direction,
    conwayRules: { born: [3], survive: [2,3] },
    tendrilsRules: { born: [1], survive: [1,2] },
    directionalBiasStrength: 0.8,
    randomWalkSpreadCount: 1,
    randomWalkMode: 'any' as const,
    veinSeekStrength: 0.5,
    veinBranchChance: 0.1,
    crystallizeThreshold: 2,
    erosionRate: 0.5,
    erosionSolidity: 3,
    flowDirection: 'down' as Direction,
    flowChance: 0.5,
    jitterChance: 0.3,
    vortexCount: 5,
    strobeExpandThreshold: 2,
    strobeContractThreshold: 3,
    scrambleSwaps: 10,
    rippleChance: 0.05,
  };

  const [palette, setPalette] = useState([
    '#000000', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', 
    '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'
  ]);

  const [cellSize, setCellSize] = useState(defaults.cellSize);
  const [rows, setRows] = useState(defaults.rows);
  const [cols, setCols] = useState(defaults.cols);
  const [grid, setGrid] = useState<number[][]>(() => createEmptyGrid(defaults.rows, defaults.cols));
  const [showGrid, setShowGrid] = useState(defaults.showGrid);
  const [backgroundColor, setBackgroundColor] = useState(defaults.backgroundColor);
  const [brushSize, setBrushSize] = useState(defaults.brushSize);
  const [selectedColor, setSelectedColor] = useState(defaults.selectedColor);
  const [spreadProbability, setSpreadProbability] = useState(defaults.spreadProbability);
  const [autoSpreadSpeed, setAutoSpreadSpeed] = useState(defaults.autoSpreadSpeed);
  const [autoDotsSpeed, setAutoDotsSpeed] = useState(defaults.autoDotsSpeed);
  const [autoShapesSpeed, setAutoShapesSpeed] = useState(defaults.autoShapesSpeed);
  const [autoSpreading, setAutoSpreading] = useState(false);
  const [autoDots, setAutoDots] = useState(false);
  const [autoShapes, setAutoShapes] = useState(false);
  const [autoSpreadEnabled, setAutoSpreadEnabled] = useState(true);
  const [autoDotsEnabled, setAutoDotsEnabled] = useState(true);
  const [autoShapesEnabled, setAutoShapesEnabled] = useState(true);

// Mirror enabled toggles in refs so key handler reads fresh values
const autoSpreadEnabledRef = useRef(autoSpreadEnabled);
const autoDotsEnabledRef = useRef(autoDotsEnabled);
const autoShapesEnabledRef = useRef(autoShapesEnabled);
useEffect(() => { autoSpreadEnabledRef.current = autoSpreadEnabled; }, [autoSpreadEnabled]);
useEffect(() => { autoDotsEnabledRef.current = autoDotsEnabled; }, [autoDotsEnabled]);
useEffect(() => { autoShapesEnabledRef.current = autoShapesEnabled; }, [autoShapesEnabled]);

  const [blendMode, setBlendMode] = useState(defaults.blendMode);
  const [tool, setTool] = useState('brush');
  const [brushType, setBrushType] = useState<BrushType>('square');
    const [sprayDensity, setSprayDensity] = useState(0.2); // BRUSH PATCH
  const [diagonalThickness, setDiagonalThickness] = useState(5);
  const brushTypeRef = useRef<BrushType>('square'); // BRUSH PATCH
    const sprayDensityRef = useRef(sprayDensity); // BRUSH PATCH
  const diagonalThicknessRef = useRef(diagonalThickness); // BRUSH PATCH

  useEffect(() => { brushTypeRef.current = brushType; }, [brushType]); // BRUSH PATCH
    useEffect(() => { sprayDensityRef.current = sprayDensity; }, [sprayDensity]); // BRUSH PATCH
  useEffect(() => { diagonalThicknessRef.current = diagonalThickness; }, [diagonalThickness]); // BRUSH PATCH
 // BRUSH PATCH
 // BRUSH PATCH
  const [panelMinimized, setPanelMinimized] = useState(false);
  const [panelVisible, setPanelVisible] = useState(true);
  const [panelTransparent, setPanelTransparent] = useState(false);
  const panelDimensions = useRef({ width: 320, height: 400 });
  const [currentTheme] = useState(0); // Locked to void theme
  const [showSpeedSettings, setShowSpeedSettings] = useState(false);
  const [showCanvasSettings, setShowCanvasSettings] = useState(false);
  const [showVisualSettings, setShowVisualSettings] = useState(false);
  const [clearButtonColor, setClearButtonColor] = useState('#ff6b6b');
  
  
  // === Recording: state & refs (clean) ===
  const [recordEnabled, setRecordEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingFilename, setRecordingFilename] = useState("grid-recording");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [recordingToast, setRecordingToast] = useState<string | null>(null);

  const sanitizeFilename = (name: string) => name.replace(/[^a-z0-9-_]+/gi, "_");

  // === Recording functions (FIXED - properly scoped with useCallback) ===
  const startRecording = useCallback(() => {
    if (!recordEnabled) {
      setRecordingToast("Enable recording in Visual Settings first");
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) {
      setRecordingToast("Canvas not ready");
      return;
    }

    const fps = 30;
    const stream: MediaStream | null = (canvas as any).captureStream
      ? canvas.captureStream(fps)
      : (canvas as any).mozCaptureStream
      ? (canvas as any).mozCaptureStream(fps)
      : null;

    if (!stream) {
      setRecordingToast("Recording not supported in this browser");
      return;
    }

    const candidates = [
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm"
    ];
    let mimeType = "";
    if (typeof MediaRecorder !== "undefined") {
      for (const type of candidates) {
        if ((MediaRecorder as any).isTypeSupported?.(type)) { mimeType = type; break; }
      }
    }

    let recorder: MediaRecorder;
    try {
      recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    } catch (e) {
      setRecordingToast("Failed to start recorder");
      return;
    }
    mediaRecorderRef.current = recorder;
    recordedChunksRef.current = [];

    recorder.ondataavailable = (e: BlobEvent) => {
      if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
    };
    recorder.onerror = () => {
      setRecordingToast("Recording error");
    };
    recorder.onstop = () => {
      try {
        if (recordedChunksRef.current.length === 0) {
          setRecordingToast("No data captured");
        } else {
          const outType = recorder.mimeType || "video/webm";
          const blob = new Blob(recordedChunksRef.current, { type: outType });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${sanitizeFilename(recordingFilename || "grid-recording")}-${Date.now()}.webm`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          setRecordingToast("Recording saved");
        }
      } finally {
        // Always stop stream tracks
        stream.getTracks().forEach(t => t.stop());
        setIsRecording(false);
      }
    };

    try {
      recorder.start(1000); // 1s timeslice ensures dataavailable fires
      setIsRecording(true);
      setRecordingToast("Recording started (press R to stop)");
    } catch (e) {
      setRecordingToast("Recorder start failed");
    }
  }, [recordEnabled, recordingFilename]);

  const stopRecording = useCallback(() => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== "inactive") {
      try {
        rec.requestData?.();
      } catch {}
      rec.stop();
      setRecordingToast("Stopping recording…");
    }
  }, []);
  // === End Recording functions ===

const [showGenerativeSettings, setShowGenerativeSettings] = useState(false);
  const [showStepControls, setShowStepControls] = useState(false);
  const [showAutoControls, setShowAutoControls] = useState(true);
  const [showOptions, setShowOptions] = useState(true);
  const [customColor, setCustomColor] = useState('#ffffff');
  const [isSavingColor, setIsSavingColor] = useState(false);
  const [generativeColorIndices, setGenerativeColorIndices] = useState(() => palette.slice(1).map((_, index) => index + 1));
  const [spreadPattern, setSpreadPattern] = useState<SpreadPattern>(defaults.spreadPattern);
  const [pulseSpeed, setPulseSpeed] = useState(defaults.pulseSpeed);
  const [directionalBias, setDirectionalBias] = useState<'none' | Direction>(defaults.directionalBias);
  const [conwayRules, setConwayRules] = useState(defaults.conwayRules);
  const [tendrilsRules, setTendrilsRules] = useState(defaults.tendrilsRules);
  const [directionalBiasStrength, setDirectionalBiasStrength] = useState(defaults.directionalBiasStrength);
  const [pulseOvertakes, setPulseOvertakes] = useState(defaults.pulseOvertakes);
  const [pulseDirection, setPulseDirection] = useState<Direction>(defaults.pulseDirection);
  const [randomWalkSpreadCount, setRandomWalkSpreadCount] = useState(defaults.randomWalkSpreadCount);
  const [randomWalkMode, setRandomWalkMode] = useState<'any' | 'cardinal'>(defaults.randomWalkMode);
  const [veinSeekStrength, setVeinSeekStrength] = useState(defaults.veinSeekStrength);
  const [veinBranchChance, setVeinBranchChance] = useState(defaults.veinBranchChance);
  const [crystallizeThreshold, setCrystallizeThreshold] = useState(defaults.crystallizeThreshold);
  const [erosionRate, setErosionRate] = useState(defaults.erosionRate);
  const [erosionSolidity, setErosionSolidity] = useState(defaults.erosionSolidity);
  const [flowDirection, setFlowDirection] = useState<Direction>(defaults.flowDirection);
  const [flowChance, setFlowChance] = useState(defaults.flowChance);
  const [jitterChance, setJitterChance] = useState(defaults.jitterChance);
  const [vortexCount, setVortexCount] = useState(defaults.vortexCount);
  const [strobeExpandThreshold, setStrobeExpandThreshold] = useState(defaults.strobeExpandThreshold);
  const [strobeContractThreshold, setStrobeContractThreshold] = useState(defaults.strobeContractThreshold);
  const [scrambleSwaps, setScrambleSwaps] = useState(defaults.scrambleSwaps);
  const [rippleChance, setRippleChance] = useState(defaults.rippleChance);

  const generativeColorIndicesRef = useRef(generativeColorIndices);
  const spreadProbabilityRef = useRef(spreadProbability);
  const autoSpreadSpeedRef = useRef(autoSpreadSpeed);
  const autoDotsSpeedRef = useRef(autoDotsSpeed);
  const autoShapesSpeedRef = useRef(autoShapesSpeed);
  const rowsRef = useRef(rows);
  const colsRef = useRef(cols);
  const spreadPatternRef = useRef(spreadPattern);
  const pulseSpeedRef = useRef(pulseSpeed);
  const directionalBiasRef = useRef(directionalBias);
  const conwayRulesRef = useRef(conwayRules);
  const tendrilsRulesRef = useRef(tendrilsRules);
  const directionalBiasStrengthRef = useRef(directionalBiasStrength);
  const pulseOvertakesRef = useRef(pulseOvertakes);
  const pulseDirectionRef = useRef(pulseDirection);
  const randomWalkSpreadCountRef = useRef(randomWalkSpreadCount);
  const randomWalkModeRef = useRef(randomWalkMode);
  const veinSeekStrengthRef = useRef(veinSeekStrength);
  const veinBranchChanceRef = useRef(veinBranchChance);
  const crystallizeThresholdRef = useRef(crystallizeThreshold);
  const erosionRateRef = useRef(erosionRate);
  const erosionSolidityRef = useRef(erosionSolidity);
  const flowDirectionRef = useRef(flowDirection);
  const flowChanceRef = useRef(flowChance);
  const jitterChanceRef = useRef(jitterChance);
  const vortexCountRef = useRef(vortexCount);
  const strobeExpandThresholdRef = useRef(strobeExpandThreshold);
  const strobeContractThresholdRef = useRef(strobeContractThreshold);
  const scrambleSwapsRef = useRef(scrambleSwaps);
  const rippleChanceRef = useRef(rippleChance);
  
  useEffect(() => { spreadProbabilityRef.current = spreadProbability; }, [spreadProbability]);
  useEffect(() => { autoSpreadSpeedRef.current = autoSpreadSpeed; }, [autoSpreadSpeed]);
  useEffect(() => { autoDotsSpeedRef.current = autoDotsSpeed; }, [autoDotsSpeed]);
  useEffect(() => { autoShapesSpeedRef.current = autoShapesSpeed; }, [autoShapesSpeed]);
  useEffect(() => { generativeColorIndicesRef.current = generativeColorIndices; }, [generativeColorIndices]);
  useEffect(() => { rowsRef.current = rows; }, [rows]);
  useEffect(() => { colsRef.current = cols; }, [cols]);
  useEffect(() => { spreadPatternRef.current = spreadPattern; }, [spreadPattern]);
  useEffect(() => { pulseSpeedRef.current = pulseSpeed; }, [pulseSpeed]);
  useEffect(() => { directionalBiasRef.current = directionalBias; }, [directionalBias]);
  useEffect(() => { conwayRulesRef.current = conwayRules; }, [conwayRules]);
  useEffect(() => { tendrilsRulesRef.current = tendrilsRules; }, [tendrilsRules]);
  useEffect(() => { directionalBiasStrengthRef.current = directionalBiasStrength; }, [directionalBiasStrength]);
  useEffect(() => { pulseOvertakesRef.current = pulseOvertakes; }, [pulseOvertakes]);
  useEffect(() => { pulseDirectionRef.current = pulseDirection; }, [pulseDirection]);
  useEffect(() => { randomWalkSpreadCountRef.current = randomWalkSpreadCount; }, [randomWalkSpreadCount]);
  useEffect(() => { randomWalkModeRef.current = randomWalkMode; }, [randomWalkMode]);
  useEffect(() => { veinSeekStrengthRef.current = veinSeekStrength; }, [veinSeekStrength]);
  useEffect(() => { veinBranchChanceRef.current = veinBranchChance; }, [veinBranchChance]);
  useEffect(() => { crystallizeThresholdRef.current = crystallizeThreshold; }, [crystallizeThreshold]);
  useEffect(() => { erosionRateRef.current = erosionRate; }, [erosionRate]);
  useEffect(() => { erosionSolidityRef.current = erosionSolidity; }, [erosionSolidity]);
  useEffect(() => { flowDirectionRef.current = flowDirection; }, [flowDirection]);
  useEffect(() => { flowChanceRef.current = flowChance; }, [flowChance]);
  useEffect(() => { jitterChanceRef.current = jitterChance; }, [jitterChance]);
  useEffect(() => { vortexCountRef.current = vortexCount; }, [vortexCount]);
  useEffect(() => { strobeExpandThresholdRef.current = strobeExpandThreshold; }, [strobeExpandThreshold]);
  useEffect(() => { strobeContractThresholdRef.current = strobeContractThreshold; }, [strobeContractThreshold]);
  useEffect(() => { scrambleSwapsRef.current = scrambleSwaps; }, [scrambleSwaps]);
  useEffect(() => { rippleChanceRef.current = rippleChance; }, [rippleChance]);

  // Theme system
  const themes = {
    0: { // Seamless Black Interface
      name: 'Void',
      panel: {
        background: panelTransparent ? 'transparent' : '#0a0a0a',
        border: 'none',
        borderRadius: '0',
        boxShadow: 'none',
        backdropFilter: 'none'
      },
      header: {
        background: 'transparent',
        border: 'none',
        borderRadius: '0',
        color: '#ffffff',
        fontFamily: 'monospace',
        fontWeight: '400',
        letterSpacing: '0.5px',
        textShadow: 'none',
        boxShadow: 'none',
        padding: '8px 0',
        marginBottom: '8px'
      },
      button: (active: boolean, type?: string) => ({
        background: 'transparent',
        border: 'none',
        borderRadius: '0',
        color: active ? '#ffffff' : '#666666',
        fontFamily: 'monospace',
        textTransform: 'none' as const,
        letterSpacing: '0.3px',
        fontWeight: active ? '500' : '400',
        textShadow: 'none',
        boxShadow: 'none',
        textDecoration: active ? 'underline' : 'none',
        textUnderlineOffset: active ? '4px' : '0',
        padding: '4px 8px',
        minHeight: 'auto',
        lineHeight: '1.2'
      }),
      clear: {
        background: 'transparent',
        color: '#ff6b6b',
        border: 'none',
        borderRadius: '0',
        fontFamily: 'monospace',
        textTransform: 'none',
        fontWeight: '400',
        textShadow: 'none',
        boxShadow: 'none',
        padding: '4px 8px',
        minHeight: 'auto',
        lineHeight: '1.2'
      },
      autoButton: (active: boolean, enabled: boolean) => ({
        background: 'transparent',
        border: 'none',
        borderRadius: '0',
        color: enabled ? (active ? '#ffffff' : '#666666') : '#333333',
        fontFamily: 'monospace',
        fontWeight: active ? '500' : '400',
        opacity: 1,
        cursor: enabled ? 'pointer' : 'not-allowed',
        textShadow: 'none',
        boxShadow: 'none',
        outline: 'none',
        textDecoration: active ? 'underline' : 'none',
        textUnderlineOffset: active ? '4px' : '0',
        padding: '4px 8px',
        minHeight: 'auto',
        lineHeight: '1.2'
      }),
      optionButton: (active: boolean) => ({
        background: 'transparent',
        border: 'none',
        borderRadius: '0',
        color: active ? '#ffffff' : '#666666',
        fontFamily: 'monospace',
        fontWeight: active ? '500' : '400',
        textTransform: 'none' as const,
        letterSpacing: '0.3px',
        textShadow: 'none',
        boxShadow: 'none',
        textDecoration: active ? 'underline' : 'none',
        textUnderlineOffset: active ? '4px' : '0',
        padding: '4px 8px',
        minHeight: 'auto',
        lineHeight: '1.2'
      })
    },
    1: { // Minimal Typography Focus
      name: 'Type',
      panel: {
        background: '#111111',
        border: 'none',
        borderRadius: '0',
        boxShadow: 'none',
        backdropFilter: 'none'
      },
      header: {
        background: 'transparent',
        border: 'none',
        borderRadius: '0',
        color: '#cccccc',
        fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
        fontWeight: '300',
        letterSpacing: '1px',
        textShadow: 'none',
        boxShadow: 'none',
        fontSize: '13px'
      },
      button: (active: boolean, type?: string) => ({
        background: 'transparent',
        border: 'none',
        borderRadius: '0',
        color: active ? '#ffffff' : '#777777',
        fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
        textTransform: 'lowercase' as const,
        letterSpacing: '0.5px',
        fontWeight: active ? '400' : '300',
        fontSize: '12px',
        textShadow: 'none',
        boxShadow: 'none',
        position: 'relative' as const,
        '&::after': active ? {
          content: '◦',
          position: 'absolute',
          right: '-12px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '8px'
        } : {}
      }),
      clear: {
        background: 'transparent',
        color: '#999999',
        border: 'none',
        borderRadius: '0',
        fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
        textTransform: 'lowercase',
        fontWeight: '300',
        fontSize: '12px',
        textShadow: 'none',
        boxShadow: 'none'
      },
      autoButton: (active: boolean, enabled: boolean) => ({
        background: 'transparent',
        border: 'none',
        borderRadius: '0',
        color: enabled ? (active ? '#ffffff' : '#777777') : '#444444',
        fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
        fontWeight: active ? '400' : '300',
        fontSize: '12px',
        textTransform: 'lowercase' as const,
        letterSpacing: '0.5px',
        opacity: 1,
        cursor: enabled ? 'pointer' : 'not-allowed',
        textShadow: 'none',
        boxShadow: 'none',
        outline: 'none',
        position: 'relative' as const,
        '&::after': active ? {
          content: '◦',
          position: 'absolute',
          right: '-12px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '8px'
        } : {}
      }),
      optionButton: (active: boolean) => ({
        background: 'transparent',
        border: 'none',
        borderRadius: '0',
        color: active ? '#ffffff' : '#777777',
        fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
        fontWeight: active ? '400' : '300',
        fontSize: '12px',
        textTransform: 'lowercase' as const,
        letterSpacing: '0.5px',
        textShadow: 'none',
        boxShadow: 'none',
        padding: '4px 8px',
        position: 'relative' as const,
        '&::after': active ? {
          content: '◦',
          position: 'absolute',
          right: '-12px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '8px'
        } : {}
      })
    },
    2: { // Subtle Texture Variation
      name: 'Rough',
      panel: {
        background: '#0a0a0a',
        border: 'none',
        borderRadius: '0',
        boxShadow: 'none',
        backdropFilter: 'none',
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.02) 1px, transparent 0)',
        backgroundSize: '20px 20px'
      },
      header: {
        background: 'transparent',
        border: 'none',
        borderRadius: '0',
        color: '#e0e0e0',
        fontFamily: 'system-ui, sans-serif',
        fontWeight: '400',
        letterSpacing: '0.8px',
        textShadow: 'none',
        boxShadow: 'none',
        textTransform: 'uppercase' as const,
        fontSize: '11px'
      },
      button: (active: boolean, type?: string) => ({
        background: active ? 'rgba(15, 15, 15, 0.8)' : 'transparent',
        border: 'none',
        borderRadius: '0',
        color: active ? '#ffffff' : '#888888',
        fontFamily: 'system-ui, sans-serif',
        textTransform: 'none' as const,
        letterSpacing: '0.2px',
        fontWeight: '400',
        fontSize: '13px',
        textShadow: 'none',
        boxShadow: 'none',
        borderLeft: active ? '2px solid #333333' : 'none',
        paddingLeft: active ? '8px' : '0'
      }),
      clear: {
        background: 'transparent',
        color: '#aaaaaa',
        border: 'none',
        borderRadius: '0',
        fontFamily: 'system-ui, sans-serif',
        textTransform: 'none',
        fontWeight: '400',
        fontSize: '13px',
        textShadow: 'none',
        boxShadow: 'none'
      },
      autoButton: (active: boolean, enabled: boolean) => ({
        background: active ? 'rgba(15, 15, 15, 0.8)' : 'transparent',
        border: 'none',
        borderRadius: '0',
        color: enabled ? (active ? '#ffffff' : '#888888') : '#444444',
        fontFamily: 'system-ui, sans-serif',
        fontWeight: '400',
        fontSize: '13px',
        opacity: 1,
        cursor: enabled ? 'pointer' : 'not-allowed',
        textShadow: 'none',
        boxShadow: 'none',
        outline: 'none',
        borderLeft: active ? '2px solid #333333' : 'none',
        paddingLeft: active ? '8px' : '0'
      }),
      optionButton: (active: boolean) => ({
        background: active ? 'rgba(15, 15, 15, 0.8)' : 'transparent',
        border: 'none',
        borderRadius: '0',
        color: active ? '#ffffff' : '#888888',
        fontFamily: 'system-ui, sans-serif',
        fontWeight: '400',
        fontSize: '13px',
        textTransform: 'none' as const,
        letterSpacing: '0.2px',
        textShadow: 'none',
        boxShadow: 'none',
        padding: '4px 8px',
        borderLeft: active ? '2px solid #333333' : 'none',
        paddingLeft: active ? '8px' : '0'
      })
    }
  };


  const currentThemeConfig = themes[currentTheme as keyof typeof themes];

  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const LAUNCH_PANEL_POS = { x: 24, y: 20 };

const [panelPos, setPanelPos] = useState(() => {
  if (typeof window !== 'undefined') {
    return LAUNCH_PANEL_POS;
  }
  return { x: 20, y: 20 }; // fallback for SSR
});
  const mousePos = useRef({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 800;
      setIsMobile(mobile);
      if (!mobile && canvasContainerRef.current) {
        const rect = canvasContainerRef.current.getBoundingClientRect();
        setPanelPos(prev => ({ x: LAUNCH_PANEL_POS.x, y: prev.y }));
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const updateDirection = () => {
        let newDirection: Direction | null = null;
        const keys = pressedKeys.current;

        if (keys.has('KeyW') && keys.has('KeyA')) newDirection = 'top-left';
        else if (keys.has('KeyW') && keys.has('KeyD')) newDirection = 'top-right';
        else if (keys.has('KeyS') && keys.has('KeyA')) newDirection = 'bottom-left';
        else if (keys.has('KeyS') && keys.has('KeyD')) newDirection = 'bottom-right';
        else if (keys.has('KeyW')) newDirection = 'up';
        else if (keys.has('KeyS')) newDirection = 'down';
        else if (keys.has('KeyA')) newDirection = 'left';
        else if (keys.has('KeyD')) newDirection = 'right';
        
        if (newDirection) {
            const isDiagonal = newDirection.includes('-');
            const isCardinal = !isDiagonal;

            if (spreadPattern === 'pulse' && isDiagonal) {
                setPulseDirection(newDirection);
            } else if (spreadPattern === 'directional') {
                setDirectionalBias(newDirection);
            } else if (spreadPattern === 'flow' && isCardinal) {
                setFlowDirection(newDirection);
            }
        }
    };

    const keyMap: { [key: string]: string } = {
        'ArrowUp': 'KeyW', 'ArrowDown': 'KeyS', 'ArrowLeft': 'KeyA', 'ArrowRight': 'KeyD'
    };
    const relevantCodes = ['KeyW', 'KeyA', 'KeyS', 'KeyD'];

    const handleKeyDown = (e: KeyboardEvent) => {
        if (!showGenerativeSettings || (spreadPattern !== 'pulse' && spreadPattern !== 'directional' && spreadPattern !== 'flow')) {
            return;
        }

        const code = keyMap[e.code] || e.code;
        if (!relevantCodes.includes(code) || e.repeat) return;
        
        e.preventDefault();
        pressedKeys.current.add(code);
        updateDirection();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        const code = keyMap[e.code] || e.code;
        if (relevantCodes.includes(code)) {
            pressedKeys.current.delete(code);
        }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

  return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, [showGenerativeSettings, spreadPattern, setPulseDirection, setDirectionalBias, setFlowDirection]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = cols * cellSize;
    canvas.height = rows * cellSize;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const colorIndex = grid[r]?.[c];
        if (colorIndex > 0) {
          if (colorIndex === palette.length) {
            ctx.fillStyle = customColor;
          } else {
            ctx.fillStyle = palette[colorIndex];
          }
          ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
        }
      }
    }

    if (showGrid) {
      ctx.strokeStyle = GRID_COLOR;
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= cols * cellSize; x += cellSize) {
        ctx.beginPath();
        ctx.moveTo(x + 0.25, 0);
        ctx.lineTo(x + 0.25, rows * cellSize);
        ctx.stroke();
      }
      for (let y = 0; y <= rows * cellSize; y += cellSize) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.25);
        ctx.lineTo(cols * cellSize, y + 0.25);
        ctx.stroke();
      }
    }
  }, [grid, rows, cols, cellSize, backgroundColor, showGrid, palette, customColor]);

  useEffect(() => draw(), [draw]);

  const updateClearButtonColor = useCallback(() => {
    if (!clearButtonRef.current || !canvasRef.current || !panelVisible) {
        return;
    }

    const btnRect = clearButtonRef.current.getBoundingClientRect();
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const checkX = btnRect.left + btnRect.width / 2;
    const checkY = btnRect.top + btnRect.height / 2;

    const defaultClearColor = currentThemeConfig.clear.color;

    if (checkX < canvasRect.left || checkX > canvasRect.right || checkY < canvasRect.top || checkY > canvasRect.bottom) {
        setClearButtonColor(defaultClearColor);
        return;
    }

    const xOnCanvas = checkX - canvasRect.left;
    const yOnCanvas = checkY - canvasRect.top;

    const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    try {
        const pixelData = ctx.getImageData(xOnCanvas, yOnCanvas, 1, 1).data;
        const pixelHex = rgbToHex(pixelData[0], pixelData[1], pixelData[2]);

        if (pixelHex.toLowerCase() === defaultClearColor.toLowerCase()) {
            setClearButtonColor('#ffffff');
        } else {
            setClearButtonColor(defaultClearColor);
        }
    } catch (e) {
        console.error("Could not get image data from canvas:", e);
        setClearButtonColor(defaultClearColor);
    }
  }, [panelVisible, currentThemeConfig]);

  useEffect(() => {
    // Defer the color check to run after the render cycle completes
    const timeoutId = setTimeout(updateClearButtonColor, 100);
    return () => clearTimeout(timeoutId);
  }, [grid, panelPos, panelVisible, updateClearButtonColor]);
  
  // === Recording shortcut + toast (clean) ===
  useEffect(() => {
    const handleRecordingShortcut = (e: KeyboardEvent) => {
      if (e.key && e.key.toLowerCase() === "r" && recordEnabled) {
        e.preventDefault();
        if (isRecording) {
          stopRecording();
        } else {
          startRecording();
        }
      }
    };
    window.addEventListener("keydown", handleRecordingShortcut);
    return () => window.removeEventListener("keydown", handleRecordingShortcut);
  }, [isRecording, recordEnabled, recordingFilename]);

  useEffect(() => {
    if (recordingToast) {
      const t = setTimeout(() => setRecordingToast(null), 1400);
      return () => clearTimeout(t);
    }
  }, [recordingToast]);
  // === End Recording shortcut + toast (clean) ===

  const paintCell = (r: number, c: number, color: number) => {
    setGrid(g => drawingUtils.paintCell({
      grid: g,
      r,
      c,
      color,
      brushSize,
      brushType: brushTypeRef.current,
      blendMode,
      diagonalThickness: diagonalThicknessRef.current,
      sprayDensity: sprayDensityRef.current,
    }));
  };

  const floodFill = (startR: number, startC: number, newColor: number) => {
    setGrid(g => drawingUtils.floodFill({ grid: g, startR, startC, newColor }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isSavingColor) {
      setIsSavingColor(false);
      return;
    }
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);
    
    if (tool === 'fill') {
      floodFill(y, x, selectedColor);
    } else {
      isMouseDown.current = true;
      const colorToUse = tool === 'eraser' ? 0 : selectedColor;
      paintCell(y, x, colorToUse);
    }
  };

  const handleMouseUp = () => { 
    isMouseDown.current = false; 
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown.current || tool === 'fill') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);
    
    const colorToUse = tool === 'eraser' ? 0 : selectedColor;
    paintCell(y, x, colorToUse);
  };

  const clear = () => {
    setGrid(createEmptyGrid(rows, cols));
    setIsSavingColor(false);
  };

  const colorSpread = useCallback(() => {
    const pattern = spreadPatternRef.current;

    setGrid(g => {
        let ng = g;

        switch (pattern) {
            case 'ripple': {
                const result = movementAlgorithms.ripple(g, ripplesRef.current, rippleChanceRef.current);
                ng = result.newGrid;
                ripplesRef.current = result.newRipples;
                break;
            }
            case 'scramble': {
                ng = chaosAlgorithms.scramble(g, scrambleSwapsRef.current);
                break;
            }
            case 'vortex': {
                ng = movementAlgorithms.vortex(g, vortexCountRef.current);
                break;
            }
            case 'strobe': {
                strobeStateRef.current = !strobeStateRef.current;
                ng = chaosAlgorithms.strobe(
                    g,
                    strobeStateRef.current,
                    strobeExpandThresholdRef.current,
                    strobeContractThresholdRef.current
                );
                break;
            }
            case 'jitter': {
                ng = chaosAlgorithms.jitter(g, jitterChanceRef.current);
                break;
            }
            case 'flow': {
                ng = movementAlgorithms.flow(g, flowDirectionRef.current as Direction, flowChanceRef.current);
                break;
            }
            case 'vein': {
                const result = cellularAlgorithms.vein(
                    g,
                    walkers.current,
                    veinSeekStrengthRef.current,
                    veinBranchChanceRef.current
                );
                ng = result.newGrid;
                walkers.current = result.newWalkers;
                break;
            }
            case 'crystallize': {
                ng = cellularAlgorithms.crystallize(g, crystallizeThresholdRef.current);
                break;
            }
            case 'erosion': {
                ng = chaosAlgorithms.erosion(g, erosionRateRef.current, erosionSolidityRef.current);
                break;
            }
            case 'tendrils':
            case 'conway': {
                const rules = pattern === 'conway' ? conwayRulesRef.current : tendrilsRulesRef.current;
                ng = cellularAlgorithms.conway(g, rules, generativeColorIndicesRef.current);
                break;
            }
            case 'pulse': {
                ng = movementAlgorithms.pulse(g, pulseDirectionRef.current, pulseOvertakesRef.current);
                break;
            }
            case 'random': {
                ng = chaosAlgorithms.randomWalk(
                    g,
                    spreadProbabilityRef.current,
                    randomWalkModeRef.current,
                    randomWalkSpreadCountRef.current
                );
                break;
            }
            case 'directional': {
                ng = movementAlgorithms.directional(
                    g,
                    spreadProbabilityRef.current,
                    directionalBiasRef.current as Direction | "none",
                    directionalBiasStrengthRef.current
                );
                break;
            }
        }
        return ng;
    });
  }, []);

  const addRandomDots = useCallback(() => {
    setGrid(g => {
        const availableColors = generativeColorIndicesRef.current.length > 0
          ? generativeColorIndicesRef.current
          : palette.slice(1).map((_, i) => i + 1);
        return drawingUtils.addRandomDots({ grid: g, availableColors });
    });
  }, [palette]);

  const addRandomShapes = useCallback(() => {
    setGrid(g => {
        const availableColors = generativeColorIndicesRef.current.length > 0
          ? generativeColorIndicesRef.current
          : palette.slice(1).map((_, i) => i + 1);
        return drawingUtils.addRandomShapes({ grid: g, availableColors });
    });
  }, [palette]);

  const runAutoSpread = useCallback(() => {
    let lastTime = performance.now();
    const loop = (time: number) => {
      if (!runningRef.current) return;

      const pattern = spreadPatternRef.current;
      const speed = pattern === 'pulse' 
        ? pulseSpeedRef.current 
        : autoSpreadSpeedRef.current;
      
      const interval = 1000 / Math.max(0.25, speed);

      if (time - lastTime >= interval) {
        colorSpread();
        lastTime = time;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [colorSpread]);

  const runAutoDots = useCallback(() => {
    let lastTime = performance.now();
    const loop = (time: number) => {
      if (!dotsRunningRef.current) return;
      const interval = 1000 / Math.max(0.1, autoDotsSpeedRef.current);
      if (time - lastTime >= interval) {
        addRandomDots();
        lastTime = time;
      }
      autoDotsRef.current = requestAnimationFrame(loop);
    };
    autoDotsRef.current = requestAnimationFrame(loop);
  }, [addRandomDots]);

  const runAutoShapes = useCallback(() => {
    let lastTime = performance.now();
    const loop = (time: number) => {
      if (!shapesRunningRef.current) return;
      const interval = 1000 / Math.max(0.1, autoShapesSpeedRef.current);
      if (time - lastTime >= interval) {
        addRandomShapes();
        lastTime = time;
      }
      autoShapesRef.current = requestAnimationFrame(loop);
    };
    autoShapesRef.current = requestAnimationFrame(loop);
  }, [addRandomShapes]);

  const toggleAutoSpread = () => {
    runningRef.current = !runningRef.current;
    setAutoSpreading(runningRef.current);
    if (runningRef.current) {
      if (spreadPatternRef.current === 'vein') walkers.current = [];
      if (spreadPatternRef.current === 'strobe') strobeStateRef.current = true;
      if (spreadPatternRef.current === 'ripple') ripplesRef.current = [];
      runAutoSpread();
    } else if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
  };

  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.isContentEditable) {
            return;
        }

        // Brush Size
        if (e.code === 'Digit9') {
            e.preventDefault();
            setBrushSize(currentSize => Math.max(1, currentSize - 1));
            return;
        }
        if (e.code === 'Digit0') {
            e.preventDefault();
            setBrushSize(currentSize => Math.min(100, currentSize + 1));
            return;
        }

        // Brush-Specific Controls
        if (e.code === 'BracketLeft') {
            e.preventDefault();
            if (brushTypeRef.current === 'diagonal') {
                setDiagonalThickness(d => Math.max(1, d - 1));
            } else if (brushTypeRef.current === 'spray') {
                setSprayDensity(d => Math.max(0.01, parseFloat((d - 0.01).toFixed(2))));
            }
            return;
        }
        if (e.code === 'BracketRight') {
            e.preventDefault();
            if (brushTypeRef.current === 'diagonal') {
                setDiagonalThickness(d => Math.min(100, d + 1));
            } else if (brushTypeRef.current === 'spray') {
                setSprayDensity(d => Math.min(1, parseFloat((d + 0.01).toFixed(2))));
            }
            return;
        }

        // Tool switching
        if (e.code === "KeyE") { e.preventDefault(); setTool('eraser'); return; }
        if (e.code === "KeyF") { e.preventDefault(); setTool('fill'); return; }
        if (e.code === "KeyB") { e.preventDefault(); setTool('brush'); return; }
        
        // Brush type switching (also sets tool to brush)
        if (e.code === "KeyU") { e.preventDefault(); setBrushType('square'); setTool('brush'); return; }
        if (e.code === "KeyI") { e.preventDefault(); setBrushType('circle'); setTool('brush'); return; }
        if (e.code === "KeyO") { e.preventDefault(); setBrushType('diagonal'); setTool('brush'); return; }
        if (e.code === "KeyP") { e.preventDefault(); setBrushType('spray'); setTool('brush'); return; }

        // Palette color selection
        if (e.code === "Digit1") { e.preventDefault(); setSelectedColor(1); return; }
        if (e.code === "Digit2") { e.preventDefault(); setSelectedColor(2); return; }
        if (e.code === "Digit3") { e.preventDefault(); setSelectedColor(3); return; }
        if (e.code === "Digit4") { e.preventDefault(); setSelectedColor(4); return; }
        if (e.code === "Digit5") { e.preventDefault(); setSelectedColor(5); return; }
        if (e.code === "Digit6") { e.preventDefault(); setSelectedColor(6); return; }
        if (e.code === "Digit7") { e.preventDefault(); setSelectedColor(7); return; }
        if (e.code === "Digit8") { e.preventDefault(); setSelectedColor(8); return; }
        
        // Auto-mode toggles
        if (e.code === "Space") { e.preventDefault(); toggleAutoSpread(); return; }
        if (e.code === "KeyJ") { e.preventDefault(); toggleAutoDots(); return; }
        if (e.code === "KeyK") { e.preventDefault(); toggleAutoShapes(); return; }

        // Start/Stop All
        if (e.code === "KeyL") {
            e.preventDefault();
            const anyRunning = runningRef.current || dotsRunningRef.current || shapesRunningRef.current;
            if (anyRunning) {
                if (runningRef.current) {
                    runningRef.current = false;
                    setAutoSpreading(false);
                    if (rafRef.current) cancelAnimationFrame(rafRef.current);
                }
                if (dotsRunningRef.current) {
                    dotsRunningRef.current = false;
                    setAutoDots(false);
                    if (autoDotsRef.current) cancelAnimationFrame(autoDotsRef.current);
                }
                if (shapesRunningRef.current) {
                    shapesRunningRef.current = false;
                    setAutoShapes(false);
                    if (autoShapesRef.current) cancelAnimationFrame(autoShapesRef.current);
                }
            } else {
                if (autoSpreadEnabledRef.current && !runningRef.current) {
                    runningRef.current = true;
                    setAutoSpreading(true);
                    if (spreadPatternRef.current === 'vein') walkers.current = [];
                    if (spreadPatternRef.current === 'strobe') strobeStateRef.current = true;
                    if (spreadPatternRef.current === 'ripple') ripplesRef.current = [];
                    runAutoSpread();
                }
                if (autoDotsEnabledRef.current && !dotsRunningRef.current) {
                    dotsRunningRef.current = true;
                    setAutoDots(true);
                    runAutoDots();
                }
                if (autoShapesEnabledRef.current && !shapesRunningRef.current) {
                    shapesRunningRef.current = true;
                    setAutoShapes(true);
                    runAutoShapes();
                }
            }
            return;
        }
    };

    window.addEventListener("keydown", handleGlobalShortcuts);
    return () => window.removeEventListener("keydown", handleGlobalShortcuts);
  }, []);


  const toggleAutoDots = () => {
    dotsRunningRef.current = !dotsRunningRef.current;
    setAutoDots(dotsRunningRef.current);
    if (dotsRunningRef.current) {
      runAutoDots();
    } else if (autoDotsRef.current) {
      cancelAnimationFrame(autoDotsRef.current);
    }
  };

  const toggleAutoShapes = () => {
    shapesRunningRef.current = !shapesRunningRef.current;
    setAutoShapes(shapesRunningRef.current);
    if (shapesRunningRef.current) {
      runAutoShapes();
    } else if (autoShapesRef.current) {
      cancelAnimationFrame(autoShapesRef.current);
    }
  };

  const startAllEnabled = () => {
    if (autoSpreadEnabled && !autoSpreading) {
      runningRef.current = true;
      setAutoSpreading(true);
      runAutoSpread();
    }
    if (autoDotsEnabled && !autoDots) {
      dotsRunningRef.current = true;
      setAutoDots(true);
      runAutoDots();
    }
    if (autoShapesEnabled && !autoShapes) {
      shapesRunningRef.current = true;
      setAutoShapes(true);
      runAutoShapes();
    }
  };

  const stopAll = () => {
    if (autoSpreading) {
      runningRef.current = false;
      setAutoSpreading(false);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    }
    if (autoDots) {
      dotsRunningRef.current = false;
      setAutoDots(false);
      if (autoDotsRef.current) {
        cancelAnimationFrame(autoDotsRef.current);
      }
    }
    if (autoShapes) {
      shapesRunningRef.current = false;
      setAutoShapes(false);
      if (autoShapesRef.current) {
        cancelAnimationFrame(autoShapesRef.current);
      }
    }
  };

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return;
    isDragging.current = true;
    dragOffset.current = { x: e.clientX - panelPos.x, y: e.clientY - panelPos.y };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (isDragging.current)
        setPanelPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    };
    const handleMouseUp = () => { isDragging.current = false; };
    
    const handleKeyDown = (e: KeyboardEvent) => {
if (e.key === 'Shift') {
  e.preventDefault();
  console.log('Shift pressed, panelVisible:', panelVisible);

  if (!panelVisible) {
    // If panel is invisible, show it at mouse position
    console.log('Making panel visible');
    setIsMobile(false);
    setPanelVisible(true);
    setPanelMinimized(false);

    // Use mouse position if available, else center
    const mouseX = mousePos.current.x || window.innerWidth / 2;
    const mouseY = mousePos.current.y || window.innerHeight / 2;

    // Use stored panel dimensions
    const PANEL_WIDTH = panelDimensions.current.width;
    const PANEL_HEIGHT = panelDimensions.current.height;
    const MARGIN = 20;

    // Calculate new position with header center under the mouse
    const newX = Math.max(
      MARGIN,
      Math.min(mouseX - PANEL_WIDTH / 2, window.innerWidth - PANEL_WIDTH - MARGIN)
    );
    const newY = Math.max(
      MARGIN,
      Math.min(mouseY - 20, window.innerHeight - PANEL_HEIGHT - MARGIN)
    );

    setPanelPos({ x: newX, y: newY });
  } else {
    // If panel is visible, make it invisible
    console.log('Making panel invisible');
    setPanelVisible(false);
  }
}

if (e.key === 't' || e.key === 'T') {
  e.preventDefault();
  setPanelTransparent(prev => !prev);
}


    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    
    

  return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobile, panelPos, panelVisible, panelTransparent]);

  // Update stored panel dimensions when visible
  useEffect(() => {
    if (panelVisible && panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        panelDimensions.current = { width: rect.width, height: rect.height };
      }
    }
  }, [panelVisible, panelMinimized]);

  const handleRowsChange = useCallback((newRows: number) => {
    setRows(newRows);
    setGrid(currentGrid => {
      const newGrid = createEmptyGrid(newRows, cols);
      const oldRows = currentGrid.length;
      for (let r = 0; r < Math.min(oldRows, newRows); r++) {
        const oldCols = currentGrid[r]?.length ?? 0;
        for (let c = 0; c < Math.min(oldCols, cols); c++) {
          newGrid[r][c] = currentGrid[r][c];
        }
      }
      return newGrid;
    });
  }, [cols]);

  const handleColsChange = useCallback((newCols: number) => {
    setCols(newCols);
    setGrid(currentGrid =>
      currentGrid.map(row => {
        const newRow = new Array(newCols).fill(0);
        const oldLength = row.length;
        for (let c = 0; c < Math.min(oldLength, newCols); c++) {
          newRow[c] = row[c];
        }
        return newRow;
      })
    );
  }, []);

  const handlePaletteClick = (index: number) => {
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
  };
  
  const handleGenerativeColorToggle = (colorIndex: number) => {
    setGenerativeColorIndices(prev => {
        if (prev.includes(colorIndex)) {
            return prev.filter(i => i !== colorIndex);
        } else {
            return [...prev, colorIndex];
        }
    });
  };

  const resetGenerativeSettings = () => {
    setSpreadPattern(defaults.spreadPattern);
    setPulseSpeed(defaults.pulseSpeed);
    setDirectionalBias(defaults.directionalBias);
    setConwayRules(defaults.conwayRules);
    setTendrilsRules(defaults.tendrilsRules);
    setDirectionalBiasStrength(defaults.directionalBiasStrength);
    setPulseOvertakes(defaults.pulseOvertakes);
    setPulseDirection(defaults.pulseDirection);
    setRandomWalkSpreadCount(defaults.randomWalkSpreadCount);
    setRandomWalkMode(defaults.randomWalkMode);
    setVeinSeekStrength(defaults.veinSeekStrength);
    setVeinBranchChance(defaults.veinBranchChance);
    setCrystallizeThreshold(defaults.crystallizeThreshold);
    setErosionRate(defaults.erosionRate);
    setErosionSolidity(defaults.erosionSolidity);
    setFlowDirection(defaults.flowDirection);
    setFlowChance(defaults.flowChance);
    setJitterChance(defaults.jitterChance);
    setVortexCount(defaults.vortexCount);
    setStrobeExpandThreshold(defaults.strobeExpandThreshold);
    setStrobeContractThreshold(defaults.strobeContractThreshold);
    setScrambleSwaps(defaults.scrambleSwaps);
    setRippleChance(defaults.rippleChance);
  };

  const isAnyRunning = autoSpreading || autoDots || autoShapes;
  const anyEnabled = autoSpreadEnabled || autoDotsEnabled || autoShapesEnabled;

  return (
    <PaintStudioUI
      // Canvas refs
      canvasRef={canvasRef}
      canvasContainerRef={canvasContainerRef}
      panelRef={panelRef}
      clearButtonRef={clearButtonRef}

      // Mouse handlers
      handleMouseDown={handleMouseDown}
      handleMouseUp={handleMouseUp}
      handleMouseMove={handleMouseMove}
      handleHeaderMouseDown={handleHeaderMouseDown}

      // UI state
      isMobile={isMobile}
      tool={tool}
      backgroundColor={backgroundColor}
      panelVisible={panelVisible}
      panelPos={panelPos}
      panelMinimized={panelMinimized}
      recordingToast={recordingToast}
      showAutoControls={showAutoControls}
      showOptions={showOptions}
      showSpeedSettings={showSpeedSettings}
      showCanvasSettings={showCanvasSettings}
      showVisualSettings={showVisualSettings}
      showGenerativeSettings={showGenerativeSettings}
      showStepControls={showStepControls}
      isSavingColor={isSavingColor}
      clearButtonColor={clearButtonColor}
      panelTransparent={panelTransparent}

      // Settings state
      selectedColor={selectedColor}
      palette={palette}
      customColor={customColor}
      brushSize={brushSize}
      brushType={brushType}
      blendMode={blendMode}
      rows={rows}
      cols={cols}
      cellSize={cellSize}
      showGrid={showGrid}
      spreadPattern={spreadPattern}
      autoSpreading={autoSpreading}
      autoDots={autoDots}
      autoShapes={autoShapes}
      autoSpreadSpeed={autoSpreadSpeed}
      autoDotsSpeed={autoDotsSpeed}
      autoShapesSpeed={autoShapesSpeed}

      // Pattern-specific settings
      rippleChance={rippleChance}
      scrambleSwaps={scrambleSwaps}
      vortexCount={vortexCount}
      strobeExpandThreshold={strobeExpandThreshold}
      strobeContractThreshold={strobeContractThreshold}
      jitterChance={jitterChance}
      flowDirection={flowDirection}
      flowChance={flowChance}
      veinSeekStrength={veinSeekStrength}
      veinBranchChance={veinBranchChance}
      crystallizeThreshold={crystallizeThreshold}
      erosionRate={erosionRate}
      erosionSolidity={erosionSolidity}
      pulseDirection={pulseDirection}
      pulseOvertakes={pulseOvertakes}
      pulseSpeed={pulseSpeed}
      spreadProbability={spreadProbability}
      randomWalkMode={randomWalkMode}
      randomWalkSpreadCount={randomWalkSpreadCount}
      directionalBias={directionalBias}
      directionalBiasStrength={directionalBiasStrength}
      diagonalThickness={diagonalThickness}
      sprayDensity={sprayDensity}
      conwayRules={conwayRules}
      tendrilsRules={tendrilsRules}
      recordEnabled={recordEnabled}
      recordingFilename={recordingFilename}
      isRecording={isRecording}
      generativeColorIndices={generativeColorIndices}
      autoSpreadEnabled={autoSpreadEnabled}
      autoDotsEnabled={autoDotsEnabled}
      autoShapesEnabled={autoShapesEnabled}

      // Setters
      setTool={setTool}
      setIsSavingColor={setIsSavingColor}
      setShowAutoControls={setShowAutoControls}
      setPanelMinimized={setPanelMinimized}
      setShowOptions={setShowOptions}
      setShowSpeedSettings={setShowSpeedSettings}
      setShowCanvasSettings={setShowCanvasSettings}
      setShowVisualSettings={setShowVisualSettings}
      setShowGenerativeSettings={setShowGenerativeSettings}
      setShowStepControls={setShowStepControls}
      setSelectedColor={setSelectedColor}
      setCustomColor={setCustomColor}
      setBrushSize={setBrushSize}
      setBrushType={setBrushType}
      setBlendMode={setBlendMode}
      setCellSize={setCellSize}
      setShowGrid={setShowGrid}
      setBackgroundColor={setBackgroundColor}
      setPanelTransparent={setPanelTransparent}
      setSpreadPattern={setSpreadPattern}
      setAutoSpreadSpeed={setAutoSpreadSpeed}
      setAutoDotsSpeed={setAutoDotsSpeed}
      setAutoShapesSpeed={setAutoShapesSpeed}
      setRippleChance={setRippleChance}
      setScrambleSwaps={setScrambleSwaps}
      setVortexCount={setVortexCount}
      setStrobeExpandThreshold={setStrobeExpandThreshold}
      setStrobeContractThreshold={setStrobeContractThreshold}
      setJitterChance={setJitterChance}
      setFlowDirection={setFlowDirection}
      setFlowChance={setFlowChance}
      setVeinSeekStrength={setVeinSeekStrength}
      setVeinBranchChance={setVeinBranchChance}
      setCrystallizeThreshold={setCrystallizeThreshold}
      setErosionRate={setErosionRate}
      setErosionSolidity={setErosionSolidity}
      setPulseDirection={setPulseDirection}
      setPulseOvertakes={setPulseOvertakes}
      setPulseSpeed={setPulseSpeed}
      setSpreadProbability={setSpreadProbability}
      setRandomWalkMode={setRandomWalkMode}
      setRandomWalkSpreadCount={setRandomWalkSpreadCount}
      setDirectionalBias={setDirectionalBias}
      setDirectionalBiasStrength={setDirectionalBiasStrength}
      setDiagonalThickness={setDiagonalThickness}
      setSprayDensity={setSprayDensity}
      setConwayRules={setConwayRules}
      setTendrilsRules={setTendrilsRules}
      setRecordEnabled={setRecordEnabled}
      setRecordingFilename={setRecordingFilename}
      setGenerativeColorIndices={setGenerativeColorIndices}
      setAutoSpreadEnabled={setAutoSpreadEnabled}
      setAutoDotsEnabled={setAutoDotsEnabled}
      setAutoShapesEnabled={setAutoShapesEnabled}
      setPalette={setPalette}

      // Functions
      clear={clear}
      toggleAutoSpread={toggleAutoSpread}
      toggleAutoDots={toggleAutoDots}
      toggleAutoShapes={toggleAutoShapes}
      handlePaletteClick={handlePaletteClick}
      colorSpread={colorSpread}
      addRandomDots={addRandomDots}
      addRandomShapes={addRandomShapes}
      handleRowsChange={handleRowsChange}
      handleColsChange={handleColsChange}
      resetGenerativeSettings={resetGenerativeSettings}
      handleGenerativeColorToggle={handleGenerativeColorToggle}

      // Theme
      currentThemeConfig={currentThemeConfig}

      // Optional refs
      walkersRef={walkers}
    />
  );
}
