import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 8,
          position: "relative",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 20,
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
            top: 5,
            right: 5,
            width: 6,
            height: 6,
            borderRadius: 999,
            background: "#ECB22E",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
