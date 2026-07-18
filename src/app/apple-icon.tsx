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
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#4A154B",
          borderRadius: 40,
          position: "relative",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 110,
            fontWeight: 800,
            fontFamily: "Georgia, Times New Roman, serif",
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          S
        </div>
        <div
          style={{
            position: "absolute",
            top: 28,
            right: 28,
            width: 28,
            height: 28,
            borderRadius: 999,
            background: "#ECB22E",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
