"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import useIntroCompletion from "@/components/intro/useIntroCompletion";
import sceneModels from "@/data/scene-models.json";
import {
  getSceneMargin,
  getSceneWarmMargin,
  warmSceneResources,
} from "./scene-resource-preload";

const loadScene = () => import("./NatsxControllerScene");
const ControllerScene = dynamic(loadScene, { ssr: false });

type Props = {
  className: string;
};

export default function NatsxControllerSceneGate({ className }: Props) {
  const introDone = useIntroCompletion();
  const hostRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);

  // The original artwork remains as an immediate, zero-WebGL fallback.
  useEffect(() => {
    const root = hostRef.current?.closest("[data-controller-artwork]");
    if (ready) {
      root?.setAttribute("data-controller-ready", "true");
    } else {
      root?.removeAttribute("data-controller-ready");
    }
    return () => root?.removeAttribute("data-controller-ready");
  }, [ready]);

  useEffect(() => {
    if (!introDone || !hostRef.current) return;
    const host = hostRef.current;
    const controller = new AbortController();
    const loadCode = () => { void loadScene().catch(() => undefined); };
    const warmModels = () => {
      void warmSceneResources(
        [sceneModels.spall.phone.runtime, sceneModels.bast.macbook.runtime],
        1,
        controller.signal,
      );
    };

    if (typeof IntersectionObserver === "undefined") {
      loadCode();
      warmModels();
      const frame = window.requestAnimationFrame(() => setMounted(true));
      return () => {
        controller.abort();
        window.cancelAnimationFrame(frame);
      };
    }

    const near = (callback: () => void, margin: string) => {
      const observer = new IntersectionObserver(([entry]) => {
        if (!entry?.isIntersecting) return;
        callback();
        observer.disconnect();
      }, { rootMargin: margin });
      observer.observe(host);
      return observer;
    };

    const codeObserver = near(loadCode, getSceneMargin(1.6));
    const resourceObserver = near(warmModels, getSceneWarmMargin(0.9));
    const mountObserver = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) setMounted(true);
    }, { rootMargin: getSceneMargin(0.7) });
    const releaseObserver = new IntersectionObserver(([entry]) => {
      if (entry && !entry.isIntersecting) {
        setMounted(false);
        setReady(false);
      }
    }, { rootMargin: getSceneMargin(1.8) });

    mountObserver.observe(host);
    releaseObserver.observe(host);

    return () => {
      controller.abort();
      codeObserver.disconnect();
      resourceObserver.disconnect();
      mountObserver.disconnect();
      releaseObserver.disconnect();
    };
  }, [introDone]);

  return (
    <div ref={hostRef} className={className} aria-hidden="true">
      {mounted ? <ControllerScene onReady={setReady} /> : null}
    </div>
  );
}
