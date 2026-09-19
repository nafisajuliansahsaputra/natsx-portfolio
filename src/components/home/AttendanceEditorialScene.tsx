"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

type Props = {
  label: string;
  dashboardImageUrl?: string | null;
};

const IMAC_MODEL_URL = "/models/attendance/imac.glb";
const SCANNER_MODEL_URL = "/models/attendance/scanner.glb";
const BADGE_MODEL_URL = "/models/attendance/badge.glb";

/* =========================================================
   COMPOSITION — CARD REBUILD PASS
========================================================= */

const CAMERA_FOV = 30;
const CAMERA_TARGET = { x: 1.05, y: -0.12, z: 0 };
const CAMERA_POSITION = { x: 1.12, y: 0.82, z: 13.62 };
const CAMERA_FIT_HALF_WIDTH = 5.9;
const CAMERA_FIT_HALF_HEIGHT = 4.05;

const CAMERA_BASE_DISTANCE = Math.hypot(
  CAMERA_POSITION.x - CAMERA_TARGET.x,
  CAMERA_POSITION.y - CAMERA_TARGET.y,
  CAMERA_POSITION.z - CAMERA_TARGET.z,
);

/*
 * Reference composition:
 * iMac is the calm, near-frontal hero.
 * Supporting hardware/cards orbit around it instead of competing with it.
 */
const IMAC_TARGET_SIZE = 6.92;
const IMAC_POSITION = { x: 1.05, y: -0.08, z: -0.62 };
const IMAC_ROTATION = { x: -0.055, y: -0.12, z: -0.025 };

const SCANNER_TARGET_SIZE = 2.48;
const SCANNER_POSITION = { x: 2.62, y: -2.42, z: 3.72 };
const SCANNER_ROTATION = { x: -0.16, y: -0.16, z: -0.045 };

const BADGE_TARGET_SIZE = 1.48;
const BADGE_POSITION = { x: -0.82, y: -2.02, z: 2.92 };
const BADGE_ROTATION = { x: -0.08, y: 0.12, z: -0.105 };

const TOTAL_CARD_POSITION = { x: -1.45, y: 3.08, z: 1.08 };
const TOTAL_CARD_ROTATION = { x: 0.035, y: 0.16, z: 0.075 };

const QUOTE_CARD_POSITION = { x: 4.62, y: 2.72, z: 1.62 };
const QUOTE_CARD_ROTATION = { x: -0.01, y: -0.11, z: 0.055 };

const CONNECT_CARD_POSITION = { x: 4.58, y: 0.32, z: 1.72 };
const CONNECT_CARD_ROTATION = { x: 0.01, y: -0.08, z: -0.025 };

const CHECKIN_CARD_POSITION = { x: 3.42, y: -1.02, z: 4.18 };
const CHECKIN_CARD_ROTATION = { x: 0, y: -0.075, z: -0.018 };

/* =========================================================
   CANVAS HELPERS
========================================================= */

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - r,
    y + height,
  );
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function canvasTexture(canvas: HTMLCanvasElement) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/* =========================================================
   DASHBOARD TEXTURE FALLBACK
========================================================= */

function createFallbackDashboardTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 900;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Dashboard canvas unavailable");
  }

  const green = "#12ad74";
  const deep = "#0a4334";
  const text = "#173b31";
  const muted = "#7d9188";
  const bg = "#f6faf8";
  const card = "#ffffff";

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = deep;
  ctx.fillRect(0, 0, 255, 900);

  ctx.fillStyle = "#f7fbf9";
  roundedRect(ctx, 320, 56, 790, 46, 23);
  ctx.fill();

  ctx.fillStyle = "#cfd9d5";
  ctx.font = "500 20px Arial";
  ctx.fillText("Search people, ID or department...", 358, 86);

  ctx.fillStyle = green;
  roundedRect(ctx, 46, 47, 52, 52, 14);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.font = "700 29px Arial";
  ctx.fillText("A", 62, 83);

  ctx.font = "700 29px Arial";
  ctx.fillText("AttendaPro", 116, 82);

  ctx.fillStyle = "#9fd5c0";
  ctx.font = "500 16px Arial";
  ctx.fillText("SMART WORKSPACE", 116, 106);

  const sidebarItems = [
    "Dashboard",
    "Attendance",
    "People",
    "Reports",
    "Settings",
  ];

  sidebarItems.forEach((label, index) => {
    const y = 180 + index * 76;

    if (index === 0) {
      ctx.fillStyle = "#0d7959";
      roundedRect(ctx, 28, y - 33, 190, 56, 16);
      ctx.fill();
    }

    ctx.fillStyle = index === 0 ? "#ffffff" : "#a8c8bc";
    ctx.beginPath();
    ctx.arc(55, y, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = "600 21px Arial";
    ctx.fillText(label, 78, y + 7);
  });

  ctx.fillStyle = text;
  ctx.font = "700 36px Arial";
  ctx.fillText("Good Morning,", 320, 140);

  ctx.fillStyle = muted;
  ctx.font = "500 18px Arial";
  ctx.fillText("Productive people build brighter tomorrows.", 320, 169);

  ctx.fillStyle = "#5f746b";
  ctx.font = "500 18px Arial";
  ctx.fillText("Mon, Apr 28, 2025", 1255, 96);

  ctx.fillStyle = text;
  ctx.font = "700 48px Arial";
  ctx.fillText("09:24 AM", 1230, 145);

  const statCards = [
    ["Present", "142", "+12%", "#10b072"],
    ["Absent", "18", "-4%", "#eb6c64"],
    ["Late", "7", "-20%", "#d5a321"],
    ["Total", "167", "Active employees", "#3f9a84"],
  ] as const;

  statCards.forEach(([label, value, change, accent], index) => {
    const x = 320 + index * 222;
    const y = 206;

    ctx.fillStyle = card;
    roundedRect(ctx, x, y, 198, 124, 22);
    ctx.fill();

    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(x + 35, y + 36, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#6f837a";
    ctx.font = "600 16px Arial";
    ctx.fillText(label, x + 56, y + 41);

    ctx.fillStyle = text;
    ctx.font = "700 38px Arial";
    ctx.fillText(value, x + 26, y + 90);

    if (index !== 3) {
      ctx.fillStyle =
        change.startsWith("+")
          ? "#18b073"
          : index === 2
            ? "#93a64a"
            : "#e1655f";
      ctx.font = "600 15px Arial";
      ctx.fillText(change, x + 26, y + 112);

      ctx.fillStyle = "#90a097";
      ctx.font = "500 15px Arial";
      ctx.fillText("from yesterday", x + 70, y + 112);
    } else {
      ctx.fillStyle = "#90a097";
      ctx.font = "500 15px Arial";
      ctx.fillText(change, x + 26, y + 112);
    }
  });

  ctx.fillStyle = card;
  roundedRect(ctx, 320, 360, 402, 324, 24);
  ctx.fill();

  ctx.fillStyle = text;
  ctx.font = "700 24px Arial";
  ctx.fillText("Attendance Today", 350, 406);

  ctx.fillStyle = "#f3f7f5";
  roundedRect(ctx, 590, 378, 98, 36, 15);
  ctx.fill();

  ctx.fillStyle = "#6e8178";
  ctx.font = "600 15px Arial";
  ctx.fillText("Today", 620, 401);

  const chartBars = [118, 160, 208, 250, 218, 188, 130, 42, 20];
  chartBars.forEach((height, index) => {
    const x = 370 + index * 33;
    const y = 635 - height;

    ctx.fillStyle = "#10b072";
    roundedRect(ctx, x, y, 21, height, 10);
    ctx.fill();
  });

  ctx.strokeStyle = "#e9efec";
  ctx.lineWidth = 2;
  [470, 538, 606].forEach((y) => {
    ctx.beginPath();
    ctx.moveTo(360, y);
    ctx.lineTo(690, y);
    ctx.stroke();
  });

  ctx.fillStyle = card;
  roundedRect(ctx, 750, 360, 212, 324, 24);
  ctx.fill();

  ctx.fillStyle = text;
  ctx.font = "700 24px Arial";
  ctx.fillText("Recent Activity", 778, 406);

  ctx.fillStyle = green;
  ctx.font = "600 16px Arial";
  ctx.fillText("View All", 882, 406);

  const people = [
    ["Alex Chen", "Checked in", "08:24 AM"],
    ["Priya Sharma", "Checked in", "09:11 AM"],
    ["Daniel Kim", "Checked in", "09:12 AM"],
    ["Maria Lopez", "Checked in", "08:56 AM"],
    ["James Wilson", "Checked in", "08:41 AM"],
  ];

  people.forEach(([name, status, time], index) => {
    const y = 468 + index * 46;

    ctx.fillStyle = "#d8e8e1";
    ctx.beginPath();
    ctx.arc(795, y - 5, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#173b31";
    ctx.font = "600 16px Arial";
    ctx.fillText(name, 822, y);

    ctx.fillStyle = "#7f9189";
    ctx.font = "500 14px Arial";
    ctx.fillText(status, 822, y + 18);

    ctx.fillStyle = "#7f9189";
    ctx.font = "500 14px Arial";
    ctx.fillText(time, 910, y + 4);
  });

  ctx.fillStyle = card;
  roundedRect(ctx, 987, 360, 290, 324, 24);
  ctx.fill();

  ctx.fillStyle = text;
  ctx.font = "700 24px Arial";
  ctx.fillText("Verification", 1016, 406);

  ctx.strokeStyle = "#10b072";
  ctx.lineWidth = 5;

  const fx = 1080;
  const fy = 472;
  const fw = 106;
  const fh = 106;
  const corner = 24;

  ctx.beginPath();
  ctx.moveTo(fx, fy + corner);
  ctx.lineTo(fx, fy);
  ctx.lineTo(fx + corner, fy);

  ctx.moveTo(fx + fw - corner, fy);
  ctx.lineTo(fx + fw, fy);
  ctx.lineTo(fx + fw, fy + corner);

  ctx.moveTo(fx + fw, fy + fh - corner);
  ctx.lineTo(fx + fw, fy + fh);
  ctx.lineTo(fx + fw - corner, fy + fh);

  ctx.moveTo(fx + corner, fy + fh);
  ctx.lineTo(fx, fy + fh);
  ctx.lineTo(fx, fy + fh - corner);
  ctx.stroke();

  ctx.strokeStyle = "#9eb7ad";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(1133, 505, 27, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(1133, 566, 48, Math.PI * 1.12, Math.PI * 1.88);
  ctx.stroke();

  ctx.fillStyle = "#10b072";
  ctx.beginPath();
  ctx.arc(1040, 626, 24, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(1030, 627);
  ctx.lineTo(1038, 636);
  ctx.lineTo(1052, 618);
  ctx.stroke();

  ctx.fillStyle = text;
  ctx.font = "700 22px Arial";
  ctx.fillText("Face Verified", 1078, 632);

  ctx.fillStyle = "#8ca096";
  ctx.font = "500 15px Arial";
  ctx.fillText("Identity confirmed", 1078, 654);

  return canvasTexture(canvas);
}

/* =========================================================
   FLOATING UI TEXTURES — REBUILT
========================================================= */

function createTotalAttendanceTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 700;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Total attendance canvas unavailable");
  }

  ctx.clearRect(0, 0, 1200, 700);

  const green = "#12b476";
  const dark = "#15352b";
  const muted = "#789086";

  ctx.fillStyle = green;
  [
    [110, 338, 38, 120],
    [172, 286, 38, 172],
    [234, 212, 38, 246],
  ].forEach(([x, y, w, h]) => {
    roundedRect(ctx, x, y, w, h, 16);
    ctx.fill();
  });

  ctx.fillStyle = dark;
  ctx.font = "600 52px Arial";
  ctx.fillText("Total Attendance", 372, 205);

  ctx.font = "700 148px Arial";
  ctx.fillText("167", 372, 382);

  ctx.fillStyle = "rgba(18,180,118,.12)";
  roundedRect(ctx, 760, 295, 220, 92, 46);
  ctx.fill();

  ctx.fillStyle = green;
  ctx.font = "700 42px Arial";
  ctx.fillText("↑ 14%", 812, 356);

  ctx.fillStyle = muted;
  ctx.font = "500 34px Arial";
  ctx.fillText("vs. last week", 372, 470);

  return canvasTexture(canvas);
}

function createQuoteCardTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 780;
  canvas.height = 1320;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Quote card canvas unavailable");
  }

  ctx.clearRect(0, 0, 780, 1320);

  ctx.fillStyle = "#2c4d42";
  ctx.font = "500 62px Arial";
  ctx.fillText("SAME", 128, 255);
  ctx.fillText("PEOPLE.", 128, 370);
  ctx.fillText("HIGHER", 128, 485);
  ctx.fillText("POTENTIAL.", 128, 600);

  ctx.fillStyle = "#18aa72";
  ctx.fillRect(128, 700, 124, 10);

  return canvasTexture(canvas);
}

function createConnectCardTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 680;
  canvas.height = 1180;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Connect card canvas unavailable");
  }

  ctx.clearRect(0, 0, 680, 1180);

  ctx.fillStyle = "#12b476";
  ctx.beginPath();
  ctx.arc(340, 208, 78, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(340, 182, 22, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(304, 228, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(376, 228, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(340, 252, 34, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#5d756d";
  ctx.font = "500 46px Arial";
  ctx.fillText("ATTEND", 184, 500);
  ctx.fillText("CONNECT", 154, 584);
  ctx.fillText("GROW", 232, 668);

  ctx.fillStyle = "#18aa72";
  ctx.fillRect(182, 760, 96, 8);

  return canvasTexture(canvas);
}

function createCheckInTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1850;
  canvas.height = 760;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Check-in canvas unavailable");
  }

  ctx.clearRect(0, 0, 1850, 760);

  const green = "#12b476";
  const dark = "#15352b";
  const muted = "#789086";

  ctx.fillStyle = "rgba(18,180,118,.14)";
  ctx.beginPath();
  ctx.arc(235, 380, 138, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = green;
  ctx.beginPath();
  ctx.arc(235, 380, 98, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 24;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(188, 382);
  ctx.lineTo(226, 422);
  ctx.lineTo(298, 336);
  ctx.stroke();

  ctx.fillStyle = dark;
  ctx.font = "700 86px Arial";
  ctx.fillText("Check-in Successful", 430, 360);

  ctx.fillStyle = muted;
  ctx.font = "500 46px Arial";
  ctx.fillText("Welcome back!", 430, 448);

  ctx.textAlign = "right";
  ctx.fillStyle = "#8ba097";
  ctx.font = "500 38px Arial";
  ctx.fillText("09:24 AM", 1732, 246);
  ctx.textAlign = "left";

  return canvasTexture(canvas);
}

function createScannerScreenTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 600;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Scanner canvas unavailable");
  }

  const green = "#54f0ad";
  const muted = "#9acdb6";

  ctx.fillStyle = "#07140f";
  ctx.fillRect(0, 0, 1200, 600);

  const glow = ctx.createRadialGradient(320, 290, 20, 320, 290, 360);
  glow.addColorStop(0, "rgba(61,225,150,.16)");
  glow.addColorStop(1, "rgba(61,225,150,0)");

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1200, 600);

  ctx.fillStyle = muted;
  ctx.font = "600 28px Arial";
  ctx.fillText("LIVE VERIFICATION", 60, 58);

  ctx.fillStyle = green;
  ctx.beginPath();
  ctx.arc(1110, 48, 9, 0, Math.PI * 2);
  ctx.fill();

  const x = 90;
  const y = 135;
  const w = 360;
  const h = 300;
  const corner = 48;

  ctx.strokeStyle = green;
  ctx.lineWidth = 8;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(x, y + corner);
  ctx.lineTo(x, y);
  ctx.lineTo(x + corner, y);

  ctx.moveTo(x + w - corner, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + corner);

  ctx.moveTo(x + w, y + h - corner);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w - corner, y + h);

  ctx.moveTo(x + corner, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + h - corner);

  ctx.stroke();

  ctx.beginPath();
  ctx.arc(270, 235, 54, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(270, 365, 92, Math.PI * 1.08, Math.PI * 1.92);
  ctx.stroke();

  ctx.fillStyle = "#f2fff9";
  ctx.font = "700 62px Arial";
  ctx.fillText("LOOK HERE", 525, 210);

  ctx.fillStyle = muted;
  ctx.font = "500 31px Arial";
  ctx.fillText("Face verification active", 525, 265);

  ctx.strokeStyle = green;
  ctx.lineWidth = 6;
  [0, 1, 2].forEach((index) => {
    ctx.beginPath();
    ctx.arc(555, 360, 34 + index * 22, -0.85, 0.85);
    ctx.stroke();
  });

  ctx.fillStyle = "#f2fff9";
  ctx.font = "650 38px Arial";
  ctx.fillText("TAP YOUR CARD", 675, 365);

  ctx.fillStyle = muted;
  ctx.font = "500 25px Arial";
  ctx.fillText("RFID / NFC READY", 675, 410);

  ctx.fillStyle = "rgba(84,240,173,.16)";
  roundedRect(ctx, 60, 500, 1080, 62, 18);
  ctx.fill();

  ctx.fillStyle = green;
  ctx.font = "650 26px Arial";
  ctx.fillText("DEVICE ONLINE", 90, 540);

  ctx.textAlign = "right";
  ctx.fillText("09:24 AM", 1105, 540);
  ctx.textAlign = "left";

  const texture = canvasTexture(canvas);
  texture.flipY = true;
  texture.needsUpdate = true;

  return texture;
}

/* =========================================================
   SHADOW / GLOW
========================================================= */

function createShadowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Shadow canvas unavailable");
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const gradient = ctx.createRadialGradient(256, 128, 8, 256, 128, 170);

  gradient.addColorStop(0, "rgba(12,55,39,0.28)");
  gradient.addColorStop(0.45, "rgba(12,55,39,0.12)");
  gradient.addColorStop(1, "rgba(12,55,39,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  return canvasTexture(canvas);
}

function createGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Glow canvas unavailable");
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const gradient = ctx.createRadialGradient(256, 256, 10, 256, 256, 220);
  gradient.addColorStop(0, "rgba(140,255,214,0.65)");
  gradient.addColorStop(0.38, "rgba(140,255,214,0.22)");
  gradient.addColorStop(1, "rgba(140,255,214,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  return canvasTexture(canvas);
}

/* =========================================================
   MODEL / CARD HELPERS
========================================================= */

function createNormalizedModel(source: THREE.Object3D, targetSize: number) {
  const root = new THREE.Group();

  const bounds = new THREE.Box3().setFromObject(source);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();

  bounds.getSize(size);
  bounds.getCenter(center);

  const largest = Math.max(size.x, size.y, size.z);
  const scale = largest > 0 ? targetSize / largest : 1;

  source.scale.setScalar(scale);
  source.position.set(
    -center.x * scale,
    -center.y * scale,
    -center.z * scale,
  );

  root.add(source);
  return root;
}

function freezeStaticDescendants(root: THREE.Object3D) {
  root.traverse((object) => {
    if (object === root) {
      return;
    }

    object.updateMatrix();
    object.matrixAutoUpdate = false;
  });
}

function createFloatingCard(
  width: number,
  height: number,
  depth: number,
  radius: number,
  texture: THREE.Texture,
  renderOrder: number,
  shadowTexture: THREE.Texture,
) {
  const group = new THREE.Group();
  const halfW = width / 2;
  const halfH = height / 2;
  const r = Math.min(radius, halfW * 0.4, halfH * 0.4);

  const shape = new THREE.Shape();
  shape.moveTo(-halfW + r, -halfH);
  shape.lineTo(halfW - r, -halfH);
  shape.quadraticCurveTo(halfW, -halfH, halfW, -halfH + r);
  shape.lineTo(halfW, halfH - r);
  shape.quadraticCurveTo(halfW, halfH, halfW - r, halfH);
  shape.lineTo(-halfW + r, halfH);
  shape.quadraticCurveTo(-halfW, halfH, -halfW, halfH - r);
  shape.lineTo(-halfW, -halfH + r);
  shape.quadraticCurveTo(-halfW, -halfH, -halfW + r, -halfH);

  /*
   * Card Attendance sebelumnya technically sudah ExtrudeGeometry,
   * tapi depth 0.026 terlalu tipis untuk terbaca sebagai object 3D.
   *
   * BAST memakai depth sekitar 0.095, jadi kita pakai bahasa visual
   * yang sama di sini: body tebal, bevel nyata, edge material terpisah.
   */
  const actualDepth = Math.max(depth, 0.088);
  const bevelThickness = actualDepth * 0.18;

  const bodyGeometry = new THREE.ExtrudeGeometry(shape, {
    depth: actualDepth,
    steps: 1,
    bevelEnabled: true,
    bevelSegments: 6,
    bevelSize: bevelThickness,
    bevelThickness,
    curveSegments: 24,
  });

  /*
   * Center body around local Z=0 supaya semua pose/rotation lama
   * tetap terasa sama; hanya volume fisiknya yang bertambah.
   */
  bodyGeometry.translate(0, 0, -actualDepth / 2);

  const frontMaterial = new THREE.MeshPhysicalMaterial({
    color: "#fbfffd",
    roughness: 0.17,
    metalness: 0,
    transmission: 0.22,
    thickness: 0.09,
    ior: 1.44,
    clearcoat: 1,
    clearcoatRoughness: 0.075,
    envMapIntensity: 1.05,
  });

  const sideMaterial = new THREE.MeshPhysicalMaterial({
    color: "#d8eee5",
    roughness: 0.2,
    metalness: 0.04,
    transmission: 0.14,
    thickness: 0.12,
    ior: 1.44,
    clearcoat: 1,
    clearcoatRoughness: 0.065,
    envMapIntensity: 1.18,
  });

  const body = new THREE.Mesh(bodyGeometry, [
    frontMaterial,
    sideMaterial,
  ]);

  body.renderOrder = renderOrder - 2;
  group.add(body);

  /*
   * Soft local shadow seperti floating cards BAST.
   * Shadow ikut card group sehingga kedalaman tetap terbaca
   * saat magnetic parallax mengubah pose card.
   */
  const shadowGeometry = new THREE.PlaneGeometry(
    width * 1.04,
    Math.max(height * 0.42, 0.34),
  );

  const shadowMaterial = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    opacity: 0.34,
    depthWrite: false,
    depthTest: true,
    toneMapped: false,
    side: THREE.DoubleSide,
  });

  const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
  shadow.position.set(
    width * 0.018,
    -height * 0.14,
    -actualDepth / 2 - bevelThickness - 0.035,
  );
  shadow.renderOrder = renderOrder - 3;
  group.add(shadow);

  /*
   * Printed UI lives in front of the bevel, not inside the body.
   * Ini penting supaya print tidak kelihatan "tenggelam".
   */
  const frontZ =
    actualDepth / 2 +
    bevelThickness +
    0.012;

  const faceGeometry = new THREE.PlaneGeometry(
    width * 0.94,
    height * 0.92,
  );

  const faceMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.005,
    depthTest: true,
    depthWrite: false,
    toneMapped: false,
    side: THREE.DoubleSide,
  });

  const face = new THREE.Mesh(faceGeometry, faceMaterial);
  face.position.z = frontZ;
  face.renderOrder = renderOrder;
  group.add(face);

  return {
    group,
    resources: {
      geometries: [
        bodyGeometry,
        shadowGeometry,
        faceGeometry,
      ],
      materials: [
        frontMaterial,
        sideMaterial,
        shadowMaterial,
        faceMaterial,
      ],
      textures: [texture],
    },
  };
}

function createImacScreenOverlay(
  imac: THREE.Object3D,
  dashboardTexture: THREE.Texture,
) {
  let panel: THREE.Object3D | undefined =
    imac.getObjectByName("sm_monitor_01_m_monitor_01_0") ??
    imac.getObjectByName("sm_monitor_01") ??
    undefined;

  if (!panel) {
    imac.traverse((child) => {
      if (panel) {
        return;
      }

      if (
        child instanceof THREE.Mesh &&
        child.name.toLowerCase().includes("monitor")
      ) {
        panel = child;
      }
    });
  }

  if (!panel) {
    return null;
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [
        -29.7, -6.85, 50.8,
        -29.7, -11.68, 17.6,
        29.7, -6.85, 50.8,
        29.7, -11.68, 17.6,
      ],
      3,
    ),
  );

  geometry.setAttribute(
    "uv",
    new THREE.Float32BufferAttribute(
      [
        0, 1,
        0, 0,
        1, 1,
        1, 0,
      ],
      2,
    ),
  );

  geometry.setIndex([0, 1, 2, 2, 1, 3]);
  geometry.computeVertexNormals();

  const material = new THREE.MeshBasicMaterial({
    map: dashboardTexture,
    side: THREE.DoubleSide,
    toneMapped: false,
  });

  const screen = new THREE.Mesh(geometry, material);
  screen.renderOrder = 6;
  panel.add(screen);

  return {
    geometry,
    material,
    texture: dashboardTexture,
  };
}

function createShadowSprite(
  texture: THREE.Texture,
  width: number,
  height: number,
  opacity: number,
) {
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity,
    depthWrite: false,
    depthTest: false,
    toneMapped: false,
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(width, height, 1);

  return {
    sprite,
    material,
  };
}

function createGlowSprite(
  texture: THREE.Texture,
  width: number,
  height: number,
  opacity: number,
) {
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity,
    depthWrite: false,
    depthTest: false,
    toneMapped: false,
    blending: THREE.AdditiveBlending,
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(width, height, 1);

  return {
    sprite,
    material,
  };
}

/* =========================================================
   MATERIAL STYLING
========================================================= */

function styleImac(object: THREE.Object3D) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }

    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    materials.forEach((material) => {
      if (!(material instanceof THREE.MeshStandardMaterial)) {
        return;
      }

      const name = material.name.trim().toLowerCase();

      if (
        name.includes("silver") ||
        name.includes("metal") ||
        name.includes("stand") ||
        name.includes("body") ||
        name.includes("aluminium") ||
        name.includes("aluminum")
      ) {
        material.map = null;
        material.color.set("#d8ddd9");
        material.metalness = 0.56;
        material.roughness = 0.34;
      } else if (
        name.includes("black") ||
        name.includes("bezel") ||
        name.includes("frame")
      ) {
        material.map = null;
        material.color.set("#171c1b");
        material.metalness = 0.28;
        material.roughness = 0.32;
      } else {
        material.metalness = Math.min(material.metalness ?? 0.5, 0.56);
        material.roughness = Math.max(material.roughness ?? 0.3, 0.3);
      }

      material.needsUpdate = true;
    });
  });
}

function styleScanner(
  object: THREE.Object3D,
  screenTexture: THREE.Texture,
) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }

    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    materials.forEach((material) => {
      if (!(material instanceof THREE.MeshStandardMaterial)) {
        return;
      }

      const name = material.name.trim().toLowerCase();

      if (["base", "black shiny", "blackest black"].includes(name)) {
        material.map = null;
        material.color.set("#101916");
        material.metalness = 0.55;
        material.roughness = 0.22;
      }

      if (["gray", "light gray"].includes(name)) {
        material.map = null;
        material.color.set("#bcc9c3");
        material.metalness = 0.72;
        material.roughness = 0.24;
      }

      if (name === "gold") {
        material.map = null;
        material.color.set("#21c983");
        material.emissive.set("#0a7047");
        material.emissiveIntensity = 0.44;
        material.metalness = 0.42;
        material.roughness = 0.24;
      }

      if (name === "screen") {
        material.map = screenTexture;
        material.color.set("#ffffff");
        material.emissive.set("#0a3525");
        material.emissiveIntensity = 0.25;
        material.metalness = 0;
        material.roughness = 0.3;
      }

      material.needsUpdate = true;
    });
  });
}

function softenBadge(object: THREE.Object3D) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }

    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    materials.forEach((material) => {
      if (!(material instanceof THREE.MeshStandardMaterial)) {
        return;
      }

      material.metalness = Math.min(material.metalness ?? 0, 0.18);
      material.roughness = Math.max(material.roughness ?? 0.4, 0.36);
      material.needsUpdate = true;
    });
  });
}

/* =========================================================
   DASHBOARD IMAGE LOADER
========================================================= */

async function loadDashboardTexture(
  dashboardImageUrl?: string | null,
) {
  if (!dashboardImageUrl) {
    return createFallbackDashboardTexture();
  }

  try {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");

    const texture = await loader.loadAsync(dashboardImageUrl);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    return texture;
  } catch {
    return createFallbackDashboardTexture();
  }
}

/* =========================================================
   COMPONENT
========================================================= */

export default function AttendanceEditorialScene({
  label,
  dashboardImageUrl,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

useEffect(() => {
  const currentHost = hostRef.current;

  if (!currentHost) {
    return;
  }

  // Guaranteed non-null for every nested function / async closure.
  const hostElement: HTMLDivElement = currentHost;

  let disposed = false;
  
    let resizeObserver: ResizeObserver | undefined;
    let visibilityObserver: IntersectionObserver | undefined;
    let renderer: THREE.WebGLRenderer | undefined;
    let environment: THREE.WebGLRenderTarget | undefined;
    let animationFrameId = 0;
    let cleanupPointerMotion: (() => void) | undefined;
    let visible = true;

    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    const textures = new Set<THREE.Texture>();

    function trackGeometry(geometry: THREE.BufferGeometry) {
      geometries.add(geometry);
    }

    function trackMaterial(material: THREE.Material) {
      materials.add(material);
    }

    function trackTexture(texture: THREE.Texture) {
      textures.add(texture);
    }

    function collectObject(object: THREE.Object3D) {
      object.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) {
          return;
        }

        geometries.add(child.geometry);

        const currentMaterials = Array.isArray(child.material)
          ? child.material
          : [child.material];

        currentMaterials.forEach((material) => {
          materials.add(material);

          Object.values(material).forEach((value) => {
            if (value instanceof THREE.Texture) {
              textures.add(value);
            }
          });
        });

        child.castShadow = false;
        child.receiveShadow = false;
      });
    }

    function disposeAssets() {
      textures.forEach((texture) => texture.dispose());
      materials.forEach((material) => material.dispose());
      geometries.forEach((geometry) => geometry.dispose());

      textures.clear();
      materials.clear();
      geometries.clear();
    }

    async function initialize() {
      try {
        const loader = new GLTFLoader();

        const [imacGltf, scannerGltf, badgeGltf, dashboardTexture] =
          await Promise.all([
            loader.loadAsync(IMAC_MODEL_URL),
            loader.loadAsync(SCANNER_MODEL_URL),
            loader.loadAsync(BADGE_MODEL_URL),
            loadDashboardTexture(dashboardImageUrl),
          ]);

        if (disposed) {
          return;
        }

        const scannerScreenTexture = createScannerScreenTexture();
        const shadowTexture = createShadowTexture();
        const glowTexture = createGlowTexture();

        trackTexture(dashboardTexture);
        trackTexture(scannerScreenTexture);
        trackTexture(shadowTexture);
        trackTexture(glowTexture);

        styleImac(imacGltf.scene);
        styleScanner(scannerGltf.scene, scannerScreenTexture);
        softenBadge(badgeGltf.scene);

        collectObject(imacGltf.scene);
        collectObject(scannerGltf.scene);
        collectObject(badgeGltf.scene);

        const scene = new THREE.Scene();

        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        });

        const webgl = renderer;

        webgl.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
        webgl.outputColorSpace = THREE.SRGBColorSpace;
        webgl.toneMapping = THREE.ACESFilmicToneMapping;
        webgl.toneMappingExposure = 1.06;
        webgl.setClearColor(0x000000, 0);
        webgl.domElement.setAttribute("aria-label", label);
        webgl.domElement.style.width = "100%";
        webgl.domElement.style.height = "100%";
        webgl.domElement.style.display = "block";
        webgl.domElement.style.pointerEvents = "none";

        hostElement.appendChild(webgl.domElement);

        const camera = new THREE.PerspectiveCamera(
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

        const pmrem = new THREE.PMREMGenerator(webgl);
        environment = pmrem.fromScene(new RoomEnvironment(), 0.04);
        pmrem.dispose();

        scene.environment = environment.texture;

        scene.add(new THREE.HemisphereLight(0xffffff, 0xc8ddd1, 1.45));

        const keyLight = new THREE.DirectionalLight(0xffffff, 2.45);
        keyLight.position.set(-5, 6.5, 8.5);
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0xc8f4de, 1.2);
        fillLight.position.set(5.5, 1.4, 5.2);
        scene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(0xe6fff6, 0.92);
        rimLight.position.set(2.6, 4.6, -4.2);
        scene.add(rimLight);

        const sceneGlow = createGlowSprite(glowTexture, 8.55, 5.72, 0.47);
        sceneGlow.sprite.position.set(1.92, 0.18, -0.85);
        scene.add(sceneGlow.sprite);
        trackMaterial(sceneGlow.material);

        const composition = new THREE.Group();
        scene.add(composition);

        const floatingNodes: Array<{
          object: THREE.Object3D;
          basePosition: THREE.Vector3;
          baseRotation: THREE.Euler;
          speed: number;
          amplitude: number;
          rotationAmplitude: number;
        }> = [];

        /* IMAC */
        const imac = createNormalizedModel(imacGltf.scene, IMAC_TARGET_SIZE);

        const screenOverlayResources = createImacScreenOverlay(
          imac,
          dashboardTexture,
        );

        if (screenOverlayResources) {
          trackGeometry(screenOverlayResources.geometry);
          trackMaterial(screenOverlayResources.material);
          trackTexture(screenOverlayResources.texture);
        }

        freezeStaticDescendants(imac);

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

        composition.add(imac);

        const imacShadow = createShadowSprite(shadowTexture, 4.9, 1.32, 0.24);
        imacShadow.sprite.position.set(1.18, -2.38, -0.7);
        composition.add(imacShadow.sprite);
        trackMaterial(imacShadow.material);

        /* SCANNER */
        const scanner = createNormalizedModel(
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

        freezeStaticDescendants(scanner);
        composition.add(scanner);

        const scannerShadow = createShadowSprite(shadowTexture, 2.08, 0.72, 0.2);
        scannerShadow.sprite.position.set(2.76, -2.72, 1.38);
        composition.add(scannerShadow.sprite);
        trackMaterial(scannerShadow.material);

        floatingNodes.push({
          object: scanner,
          basePosition: scanner.position.clone(),
          baseRotation: scanner.rotation.clone(),
          speed: 1.18,
          amplitude: 0.03,
          rotationAmplitude: 0.01,
        });

        /* BADGE */
        const badge = createNormalizedModel(badgeGltf.scene, BADGE_TARGET_SIZE);

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

        freezeStaticDescendants(badge);
        composition.add(badge);

        const badgeShadow = createShadowSprite(shadowTexture, 1.28, 0.42, 0.12);
        badgeShadow.sprite.position.set(-0.92, -2.22, 1.42);
        composition.add(badgeShadow.sprite);
        trackMaterial(badgeShadow.material);

        floatingNodes.push({
          object: badge,
          basePosition: badge.position.clone(),
          baseRotation: badge.rotation.clone(),
          speed: 1.0,
          amplitude: 0.028,
          rotationAmplitude: 0.008,
        });

        /* TOTAL ATTENDANCE */
        const totalCardData = createFloatingCard(
          2.38,
          1.08,
          0.092,
          0.16,
          createTotalAttendanceTexture(),
          10,
          shadowTexture,
        );

        totalCardData.group.position.set(
          TOTAL_CARD_POSITION.x,
          TOTAL_CARD_POSITION.y,
          TOTAL_CARD_POSITION.z,
        );

        totalCardData.group.rotation.set(
          TOTAL_CARD_ROTATION.x,
          TOTAL_CARD_ROTATION.y,
          TOTAL_CARD_ROTATION.z,
        );

        freezeStaticDescendants(totalCardData.group);
        composition.add(totalCardData.group);

        totalCardData.resources.geometries.forEach(trackGeometry);
        totalCardData.resources.materials.forEach(trackMaterial);
        totalCardData.resources.textures.forEach(trackTexture);

        floatingNodes.push({
          object: totalCardData.group,
          basePosition: totalCardData.group.position.clone(),
          baseRotation: totalCardData.group.rotation.clone(),
          speed: 0.92,
          amplitude: 0.038,
          rotationAmplitude: 0.009,
        });

        /* QUOTE CARD */
        const quoteCardData = createFloatingCard(
          1.46,
          2.34,
          0.094,
          0.18,
          createQuoteCardTexture(),
          11,
          shadowTexture,
        );

        quoteCardData.group.position.set(
          QUOTE_CARD_POSITION.x,
          QUOTE_CARD_POSITION.y,
          QUOTE_CARD_POSITION.z,
        );

        quoteCardData.group.rotation.set(
          QUOTE_CARD_ROTATION.x,
          QUOTE_CARD_ROTATION.y,
          QUOTE_CARD_ROTATION.z,
        );

        freezeStaticDescendants(quoteCardData.group);
        composition.add(quoteCardData.group);

        quoteCardData.resources.geometries.forEach(trackGeometry);
        quoteCardData.resources.materials.forEach(trackMaterial);
        quoteCardData.resources.textures.forEach(trackTexture);

        floatingNodes.push({
          object: quoteCardData.group,
          basePosition: quoteCardData.group.position.clone(),
          baseRotation: quoteCardData.group.rotation.clone(),
          speed: 0.84,
          amplitude: 0.028,
          rotationAmplitude: 0.007,
        });

        /* CONNECT CARD */
        const connectCardData = createFloatingCard(
          1.2,
          2.04,
          0.09,
          0.18,
          createConnectCardTexture(),
          9,
          shadowTexture,
        );

        connectCardData.group.position.set(
          CONNECT_CARD_POSITION.x,
          CONNECT_CARD_POSITION.y,
          CONNECT_CARD_POSITION.z,
        );

        connectCardData.group.rotation.set(
          CONNECT_CARD_ROTATION.x,
          CONNECT_CARD_ROTATION.y,
          CONNECT_CARD_ROTATION.z,
        );

        freezeStaticDescendants(connectCardData.group);
        composition.add(connectCardData.group);

        connectCardData.resources.geometries.forEach(trackGeometry);
        connectCardData.resources.materials.forEach(trackMaterial);
        connectCardData.resources.textures.forEach(trackTexture);

        floatingNodes.push({
          object: connectCardData.group,
          basePosition: connectCardData.group.position.clone(),
          baseRotation: connectCardData.group.rotation.clone(),
          speed: 1.0,
          amplitude: 0.026,
          rotationAmplitude: 0.007,
        });

        /* CHECK-IN CARD */
const checkInCardData = createFloatingCard(
  2.88,
  0.9,
  0.096,
  0.14,
  createCheckInTexture(),
  12,
  shadowTexture,
);

        checkInCardData.group.position.set(
          CHECKIN_CARD_POSITION.x,
          CHECKIN_CARD_POSITION.y,
          CHECKIN_CARD_POSITION.z,
        );

        checkInCardData.group.rotation.set(
          CHECKIN_CARD_ROTATION.x,
          CHECKIN_CARD_ROTATION.y,
          CHECKIN_CARD_ROTATION.z,
        );

        freezeStaticDescendants(checkInCardData.group);
        composition.add(checkInCardData.group);

        checkInCardData.resources.geometries.forEach(trackGeometry);
        checkInCardData.resources.materials.forEach(trackMaterial);
        checkInCardData.resources.textures.forEach(trackTexture);

        floatingNodes.push({
          object: checkInCardData.group,
          basePosition: checkInCardData.group.position.clone(),
          baseRotation: checkInCardData.group.rotation.clone(),
          speed: 0.94,
          amplitude: 0.026,
          rotationAmplitude: 0.006,
        });

        /* =====================================================
           3D MAGNETIC PARALLAX

           Same interaction language as BAST + Spall:
           - hero hardware follows the pointer
           - supporting hardware/cards move in the opposite direction
           - idle floating stays active underneath the pointer pose
        ===================================================== */

        const cover = hostElement.closest<HTMLElement>(
          '[data-attendance-featured="true"]',
        );

        const reducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        );

        const finePointer = window.matchMedia(
          "(hover: hover) and (pointer: fine)",
        );

        const targetPointer = new THREE.Vector2(0, 0);
        const currentPointer = new THREE.Vector2(0, 0);

        let previousMotionFrameTime = 0;

        const imacShadowBase = imacShadow.sprite.position.clone();
        const scannerShadowBase = scannerShadow.sprite.position.clone();
        const badgeShadowBase = badgeShadow.sprite.position.clone();

        function applyPointerPose() {
          const x = currentPointer.x;
          const y = currentPointer.y;
          const depth = Math.abs(x);

          /* iMac — hero, follows pointer. */
          imac.position.set(
            IMAC_POSITION.x + x * 0.18,
            IMAC_POSITION.y - y * 0.105,
            IMAC_POSITION.z + depth * 0.035,
          );

          imac.rotation.set(
            IMAC_ROTATION.x + y * 0.028,
            IMAC_ROTATION.y + x * 0.068,
            IMAC_ROTATION.z - x * 0.012,
          );

          imacShadow.sprite.position.set(
            imacShadowBase.x + x * 0.14,
            imacShadowBase.y - y * 0.055,
            imacShadowBase.z,
          );

          /* Scanner — foreground, opposing. */
          scanner.position.x -= x * 0.165;
          scanner.position.y += y * 0.09;
          scanner.position.z -= depth * 0.032;

          scanner.rotation.x -= y * 0.024;
          scanner.rotation.y -= x * 0.06;
          scanner.rotation.z += x * 0.012;

          scannerShadow.sprite.position.set(
            scannerShadowBase.x - x * 0.125,
            scannerShadowBase.y + y * 0.05,
            scannerShadowBase.z,
          );

          /* Badge — opposing, slightly calmer. */
          badge.position.x -= x * 0.115;
          badge.position.y += y * 0.068;
          badge.position.z -= depth * 0.02;

          badge.rotation.x -= y * 0.017;
          badge.rotation.y -= x * 0.038;
          badge.rotation.z += x * 0.009;

          badgeShadow.sprite.position.set(
            badgeShadowBase.x - x * 0.09,
            badgeShadowBase.y + y * 0.042,
            badgeShadowBase.z,
          );

          /* Total attendance card. */
          totalCardData.group.position.x -= x * 0.12;
          totalCardData.group.position.y += y * 0.072;
          totalCardData.group.position.z -= depth * 0.018;

          totalCardData.group.rotation.x -= y * 0.016;
          totalCardData.group.rotation.y -= x * 0.032;
          totalCardData.group.rotation.z += x * 0.01;

          /* Quote card. */
          quoteCardData.group.position.x -= x * 0.13;
          quoteCardData.group.position.y += y * 0.078;
          quoteCardData.group.position.z -= depth * 0.021;

          quoteCardData.group.rotation.x -= y * 0.018;
          quoteCardData.group.rotation.y -= x * 0.036;
          quoteCardData.group.rotation.z += x * 0.011;

          /* Connect card. */
          connectCardData.group.position.x -= x * 0.145;
          connectCardData.group.position.y += y * 0.085;
          connectCardData.group.position.z -= depth * 0.024;

          connectCardData.group.rotation.x -= y * 0.019;
          connectCardData.group.rotation.y -= x * 0.04;
          connectCardData.group.rotation.z += x * 0.012;

          /* Check-in card — closest supporting UI, strongest depth. */
          checkInCardData.group.position.x -= x * 0.17;
          checkInCardData.group.position.y += y * 0.098;
          checkInCardData.group.position.z -= depth * 0.03;

          checkInCardData.group.rotation.x -= y * 0.022;
          checkInCardData.group.rotation.y -= x * 0.048;
          checkInCardData.group.rotation.z += x * 0.014;
        }

        function handlePointerMove(event: PointerEvent) {
          if (
            !cover ||
            event.pointerType === "touch" ||
            reducedMotion.matches ||
            !finePointer.matches
          ) {
            return;
          }

          const bounds = cover.getBoundingClientRect();

          if (bounds.width <= 0 || bounds.height <= 0) {
            return;
          }

          targetPointer.set(
            THREE.MathUtils.clamp(
              ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
              -1,
              1,
            ),
            THREE.MathUtils.clamp(
              ((event.clientY - bounds.top) / bounds.height) * 2 - 1,
              -1,
              1,
            ),
          );
        }

        function resetPointer() {
          targetPointer.set(0, 0);

          if (reducedMotion.matches || !finePointer.matches) {
            currentPointer.set(0, 0);
            previousMotionFrameTime = 0;
          }
        }

        cover?.addEventListener("pointermove", handlePointerMove, {
          passive: true,
        });
        cover?.addEventListener("pointerleave", resetPointer);
        cover?.addEventListener("pointercancel", resetPointer);
        reducedMotion.addEventListener("change", resetPointer);
        finePointer.addEventListener("change", resetPointer);
        window.addEventListener("blur", resetPointer);

        cleanupPointerMotion = () => {
          cover?.removeEventListener("pointermove", handlePointerMove);
          cover?.removeEventListener("pointerleave", resetPointer);
          cover?.removeEventListener("pointercancel", resetPointer);
          reducedMotion.removeEventListener("change", resetPointer);
          finePointer.removeEventListener("change", resetPointer);
          window.removeEventListener("blur", resetPointer);
        };

        function renderFrame(time: number) {
          if (disposed || !visible) {
            animationFrameId = 0;
            previousMotionFrameTime = 0;
            return;
          }

          const t = time * 0.001;

          const delta = previousMotionFrameTime
            ? Math.min((time - previousMotionFrameTime) / 1000, 0.05)
            : 1 / 60;

          previousMotionFrameTime = time;

          currentPointer.lerp(
            targetPointer,
            1 - Math.exp(-7.2 * delta),
          );

          if (currentPointer.distanceTo(targetPointer) < 0.00045) {
            currentPointer.copy(targetPointer);
          }

          floatingNodes.forEach((node, index) => {
            const offset = Math.sin(t * node.speed + index * 0.85);
            const twist = Math.cos(t * node.speed * 0.8 + index * 0.65);

            node.object.position.x = node.basePosition.x;
            node.object.position.y =
              node.basePosition.y + offset * node.amplitude;
            node.object.position.z = node.basePosition.z;

            node.object.rotation.x =
              node.baseRotation.x +
              (node.object !== scanner && node.object !== badge
                ? offset * node.rotationAmplitude * 0.35
                : 0);

            node.object.rotation.y = node.baseRotation.y;
            node.object.rotation.z =
              node.baseRotation.z + twist * node.rotationAmplitude;
          });

          applyPointerPose();

          webgl.render(scene, camera);
          animationFrameId = window.requestAnimationFrame(renderFrame);
        }

        function resize() {
          const width = hostElement.clientWidth;
          const height = hostElement.clientHeight;

          if (!width || !height) {
            return;
          }

          webgl.setSize(width, height, false);

          camera.aspect = width / height;
          camera.fov = CAMERA_FOV;

          const tangent = Math.tan(
            THREE.MathUtils.degToRad(CAMERA_FOV) / 2,
          );

          const verticalFitDistance = CAMERA_FIT_HALF_HEIGHT / tangent;
          const horizontalFitDistance =
            CAMERA_FIT_HALF_WIDTH / (tangent * camera.aspect);

          const fittedDistance = Math.max(
            CAMERA_BASE_DISTANCE,
            verticalFitDistance,
            horizontalFitDistance,
          );

          const dx = CAMERA_POSITION.x - CAMERA_TARGET.x;
          const dy = CAMERA_POSITION.y - CAMERA_TARGET.y;
          const dz = CAMERA_POSITION.z - CAMERA_TARGET.z;

          const distanceScale = fittedDistance / CAMERA_BASE_DISTANCE;

          camera.position.set(
            CAMERA_TARGET.x + dx * distanceScale,
            CAMERA_TARGET.y + dy * distanceScale,
            CAMERA_TARGET.z + dz * distanceScale,
          );

          camera.lookAt(
            CAMERA_TARGET.x,
            CAMERA_TARGET.y,
            CAMERA_TARGET.z,
          );

          camera.updateProjectionMatrix();
          webgl.render(scene, camera);
        }

        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(hostElement);

        if (typeof IntersectionObserver !== "undefined") {
          visibilityObserver = new IntersectionObserver(
            ([entry]) => {
              visible = Boolean(entry?.isIntersecting);

              if (!visible) {
                if (animationFrameId) {
                  window.cancelAnimationFrame(animationFrameId);
                  animationFrameId = 0;
                }

                previousMotionFrameTime = 0;
                return;
              }

              webgl.render(scene, camera);

              if (!animationFrameId) {
                animationFrameId =
                  window.requestAnimationFrame(renderFrame);
              }
            },
            {
              root: null,
              rootMargin: "120px 0px",
              threshold: 0.01,
            },
          );

          visibilityObserver.observe(hostElement);
        }

        resize();
        animationFrameId = window.requestAnimationFrame(renderFrame);
      } catch {
        if (!disposed) {
          setFailed(true);
        }
      }
    }

    initialize();

    return () => {
      disposed = true;

      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }

      cleanupPointerMotion?.();
      resizeObserver?.disconnect();
      visibilityObserver?.disconnect();

      if (renderer) {
        renderer.dispose();

        if (renderer.domElement.parentNode === hostElement) {
          hostElement.removeChild(renderer.domElement);
        }
      }

      if (environment) {
        environment.dispose();
      }

      disposeAssets();
    };
  }, [dashboardImageUrl, label]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      style={{
        width: "100%",
        height: "100%",
        opacity: failed ? 0.86 : 1,
      }}
    />
  );
}