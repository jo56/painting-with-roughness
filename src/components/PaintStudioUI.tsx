import React from 'react';
import type { BrushType, SpreadPattern } from '../types';
import { ToolBar } from './ToolBar';
import { PaletteSection } from './PaletteSection';
import { AutoControls } from './AutoControls';
import { OptionsToggle } from './OptionsToggle';
import { StepControls } from './StepControls';
import { SpeedSettings } from './SpeedSettings';
import { CanvasSettings } from './CanvasSettings';
import { GenerativeSettings } from './GenerativeSettings';
import { VisualSettings } from './VisualSettings';
import { MainPanel } from './MainPanel';

export interface PaintStudioUIProps {
  // Canvas refs
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvasContainerRef: React.RefObject<HTMLDivElement>;
  panelRef: React.RefObject<HTMLDivElement>;
  clearButtonRef: React.RefObject<HTMLButtonElement>;

  // Mouse handlers
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleHeaderMouseDown: (e: React.MouseEvent) => void;

  // UI state
  isMobile: boolean;
  tool: string;
  backgroundColor: string;
  panelVisible: boolean;
  panelPos: { x: number; y: number };
  panelMinimized: boolean;
  recordingToast: string | null;
  showAutoControls: boolean;
  showOptions: boolean;
  showSpeedSettings: boolean;
  showCanvasSettings: boolean;
  showVisualSettings: boolean;
  showGenerativeSettings: boolean;
  showStepControls: boolean;
  isSavingColor: boolean;
  clearButtonColor: string;
  panelTransparent: boolean;

  // Settings state
  selectedColor: number;
  palette: string[];
  customColor: string;
  brushSize: number;
  brushType: BrushType;
  blendMode: string;
  rows: number;
  cols: number;
  cellSize: number;
  showGrid: boolean;
  spreadPattern: SpreadPattern;
  autoSpreading: boolean;
  autoDots: boolean;
  autoShapes: boolean;
  autoSpreadSpeed: number;
  autoDotsSpeed: number;
  autoShapesSpeed: number;

  // Pattern-specific settings
  rippleChance: number;
  scrambleSwaps: number;
  vortexCount: number;
  strobeExpandThreshold: number;
  strobeContractThreshold: number;
  jitterChance: number;
  flowDirection: string;
  flowChance: number;
  veinSeekStrength: number;
  veinBranchChance: number;
  crystallizeThreshold: number;
  erosionRate: number;
  erosionSolidity: number;
  pulseDirection: string;
  pulseOvertakes: boolean;
  pulseSpeed: number;
  spreadProbability: number;
  randomWalkMode: string;
  randomWalkSpreadCount: number;
  directionalBias: string;
  directionalBiasStrength: number;
  diagonalThickness: number;
  sprayDensity: number;
  conwayRules: { born: number[]; survive: number[] };
  tendrilsRules: { born: number[]; survive: number[] };
  recordEnabled: boolean;
  recordingFilename: string;
  isRecording: boolean;
  generativeColorIndices: number[];
  autoSpreadEnabled: boolean;
  autoDotsEnabled: boolean;
  autoShapesEnabled: boolean;

  // Setters
  setTool: (tool: string) => void;
  setIsSavingColor: (value: boolean | ((prev: boolean) => boolean)) => void;
  setShowAutoControls: (value: boolean | ((prev: boolean) => boolean)) => void;
  setPanelMinimized: (value: boolean | ((prev: boolean) => boolean)) => void;
  setShowOptions: (value: boolean | ((prev: boolean) => boolean)) => void;
  setShowSpeedSettings: (value: boolean | ((prev: boolean) => boolean)) => void;
  setShowCanvasSettings: (value: boolean | ((prev: boolean) => boolean)) => void;
  setShowVisualSettings: (value: boolean | ((prev: boolean) => boolean)) => void;
  setShowGenerativeSettings: (value: boolean | ((prev: boolean) => boolean)) => void;
  setShowStepControls: (value: boolean | ((prev: boolean) => boolean)) => void;
  setSelectedColor: (value: number) => void;
  setCustomColor: (value: string) => void;
  setBrushSize: (value: number) => void;
  setBrushType: (value: BrushType) => void;
  setBlendMode: (value: string) => void;
  setCellSize: (value: number) => void;
  setShowGrid: (value: boolean) => void;
  setBackgroundColor: (value: string) => void;
  setPanelTransparent: (value: boolean) => void;
  setSpreadPattern: (value: SpreadPattern) => void;
  setAutoSpreadSpeed: (value: number) => void;
  setAutoDotsSpeed: (value: number) => void;
  setAutoShapesSpeed: (value: number) => void;
  setRippleChance: (value: number) => void;
  setScrambleSwaps: (value: number) => void;
  setVortexCount: (value: number) => void;
  setStrobeExpandThreshold: (value: number) => void;
  setStrobeContractThreshold: (value: number) => void;
  setJitterChance: (value: number) => void;
  setFlowDirection: (value: string) => void;
  setFlowChance: (value: number) => void;
  setVeinSeekStrength: (value: number) => void;
  setVeinBranchChance: (value: number) => void;
  setCrystallizeThreshold: (value: number) => void;
  setErosionRate: (value: number) => void;
  setErosionSolidity: (value: number) => void;
  setPulseDirection: (value: string) => void;
  setPulseOvertakes: (value: boolean) => void;
  setPulseSpeed: (value: number) => void;
  setSpreadProbability: (value: number) => void;
  setRandomWalkMode: (value: string) => void;
  setRandomWalkSpreadCount: (value: number) => void;
  setDirectionalBias: (value: string) => void;
  setDirectionalBiasStrength: (value: number) => void;
  setDiagonalThickness: (value: number) => void;
  setSprayDensity: (value: number) => void;
  setConwayRules: (value: { born: number[]; survive: number[] } | ((prev: { born: number[]; survive: number[] }) => { born: number[]; survive: number[] })) => void;
  setTendrilsRules: (value: { born: number[]; survive: number[] } | ((prev: { born: number[]; survive: number[] }) => { born: number[]; survive: number[] })) => void;
  setRecordEnabled: (value: boolean) => void;
  setRecordingFilename: (value: string) => void;
  setGenerativeColorIndices: (value: number[]) => void;
  setAutoSpreadEnabled: (value: boolean) => void;
  setAutoDotsEnabled: (value: boolean) => void;
  setAutoShapesEnabled: (value: boolean) => void;
  setPalette: (value: string[] | ((prev: string[]) => string[])) => void;

  // Functions
  clear: () => void;
  toggleAutoSpread: () => void;
  toggleAutoDots: () => void;
  toggleAutoShapes: () => void;
  handlePaletteClick: (index: number) => void;
  colorSpread: () => void;
  addRandomDots: () => void;
  addRandomShapes: () => void;
  handleRowsChange: (value: number) => void;
  handleColsChange: (value: number) => void;
  resetGenerativeSettings: () => void;
  handleGenerativeColorToggle: (colorIndex: number) => void;

  // Theme
  currentThemeConfig: any;

  // Optional refs
  walkersRef?: React.MutableRefObject<{r: number, c: number, color: number}[]>;
}

export function PaintStudioUI(props: PaintStudioUIProps) {
  const {
    canvasRef,
    canvasContainerRef,
    panelRef,
    clearButtonRef,
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
    handleHeaderMouseDown,
    isMobile,
    tool,
    backgroundColor,
    panelVisible,
    panelPos,
    panelMinimized,
    recordingToast,
    showAutoControls,
    showOptions,
    showSpeedSettings,
    showCanvasSettings,
    showVisualSettings,
    showGenerativeSettings,
    showStepControls,
    isSavingColor,
    clearButtonColor,
    panelTransparent,
    currentThemeConfig,
  } = props;

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: 'black',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: 'flex-start',
      color: '#fff'
    }}>
      {/* Canvas */}
      <div ref={canvasContainerRef} style={{ padding: '10px', display: 'inline-block' }}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseUp}
          style={{
            display: 'block',
            cursor: tool === 'fill' ? 'pointer' : 'crosshair',
            background: backgroundColor
          }}
        />
      </div>

      {/* Recording Toast */}
      {recordingToast && (
        <div style={{
          position: 'fixed',
          top: 12,
          right: 12,
          background: 'rgba(0,0,0,0.8)',
          color: '#ffffff',
          fontFamily: 'monospace',
          letterSpacing: '0.3px',
          padding: '8px 12px',
          borderRadius: '0',
          fontSize: '0.9rem',
          zIndex: 2000
        }}>
          {recordingToast}
        </div>
      )}

      {/* Main Panel with all controls */}
      <MainPanel
        panelRef={panelRef}
        isMobile={isMobile}
        panelVisible={panelVisible}
        panelPos={panelPos}
        panelMinimized={panelMinimized}
        handleHeaderMouseDown={handleHeaderMouseDown}
        setPanelMinimized={props.setPanelMinimized}
        currentThemeConfig={currentThemeConfig}
      >
        {/* ToolBar */}
        <ToolBar
          tool={tool}
          setTool={props.setTool}
          setIsSavingColor={props.setIsSavingColor}
          showAutoControls={showAutoControls}
          setShowAutoControls={props.setShowAutoControls}
          themeConfig={currentThemeConfig}
        />

        {/* Palette Section */}
        <PaletteSection
          palette={props.palette}
          selectedColor={props.selectedColor}
          customColor={props.customColor}
          isSavingColor={isSavingColor}
          panelRef={panelRef}
          handlePaletteClick={props.handlePaletteClick}
          setCustomColor={props.setCustomColor}
          setSelectedColor={props.setSelectedColor}
          setIsSavingColor={props.setIsSavingColor}
        />

        {/* Auto Controls */}
        {showAutoControls && (
          <AutoControls
            autoSpreading={props.autoSpreading}
            autoDots={props.autoDots}
            autoShapes={props.autoShapes}
            autoSpreadEnabled={props.autoSpreadEnabled}
            autoDotsEnabled={props.autoDotsEnabled}
            autoShapesEnabled={props.autoShapesEnabled}
            toggleAutoSpread={props.toggleAutoSpread}
            toggleAutoDots={props.toggleAutoDots}
            toggleAutoShapes={props.toggleAutoShapes}
            setIsSavingColor={props.setIsSavingColor}
            themeConfig={currentThemeConfig}
          />
        )}

        {/* Options Toggle */}
        {showOptions && (
          <OptionsToggle
            showSpeedSettings={showSpeedSettings}
            showCanvasSettings={showCanvasSettings}
            showVisualSettings={showVisualSettings}
            showGenerativeSettings={showGenerativeSettings}
            showStepControls={showStepControls}
            setShowSpeedSettings={props.setShowSpeedSettings}
            setShowCanvasSettings={props.setShowCanvasSettings}
            setShowVisualSettings={props.setShowVisualSettings}
            setShowGenerativeSettings={props.setShowGenerativeSettings}
            setShowStepControls={props.setShowStepControls}
            themeConfig={currentThemeConfig}
          />
        )}

        {/* Step Controls */}
        {showOptions && showStepControls && (
          <StepControls
            colorSpread={props.colorSpread}
            addRandomDots={props.addRandomDots}
            addRandomShapes={props.addRandomShapes}
            setIsSavingColor={props.setIsSavingColor}
          />
        )}

        {/* Speed and Canvas Settings */}
        {showOptions && (showSpeedSettings || showCanvasSettings) && (
          <div className="scrollable-settings" style={{
            display: 'grid',
            gridTemplateColumns: showSpeedSettings && showCanvasSettings ? 'repeat(2, 1fr)' : '1fr',
            gap: '12px',
            marginBottom: '12px',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {showSpeedSettings && (
              <SpeedSettings
                spreadProbability={props.spreadProbability}
                autoSpreadSpeed={props.autoSpreadSpeed}
                autoDotsSpeed={props.autoDotsSpeed}
                autoShapesSpeed={props.autoShapesSpeed}
                setSpreadProbability={props.setSpreadProbability}
                setAutoSpreadSpeed={props.setAutoSpreadSpeed}
                setAutoDotsSpeed={props.setAutoDotsSpeed}
                setAutoShapesSpeed={props.setAutoShapesSpeed}
                panelTransparent={panelTransparent}
              />
            )}

            {showCanvasSettings && (
              <CanvasSettings
                brushSize={props.brushSize}
                cellSize={props.cellSize}
                rows={props.rows}
                cols={props.cols}
                setBrushSize={props.setBrushSize}
                setCellSize={props.setCellSize}
                handleRowsChange={props.handleRowsChange}
                handleColsChange={props.handleColsChange}
                panelTransparent={panelTransparent}
              />
            )}
          </div>
        )}

        {/* Generative Settings */}
        {showOptions && showGenerativeSettings && (
          <GenerativeSettings
            spreadPattern={props.spreadPattern}
            setSpreadPattern={props.setSpreadPattern}
            resetGenerativeSettings={props.resetGenerativeSettings}
            panelTransparent={panelTransparent}
            isSavingColor={isSavingColor}
            customColor={props.customColor}
            palette={props.palette}
            generativeColorIndices={props.generativeColorIndices}
            handleGenerativeColorToggle={props.handleGenerativeColorToggle}
            setIsSavingColor={props.setIsSavingColor}
            setPalette={props.setPalette}
            setSelectedColor={props.setSelectedColor}
            rippleChance={props.rippleChance}
            setRippleChance={props.setRippleChance}
            scrambleSwaps={props.scrambleSwaps}
            setScrambleSwaps={props.setScrambleSwaps}
            vortexCount={props.vortexCount}
            setVortexCount={props.setVortexCount}
            strobeExpandThreshold={props.strobeExpandThreshold}
            setStrobeExpandThreshold={props.setStrobeExpandThreshold}
            strobeContractThreshold={props.strobeContractThreshold}
            setStrobeContractThreshold={props.setStrobeContractThreshold}
            jitterChance={props.jitterChance}
            setJitterChance={props.setJitterChance}
            flowDirection={props.flowDirection}
            setFlowDirection={props.setFlowDirection}
            flowChance={props.flowChance}
            setFlowChance={props.setFlowChance}
            veinSeekStrength={props.veinSeekStrength}
            setVeinSeekStrength={props.setVeinSeekStrength}
            veinBranchChance={props.veinBranchChance}
            setVeinBranchChance={props.setVeinBranchChance}
            crystallizeThreshold={props.crystallizeThreshold}
            setCrystallizeThreshold={props.setCrystallizeThreshold}
            erosionRate={props.erosionRate}
            setErosionRate={props.setErosionRate}
            erosionSolidity={props.erosionSolidity}
            setErosionSolidity={props.setErosionSolidity}
            randomWalkMode={props.randomWalkMode}
            setRandomWalkMode={props.setRandomWalkMode}
            randomWalkSpreadCount={props.randomWalkSpreadCount}
            setRandomWalkSpreadCount={props.setRandomWalkSpreadCount}
            conwayRules={props.conwayRules}
            setConwayRules={props.setConwayRules}
            tendrilsRules={props.tendrilsRules}
            setTendrilsRules={props.setTendrilsRules}
            pulseSpeed={props.pulseSpeed}
            setPulseSpeed={props.setPulseSpeed}
            pulseDirection={props.pulseDirection}
            setPulseDirection={props.setPulseDirection}
            pulseOvertakes={props.pulseOvertakes}
            setPulseOvertakes={props.setPulseOvertakes}
            directionalBias={props.directionalBias}
            setDirectionalBias={props.setDirectionalBias}
            directionalBiasStrength={props.directionalBiasStrength}
            setDirectionalBiasStrength={props.setDirectionalBiasStrength}
            walkersRef={props.walkersRef}
          />
        )}

        {/* Visual Settings */}
        {showOptions && showVisualSettings && (
          <VisualSettings
            brushType={props.brushType}
            setBrushType={props.setBrushType}
            sprayDensity={props.sprayDensity}
            setSprayDensity={props.setSprayDensity}
            diagonalThickness={props.diagonalThickness}
            setDiagonalThickness={props.setDiagonalThickness}
            blendMode={props.blendMode}
            setBlendMode={props.setBlendMode}
            backgroundColor={backgroundColor}
            setBackgroundColor={props.setBackgroundColor}
            showGrid={props.showGrid}
            setShowGrid={props.setShowGrid}
            panelTransparent={panelTransparent}
            setPanelTransparent={props.setPanelTransparent}
            recordEnabled={props.recordEnabled}
            setRecordEnabled={props.setRecordEnabled}
            recordingFilename={props.recordingFilename}
            setRecordingFilename={props.setRecordingFilename}
          />
        )}
      </MainPanel>
    </div>
  );
}
