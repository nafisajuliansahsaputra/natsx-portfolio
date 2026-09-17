import * as THREE from "three";

export type IconKind = "identity" | "explore" | "share";

export function roundedRect(
  width: number,
  height: number,
  radius: number,
) {
  const shape = new THREE.Shape();

  const x = -width / 2;
  const y = -height / 2;

  const r = Math.min(
    radius,
    width / 2,
    height / 2,
  );

  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);

  shape.quadraticCurveTo(
    x + width,
    y,
    x + width,
    y + r,
  );

  shape.lineTo(
    x + width,
    y + height - r,
  );

  shape.quadraticCurveTo(
    x + width,
    y + height,
    x + width - r,
    y + height,
  );

  shape.lineTo(
    x + r,
    y + height,
  );

  shape.quadraticCurveTo(
    x,
    y + height,
    x,
    y + height - r,
  );

  shape.lineTo(
    x,
    y + r,
  );

  shape.quadraticCurveTo(
    x,
    y,
    x + r,
    y,
  );

  shape.closePath();

  return shape;
}

export function canvasTexture(
  draw: (
    context: CanvasRenderingContext2D,
  ) => void,
) {
  const canvas =
    document.createElement("canvas");

  canvas.width = 512;
  canvas.height = 512;

  const context =
    canvas.getContext("2d");

  if (!context) {
    throw new Error(
      "Canvas 2D unavailable.",
    );
  }

  draw(context);

  const texture =
    new THREE.CanvasTexture(canvas);

  texture.colorSpace =
    THREE.SRGBColorSpace;

  return texture;
}

export function iconTexture(
  kind: IconKind,
  light = false,
) {
  return canvasTexture(
    (context) => {
      const color =
        light
          ? "#e2e7d8"
          : "#234633";

      context.strokeStyle =
        color;

      context.fillStyle =
        color;

      context.lineWidth = 8;
      context.lineCap = "round";
      context.lineJoin = "round";

      if (
        kind ===
        "identity"
      ) {
        context.beginPath();

        context.arc(
          256,
          153,
          34,
          0,
          Math.PI * 2,
        );

        context.stroke();

        context.beginPath();

        context.moveTo(
          191,
          272,
        );

        context.lineTo(
          191,
          251,
        );

        context.bezierCurveTo(
          191,
          195,
          321,
          195,
          321,
          251,
        );

        context.lineTo(
          321,
          272,
        );

        context.closePath();

        context.stroke();
      }

      if (
        kind ===
        "explore"
      ) {
        for (
          let index = 0;
          index < 3;
          index++
        ) {
          const y =
            159 +
            index * 35;

          context.beginPath();

          context.moveTo(
            177,
            y,
          );

          context.lineTo(
            256,
            y + 41,
          );

          context.lineTo(
            335,
            y,
          );

          if (
            index === 0
          ) {
            context.lineTo(
              256,
              y - 41,
            );

            context.closePath();
          }

          context.stroke();
        }
      }

      if (
        kind ===
        "share"
      ) {
        context.save();

        context.translate(
          256,
          203,
        );

        context.rotate(
          -Math.PI / 4,
        );

        context.beginPath();

        context.roundRect(
          -94,
          -30,
          116,
          60,
          30,
        );

        context.stroke();

        context.beginPath();

        context.roundRect(
          -22,
          -30,
          116,
          60,
          30,
        );

        context.stroke();

        context.restore();
      }

      context.font =
        "500 31px Arial";

      context.textAlign =
        "center";

      context.fillText(
        kind.toUpperCase(),
        256,
        369,
      );
    },
  );
}

export function shadowTexture() {
  return canvasTexture(
    (context) => {
      const gradient =
        context.createRadialGradient(
          256,
          256,
          5,
          256,
          256,
          250,
        );

      gradient.addColorStop(
        0,
        "rgba(24,34,24,0.42)",
      );

      gradient.addColorStop(
        0.34,
        "rgba(24,34,24,0.18)",
      );

      gradient.addColorStop(
        0.68,
        "rgba(24,34,24,0.045)",
      );

      gradient.addColorStop(
        1,
        "rgba(24,34,24,0)",
      );

      context.fillStyle =
        gradient;

      context.fillRect(
        0,
        0,
        512,
        512,
      );
    },
  );
}