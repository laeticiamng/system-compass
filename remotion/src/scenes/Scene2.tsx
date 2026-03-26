import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700"], subsets: ["latin"] });

const countries = [
  { flag: "🇨🇭", name: "Suisse", score: 92 },
  { flag: "🇵🇹", name: "Portugal", score: 87 },
  { flag: "🇦🇪", name: "Émirats", score: 85 },
  { flag: "🇹🇭", name: "Thaïlande", score: 78 },
  { flag: "🇨🇦", name: "Canada", score: 81 },
];

export const Scene2Countries: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Header */}
      <div
        style={{
          fontFamily,
          fontSize: 48,
          fontWeight: 600,
          color: "white",
          opacity: headerOpacity,
          marginBottom: 60,
          textAlign: "center",
        }}
      >
        <span style={{ color: "#C27A1A" }}>80+</span> pays analysés
      </div>

      {/* Country cards row */}
      <div style={{ display: "flex", gap: 30 }}>
        {countries.map((country, i) => {
          const delay = i * 8 + 10;
          const cardScale = spring({ frame: frame - delay, fps, config: { damping: 15, stiffness: 120 } });
          const cardOpacity = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          
          // Score bar animation
          const barWidth = interpolate(frame, [delay + 15, delay + 40], [0, country.score], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          
          return (
            <div
              key={country.name}
              style={{
                background: "rgba(255,255,255,0.06)",
                borderRadius: 20,
                padding: "36px 32px",
                width: 280,
                border: "1px solid rgba(255,255,255,0.1)",
                transform: `scale(${cardScale})`,
                opacity: cardOpacity,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
              }}
            >
              <span style={{ fontSize: 56 }}>{country.flag}</span>
              <span style={{ fontFamily, fontSize: 22, fontWeight: 600, color: "white" }}>
                {country.name}
              </span>
              {/* Score bar */}
              <div style={{ width: "100%", height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 4 }}>
                <div
                  style={{
                    width: `${barWidth}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #C27A1A, #E8A84C)",
                    borderRadius: 4,
                  }}
                />
              </div>
              <span style={{ fontFamily, fontSize: 16, color: "rgba(255,255,255,0.5)" }}>
                Compatibilité {country.score}%
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
