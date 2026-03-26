import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence } from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700"], subsets: ["latin"] });

export const Scene1Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Compass icon scale
  const iconScale = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });
  const iconRotate = interpolate(frame, [0, 60], [180, 0], { extrapolateRight: "clamp" });
  
  // Title entrance
  const titleY = interpolate(spring({ frame: frame - 15, fps, config: { damping: 20 } }), [0, 1], [60, 0]);
  const titleOpacity = interpolate(frame, [15, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  
  // Subtitle
  const subOpacity = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subY = interpolate(spring({ frame: frame - 30, fps, config: { damping: 20 } }), [0, 1], [40, 0]);
  
  // Gold line
  const lineWidth = interpolate(frame, [40, 70], [0, 300], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Compass icon */}
      <div
        style={{
          transform: `scale(${iconScale}) rotate(${iconRotate}deg)`,
          marginBottom: 40,
        }}
      >
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#C27A1A" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="#C27A1A" opacity="0.3" stroke="#C27A1A" />
        </svg>
      </div>
      
      {/* Title */}
      <div
        style={{
          fontFamily,
          fontSize: 88,
          fontWeight: 700,
          color: "white",
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
          textAlign: "center",
          letterSpacing: -2,
        }}
      >
        <span style={{ color: "#C27A1A" }}>Compass</span>
      </div>
      
      {/* Gold line */}
      <div
        style={{
          width: lineWidth,
          height: 3,
          background: "linear-gradient(90deg, transparent, #C27A1A, transparent)",
          marginTop: 20,
          marginBottom: 20,
          borderRadius: 2,
        }}
      />
      
      {/* Subtitle */}
      <div
        style={{
          fontFamily,
          fontSize: 32,
          fontWeight: 400,
          color: "rgba(255,255,255,0.7)",
          transform: `translateY(${subY}px)`,
          opacity: subOpacity,
          textAlign: "center",
          maxWidth: 700,
        }}
      >
        Votre boussole pour l'expatriation
      </div>
    </AbsoluteFill>
  );
};
