import {
  ImageResponse,
} from "next/og";

export const alt =
  "NATSX — Digital Creator";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType =
  "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width:
            "100%",

          height:
            "100%",

          padding:
            "62px 70px",

          background:
            "#f8f8f8",

          color:
            "#111111",

          display:
            "flex",

          flexDirection:
            "column",

          justifyContent:
            "space-between",

          fontFamily:
            "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display:
              "flex",

            justifyContent:
              "space-between",

            alignItems:
              "center",

            fontSize:
              22,

            fontWeight:
              700,
          }}
        >
          <span>
            NATSX
          </span>

          <span
            style={{
              color:
                "#707070",

              fontSize:
                18,
            }}
          >
            DIGITAL CREATOR /
            INDONESIA
          </span>
        </div>

        <div
          style={{
            display:
              "flex",

            flexDirection:
              "column",
          }}
        >
          <span
            style={{
              fontSize:
                106,

              lineHeight:
                0.9,

              letterSpacing:
                "-7px",

              fontWeight:
                700,
            }}
          >
            Designing Ideas
          </span>

          <div
            style={{
              display:
                "flex",

              alignItems:
                "flex-end",
            }}
          >
            <span
              style={{
                fontSize:
                  106,

                lineHeight:
                  0.9,

                letterSpacing:
                  "-7px",

                fontWeight:
                  700,
              }}
            >
              Into Experience
            </span>

            <span
              style={{
                color:
                  "#5862ec",

                fontSize:
                  108,

                lineHeight:
                  0.8,
              }}
            >
              .
            </span>
          </div>
        </div>

        <div
          style={{
            paddingTop:
              24,

            borderTop:
              "1px solid #dedede",

            display:
              "flex",

            justifyContent:
              "space-between",

            fontSize:
              18,
          }}
        >
          <span>
            DESIGN /
            DEVELOPMENT /
            MOTION
          </span>

          <span
            style={{
              color:
                "#5862ec",
            }}
          >
            N / 26
          </span>
        </div>
      </div>
    ),

    {
      ...size,
    },
  );
}