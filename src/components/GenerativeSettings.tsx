import React from 'react';
import type { SpreadPattern, Direction } from '../types';
import { Theme } from '../types/ui';
import { RuleEditor } from './RuleEditor';
import {
  LABEL_STYLE,
  VALUE_DISPLAY_STYLE,
  SLIDER_CONTAINER_STYLE,
  SLIDER_INPUT_STYLE,
  SETTINGS_SECTION_STYLE
} from '../constants/componentStyles';

interface GenerativeSettingsProps {
  showGenerativeSettings: boolean;
  setShowGenerativeSettings: (value: boolean | ((prev: boolean) => boolean)) => void;
  spreadPattern: SpreadPattern;
  spreadProbability: number;
  setSpreadPattern: (value: SpreadPattern) => void;
  setSpreadProbability: (value: number) => void;
  resetGenerativeSettings: () => void;
  palette: string[];
  generativeColorIndices: number[];
  handleGenerativeColorToggle: (colorIndex: number) => void;
  panelTransparent: boolean;
  currentThemeConfig: Theme;

  // Pattern-specific settings
  rippleChance: number;
  setRippleChance: (value: number) => void;
  scrambleSwaps: number;
  setScrambleSwaps: (value: number) => void;
  vortexCount: number;
  setVortexCount: (value: number) => void;
  strobeExpandThreshold: number;
  setStrobeExpandThreshold: (value: number) => void;
  strobeContractThreshold: number;
  setStrobeContractThreshold: (value: number) => void;
  jitterChance: number;
  setJitterChance: (value: number) => void;
  flowDirection: Direction;
  setFlowDirection: (value: Direction) => void;
  flowChance: number;
  setFlowChance: (value: number) => void;
  veinSeekStrength: number;
  setVeinSeekStrength: (value: number) => void;
  veinBranchChance: number;
  setVeinBranchChance: (value: number) => void;
  crystallizeThreshold: number;
  setCrystallizeThreshold: (value: number) => void;
  erosionRate: number;
  setErosionRate: (value: number) => void;
  erosionSolidity: number;
  setErosionSolidity: (value: number) => void;
  randomWalkMode: 'any' | 'cardinal';
  setRandomWalkMode: (value: 'any' | 'cardinal') => void;
  randomWalkSpreadCount: number;
  setRandomWalkSpreadCount: (value: number) => void;
  conwayRules: { born: number[]; survive: number[] };
  setConwayRules: (value: { born: number[]; survive: number[] }) => void;
  tendrilsRules: { born: number[]; survive: number[] };
  setTendrilsRules: (value: { born: number[]; survive: number[] }) => void;
  pulseSpeed: number;
  setPulseSpeed: (value: number) => void;
  pulseDirection: Direction;
  setPulseDirection: (value: Direction) => void;
  pulseOvertakes: boolean;
  setPulseOvertakes: (value: boolean) => void;
  directionalBias: 'none' | Direction;
  setDirectionalBias: (value: 'none' | Direction) => void;
  directionalBiasStrength: number;
  setDirectionalBiasStrength: (value: number) => void;

}

export function GenerativeSettings(props: GenerativeSettingsProps) {
  const {
    showGenerativeSettings,
    setShowGenerativeSettings,
    spreadPattern,
    spreadProbability,
    setSpreadPattern,
    setSpreadProbability,
    resetGenerativeSettings,
    palette,
    generativeColorIndices,
    handleGenerativeColorToggle,
    panelTransparent,
    currentThemeConfig
  } = props;

  return (
    <div className="scrollable-settings" style={{
      marginBottom: '12px',
      padding: '8px',
      maxHeight: '400px',
      overflowY: 'auto',
      background: panelTransparent ? 'transparent' : 'rgba(10, 10, 10, 0.5)',
      border: 'none',
      borderRadius: '0'
    }}>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ flexGrow: 1 }}>
          <label style={{ fontWeight: '400', marginBottom: '6px', display: 'block', fontFamily: 'monospace', color: '#ffffff', letterSpacing: '0.4px', fontSize: '0.95rem' }}>
            Spread Pattern:
          </label>
          <select
            value={spreadPattern}
            onChange={(e) => {
              setSpreadPattern(e.target.value as SpreadPattern);
            }}
            style={{
              padding: '4px 8px',
              borderRadius: '0',
              background: '#1a1a1a',
              color: '#ffffff',
              fontFamily: 'monospace',
              letterSpacing: '0.3px',
              border: '1px solid #333333',
              width: '100%'
            }}
          >
            <option value="random">Random Walk</option>
            <option value="conway">Game of Life</option>
            <option value="tendrils">Tendrils</option>
            <option value="pulse">Current</option>
            <option value="directional">Directional</option>
            <option value="vein">Vein Growth</option>
            <option value="crystallize">Crystallize</option>
            <option value="erosion">Erosion</option>
            <option value="flow">Flow</option>
            <option value="jitter">Jitter</option>
            <option value="vortex">Vortex</option>
            <option value="scramble">Scramble</option>
            <option value="ripple">Ripple</option>
          </select>
        </div>
        <button
          onClick={resetGenerativeSettings}
          style={{
            padding: '4px 8px',
            borderRadius: '0',
            background: 'transparent',
            color: '#ffffff',
            fontFamily: 'monospace',
            letterSpacing: '0.3px',
            border: 'none',
            cursor: 'pointer',
            alignSelf: 'flex-end',
            fontSize: '0.9rem',
            height: '29px'
          }}
          title="Reset generative settings to default"
        >
          Reset
        </button>
      </div>

      {/* Pattern-specific controls */}
      {spreadPattern === 'ripple' && (
        <div style={{ background: 'transparent', padding: '8px', borderRadius: '0', border: 'none' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '400', fontFamily: 'monospace', color: '#ffffff', letterSpacing: '0.3px' }}>
                Ripple Chance:
              </label>
              <span style={{ fontSize: '0.8rem', color: '#666666', fontFamily: 'monospace' }}>
                {Math.round(props.rippleChance * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0.01}
              max={0.5}
              step={0.01}
              value={props.rippleChance}
              onChange={(e) => props.setRippleChance(Number(e.target.value))}
              style={{ width: '100%', height: '6px' }}
            />
          </div>
        </div>
      )}

      {spreadPattern === 'scramble' && (
        <div style={{ background: 'transparent', padding: '8px', borderRadius: '0', border: 'none' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '400', fontFamily: 'monospace', color: '#ffffff', letterSpacing: '0.3px' }}>
                Swaps per Step:
              </label>
              <span style={{ fontSize: '0.8rem', color: '#666666', fontFamily: 'monospace' }}>
                {props.scrambleSwaps}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              value={props.scrambleSwaps}
              onChange={(e) => props.setScrambleSwaps(Number(e.target.value))}
              style={{ width: '100%', height: '6px' }}
            />
          </div>
        </div>
      )}

      {spreadPattern === 'vortex' && (
        <div style={SETTINGS_SECTION_STYLE}>
          <div>
            <div style={SLIDER_CONTAINER_STYLE}>
              <label style={LABEL_STYLE}>
                Vortex Count:
              </label>
              <span style={VALUE_DISPLAY_STYLE}>
                {props.vortexCount}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={50}
              value={props.vortexCount}
              onChange={(e) => props.setVortexCount(Number(e.target.value))}
              style={SLIDER_INPUT_STYLE}
            />
          </div>
        </div>
      )}

      {/* Note: 'strobe' pattern not yet available in dropdown but implementation ready */}
      {spreadPattern === 'strobe' && (
        <div style={SETTINGS_SECTION_STYLE}>
          <div style={{ marginBottom: '8px' }}>
            <div style={SLIDER_CONTAINER_STYLE}>
              <label style={LABEL_STYLE}>
                Expand Threshold:
              </label>
              <span style={VALUE_DISPLAY_STYLE}>
                {props.strobeExpandThreshold} Neighbors
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={8}
              value={props.strobeExpandThreshold}
              onChange={(e) => props.setStrobeExpandThreshold(Number(e.target.value))}
              style={SLIDER_INPUT_STYLE}
            />
          </div>
          <div>
            <div style={SLIDER_CONTAINER_STYLE}>
              <label style={LABEL_STYLE}>
                Contract Threshold:
              </label>
              <span style={VALUE_DISPLAY_STYLE}>
                {props.strobeContractThreshold} Neighbors
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={8}
              value={props.strobeContractThreshold}
              onChange={(e) => props.setStrobeContractThreshold(Number(e.target.value))}
              style={SLIDER_INPUT_STYLE}
            />
          </div>
        </div>
      )}

      {spreadPattern === 'jitter' && (
        <div style={SETTINGS_SECTION_STYLE}>
          <div>
            <div style={SLIDER_CONTAINER_STYLE}>
              <label style={LABEL_STYLE}>
                Jitter Chance:
              </label>
              <span style={VALUE_DISPLAY_STYLE}>
                {Math.round(props.jitterChance * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={props.jitterChance}
              onChange={(e) => props.setJitterChance(Number(e.target.value))}
              style={{ width: '100%', height: '6px' }}
            />
          </div>
        </div>
      )}

      {spreadPattern === 'flow' && (
        <div style={{ background: 'transparent', padding: '8px', borderRadius: '0', border: 'none' }}>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '400', fontFamily: 'monospace', color: '#ffffff', letterSpacing: '0.4px', display: 'block', marginBottom: '4px' }}>
              Flow Direction:
            </label>
            <select
              value={props.flowDirection}
              onChange={(e) => props.setFlowDirection(e.target.value as Direction)}
              style={{ padding: '4px 8px', borderRadius: '0', background: '#1a1a1a', color: '#ffffff', border: '1px solid #333333', fontFamily: 'monospace', letterSpacing: '0.3px', width: '100%' }}
            >
              <option value="down">Down</option>
              <option value="up">Up</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '400', fontFamily: 'monospace', color: '#ffffff', letterSpacing: '0.3px' }}>
                Flow Chance:
              </label>
              <span style={{ fontSize: '0.8rem', color: '#666666', fontFamily: 'monospace' }}>
                {Math.round(props.flowChance * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={props.flowChance}
              onChange={(e) => props.setFlowChance(Number(e.target.value))}
              style={{ width: '100%', height: '6px' }}
            />
          </div>
        </div>
      )}

      {spreadPattern === 'vein' && (
        <div style={{ background: 'transparent', padding: '8px', borderRadius: '0', border: 'none' }}>
          <div style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '400', fontFamily: 'monospace', color: '#ffffff', letterSpacing: '0.3px' }}>
                Seek Strength:
              </label>
              <span style={{ fontSize: '0.8rem', color: '#666666', fontFamily: 'monospace' }}>
                {Math.round(props.veinSeekStrength * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={props.veinSeekStrength}
              onChange={(e) => props.setVeinSeekStrength(Number(e.target.value))}
              style={{ width: '100%', height: '6px' }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '400', fontFamily: 'monospace', color: '#ffffff', letterSpacing: '0.3px' }}>
                Branching Chance:
              </label>
              <span style={{ fontSize: '0.8rem', color: '#666666', fontFamily: 'monospace' }}>
                {Math.round(props.veinBranchChance * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={0.5}
              step={0.01}
              value={props.veinBranchChance}
              onChange={(e) => props.setVeinBranchChance(Number(e.target.value))}
              style={{ width: '100%', height: '6px' }}
            />
          </div>
        </div>
      )}

      {spreadPattern === 'crystallize' && (
        <div style={{ background: 'transparent', padding: '8px', borderRadius: '0', border: 'none' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '400', fontFamily: 'monospace', color: '#ffffff', letterSpacing: '0.3px' }}>
                Growth Threshold:
              </label>
              <span style={{ fontSize: '0.8rem', color: '#666666', fontFamily: 'monospace' }}>
                {props.crystallizeThreshold} Neighbors
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={8}
              value={props.crystallizeThreshold}
              onChange={(e) => props.setCrystallizeThreshold(Number(e.target.value))}
              style={{ width: '100%', height: '6px' }}
            />
          </div>
        </div>
      )}

      {spreadPattern === 'erosion' && (
        <div style={{ background: 'transparent', padding: '8px', borderRadius: '0', border: 'none' }}>
          <div style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '400', fontFamily: 'monospace', color: '#ffffff', letterSpacing: '0.3px' }}>
                Erosion Rate:
              </label>
              <span style={{ fontSize: '0.8rem', color: '#666666', fontFamily: 'monospace' }}>
                {Math.round(props.erosionRate * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0.01}
              max={1}
              step={0.01}
              value={props.erosionRate}
              onChange={(e) => props.setErosionRate(Number(e.target.value))}
              style={{ width: '100%', height: '6px' }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '400', fontFamily: 'monospace', color: '#ffffff', letterSpacing: '0.3px' }}>
                Core Protection:
              </label>
              <span style={{ fontSize: '0.8rem', color: '#666666', fontFamily: 'monospace' }}>
                {props.erosionSolidity} Neighbors
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={8}
              value={props.erosionSolidity}
              onChange={(e) => props.setErosionSolidity(Number(e.target.value))}
              style={{ width: '100%', height: '6px' }}
            />
          </div>
        </div>
      )}

      {spreadPattern === 'random' && (
        <div style={{ background: 'transparent', padding: '8px', borderRadius: '0', border: 'none' }}>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '400', fontFamily: 'monospace', color: '#ffffff', letterSpacing: '0.4px', display: 'block', marginBottom: '4px' }}>
              Walk Mode:
            </label>
            <select
              value={props.randomWalkMode}
              onChange={(e) => props.setRandomWalkMode(e.target.value as 'any' | 'cardinal')}
              style={{ padding: '4px 8px', borderRadius: '0', background: '#1a1a1a', color: '#ffffff', border: '1px solid #333333', fontFamily: 'monospace', letterSpacing: '0.3px', width: '100%' }}
            >
              <option value="any">8 Directions (Any)</option>
              <option value="cardinal">4 Directions (Cardinal)</option>
            </select>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '400', fontFamily: 'monospace', color: '#ffffff', letterSpacing: '0.3px' }}>
                Spread Count:
              </label>
              <span style={{ fontSize: '0.8rem', color: '#666666', fontFamily: 'monospace' }}>
                {props.randomWalkSpreadCount}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={8}
              step={1}
              value={props.randomWalkSpreadCount}
              onChange={(e) => props.setRandomWalkSpreadCount(Number(e.target.value))}
              style={{ width: '100%', height: '6px' }}
            />
          </div>
        </div>
      )}

      {spreadPattern === 'conway' && (
        <div style={{ background: 'transparent', padding: '8px', borderRadius: '0', border: 'none' }}>
          <RuleEditor
            label="Survive Counts"
            rules={props.conwayRules.survive}
            onChange={(newSurvive) => props.setConwayRules({ ...props.conwayRules, survive: newSurvive })}
          />
          <RuleEditor
            label="Birth Counts"
            rules={props.conwayRules.born}
            onChange={(newBorn) => props.setConwayRules({ ...props.conwayRules, born: newBorn })}
          />
        </div>
      )}

      {spreadPattern === 'tendrils' && (
        <div style={{ background: 'transparent', padding: '8px', borderRadius: '0', border: 'none' }}>
          <RuleEditor
            label="Survive Counts"
            rules={props.tendrilsRules.survive}
            onChange={(newSurvive) => props.setTendrilsRules({ ...props.tendrilsRules, survive: newSurvive })}
          />
          <RuleEditor
            label="Birth Counts"
            rules={props.tendrilsRules.born}
            onChange={(newBorn) => props.setTendrilsRules({ ...props.tendrilsRules, born: newBorn })}
          />
        </div>
      )}

      {spreadPattern === 'pulse' && (
        <div style={{ background: 'transparent', padding: '8px', borderRadius: '0', border: 'none' }}>
          <div style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '400', fontFamily: 'monospace', color: '#ffffff', letterSpacing: '0.3px' }}>
                Pulse Speed:
              </label>
              <span style={{ fontSize: '0.8rem', color: '#666666', fontFamily: 'monospace' }}>
                {props.pulseSpeed}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={60}
              value={props.pulseSpeed}
              onChange={(e) => props.setPulseSpeed(Number(e.target.value))}
              style={{ width: '100%', height: '6px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '400', fontFamily: 'monospace', color: '#ffffff', letterSpacing: '0.4px', display: 'block', marginBottom: '4px' }}>
              Flow Direction:
            </label>
            <select
              value={props.pulseDirection}
              onChange={(e) => props.setPulseDirection(e.target.value as Direction)}
              style={{ padding: '4px 8px', borderRadius: '0', background: '#1a1a1a', color: '#ffffff', border: '1px solid #333333', fontFamily: 'monospace', letterSpacing: '0.3px', width: '100%' }}
            >
              <option value="top-left">Top-Left</option>
              <option value="top-right">Top-Right</option>
              <option value="bottom-left">Bottom-Left</option>
              <option value="bottom-right">Bottom-Right</option>
            </select>
          </div>
          <div style={{ fontWeight: 500, marginTop: '10px', fontSize: '0.85rem' }}>
            <label>
              <input
                type="checkbox"
                checked={props.pulseOvertakes}
                onChange={e => props.setPulseOvertakes(e.target.checked)}
                style={{ marginRight: '6px' }}
              />
              New Drops Overtake Existing
            </label>
          </div>
        </div>
      )}

      {spreadPattern === 'directional' && (
        <div style={{ background: 'transparent', padding: '8px', borderRadius: '0', border: 'none' }}>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '400', fontFamily: 'monospace', color: '#ffffff', letterSpacing: '0.4px', display: 'block', marginBottom: '4px' }}>
              Bias Direction:
            </label>
            <select
              value={props.directionalBias}
              onChange={(e) => props.setDirectionalBias(e.target.value as 'none' | Direction)}
              style={{ padding: '4px 8px', borderRadius: '0', background: '#1a1a1a', color: '#ffffff', border: '1px solid #333333', fontFamily: 'monospace', letterSpacing: '0.3px', width: '100%' }}
            >
              <option value="up">Up</option>
              <option value="down">Down</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="top-left">Top-Left</option>
              <option value="top-right">Top-Right</option>
              <option value="bottom-left">Bottom-Left</option>
              <option value="bottom-right">Bottom-Right</option>
            </select>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '400', fontFamily: 'monospace', color: '#ffffff', letterSpacing: '0.3px' }}>
                Bias Strength:
              </label>
              <span style={{ fontSize: '0.8rem', color: '#666666', fontFamily: 'monospace' }}>
                {Math.round(props.directionalBiasStrength * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={props.directionalBiasStrength}
              onChange={(e) => props.setDirectionalBiasStrength(Number(e.target.value))}
              style={{ width: '100%', height: '6px' }}
            />
          </div>
        </div>
      )}

      {/* Allowed Random Colors section */}
      <label style={{ fontWeight: '400', fontFamily: 'monospace', color: '#ffffff', letterSpacing: '0.4px', marginBottom: '8px', display: 'block', fontSize: '0.95rem', marginTop: '12px' }}>
        Allowed Random Colors
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(48px, 1fr))', gap: '8px' }}>
        {palette.slice(1).map((color, index) => {
          const colorIndex = index + 1;
          return (
            <label
              key={colorIndex}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                padding: '2px',
                borderRadius: '0',
              }}
              title="Toggle color for generation"
            >
              <input
                type="checkbox"
                checked={generativeColorIndices.includes(colorIndex)}
                onChange={() => handleGenerativeColorToggle(colorIndex)}
              />
              <div style={{ width: '20px', height: '20px', background: color, borderRadius: '4px' }} />
            </label>
          );
        })}
      </div>
    </div>
  );
}
