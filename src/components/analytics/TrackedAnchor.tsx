"use client";

import type {
  AnchorHTMLAttributes,
  MouseEventHandler,
  ReactNode,
} from "react";

import {
  track,
} from "@vercel/analytics";

type AnalyticsValue =
  | string
  | number
  | boolean;

type TrackedAnchorProps =
  Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    "children" | "onClick"
  > & {
    children: ReactNode;
    eventName: string;
    eventData?: Record<
      string,
      AnalyticsValue
    >;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
  };

export default function TrackedAnchor({
  children,
  eventName,
  eventData,
  onClick,
  ...anchorProps
}: TrackedAnchorProps) {
  const handleClick:
    MouseEventHandler<HTMLAnchorElement> =
    (
      event,
    ) => {
      track(
        eventName,
        eventData,
      );

      onClick?.(
        event,
      );
    };

  return (
    <a
      {...anchorProps}
      data-analytics-event={
        eventName
      }
      onClick={
        handleClick
      }
    >
      {
        children
      }
    </a>
  );
}
