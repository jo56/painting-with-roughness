import React from 'react';
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
import { useCanvasStore } from '../stores/canvasStore';
import { usePaintStore } from '../stores/paintStore';
import { useAutomationStore } from '../stores/automationStore';
import { useGenerativeStore } from '../stores/generativeStore';
import { useUIStore } from '../stores/uiStore';
import { THEMES } from '../utils/themes';

/**
 * Refactored PaintStudioUI - Now reads from stores directly
 * Dramatically reduced props from 100+ to just refs and handlers
 */
export interface PaintStudioUIProps {
  // Canvas refs (still needed for DOM access)
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  canvasContainerRef: React.RefObject<HTMLDivElement | null>;
  panelRef: React.RefObject<HTMLDivElement | null>;
  clearButtonRef: React.RefObject<HTMLButtonElement | null>;

  // Mouse handlers
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleHeaderMouseDown: (e: React.MouseEvent) => void;

  // Recording toast (from useRecording hook)
  recordingToast: string | null;
}

export function PaintStudioUI(props: PaintStudioUIProps) {
  // Read from stores
  const canvasState = useCanvasStore();
  const paintState = usePaintStore();
  const automationState = useAutomationStore();
  const generativeState = useGenerativeStore();
  const uiState = useUIStore();

  const currentThemeConfig = THEMES[uiState.currentTheme as keyof typeof THEMES](uiState.panelTransparent);

  return (
    <>
      {/* Canvas Container */}
      <div style={{
        width: '100%',
        minHeight: '100vh',
        height: '100%',
        background: 'black',
        display: 'flex',
        flexDirection: uiState.isMobile ? 'column' : 'row',
        alignItems: 'flex-start',
        color: '#fff'
      }}>
        <div ref={props.canvasContainerRef} style={{ padding: '10px', display: 'inline-block' }}>
          <canvas
            ref={props.canvasRef}
            onMouseDown={props.handleMouseDown}
            onMouseUp={props.handleMouseUp}
            onMouseMove={props.handleMouseMove}
            style={{
              cursor: paintState.tool === 'fill' || paintState.tool === 'eyedropper' ? 'pointer' : 'crosshair',
              display: 'block'
            }}
          />
        </div>
      </div>

      {/* Recording Toast */}
      {props.recordingToast && (
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
          {props.recordingToast}
        </div>
      )}

      {/* Panel */}
      <MainPanel
        panelRef={props.panelRef}
        panelVisible={uiState.panelVisible}
        panelPos={uiState.panelPos}
        panelMinimized={uiState.panelMinimized}
        isMobile={uiState.isMobile}
        currentThemeConfig={currentThemeConfig}
        handleHeaderMouseDown={props.handleHeaderMouseDown}
        setPanelMinimized={uiState.setPanelMinimized}
      >
        {/* Toolbar */}
        <ToolBar
          tool={paintState.tool}
          setTool={paintState.setTool}
          setIsSavingColor={paintState.setIsSavingColor}
          showAutoControls={uiState.showAutoControls}
          setShowAutoControls={uiState.setShowAutoControls}
          currentThemeConfig={currentThemeConfig}
          clearButtonRef={props.clearButtonRef}
          clear={canvasState.clear}
          clearButtonColor={canvasState.clearButtonColor}
        />

        {/* Palette */}
        <PaletteSection
          panelRef={props.panelRef}
          palette={paintState.palette}
          selectedColor={paintState.selectedColor}
          customColor={paintState.customColor}
          isSavingColor={paintState.isSavingColor}
          setCustomColor={paintState.setCustomColor}
          setSelectedColor={paintState.setSelectedColor}
          setIsSavingColor={paintState.setIsSavingColor}
          handlePaletteClick={paintState.handlePaletteClick}
        />

        {/* Auto Controls */}
        {uiState.showAutoControls && (
          <AutoControls
            showAutoControls={uiState.showAutoControls}
            setShowAutoControls={uiState.setShowAutoControls}
            autoSpreading={automationState.autoSpreading}
            autoDots={automationState.autoDots}
            autoShapes={automationState.autoShapes}
            autoSpreadEnabled={automationState.autoSpreadEnabled}
            autoDotsEnabled={automationState.autoDotsEnabled}
            autoShapesEnabled={automationState.autoShapesEnabled}
            toggleAutoSpread={automationState.toggleAutoSpread}
            toggleAutoDots={automationState.toggleAutoDots}
            toggleAutoShapes={automationState.toggleAutoShapes}
            setAutoSpreadEnabled={automationState.setAutoSpreadEnabled}
            setAutoDotsEnabled={automationState.setAutoDotsEnabled}
            setAutoShapesEnabled={automationState.setAutoShapesEnabled}
            setIsSavingColor={paintState.setIsSavingColor}
            currentThemeConfig={currentThemeConfig}
          />
        )}

        {/* Options Toggle */}
        {uiState.showOptions && (
          <OptionsToggle
            showOptions={uiState.showOptions}
            setShowOptions={uiState.setShowOptions}
            showSpeedSettings={uiState.showSpeedSettings}
            showCanvasSettings={uiState.showCanvasSettings}
            showVisualSettings={uiState.showVisualSettings}
            showGenerativeSettings={uiState.showGenerativeSettings}
            showStepControls={uiState.showStepControls}
            setShowSpeedSettings={uiState.setShowSpeedSettings}
            setShowCanvasSettings={uiState.setShowCanvasSettings}
            setShowVisualSettings={uiState.setShowVisualSettings}
            setShowGenerativeSettings={uiState.setShowGenerativeSettings}
            setShowStepControls={uiState.setShowStepControls}
            currentThemeConfig={currentThemeConfig}
          />
        )}

        {/* Setting Sections */}
        {uiState.showOptions && uiState.showStepControls && (
          <StepControls
            showStepControls={uiState.showStepControls}
            setShowStepControls={uiState.setShowStepControls}
            colorSpread={automationState.colorSpread}
            addRandomDots={automationState.addRandomDots}
            addRandomShapes={automationState.addRandomShapes}
            setIsSavingColor={paintState.setIsSavingColor}
            currentThemeConfig={currentThemeConfig}
          />
        )}

        {/* Grid layout for Speed and Canvas Settings */}
        {uiState.showOptions && (uiState.showSpeedSettings || uiState.showCanvasSettings) && (
          <div className="scrollable-settings" style={{
            display: 'grid',
            gridTemplateColumns: uiState.showSpeedSettings && uiState.showCanvasSettings ? 'repeat(2, 1fr)' : '1fr',
            gap: '12px',
            marginBottom: '12px',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {uiState.showSpeedSettings && (
              <SpeedSettings
                  showSpeedSettings={uiState.showSpeedSettings}
                  setShowSpeedSettings={uiState.setShowSpeedSettings}
                  autoSpreadSpeed={automationState.autoSpreadSpeed}
                  autoDotsSpeed={automationState.autoDotsSpeed}
                  autoShapesSpeed={automationState.autoShapesSpeed}
                  spreadProbability={generativeState.spreadProbability}
                  setAutoSpreadSpeed={automationState.setAutoSpreadSpeed}
                  setAutoDotsSpeed={automationState.setAutoDotsSpeed}
                  setAutoShapesSpeed={automationState.setAutoShapesSpeed}
                  setSpreadProbability={generativeState.setSpreadProbability}
                  panelTransparent={uiState.panelTransparent}
                  currentThemeConfig={currentThemeConfig}
                />
            )}

            {uiState.showCanvasSettings && (
              <CanvasSettings
                  showCanvasSettings={uiState.showCanvasSettings}
                  setShowCanvasSettings={uiState.setShowCanvasSettings}
                  brushSize={paintState.brushSize}
                  rows={canvasState.rows}
                  cols={canvasState.cols}
                  cellSize={canvasState.cellSize}
                  setBrushSize={paintState.setBrushSize}
                  handleRowsChange={canvasState.handleRowsChange}
                  handleColsChange={canvasState.handleColsChange}
                  setCellSize={canvasState.setCellSize}
                  panelTransparent={uiState.panelTransparent}
                  currentThemeConfig={currentThemeConfig}
                />
            )}
          </div>
        )}

        {uiState.showOptions && uiState.showGenerativeSettings && (
          <GenerativeSettings
              showGenerativeSettings={uiState.showGenerativeSettings}
              setShowGenerativeSettings={uiState.setShowGenerativeSettings}
              spreadPattern={generativeState.spreadPattern}
              spreadProbability={generativeState.spreadProbability}
              generativeColorIndices={generativeState.generativeColorIndices}
              palette={generativeState.generativePalette}
              isSavingColor={paintState.isSavingColor}
              customColor={paintState.customColor}
              setPalette={generativeState.setGenerativePalette}
              setSelectedColor={paintState.setSelectedColor}
              setIsSavingColor={paintState.setIsSavingColor}
              pulseSpeed={generativeState.pulseSpeed}
              pulseOvertakes={generativeState.pulseOvertakes}
              pulseDirection={generativeState.pulseDirection}
              directionalBias={generativeState.directionalBias}
              directionalBiasStrength={generativeState.directionalBiasStrength}
              randomWalkSpreadCount={generativeState.randomWalkSpreadCount}
              randomWalkMode={generativeState.randomWalkMode}
              conwayRules={generativeState.conwayRules}
              tendrilsRules={generativeState.tendrilsRules}
              veinSeekStrength={generativeState.veinSeekStrength}
              veinBranchChance={generativeState.veinBranchChance}
              crystallizeThreshold={generativeState.crystallizeThreshold}
              erosionRate={generativeState.erosionRate}
              erosionSolidity={generativeState.erosionSolidity}
              flowDirection={generativeState.flowDirection}
              flowChance={generativeState.flowChance}
              jitterChance={generativeState.jitterChance}
              vortexCount={generativeState.vortexCount}
              strobeExpandThreshold={generativeState.strobeExpandThreshold}
              strobeContractThreshold={generativeState.strobeContractThreshold}
              scrambleSwaps={generativeState.scrambleSwaps}
              rippleChance={generativeState.rippleChance}
              setSpreadPattern={generativeState.setSpreadPattern}
              setSpreadProbability={generativeState.setSpreadProbability}
              setPulseSpeed={generativeState.setPulseSpeed}
              setPulseOvertakes={generativeState.setPulseOvertakes}
              setPulseDirection={generativeState.setPulseDirection}
              setDirectionalBias={generativeState.setDirectionalBias}
              setDirectionalBiasStrength={generativeState.setDirectionalBiasStrength}
              setRandomWalkSpreadCount={generativeState.setRandomWalkSpreadCount}
              setRandomWalkMode={generativeState.setRandomWalkMode}
              setConwayRules={generativeState.setConwayRules}
              setTendrilsRules={generativeState.setTendrilsRules}
              setVeinSeekStrength={generativeState.setVeinSeekStrength}
              setVeinBranchChance={generativeState.setVeinBranchChance}
              setCrystallizeThreshold={generativeState.setCrystallizeThreshold}
              setErosionRate={generativeState.setErosionRate}
              setErosionSolidity={generativeState.setErosionSolidity}
              setFlowDirection={generativeState.setFlowDirection}
              setFlowChance={generativeState.setFlowChance}
              setJitterChance={generativeState.setJitterChance}
              setVortexCount={generativeState.setVortexCount}
              setStrobeExpandThreshold={generativeState.setStrobeExpandThreshold}
              setStrobeContractThreshold={generativeState.setStrobeContractThreshold}
              setScrambleSwaps={generativeState.setScrambleSwaps}
              setRippleChance={generativeState.setRippleChance}
              handleGenerativeColorToggle={generativeState.handleGenerativeColorToggle}
              resetGenerativeSettings={generativeState.resetGenerativeSettings}
              panelTransparent={uiState.panelTransparent}
              currentThemeConfig={currentThemeConfig}
            />
        )}

        {uiState.showOptions && uiState.showVisualSettings && (
          <VisualSettings
              showVisualSettings={uiState.showVisualSettings}
              setShowVisualSettings={uiState.setShowVisualSettings}
              backgroundColor={canvasState.backgroundColor}
              showGrid={canvasState.showGrid}
              brushType={paintState.brushType}
              blendMode={paintState.blendMode}
              diagonalThickness={paintState.diagonalThickness}
              sprayDensity={paintState.sprayDensity}
              palette={paintState.palette}
              recordEnabled={uiState.recordEnabled}
              recordingFilename={uiState.recordingFilename}
              panelTransparent={uiState.panelTransparent}
              setBackgroundColor={canvasState.setBackgroundColor}
              setShowGrid={canvasState.setShowGrid}
              setBrushType={paintState.setBrushType}
              setBlendMode={paintState.setBlendMode}
              setDiagonalThickness={paintState.setDiagonalThickness}
              setSprayDensity={paintState.setSprayDensity}
              setPalette={paintState.setPalette}
              setRecordEnabled={uiState.setRecordEnabled}
              setRecordingFilename={uiState.setRecordingFilename}
              setPanelTransparent={uiState.setPanelTransparent}
              currentThemeConfig={currentThemeConfig}
            />
        )}
      </MainPanel>
    </>
  );
}
