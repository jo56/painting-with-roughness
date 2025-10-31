import { create } from 'zustand';

interface UIState {
  // State
  panelMinimized: boolean;
  panelVisible: boolean;
  panelTransparent: boolean;
  panelPos: { x: number; y: number };
  showSpeedSettings: boolean;
  showCanvasSettings: boolean;
  showVisualSettings: boolean;
  showGenerativeSettings: boolean;
  showStepControls: boolean;
  showAutoControls: boolean;
  showOptions: boolean;
  isMobile: boolean;
  currentTheme: number;
  recordEnabled: boolean;
  recordingFilename: string;

  // Actions
  setPanelMinimized: (minimized: boolean | ((prev: boolean) => boolean)) => void;
  setPanelVisible: (visible: boolean | ((prev: boolean) => boolean)) => void;
  setPanelTransparent: (transparent: boolean | ((prev: boolean) => boolean)) => void;
  setPanelPos: (pos: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  setShowSpeedSettings: (show: boolean | ((prev: boolean) => boolean)) => void;
  setShowCanvasSettings: (show: boolean | ((prev: boolean) => boolean)) => void;
  setShowVisualSettings: (show: boolean | ((prev: boolean) => boolean)) => void;
  setShowGenerativeSettings: (show: boolean | ((prev: boolean) => boolean)) => void;
  setShowStepControls: (show: boolean | ((prev: boolean) => boolean)) => void;
  setShowAutoControls: (show: boolean | ((prev: boolean) => boolean)) => void;
  setShowOptions: (show: boolean | ((prev: boolean) => boolean)) => void;
  setIsMobile: (isMobile: boolean | ((prev: boolean) => boolean)) => void;
  setRecordEnabled: (enabled: boolean | ((prev: boolean) => boolean)) => void;
  setRecordingFilename: (filename: string | ((prev: string) => string)) => void;
}

const LAUNCH_PANEL_POS = { x: 24, y: 20 };

export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  panelMinimized: false,
  panelVisible: true,
  panelTransparent: false,
  panelPos: typeof window !== 'undefined' ? LAUNCH_PANEL_POS : { x: 20, y: 20 },
  showSpeedSettings: false,
  showCanvasSettings: false,
  showVisualSettings: false,
  showGenerativeSettings: false,
  showStepControls: false,
  showAutoControls: true,
  showOptions: true,
  isMobile: false,
  currentTheme: 0,
  recordEnabled: true,
  recordingFilename: 'grid-recording',

  // Actions
  setPanelMinimized: (panelMinimized) => set({ panelMinimized: typeof panelMinimized === 'function' ? panelMinimized(get().panelMinimized) : panelMinimized }),
  setPanelVisible: (panelVisible) => set({ panelVisible: typeof panelVisible === 'function' ? panelVisible(get().panelVisible) : panelVisible }),
  setPanelTransparent: (panelTransparent) => set({ panelTransparent: typeof panelTransparent === 'function' ? panelTransparent(get().panelTransparent) : panelTransparent }),
  setPanelPos: (panelPos) => set({ panelPos: typeof panelPos === 'function' ? panelPos(get().panelPos) : panelPos }),
  setShowSpeedSettings: (showSpeedSettings) => set({ showSpeedSettings: typeof showSpeedSettings === 'function' ? showSpeedSettings(get().showSpeedSettings) : showSpeedSettings }),
  setShowCanvasSettings: (showCanvasSettings) => set({ showCanvasSettings: typeof showCanvasSettings === 'function' ? showCanvasSettings(get().showCanvasSettings) : showCanvasSettings }),
  setShowVisualSettings: (showVisualSettings) => set({ showVisualSettings: typeof showVisualSettings === 'function' ? showVisualSettings(get().showVisualSettings) : showVisualSettings }),
  setShowGenerativeSettings: (showGenerativeSettings) => set({ showGenerativeSettings: typeof showGenerativeSettings === 'function' ? showGenerativeSettings(get().showGenerativeSettings) : showGenerativeSettings }),
  setShowStepControls: (showStepControls) => set({ showStepControls: typeof showStepControls === 'function' ? showStepControls(get().showStepControls) : showStepControls }),
  setShowAutoControls: (showAutoControls) => set({ showAutoControls: typeof showAutoControls === 'function' ? showAutoControls(get().showAutoControls) : showAutoControls }),
  setShowOptions: (showOptions) => set({ showOptions: typeof showOptions === 'function' ? showOptions(get().showOptions) : showOptions }),
  setIsMobile: (isMobile) => set({ isMobile: typeof isMobile === 'function' ? isMobile(get().isMobile) : isMobile }),
  setRecordEnabled: (recordEnabled) => set({ recordEnabled: typeof recordEnabled === 'function' ? recordEnabled(get().recordEnabled) : recordEnabled }),
  setRecordingFilename: (recordingFilename) => set({ recordingFilename: typeof recordingFilename === 'function' ? recordingFilename(get().recordingFilename) : recordingFilename }),
}));
