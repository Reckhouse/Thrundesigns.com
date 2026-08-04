"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react";
import {
  emptyAudioBands,
  type AudioBands,
  type AudioReactiveConfig,
  type AudioTrackKey,
} from "./audio.schema";
import { AudioAnalyserEngine } from "./AudioAnalyserEngine";

type AudioReactiveContextValue = {
  bandsRef: MutableRefObject<AudioBands>;
  config: AudioReactiveConfig;
  status: string;
  error: string | null;
  localFileName: string | null;
  setConfig: (patch: Partial<AudioReactiveConfig>) => void;
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  loadLocalFile: (
    file: File,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  clearLocalFile: () => void;
};

const AudioReactiveContext = createContext<AudioReactiveContextValue | null>(
  null,
);

type AudioReactiveProviderProps = {
  children: ReactNode;
  config: AudioReactiveConfig;
  onConfigChange: (patch: Partial<AudioReactiveConfig>) => void;
  enabled?: boolean;
  reducedMotion?: boolean;
};

/**
 * Owns the Web Audio engine. Samples analyser into bandsRef every animation frame.
 */
export function AudioReactiveProvider({
  children,
  config,
  onConfigChange,
  enabled = true,
  reducedMotion = false,
}: AudioReactiveProviderProps) {
  const engineRef = useRef<AudioAnalyserEngine | null>(null);
  const bandsRef = useRef<AudioBands>(emptyAudioBands());
  const configRef = useRef(config);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState<string | null>(null);
  const [localFileName, setLocalFileName] = useState<string | null>(null);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    const engine = new AudioAnalyserEngine();
    engineRef.current = engine;
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    engineRef.current?.setGain(config.gain);
  }, [config.gain]);

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    let lastStatus = engineRef.current?.getStatus() ?? "idle";
    const tick = () => {
      const engine = engineRef.current;
      if (engine) {
        const effective = reducedMotion
          ? { ...configRef.current, reactive: false, sensitivity: 0 }
          : configRef.current;
        engine.sample(bandsRef.current, effective);
        const nextStatus = engine.getStatus();
        if (nextStatus !== lastStatus) {
          lastStatus = nextStatus;
          setStatus(nextStatus);
        }
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [enabled, reducedMotion]);

  const value = useMemo<AudioReactiveContextValue>(
    () => ({
      bandsRef,
      config,
      status,
      error,
      localFileName,
      setConfig: onConfigChange,
      async play() {
        const engine = engineRef.current;
        if (!engine || !enabled) return;
        try {
          if (config.mode === "local") {
            const result = await engine.playLocal(config.gain);
            if (!result.ok) {
              setError(result.message);
              return;
            }
          } else if (config.mode === "curated") {
            await engine.playCurated(config.trackKey, config.gain);
          }
          setError(null);
          setStatus(engine.getStatus());
        } catch {
          setError(
            "Audio playback failed. Try interacting with the page first.",
          );
          setStatus("error");
        }
      },
      pause() {
        engineRef.current?.pause();
        setStatus(engineRef.current?.getStatus() ?? "paused");
      },
      stop() {
        engineRef.current?.stop();
        bandsRef.current = emptyAudioBands();
        setStatus(engineRef.current?.getStatus() ?? "ready");
      },
      async loadLocalFile(file: File) {
        const engine = engineRef.current;
        if (!engine) {
          return { ok: false as const, message: "Audio engine unavailable." };
        }
        const result = await engine.loadLocalFile(file);
        if (result.ok) {
          setLocalFileName(file.name);
          onConfigChange({ mode: "local" });
          setError(null);
        } else {
          setError(result.message);
        }
        setStatus(engine.getStatus());
        return result;
      },
      clearLocalFile() {
        setLocalFileName(null);
        engineRef.current?.stop();
        onConfigChange({ mode: "off" });
      },
    }),
    [config, enabled, error, localFileName, onConfigChange, status],
  );

  return (
    <AudioReactiveContext.Provider value={value}>
      {children}
    </AudioReactiveContext.Provider>
  );
}

export function useAudioReactive(): AudioReactiveContextValue {
  const ctx = useContext(AudioReactiveContext);
  if (!ctx) {
    throw new Error(
      "useAudioReactive must be used within AudioReactiveProvider",
    );
  }
  return ctx;
}

const FALLBACK_BANDS = emptyAudioBands();
const FALLBACK_REF: MutableRefObject<AudioBands> = { current: FALLBACK_BANDS };

export function useAudioBandsRef(): MutableRefObject<AudioBands> {
  const ctx = useContext(AudioReactiveContext);
  return ctx?.bandsRef ?? FALLBACK_REF;
}

export type { AudioTrackKey, AudioReactiveConfig, AudioBands };
