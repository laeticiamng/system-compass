import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700"], subsets: ["latin"] });

export const Scene5CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({ frame, fps, config: { damping: 15 } });
  const titleOpacity = interpolate(frame, [0, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const subOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subY = interpolate(spring({ frame: frame - 20, fps, config: { damping: 20 } }), [0, 1], [30, 0]);

  // Pulsating glow
  const glowOpacity = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.3, 0.7]);

  // URL fade in
  const urlOpacity = interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Central glow */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(194,122,26,0.2) 0%, transparent 70%)",
          filter: "blur(80px)",
          opacity: glowOpacity,
        }}
      />

      {/* Compass icon */}
      <div style={{ transform: `scale(${titleScale})`, opacity: titleOpacity, marginBottom: 30 }}>
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#C27A1A" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="#C27A1A" opacity="0.4" stroke="#C27A1A" />
        </svg>
      </div>

      {/* Title */}
      <div
        style={{
          fontFamily,
          fontSize: 64,
          fontWeight: 700,
          color: "white",
          transform: `scale(${titleScale})`,
          opacity: titleOpacity,
          textAlign: "center",
          letterSpacing: -1,
        }}
      >
        Trouvez <span style={{ color: "#C27A1A" }}>votre</span> pays
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontFamily,
          fontSize: 26,
          fontWeight: 400,
          color: "rgba(255,255,255,0.6)",
          transform: `translateY(${subY}px)`,
          opacity: subOpacity,
          marginTop: 20,
          textAlign: "center",
        }}
      >
        Test gratuit en 2 minutes
      </div>

      {/* URL */}
      <div
        style={{
          fontFamily,
          fontSize: 22,
          fontWeight: 500,
          color: "#C27A1A",
          opacity: urlOpacity,
          marginTop: 50,
          letterSpacing: 1,
        }}
      >
        world-alignment.lovable.app
      </div>
    </AbsoluteFill>
  );
};
