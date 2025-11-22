import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fcd34d",
          color: "#111827",
          fontSize: 90,
          fontWeight: 700,
          fontFamily: "Geist, Arial, sans-serif",
          letterSpacing: "-6px",
        }}
      >
        SS
      </div>
    ),
    size,
  );
}

