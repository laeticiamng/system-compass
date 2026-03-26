import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700"], subsets: ["latin"] });

const stats = [
  { value: "80+", label: "Pays couverts", icon: "🌍" },
  { value: "12", label: "Dimensions analysées", icon: "📊" },
  { value: "2 min", label: "Test de profil", icon: "⚡" },
  { value: "100%", label: "Données vérifiées", icon: "✅" },
];

export const Scene3Stats: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Title */}
      <div
        style={{
          fontFamily,
          fontSize: 44,
          fontWeight: 600,
          color: "white",
          opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          marginBottom: 70,
          textAlign: "center",
        }}
      >
        Des données qui comptent
      </div>

      {/* Stats grid */}
      <div style={{ display: "flex", gap: 50 }}>
        {stats.map((stat, i) => {
          const delay = i * 10 + 10;
          const s = spring({ frame: frame - delay, fps, config: { damping: 12 } });
          const y = interpolate(s, [0, 1], [50, 0]);
          const opacity = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

          return (
            <div
              key={stat.label}
              style={{
                transform: `translateY(${y}px)`,
                opacity,
                textAlign: "center",
                width: 280,
              }}
            >
              <span style={{ fontSize: 52, display: "block", marginBottom: 16 }}>{stat.icon}</span>
              <span
                style={{
                  fontFamily,
                  fontSize: 64,
                  fontWeight: 700,
                  color: "#C27A1A",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                {stat.value}
              </span>
              <span
                style={{
                  fontFamily,
                  fontSize: 20,
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                {stat.label}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
