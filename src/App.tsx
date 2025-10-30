import React, { useEffect } from 'react';
import { PaintStudioUI } from './components/PaintStudioUI';
import { useRecording } from './hooks/useRecording';
import { useCanvasState } from './hooks/useCanvasState';
import { usePaintSettings } from './hooks/usePaintSettings';
import { useGenerativeSettings } from './hooks/useGenerativeSettings';
import { useAutomation } from './hooks/useAutomation';
import { useUIState } from './hooks/useUIState';
import { usePaintingInteractions } from './hooks/usePaintingInteractions';
import { useDirectionalControls } from './hooks/useDirectionalControls';
import { useGlobalKeyboardShortcuts } from './hooks/useGlobalKeyboardShortcuts';

export default function ModularSettingsPaintStudio(): JSX.Element {
  // Initialize all custom hooks
  const paintSettings = usePaintSettings();
  const uiState = useUIState();
  const generativeSettings = useGenerativeSettings(paintSettings.palette);

  const canvasState = useCanvasState(
    paintSettings.palette,
    paintSettings.customColor,
    uiState.panelVisible,
    uiState.currentThemeConfig
  );

  const automation = useAutomation({
    grid: canvasState.grid,
    setGrid: canvasState.setGrid,
    palette: paintSettings.palette,
    generativeColorIndicesRef: generativeSettings.generativeColorIndicesRef,
    spreadPatternRef: generativeSettings.spreadPatternRef,
    spreadProbabilityRef: generativeSettings.spreadProbabilityRef,
    pulseSpeedRef: generativeSettings.pulseSpeedRef,
    pulseDirectionRef: generativeSettings.pulseDirectionRef,
    pulseOvertakesRef: generativeSettings.pulseOvertakesRef,
    directionalBiasRef: generativeSettings.directionalBiasRef,
    directionalBiasStrengthRef: generativeSettings.directionalBiasStrengthRef,
    randomWalkModeRef: generativeSettings.randomWalkModeRef,
    randomWalkSpreadCountRef: generativeSettings.randomWalkSpreadCountRef,
    conwayRulesRef: generativeSettings.conwayRulesRef,
    tendrilsRulesRef: generativeSettings.tendrilsRulesRef,
    veinSeekStrengthRef: generativeSettings.veinSeekStrengthRef,
    veinBranchChanceRef: generativeSettings.veinBranchChanceRef,
    crystallizeThresholdRef: generativeSettings.crystallizeThresholdRef,
    erosionRateRef: generativeSettings.erosionRateRef,
    erosionSolidityRef: generativeSettings.erosionSolidityRef,
    flowDirectionRef: generativeSettings.flowDirectionRef,
    flowChanceRef: generativeSettings.flowChanceRef,
    jitterChanceRef: generativeSettings.jitterChanceRef,
    vortexCountRef: generativeSettings.vortexCountRef,
    strobeExpandThresholdRef: generativeSettings.strobeExpandThresholdRef,
    strobeContractThresholdRef: generativeSettings.strobeContractThresholdRef,
    scrambleSwapsRef: generativeSettings.scrambleSwapsRef,
    rippleChanceRef: generativeSettings.rippleChanceRef,
  });

  const recording = useRecording(canvasState.canvasRef);

  const paintingInteractions = usePaintingInteractions({
    canvasRef: canvasState.canvasRef,
    cellSize: canvasState.cellSize,
    tool: paintSettings.tool,
    selectedColor: paintSettings.selectedColor,
    brushSize: paintSettings.brushSize,
    brushTypeRef: paintSettings.brushTypeRef,
    blendMode: paintSettings.blendMode,
    diagonalThicknessRef: paintSettings.diagonalThicknessRef,
    sprayDensityRef: paintSettings.sprayDensityRef,
    isSavingColor: paintSettings.isSavingColor,
    setIsSavingColor: paintSettings.setIsSavingColor,
    setGrid: canvasState.setGrid,
  });

  // Directional controls for WASD keys
  useDirectionalControls({
    showGenerativeSettings: uiState.showGenerativeSettings,
    spreadPattern: generativeSettings.spreadPattern,
    setPulseDirection: generativeSettings.setPulseDirection,
    setDirectionalBias: generativeSettings.setDirectionalBias,
    setFlowDirection: generativeSettings.setFlowDirection,
  });

  // Global keyboard shortcuts
  useGlobalKeyboardShortcuts({
    setBrushSize: paintSettings.setBrushSize,
    setDiagonalThickness: paintSettings.setDiagonalThickness,
    setSprayDensity: paintSettings.setSprayDensity,
    setTool: paintSettings.setTool,
    setBrushType: paintSettings.setBrushType,
    setSelectedColor: paintSettings.setSelectedColor,
    toggleAutoSpread: automation.toggleAutoSpread,
    toggleAutoDots: automation.toggleAutoDots,
    toggleAutoShapes: automation.toggleAutoShapes,
    brushTypeRef: paintSettings.brushTypeRef,
    runningRef: automation.runningRef,
    dotsRunningRef: automation.dotsRunningRef,
    shapesRunningRef: automation.shapesRunningRef,
    autoSpreadEnabledRef: automation.autoSpreadEnabledRef,
    autoDotsEnabledRef: automation.autoDotsEnabledRef,
    autoShapesEnabledRef: automation.autoShapesEnabledRef,
    rafRef: automation.rafRef,
    autoDotsRef: automation.autoDotsRef,
    autoShapesRef: automation.autoShapesRef,
    setAutoSpreading: automation.setAutoSpreading,
    setAutoDots: automation.setAutoDots,
    setAutoShapes: automation.setAutoShapes,
    runAutoSpread: automation.toggleAutoSpread,
    runAutoDots: automation.toggleAutoDots,
    runAutoShapes: automation.toggleAutoShapes,
    spreadPatternRef: generativeSettings.spreadPatternRef,
    walkers: automation.walkers,
    strobeStateRef: automation.strobeStateRef,
    ripplesRef: automation.ripplesRef,
  });

  // Update clear button color based on canvas
  useEffect(() => {
    const timeoutId = setTimeout(canvasState.updateClearButtonColor, 100);
    return () => clearTimeout(timeoutId);
  }, [canvasState.grid, uiState.panelPos, uiState.panelVisible, canvasState.updateClearButtonColor]);

  return (
    <PaintStudioUI
      // Canvas refs
      canvasRef={canvasState.canvasRef}
      canvasContainerRef={canvasState.canvasContainerRef}
      panelRef={uiState.panelRef}
      clearButtonRef={canvasState.clearButtonRef}

      // Mouse handlers
      handleMouseDown={paintingInteractions.handleMouseDown}
      handleMouseUp={paintingInteractions.handleMouseUp}
      handleMouseMove={paintingInteractions.handleMouseMove}
      handleHeaderMouseDown={uiState.handleHeaderMouseDown}

      // UI state
      isMobile={uiState.isMobile}
      tool={paintSettings.tool}
      backgroundColor={canvasState.backgroundColor}
      panelVisible={uiState.panelVisible}
      panelPos={uiState.panelPos}
      panelMinimized={uiState.panelMinimized}
      recordingToast={recording.recordingToast}
      showAutoControls={uiState.showAutoControls}
      showOptions={uiState.showOptions}
      showSpeedSettings={uiState.showSpeedSettings}
      showCanvasSettings={uiState.showCanvasSettings}
      showVisualSettings={uiState.showVisualSettings}
      showGenerativeSettings={uiState.showGenerativeSettings}
      showStepControls={uiState.showStepControls}
      isSavingColor={paintSettings.isSavingColor}
      clearButtonColor={canvasState.clearButtonColor}
      panelTransparent={uiState.panelTransparent}

      // Canvas settings
      rows={canvasState.rows}
      cols={canvasState.cols}
      cellSize={canvasState.cellSize}
      showGrid={canvasState.showGrid}

      // Paint settings
      selectedColor={paintSettings.selectedColor}
      palette={paintSettings.palette}
      customColor={paintSettings.customColor}
      brushSize={paintSettings.brushSize}
      brushType={paintSettings.brushType}
      blendMode={paintSettings.blendMode}

      // Generative settings
      spreadPattern={generativeSettings.spreadPattern}
      spreadProbability={generativeSettings.spreadProbability}
      generativeColorIndices={generativeSettings.generativeColorIndices}

      // Auto settings
      autoSpreading={automation.autoSpreading}
      autoDots={automation.autoDots}
      autoShapes={automation.autoShapes}
      autoSpreadSpeed={automation.autoSpreadSpeed}
      autoDotsSpeed={automation.autoDotsSpeed}
      autoShapesSpeed={automation.autoShapesSpeed}

      // Pattern-specific settings
      rippleChance={generativeSettings.rippleChance}
      scrambleSwaps={generativeSettings.scrambleSwaps}
      vortexCount={generativeSettings.vortexCount}
      strobeExpandThreshold={generativeSettings.strobeExpandThreshold}
      strobeContractThreshold={generativeSettings.strobeContractThreshold}
      jitterChance={generativeSettings.jitterChance}
      flowDirection={generativeSettings.flowDirection}
      flowChance={generativeSettings.flowChance}
      veinSeekStrength={generativeSettings.veinSeekStrength}
      veinBranchChance={generativeSettings.veinBranchChance}
      crystallizeThreshold={generativeSettings.crystallizeThreshold}
      erosionRate={generativeSettings.erosionRate}
      erosionSolidity={generativeSettings.erosionSolidity}
      pulseDirection={generativeSettings.pulseDirection}
      pulseOvertakes={generativeSettings.pulseOvertakes}
      pulseSpeed={generativeSettings.pulseSpeed}
      randomWalkMode={generativeSettings.randomWalkMode}
      randomWalkSpreadCount={generativeSettings.randomWalkSpreadCount}
      directionalBias={generativeSettings.directionalBias}
      directionalBiasStrength={generativeSettings.directionalBiasStrength}
      diagonalThickness={paintSettings.diagonalThickness}
      sprayDensity={paintSettings.sprayDensity}
      conwayRules={generativeSettings.conwayRules}
      tendrilsRules={generativeSettings.tendrilsRules}

      // Recording
      recordEnabled={recording.recordEnabled}
      recordingFilename={recording.recordingFilename}
      isRecording={recording.isRecording}

      // Enabled flags
      autoSpreadEnabled={automation.autoSpreadEnabled}
      autoDotsEnabled={automation.autoDotsEnabled}
      autoShapesEnabled={automation.autoShapesEnabled}

      // Setters - UI
      setTool={paintSettings.setTool}
      setIsSavingColor={paintSettings.setIsSavingColor}
      setShowAutoControls={uiState.setShowAutoControls}
      setPanelMinimized={uiState.setPanelMinimized}
      setShowOptions={uiState.setShowOptions}
      setShowSpeedSettings={uiState.setShowSpeedSettings}
      setShowCanvasSettings={uiState.setShowCanvasSettings}
      setShowVisualSettings={uiState.setShowVisualSettings}
      setShowGenerativeSettings={uiState.setShowGenerativeSettings}
      setShowStepControls={uiState.setShowStepControls}
      setPanelTransparent={uiState.setPanelTransparent}

      // Setters - Paint
      setSelectedColor={paintSettings.setSelectedColor}
      setCustomColor={paintSettings.setCustomColor}
      setBrushSize={paintSettings.setBrushSize}
      setBrushType={paintSettings.setBrushType}
      setBlendMode={paintSettings.setBlendMode}
      setPalette={paintSettings.setPalette}

      // Setters - Canvas
      setCellSize={canvasState.setCellSize}
      setShowGrid={canvasState.setShowGrid}
      setBackgroundColor={canvasState.setBackgroundColor}

      // Setters - Generative
      setSpreadPattern={generativeSettings.setSpreadPattern}
      setSpreadProbability={generativeSettings.setSpreadProbability}
      setAutoSpreadSpeed={automation.setAutoSpreadSpeed}
      setAutoDotsSpeed={automation.setAutoDotsSpeed}
      setAutoShapesSpeed={automation.setAutoShapesSpeed}
      setRippleChance={generativeSettings.setRippleChance}
      setScrambleSwaps={generativeSettings.setScrambleSwaps}
      setVortexCount={generativeSettings.setVortexCount}
      setStrobeExpandThreshold={generativeSettings.setStrobeExpandThreshold}
      setStrobeContractThreshold={generativeSettings.setStrobeContractThreshold}
      setJitterChance={generativeSettings.setJitterChance}
      setFlowDirection={generativeSettings.setFlowDirection}
      setFlowChance={generativeSettings.setFlowChance}
      setVeinSeekStrength={generativeSettings.setVeinSeekStrength}
      setVeinBranchChance={generativeSettings.setVeinBranchChance}
      setCrystallizeThreshold={generativeSettings.setCrystallizeThreshold}
      setErosionRate={generativeSettings.setErosionRate}
      setErosionSolidity={generativeSettings.setErosionSolidity}
      setPulseDirection={generativeSettings.setPulseDirection}
      setPulseOvertakes={generativeSettings.setPulseOvertakes}
      setPulseSpeed={generativeSettings.setPulseSpeed}
      setRandomWalkMode={generativeSettings.setRandomWalkMode}
      setRandomWalkSpreadCount={generativeSettings.setRandomWalkSpreadCount}
      setDirectionalBias={generativeSettings.setDirectionalBias}
      setDirectionalBiasStrength={generativeSettings.setDirectionalBiasStrengthRef}
      setDiagonalThickness={paintSettings.setDiagonalThickness}
      setSprayDensity={paintSettings.setSprayDensity}
      setConwayRules={generativeSettings.setConwayRules}
      setTendrilsRules={generativeSettings.setTendrilsRules}
      setRecordEnabled={recording.setRecordEnabled}
      setRecordingFilename={recording.setRecordingFilename}
      setGenerativeColorIndices={generativeSettings.setGenerativeColorIndices}
      setAutoSpreadEnabled={automation.setAutoSpreadEnabled}
      setAutoDotsEnabled={automation.setAutoDotsEnabled}
      setAutoShapesEnabled={automation.setAutoShapesEnabled}

      // Functions
      clear={canvasState.clear}
      toggleAutoSpread={automation.toggleAutoSpread}
      toggleAutoDots={automation.toggleAutoDots}
      toggleAutoShapes={automation.toggleAutoShapes}
      handlePaletteClick={paintSettings.handlePaletteClick}
      colorSpread={automation.colorSpread}
      addRandomDots={automation.addRandomDots}
      addRandomShapes={automation.addRandomShapes}
      handleRowsChange={canvasState.handleRowsChange}
      handleColsChange={canvasState.handleColsChange}
      resetGenerativeSettings={generativeSettings.resetGenerativeSettings}
      handleGenerativeColorToggle={generativeSettings.handleGenerativeColorToggle}

      // Theme
      currentThemeConfig={uiState.currentThemeConfig}

      // Optional refs
      walkersRef={automation.walkers}
    />
  );
}
