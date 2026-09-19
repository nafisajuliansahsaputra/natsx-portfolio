"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

type Props = { label: string };

const IMAC_MODEL_URL = "/models/attendance/imac.glb";
const SCANNER_MODEL_URL = "/models/attendance/scanner.glb";
const BADGE_MODEL_URL = "/models/attendance/badge.glb";

const CAMERA_FOV = 30;
const CAMERA_POSITION = { x: 0.15, y: 1.35, z: 12.8 };
const CAMERA_TARGET = { x: 0.2, y: -0.42, z: 0 };
const CAMERA_FIT_HALF_WIDTH = 4.65;
const CAMERA_FIT_HALF_HEIGHT = 3.55;

const CAMERA_BASE_DISTANCE = Math.hypot(
  CAMERA_POSITION.x - CAMERA_TARGET.x,
  CAMERA_POSITION.y - CAMERA_TARGET.y,
  CAMERA_POSITION.z - CAMERA_TARGET.z,
);

/* =========================================================
   DESKTOP COMPOSITION — PASS 1
========================================================= */

const IMAC_TARGET_SIZE = 5.8;

const IMAC_POSITION = {
  x: -0.15,
  y: 0.25,
  z: -0.35,
};

const IMAC_ROTATION = {
  x: 0,
  y: -1,
  z: 0,
};

/* =========================================================
   ACCESSORIES — REFERENCE COMPOSITION
========================================================= */

const SCANNER_TARGET_SIZE = 2.75;

const SCANNER_POSITION = {
  x: 1.05,
  y: -2.35,
  z: 1.5,
};

const SCANNER_ROTATION = {
  x: 0.035,
  y: -0.3,
  z: 0.06,
};

const BADGE_TARGET_SIZE = 2.5;

const BADGE_POSITION = {
  x: -3.05,
  y: -1.55,
  z: 1.5,
};

const BADGE_ROTATION = {
  x: 0.055,
  y: 0.22,
  z: -0.14,
};

const TOTAL_CARD_POSITION = {
  x: -1.35,
  y: 2.62,
  z: 1.45,
};

const TOTAL_CARD_ROTATION = {
  x: -0.025,
  y: -0.06,
  z: -0.055,
};

const CHECKIN_CARD_POSITION = {
  x: 2.75,
  y: -1.72,
  z: 1.78,
};

const CHECKIN_CARD_ROTATION = {
  x: 0.015,
  y: -0.08,
  z: -0.045,
};

const QUOTE_CARD_POSITION = {
  x: 2.95,
  y: 2.05,
  z: 1.18,
};

const QUOTE_CARD_ROTATION = {
  x: -0.015,
  y: -0.13,
  z: 0.065,
};

/* =========================================================
   CANVAS HELPERS
========================================================= */

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();

  context.roundRect(
    x,
    y,
    width,
    height,
    radius,
  );
}

function canvasTexture(
  canvas: HTMLCanvasElement,
) {
  const texture =
    new THREE.CanvasTexture(
      canvas,
    );

  texture.colorSpace =
    THREE.SRGBColorSpace;

  texture.needsUpdate =
    true;

  return texture;
}

/* =========================================================
   IMAC DASHBOARD
========================================================= */

function createImacDashboardTexture() {
  const canvas =
    document.createElement(
      "canvas",
    );

  canvas.width =
    1600;

  canvas.height =
    900;

  const ctx =
    canvas.getContext(
      "2d",
    );

  if (!ctx) {
    throw new Error(
      "iMac dashboard canvas unavailable",
    );
  }

  const green =
    "#12ad74";

  const deep =
    "#073f31";

  const text =
    "#173b31";

  const muted =
    "#80938b";

  const bg =
    "#f6faf8";

  const card =
    "#ffffff";

  ctx.fillStyle =
    bg;

  ctx.fillRect(
    0,
    0,
    1600,
    900,
  );

  /* Sidebar */

  ctx.fillStyle =
    deep;

  ctx.fillRect(
    0,
    0,
    250,
    900,
  );

  ctx.fillStyle =
    green;

  roundedRect(
    ctx,
    48,
    48,
    48,
    48,
    13,
  );

  ctx.fill();

  ctx.fillStyle =
    "#fff";

  ctx.font =
    "700 29px Arial";

  ctx.fillText(
    "A",
    63,
    83,
  );

  ctx.font =
    "700 29px Arial";

  ctx.fillText(
    "Attenda",
    116,
    82,
  );

  ctx.fillStyle =
    "#9fd5c0";

  ctx.font =
    "500 16px Arial";

  ctx.fillText(
    "SMART WORKSPACE",
    116,
    106,
  );

  [
    "Dashboard",
    "Attendance",
    "People",
    "Reports",
    "Settings",
  ].forEach(
    (
      label,
      index,
    ) => {
      const y =
        180 +
        index *
          76;

      if (
        index ===
        0
      ) {
        ctx.fillStyle =
          "#0d7858";

        roundedRect(
          ctx,
          28,
          y -
            33,
          190,
          56,
          16,
        );

        ctx.fill();
      }

      ctx.fillStyle =
        index ===
        0
          ? "#fff"
          : "#a8c8bc";

      ctx.beginPath();

      ctx.arc(
        54,
        y -
          6,
        6,
        0,
        Math.PI *
          2,
      );

      ctx.fill();

      ctx.font =
        index ===
        0
          ? "700 23px Arial"
          : "500 23px Arial";

      ctx.fillText(
        label,
        79,
        y,
      );
    },
  );

  /* Top bar */

  ctx.fillStyle =
    card;

  ctx.fillRect(
    250,
    0,
    1350,
    120,
  );

  ctx.fillStyle =
    text;

  ctx.font =
    "700 35px Arial";

  ctx.fillText(
    "Good Morning,",
    302,
    55,
  );

  ctx.fillStyle =
    muted;

  ctx.font =
    "500 19px Arial";

  ctx.fillText(
    "Productive people build brighter tomorrows.",
    302,
    86,
  );

  ctx.fillStyle =
    "#eef4f1";

  roundedRect(
    ctx,
    960,
    32,
    295,
    50,
    25,
  );

  ctx.fill();

  ctx.fillStyle =
    "#9aa9a2";

  ctx.font =
    "500 16px Arial";

  ctx.fillText(
    "Search people...",
    995,
    63,
  );

  ctx.textAlign =
    "right";

  ctx.fillStyle =
    muted;

  ctx.font =
    "500 16px Arial";

  ctx.fillText(
    "MON, APR 28, 2025",
    1540,
    43,
  );

  ctx.fillStyle =
    text;

  ctx.font =
    "700 37px Arial";

  ctx.fillText(
    "09:24 AM",
    1540,
    82,
  );

  ctx.textAlign =
    "left";

  /* Metrics */

  const metrics = [
    {
      label:
        "Present",
      value:
        "142",
      delta:
        "+12%",
      color:
        green,
    },
    {
      label:
        "Absent",
      value:
        "18",
      delta:
        "-4%",
      color:
        "#ef675f",
    },
    {
      label:
        "Late",
      value:
        "7",
      delta:
        "-20%",
      color:
        "#e9a536",
    },
    {
      label:
        "Total",
      value:
        "167",
      delta:
        "Active",
      color:
        green,
    },
  ];

  metrics.forEach(
    (
      metric,
      index,
    ) => {
      const x =
        300 +
        index *
          300;

      ctx.fillStyle =
        card;

      roundedRect(
        ctx,
        x,
        154,
        260,
        150,
        22,
      );

      ctx.fill();

      ctx.fillStyle =
        metric.color +
        "20";

      ctx.beginPath();

      ctx.arc(
        x +
          48,
        202,
        24,
        0,
        Math.PI *
          2,
      );

      ctx.fill();

      ctx.fillStyle =
        metric.color;

      ctx.beginPath();

      ctx.arc(
        x +
          48,
        202,
        9,
        0,
        Math.PI *
          2,
      );

      ctx.fill();

      ctx.fillStyle =
        muted;

      ctx.font =
        "500 19px Arial";

      ctx.fillText(
        metric.label,
        x +
          86,
        194,
      );

      ctx.fillStyle =
        text;

      ctx.font =
        "700 42px Arial";

      ctx.fillText(
        metric.value,
        x +
          86,
        243,
      );

      ctx.fillStyle =
        metric.color;

      ctx.font =
        "600 16px Arial";

      ctx.fillText(
        metric.delta,
        x +
          86,
        273,
      );
    },
  );

  /* Attendance chart */

  ctx.fillStyle =
    card;

  roundedRect(
    ctx,
    300,
    345,
    560,
    480,
    24,
  );

  ctx.fill();

  ctx.fillStyle =
    text;

  ctx.font =
    "700 27px Arial";

  ctx.fillText(
    "Attendance Today",
    335,
    395,
  );

  ctx.fillStyle =
    muted;

  ctx.font =
    "500 16px Arial";

  ctx.fillText(
    "Hourly check-in activity",
    335,
    424,
  );

  ctx.strokeStyle =
    "#e7efeb";

  ctx.lineWidth =
    2;

  [
    515,
    600,
    685,
    770,
  ].forEach(
    (
      y,
    ) => {
      ctx.beginPath();

      ctx.moveTo(
        355,
        y,
      );

      ctx.lineTo(
        820,
        y,
      );

      ctx.stroke();
    },
  );

  [
    65,
    105,
    145,
    175,
    215,
    165,
    120,
    85,
    55,
  ].forEach(
    (
      value,
      index,
    ) => {
      const x =
        380 +
        index *
          47;

      const gradient =
        ctx.createLinearGradient(
          0,
          755 -
            value,
          0,
          755,
        );

      gradient.addColorStop(
        0,
        "#22c888",
      );

      gradient.addColorStop(
        1,
        "#75dfb6",
      );

      ctx.fillStyle =
        gradient;

      roundedRect(
        ctx,
        x,
        755 -
          value,
        25,
        value,
        12,
      );

      ctx.fill();
    },
  );

  /* Recent activity */

  ctx.fillStyle =
    card;

  roundedRect(
    ctx,
    890,
    345,
    340,
    480,
    24,
  );

  ctx.fill();

  ctx.fillStyle =
    text;

  ctx.font =
    "700 27px Arial";

  ctx.fillText(
    "Recent Activity",
    925,
    395,
  );

  [
    [
      "Alex Chen",
      "09:24",
    ],
    [
      "Priya Sharma",
      "09:11",
    ],
    [
      "Daniel Kim",
      "09:02",
    ],
    [
      "Maria Lopez",
      "08:56",
    ],
    [
      "James Wilson",
      "08:41",
    ],
  ].forEach(
    (
      [
        name,
        time,
      ],
      index,
    ) => {
      const y =
        470 +
        index *
          68;

      ctx.fillStyle =
        "#e5f5ef";

      ctx.beginPath();

      ctx.arc(
        945,
        y -
          8,
        18,
        0,
        Math.PI *
          2,
      );

      ctx.fill();

      ctx.fillStyle =
        green;

      ctx.beginPath();

      ctx.arc(
        985,
        y -
          7,
        7,
        0,
        Math.PI *
          2,
      );

      ctx.fill();

      ctx.fillStyle =
        text;

      ctx.font =
        "600 18px Arial";

      ctx.fillText(
        name,
        1005,
        y,
      );

      ctx.textAlign =
        "right";

      ctx.fillStyle =
        muted;

      ctx.font =
        "500 15px Arial";

      ctx.fillText(
        time,
        1190,
        y,
      );

      ctx.textAlign =
        "left";
    },
  );

  /* Verification */

  ctx.fillStyle =
    card;

  roundedRect(
    ctx,
    1260,
    345,
    300,
    480,
    24,
  );

  ctx.fill();

  ctx.fillStyle =
    text;

  ctx.font =
    "700 27px Arial";

  ctx.fillText(
    "Verification",
    1295,
    395,
  );

  const sx =
    1325;

  const sy =
    455;

  const sw =
    170;

  const sh =
    170;

  const c =
    28;

  ctx.strokeStyle =
    green;

  ctx.lineWidth =
    6;

  ctx.lineCap =
    "round";

  ctx.beginPath();

  ctx.moveTo(
    sx,
    sy +
      c,
  );

  ctx.lineTo(
    sx,
    sy,
  );

  ctx.lineTo(
    sx +
      c,
    sy,
  );

  ctx.moveTo(
    sx +
      sw -
      c,
    sy,
  );

  ctx.lineTo(
    sx +
      sw,
    sy,
  );

  ctx.lineTo(
    sx +
      sw,
    sy +
      c,
  );

  ctx.moveTo(
    sx +
      sw,
    sy +
      sh -
      c,
  );

  ctx.lineTo(
    sx +
      sw,
    sy +
      sh,
  );

  ctx.lineTo(
    sx +
      sw -
      c,
    sy +
      sh,
  );

  ctx.moveTo(
    sx +
      c,
    sy +
      sh,
  );

  ctx.lineTo(
    sx,
    sy +
      sh,
  );

  ctx.lineTo(
    sx,
    sy +
      sh -
      c,
  );

  ctx.stroke();

  ctx.strokeStyle =
    "#8ca098";

  ctx.lineWidth =
    5;

  ctx.beginPath();

  ctx.arc(
    1410,
    510,
    35,
    0,
    Math.PI *
      2,
  );

  ctx.stroke();

  ctx.beginPath();

  ctx.arc(
    1410,
    610,
    60,
    Math.PI *
      1.08,
    Math.PI *
      1.92,
  );

  ctx.stroke();

  ctx.fillStyle =
    green;

  ctx.beginPath();

  ctx.arc(
    1320,
    705,
    24,
    0,
    Math.PI *
      2,
  );

  ctx.fill();

  ctx.fillStyle =
    text;

  ctx.font =
    "700 25px Arial";

  ctx.fillText(
    "Face Verified",
    1360,
    712,
  );

  ctx.fillStyle =
    muted;

  ctx.font =
    "500 17px Arial";

  ctx.fillText(
    "Identity confirmed",
    1360,
    742,
  );

  return canvasTexture(
    canvas,
  );
}

/* =========================================================
   TOTAL ATTENDANCE CARD
========================================================= */

function createTotalAttendanceTexture() {
  const canvas =
    document.createElement(
      "canvas",
    );

  canvas.width =
    1200;

  canvas.height =
    700;

  const ctx =
    canvas.getContext(
      "2d",
    );

  if (!ctx) {
    throw new Error(
      "Total attendance canvas unavailable",
    );
  }

  ctx.clearRect(
    0,
    0,
    1200,
    700,
  );

  ctx.shadowColor =
    "rgba(10, 69, 48, 0.18)";

  ctx.shadowBlur =
    45;

  ctx.shadowOffsetY =
    18;

  ctx.fillStyle =
    "rgba(255,255,255,0.98)";

  roundedRect(
    ctx,
    55,
    55,
    1090,
    590,
    72,
  );

  ctx.fill();

  ctx.shadowColor =
    "transparent";

  const green =
    "#10aa70";

  ctx.fillStyle =
    green;

  [
    [
      125,
      350,
      42,
      120,
    ],
    [
      195,
      295,
      42,
      175,
    ],
    [
      265,
      225,
      42,
      245,
    ],
  ].forEach(
    (
      [
        x,
        y,
        w,
        h,
      ],
    ) => {
      roundedRect(
        ctx,
        x,
        y,
        w,
        h,
        18,
      );

      ctx.fill();
    },
  );

  ctx.fillStyle =
    "#15352b";

  ctx.font =
    "600 52px Arial";

  ctx.fillText(
    "Total Attendance",
    390,
    210,
  );

  ctx.font =
    "700 142px Arial";

  ctx.fillText(
    "167",
    390,
    385,
  );

  ctx.fillStyle =
    "#e8f8f0";

  roundedRect(
    ctx,
    720,
    305,
    225,
    92,
    46,
  );

  ctx.fill();

  ctx.fillStyle =
    green;

  ctx.font =
    "700 41px Arial";

  ctx.fillText(
    "↑ 12%",
    770,
    365,
  );

  ctx.fillStyle =
    "#7d9188";

  ctx.font =
    "500 35px Arial";

  ctx.fillText(
    "vs. last week",
    390,
    470,
  );

  return canvasTexture(
    canvas,
  );
}

/* =========================================================
   CHECK-IN CARD
========================================================= */

function createCheckInTexture() {
  const canvas =
    document.createElement(
      "canvas",
    );

  canvas.width =
    1500;

  canvas.height =
    620;

  const ctx =
    canvas.getContext(
      "2d",
    );

  if (!ctx) {
    throw new Error(
      "Check-in canvas unavailable",
    );
  }

  ctx.clearRect(
    0,
    0,
    1500,
    620,
  );

  ctx.shadowColor =
    "rgba(10, 69, 48, 0.17)";

  ctx.shadowBlur =
    50;

  ctx.shadowOffsetY =
    20;

  ctx.fillStyle =
    "rgba(255,255,255,0.98)";

  roundedRect(
    ctx,
    55,
    55,
    1390,
    510,
    70,
  );

  ctx.fill();

  ctx.shadowColor =
    "transparent";

  const green =
    "#12b476";

  ctx.fillStyle =
    "#dff8ed";

  ctx.beginPath();

  ctx.arc(
    215,
    310,
    108,
    0,
    Math.PI *
      2,
  );

  ctx.fill();

  ctx.fillStyle =
    green;

  ctx.beginPath();

  ctx.arc(
    215,
    310,
    75,
    0,
    Math.PI *
      2,
  );

  ctx.fill();

  ctx.strokeStyle =
    "#fff";

  ctx.lineWidth =
    20;

  ctx.lineCap =
    "round";

  ctx.lineJoin =
    "round";

  ctx.beginPath();

  ctx.moveTo(
    178,
    310,
  );

  ctx.lineTo(
    207,
    340,
  );

  ctx.lineTo(
    262,
    275,
  );

  ctx.stroke();

  ctx.fillStyle =
    "#15352b";

  ctx.font =
    "700 68px Arial";

  ctx.fillText(
    "Check-in Successful",
    390,
    295,
  );

  ctx.fillStyle =
    "#789086";

  ctx.font =
    "500 40px Arial";

  ctx.fillText(
    "Welcome back!",
    390,
    370,
  );

  ctx.textAlign =
    "right";

  ctx.font =
    "500 31px Arial";

  ctx.fillText(
    "09:24 AM",
    1375,
    185,
  );

  ctx.textAlign =
    "left";

  return canvasTexture(
    canvas,
  );
}

/* =========================================================
   QUOTE CARD
========================================================= */

function createQuoteCardTexture() {
  const canvas =
    document.createElement(
      "canvas",
    );

  canvas.width =
    760;

  canvas.height =
    1200;

  const ctx =
    canvas.getContext(
      "2d",
    );

  if (!ctx) {
    throw new Error(
      "Quote card canvas unavailable",
    );
  }

  ctx.clearRect(
    0,
    0,
    760,
    1200,
  );

  ctx.shadowColor =
    "rgba(10, 69, 48, 0.15)";

  ctx.shadowBlur =
    42;

  ctx.shadowOffsetY =
    18;

  ctx.fillStyle =
    "rgba(255,255,255,0.94)";

  roundedRect(
    ctx,
    55,
    55,
    650,
    1090,
    74,
  );

  ctx.fill();

  ctx.shadowColor =
    "transparent";

  ctx.fillStyle =
    "#214a3d";

  ctx.font =
    "500 54px Arial";

  ctx.fillText(
    "SAME",
    145,
    300,
  );

  ctx.fillText(
    "PEOPLE.",
    145,
    410,
  );

  ctx.fillText(
    "HIGHER",
    145,
    520,
  );

  ctx.fillText(
    "POTENTIAL.",
    145,
    630,
  );

  ctx.fillStyle =
    "#18aa72";

  ctx.fillRect(
    145,
    710,
    115,
    10,
  );

  ctx.fillStyle =
    "#7b9389";

  ctx.font =
    "500 30px Arial";

  ctx.fillText(
    "ATTEND",
    145,
    880,
  );

  ctx.fillText(
    "CONNECT",
    145,
    930,
  );

  ctx.fillText(
    "GROW",
    145,
    980,
  );

  return canvasTexture(
    canvas,
  );
}

/* =========================================================
   SCANNER SCREEN
========================================================= */

function createScannerScreenTexture() {
  const canvas =
    document.createElement(
      "canvas",
    );

  canvas.width =
    1200;

  canvas.height =
    600;

  const ctx =
    canvas.getContext(
      "2d",
    );

  if (!ctx) {
    throw new Error(
      "Scanner canvas unavailable",
    );
  }

  const green =
    "#54f0ad";

  const muted =
    "#9acdb6";

  ctx.fillStyle =
    "#07140f";

  ctx.fillRect(
    0,
    0,
    1200,
    600,
  );

  const glow =
    ctx.createRadialGradient(
      320,
      290,
      20,
      320,
      290,
      360,
    );

  glow.addColorStop(
    0,
    "rgba(61,225,150,.16)",
  );

  glow.addColorStop(
    1,
    "rgba(61,225,150,0)",
  );

  ctx.fillStyle =
    glow;

  ctx.fillRect(
    0,
    0,
    1200,
    600,
  );

  ctx.fillStyle =
    muted;

  ctx.font =
    "600 28px Arial";

  ctx.fillText(
    "LIVE VERIFICATION",
    60,
    58,
  );

  ctx.fillStyle =
    green;

  ctx.beginPath();

  ctx.arc(
    1110,
    48,
    9,
    0,
    Math.PI *
      2,
  );

  ctx.fill();

  const x =
    90;

  const y =
    135;

  const w =
    360;

  const h =
    300;

  const corner =
    48;

  ctx.strokeStyle =
    green;

  ctx.lineWidth =
    8;

  ctx.lineCap =
    "round";

  ctx.beginPath();

  ctx.moveTo(
    x,
    y +
      corner,
  );

  ctx.lineTo(
    x,
    y,
  );

  ctx.lineTo(
    x +
      corner,
    y,
  );

  ctx.moveTo(
    x +
      w -
      corner,
    y,
  );

  ctx.lineTo(
    x +
      w,
    y,
  );

  ctx.lineTo(
    x +
      w,
    y +
      corner,
  );

  ctx.moveTo(
    x +
      w,
    y +
      h -
      corner,
  );

  ctx.lineTo(
    x +
      w,
    y +
      h,
  );

  ctx.lineTo(
    x +
      w -
      corner,
    y +
      h,
  );

  ctx.moveTo(
    x +
      corner,
    y +
      h,
  );

  ctx.lineTo(
    x,
    y +
      h,
  );

  ctx.lineTo(
    x,
    y +
      h -
      corner,
  );

  ctx.stroke();

  ctx.beginPath();

  ctx.arc(
    270,
    235,
    54,
    0,
    Math.PI *
      2,
  );

  ctx.stroke();

  ctx.beginPath();

  ctx.arc(
    270,
    365,
    92,
    Math.PI *
      1.08,
    Math.PI *
      1.92,
  );

  ctx.stroke();

  ctx.fillStyle =
    "#f2fff9";

  ctx.font =
    "700 62px Arial";

  ctx.fillText(
    "LOOK HERE",
    525,
    210,
  );

  ctx.fillStyle =
    muted;

  ctx.font =
    "500 31px Arial";

  ctx.fillText(
    "Face verification active",
    525,
    265,
  );

  ctx.strokeStyle =
    green;

  ctx.lineWidth =
    6;

  [
    0,
    1,
    2,
  ].forEach(
    (
      index,
    ) => {
      ctx.beginPath();

      ctx.arc(
        555,
        360,
        34 +
          index *
            22,
        -0.85,
        0.85,
      );

      ctx.stroke();
    },
  );

  ctx.fillStyle =
    "#f2fff9";

  ctx.font =
    "650 38px Arial";

  ctx.fillText(
    "TAP YOUR CARD",
    675,
    365,
  );

  ctx.fillStyle =
    muted;

  ctx.font =
    "500 25px Arial";

  ctx.fillText(
    "RFID / NFC READY",
    675,
    410,
  );

  ctx.fillStyle =
    "rgba(84,240,173,.16)";

  roundedRect(
    ctx,
    60,
    500,
    1080,
    62,
    18,
  );

  ctx.fill();

  ctx.fillStyle =
    green;

  ctx.font =
    "650 26px Arial";

  ctx.fillText(
    "DEVICE ONLINE",
    90,
    540,
  );

  ctx.textAlign =
    "right";

  ctx.fillText(
    "09:24 AM",
    1105,
    540,
  );

  ctx.textAlign =
    "left";

  const texture =
    canvasTexture(
      canvas,
    );

  texture.flipY =
    true;

  texture.needsUpdate =
    true;

  return texture;
}

/* =========================================================
   SCANNER MATERIAL
========================================================= */

function styleScanner(
  object: THREE.Object3D,
  screenTexture: THREE.Texture,
) {
  object.traverse(
    (
      child,
    ) => {
      if (
        !(
          child instanceof
          THREE.Mesh
        )
      ) {
        return;
      }

      const sources =
        Array.isArray(
          child.material,
        )
          ? child.material
          : [
              child.material,
            ];

      const next =
        sources.map(
          (
            source,
          ) => {
            const material =
              source.clone();

            if (
              !(
                material instanceof
                THREE.MeshStandardMaterial
              )
            ) {
              return material;
            }

            const name =
              material.name
                .trim()
                .toLowerCase();

            if (
              [
                "base",
                "black shiny",
                "blackest black",
              ].includes(
                name,
              )
            ) {
              material.map =
                null;

              material.color.set(
                "#101916",
              );

              material.metalness =
                0.5;

              material.roughness =
                0.24;
            }

            if (
              [
                "gray",
                "light gray",
              ].includes(
                name,
              )
            ) {
              material.map =
                null;

              material.color.set(
                "#b9c8c1",
              );

              material.metalness =
                0.72;

              material.roughness =
                0.23;
            }

            if (
              name ===
              "gold"
            ) {
              material.map =
                null;

              material.color.set(
                "#21c983",
              );

              material.emissive.set(
                "#087649",
              );

              material.emissiveIntensity =
                0.42;

              material.metalness =
                0.45;

              material.roughness =
                0.25;
            }

            if (
              name ===
              "screen"
            ) {
              material.map =
                screenTexture;

              material.color.set(
                "#ffffff",
              );

              material.emissive.set(
                "#072e20",
              );

              material.emissiveIntensity =
                0.25;

              material.metalness =
                0;

              material.roughness =
                0.3;
            }

            material.needsUpdate =
              true;

            return material;
          },
        );

      child.material =
        Array.isArray(
          child.material,
        )
          ? next
          : next[0];
    },
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function AttendanceEditorialScene(
  props: Props,
) {
  return (
    <Scene
      key={
        props.label
      }
      {...props}
    />
  );
}

function Scene({
  label,
}: Props) {
  const hostRef =
    useRef<HTMLDivElement>(
      null,
    );

  const [
    ready,
    setReady,
  ] =
    useState(
      false,
    );

  const [
    failed,
    setFailed,
  ] =
    useState(
      false,
    );

useEffect(() => {
  const hostNode =
    hostRef.current;

  if (!hostNode) {
    return;
  }

  const hostElement: HTMLDivElement =
    hostNode;

  let disposed =
    false;

      let renderer:
        | THREE.WebGLRenderer
        | undefined;

      let environment:
        | THREE.WebGLRenderTarget
        | undefined;

      let resizeObserver:
        | ResizeObserver
        | undefined;

      const geometries =
        new Set<
          THREE.BufferGeometry
        >();

      const materials =
        new Set<
          THREE.Material
        >();

      const textures =
        new Set<
          THREE.Texture
        >();

      /* =====================================================
         RESOURCE MANAGEMENT
      ===================================================== */

      function collectObject(
        object:
          THREE.Object3D,
      ) {
        object.traverse(
          (
            child,
          ) => {
            if (
              !(
                child instanceof
                THREE.Mesh
              )
            ) {
              return;
            }

            geometries.add(
              child.geometry,
            );

            const childMaterials =
              Array.isArray(
                child.material,
              )
                ? child.material
                : [
                    child.material,
                  ];

            childMaterials.forEach(
              (
                material,
              ) => {
                materials.add(
                  material,
                );

                Object.values(
                  material,
                ).forEach(
                  (
                    value,
                  ) => {
                    if (
                      value instanceof
                      THREE.Texture
                    ) {
                      textures.add(
                        value,
                      );
                    }
                  },
                );
              },
            );

            child.castShadow =
              false;

            child.receiveShadow =
              false;
          },
        );
      }

      function disposeAssets() {
        textures.forEach(
          (
            texture,
          ) => {
            texture.dispose();
          },
        );

        materials.forEach(
          (
            material,
          ) => {
            material.dispose();
          },
        );

        geometries.forEach(
          (
            geometry,
          ) => {
            geometry.dispose();
          },
        );

        textures.clear();

        materials.clear();

        geometries.clear();
      }

      /* =====================================================
         NORMALIZE MODEL
      ===================================================== */

      function createNormalizedModel(
        source:
          THREE.Object3D,

        targetSize:
          number,
      ) {
        const root =
          new THREE.Group();

        const bounds =
          new THREE.Box3()
            .setFromObject(
              source,
            );

        const size =
          new THREE.Vector3();

        const center =
          new THREE.Vector3();

        bounds.getSize(
          size,
        );

        bounds.getCenter(
          center,
        );

        const largest =
          Math.max(
            size.x,
            size.y,
            size.z,
          );

        const scale =
          largest >
          0
            ? targetSize /
              largest
            : 1;

        source.scale.setScalar(
          scale,
        );

        source.position.set(
          -center.x *
            scale,

          -center.y *
            scale,

          -center.z *
            scale,
        );

        root.add(
          source,
        );

        return root;
      }

      /* =====================================================
         FLOATING CARD — REAL 3D DEPTH
      ===================================================== */

function createFloatingCard(
  width: number,
  height: number,
  depth: number,
  radius: number,
  texture: THREE.Texture,
  renderOrder: number,
) {
  const group =
    new THREE.Group();

  const halfW =
    width / 2;

  const halfH =
    height / 2;

  const r =
    Math.min(
      radius,
      halfW * 0.4,
      halfH * 0.4,
    );

  const shape =
    new THREE.Shape();

  shape.moveTo(
    -halfW + r,
    -halfH,
  );

  shape.lineTo(
    halfW - r,
    -halfH,
  );

  shape.quadraticCurveTo(
    halfW,
    -halfH,
    halfW,
    -halfH + r,
  );

  shape.lineTo(
    halfW,
    halfH - r,
  );

  shape.quadraticCurveTo(
    halfW,
    halfH,
    halfW - r,
    halfH,
  );

  shape.lineTo(
    -halfW + r,
    halfH,
  );

  shape.quadraticCurveTo(
    -halfW,
    halfH,
    -halfW,
    halfH - r,
  );

  shape.lineTo(
    -halfW,
    -halfH + r,
  );

  shape.quadraticCurveTo(
    -halfW,
    -halfH,
    -halfW + r,
    -halfH,
  );

  const actualDepth =
    Math.min(
      depth,
      0.055,
    );

const bodyGeometry =
  new THREE.ExtrudeGeometry(
    shape,
    {
      depth:
        actualDepth,

      steps:
        1,

      bevelEnabled:
        true,

      bevelSegments:
        3,

      bevelSize:
        0.008,

      bevelThickness:
        0.008,

      curveSegments:
        12,
    },
  );

  bodyGeometry.translate(
    0,
    0,
    -actualDepth / 2,
  );

  geometries.add(
    bodyGeometry,
  );

  const bodyMaterial =
    new THREE.MeshStandardMaterial(
      {
        color:
          0xffffff,

        metalness:
          0,

        roughness:
          0.32,
      },
    );

  materials.add(
    bodyMaterial,
  );

  const body =
    new THREE.Mesh(
      bodyGeometry,
      bodyMaterial,
    );

  body.renderOrder =
    renderOrder - 1;

  group.add(
    body,
  );

  textures.add(
    texture,
  );

  const faceGeometry =
    new THREE.PlaneGeometry(
      width * 0.997,
      height * 0.997,
    );

  geometries.add(
    faceGeometry,
  );

const faceMaterial =
  new THREE.MeshBasicMaterial(
    {
      map:
        texture,

      transparent:
        true,

      depthTest:
        true,

      depthWrite:
        false,

      toneMapped:
        false,

      side:
        THREE.DoubleSide,

      polygonOffset:
        true,

      polygonOffsetFactor:
        -4,

      polygonOffsetUnits:
        -4,
    },
  );

materials.add(
  faceMaterial,
);

const face =
  new THREE.Mesh(
    faceGeometry,
    faceMaterial,
  );

/*
 * Harus berada DI DEPAN bevel ExtrudeGeometry.
 * 0.008 sebelumnya terlalu dekat sehingga cap putih
 * menutupi texture.
 */
face.position.z =
  actualDepth / 2 +
  0.045;

face.renderOrder =
  renderOrder;

group.add(
  face,
);

  return group;
}

      /* =====================================================
         IMAC DASHBOARD OVERLAY
      ===================================================== */

      function createImacScreenOverlay(
        imac:
          THREE.Object3D,

        dashboardTexture:
          THREE.Texture,
      ) {
        const panel =
          imac.getObjectByName(
            "sm_monitor_01_m_monitor_01_0",
          );

        if (
          !panel
        ) {
          return;
        }

        const geometry =
          new THREE.BufferGeometry();

        geometry.setAttribute(
          "position",

          new THREE.Float32BufferAttribute(
            [
              -29.7,
              -6.85,
              50.8,

              -29.7,
              -11.68,
              17.6,

              29.7,
              -6.85,
              50.8,

              29.7,
              -11.68,
              17.6,
            ],
            3,
          ),
        );

        geometry.setAttribute(
          "uv",

          new THREE.Float32BufferAttribute(
            [
              0,
              1,
              0,
              0,
              1,
              1,
              1,
              0,
            ],
            2,
          ),
        );

        geometry.setIndex(
          [
            0,
            1,
            2,
            2,
            1,
            3,
          ],
        );

        geometry.computeVertexNormals();

        geometries.add(
          geometry,
        );

        const material =
          new THREE.MeshBasicMaterial(
            {
              map:
                dashboardTexture,

              side:
                THREE.DoubleSide,

              toneMapped:
                false,
            },
          );

        materials.add(
          material,
        );

        textures.add(
          dashboardTexture,
        );

        const screen =
          new THREE.Mesh(
            geometry,
            material,
          );

        screen.renderOrder =
          5;

        panel.add(
          screen,
        );
      }

      /* =====================================================
         INITIALIZE
      ===================================================== */

      async function initialize() {
        try {
          const loader =
            new GLTFLoader();

          const [
            imacGltf,
            scannerGltf,
            badgeGltf,
          ] =
            await Promise.all(
              [
                loader.loadAsync(
                  IMAC_MODEL_URL,
                ),

                loader.loadAsync(
                  SCANNER_MODEL_URL,
                ),

                loader.loadAsync(
                  BADGE_MODEL_URL,
                ),
              ],
            );

          if (
            disposed
          ) {
            return;
          }

          const scannerScreenTexture =
            createScannerScreenTexture();

          styleScanner(
            scannerGltf.scene,
            scannerScreenTexture,
          );

          collectObject(
            imacGltf.scene,
          );

          collectObject(
            scannerGltf.scene,
          );

          collectObject(
            badgeGltf.scene,
          );

          const scene =
            new THREE.Scene();

          /* =================================================
             RENDERER
          ================================================= */

          renderer =
            new THREE.WebGLRenderer(
              {
                alpha:
                  true,

                antialias:
                  true,

                powerPreference:
                  "low-power",
              },
            );

          const webgl =
            renderer;

          webgl.setPixelRatio(
            Math.min(
              window.devicePixelRatio ||
                1,

              1.75,
            ),
          );

          webgl.outputColorSpace =
            THREE.SRGBColorSpace;

          webgl.toneMapping =
            THREE.ACESFilmicToneMapping;

          webgl.toneMappingExposure =
            1.08;

          webgl.setClearColor(
            0x000000,
            0,
          );

          webgl.domElement.setAttribute(
            "aria-label",
            label,
          );

          webgl.domElement.style.width =
            "100%";

          webgl.domElement.style.height =
            "100%";

          webgl.domElement.style.display =
            "block";

          webgl.domElement.style.pointerEvents =
            "none";

hostElement.appendChild(
  webgl.domElement,
);

          /* =================================================
             CAMERA
          ================================================= */

          const camera =
            new THREE.PerspectiveCamera(
              CAMERA_FOV,
              1,
              0.1,
              100,
            );

          camera.position.set(
            CAMERA_POSITION.x,
            CAMERA_POSITION.y,
            CAMERA_POSITION.z,
          );

          camera.lookAt(
            CAMERA_TARGET.x,
            CAMERA_TARGET.y,
            CAMERA_TARGET.z,
          );

          /* =================================================
             ENVIRONMENT
          ================================================= */

          const pmrem =
            new THREE.PMREMGenerator(
              webgl,
            );

          environment =
            pmrem.fromScene(
              new RoomEnvironment(),
              0.04,
            );

          pmrem.dispose();

          scene.environment =
            environment.texture;

          /* =================================================
             LIGHTS
          ================================================= */

          scene.add(
            new THREE.HemisphereLight(
              0xffffff,
              0xc9ddd2,
              1.35,
            ),
          );

          const keyLight =
            new THREE.DirectionalLight(
              0xffffff,
              2.35,
            );

          keyLight.position.set(
            -4,
            6,
            8,
          );

          scene.add(
            keyLight,
          );

          const fillLight =
            new THREE.DirectionalLight(
              0xbcebd2,
              1.15,
            );

          fillLight.position.set(
            5,
            1,
            5,
          );

          scene.add(
            fillLight,
          );

          const rimLight =
            new THREE.DirectionalLight(
              0xd9fff0,
              0.8,
            );

          rimLight.position.set(
            2,
            4,
            -4,
          );

          scene.add(
            rimLight,
          );

          /* =================================================
             ROOT
          ================================================= */

          const composition =
            new THREE.Group();

          scene.add(
            composition,
          );

          /* =================================================
             IMAC — LOCKED
          ================================================= */

          const imac =
            createNormalizedModel(
              imacGltf.scene,
              IMAC_TARGET_SIZE,
            );

          createImacScreenOverlay(
            imac,
            createImacDashboardTexture(),
          );

          imac.position.set(
            IMAC_POSITION.x,
            IMAC_POSITION.y,
            IMAC_POSITION.z,
          );

          imac.rotation.set(
            IMAC_ROTATION.x,
            IMAC_ROTATION.y,
            IMAC_ROTATION.z,
          );

          composition.add(
            imac,
          );

          /* =================================================
             SCANNER — LANDSCAPE
          ================================================= */

          const scanner =
            createNormalizedModel(
              scannerGltf.scene,
              SCANNER_TARGET_SIZE,
            );

          scanner.position.set(
            SCANNER_POSITION.x,
            SCANNER_POSITION.y,
            SCANNER_POSITION.z,
          );

          scanner.rotation.set(
            SCANNER_ROTATION.x,
            SCANNER_ROTATION.y,
            SCANNER_ROTATION.z,
          );

          composition.add(
            scanner,
          );

          /* =================================================
             BADGE — LANDSCAPE
          ================================================= */

          const badge =
            createNormalizedModel(
              badgeGltf.scene,
              BADGE_TARGET_SIZE,
            );

          badge.position.set(
            BADGE_POSITION.x,
            BADGE_POSITION.y,
            BADGE_POSITION.z,
          );

          badge.rotation.set(
            BADGE_ROTATION.x,
            BADGE_ROTATION.y,
            BADGE_ROTATION.z,
          );

          composition.add(
            badge,
          );

          /* =================================================
             TOTAL ATTENDANCE
          ================================================= */

          const totalCard =
  createFloatingCard(
    2.35,
    1.22,
    0.05,
    0.14,
    createTotalAttendanceTexture(),
    10,
  );

          totalCard.position.set(
            TOTAL_CARD_POSITION.x,
            TOTAL_CARD_POSITION.y,
            TOTAL_CARD_POSITION.z,
          );

          totalCard.rotation.set(
            TOTAL_CARD_ROTATION.x,
            TOTAL_CARD_ROTATION.y,
            TOTAL_CARD_ROTATION.z,
          );

          composition.add(
            totalCard,
          );

          /* =================================================
             CHECK-IN SUCCESS
          ================================================= */

          const checkInCard =
  createFloatingCard(
    2.95,
    1.14,
    0.05,
    0.14,
    createCheckInTexture(),
    11,
  );

          checkInCard.position.set(
            CHECKIN_CARD_POSITION.x,
            CHECKIN_CARD_POSITION.y,
            CHECKIN_CARD_POSITION.z,
          );

          checkInCard.rotation.set(
            CHECKIN_CARD_ROTATION.x,
            CHECKIN_CARD_ROTATION.y,
            CHECKIN_CARD_ROTATION.z,
          );

          composition.add(
            checkInCard,
          );

          /* =================================================
             QUOTE CARD
          ================================================= */

          const quoteCard =
  createFloatingCard(
    1.22,
    2.08,
    0.05,
    0.14,
    createQuoteCardTexture(),
    9,
  );

          quoteCard.position.set(
            QUOTE_CARD_POSITION.x,
            QUOTE_CARD_POSITION.y,
            QUOTE_CARD_POSITION.z,
          );

          quoteCard.rotation.set(
            QUOTE_CARD_ROTATION.x,
            QUOTE_CARD_ROTATION.y,
            QUOTE_CARD_ROTATION.z,
          );

          composition.add(
            quoteCard,
          );

          /* =================================================
             RENDER
          ================================================= */

          function render() {
            if (
              !disposed
            ) {
              webgl.render(
                scene,
                camera,
              );
            }
          }

          /* =================================================
             RESPONSIVE CAMERA
          ================================================= */

          function resize() {
const width =
  hostElement.clientWidth;

const height =
  hostElement.clientHeight;

            if (
              !width ||
              !height
            ) {
              return;
            }

            webgl.setSize(
              width,
              height,
              false,
            );

            camera.aspect =
              width /
              height;

            camera.fov =
              CAMERA_FOV;

            const tangent =
              Math.tan(
                THREE.MathUtils.degToRad(
                  CAMERA_FOV,
                ) /
                  2,
              );

            const verticalFitDistance =
              CAMERA_FIT_HALF_HEIGHT /
              tangent;

            const horizontalFitDistance =
              CAMERA_FIT_HALF_WIDTH /
              (
                tangent *
                camera.aspect
              );

            const fittedDistance =
              Math.max(
                CAMERA_BASE_DISTANCE,
                verticalFitDistance,
                horizontalFitDistance,
              );

            const dx =
              CAMERA_POSITION.x -
              CAMERA_TARGET.x;

            const dy =
              CAMERA_POSITION.y -
              CAMERA_TARGET.y;

            const dz =
              CAMERA_POSITION.z -
              CAMERA_TARGET.z;

            const distanceScale =
              fittedDistance /
              CAMERA_BASE_DISTANCE;

            camera.position.set(
              CAMERA_TARGET.x +
                dx *
                  distanceScale,

              CAMERA_TARGET.y +
                dy *
                  distanceScale,

              CAMERA_TARGET.z +
                dz *
                  distanceScale,
            );

            camera.lookAt(
              CAMERA_TARGET.x,
              CAMERA_TARGET.y,
              CAMERA_TARGET.z,
            );

            camera.updateProjectionMatrix();

            render();
          }

          resizeObserver =
            new ResizeObserver(
              resize,
            );

resizeObserver.observe(
  hostElement,
);

          resize();

          if (
            !disposed
          ) {
            setReady(
              true,
            );
          }
        } catch (
          error
        ) {
          console.error(
            "[AttendanceEditorialScene] Failed to initialize scene:",
            error,
          );

          if (
            !disposed
          ) {
            setFailed(
              true,
            );
          }
        }
      }

      void initialize();

      return () => {
        disposed =
          true;

        resizeObserver
          ?.disconnect();

        environment
          ?.dispose();

        environment =
          undefined;

        disposeAssets();

        if (
          renderer
        ) {
          renderer.dispose();

          renderer.domElement
            .remove();

          renderer =
            undefined;
        }
      };
    },
    [
      label,
    ],
  );

  return (
    <div
      ref={
        hostRef
      }
      style={{
        position:
          "absolute",

        inset:
          0,

        opacity:
          ready
            ? 1
            : 0,

        transition:
          "opacity 420ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      data-attendance-scene-ready={
        ready
          ? "true"
          : "false"
      }
      data-attendance-scene-failed={
        failed
          ? "true"
          : "false"
      }
      aria-hidden="true"
    />
  );
}