import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  const background = "#111827";
  const foreground = "#fcd34d";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background,
          color: foreground,
          fontSize: 220,
          fontWeight: 700,
          letterSpacing: "-12px",
          fontFamily: "Geist, Arial, sans-serif",
        }}
      >
        SS
      </div>
    ),
    size,
  );
}

