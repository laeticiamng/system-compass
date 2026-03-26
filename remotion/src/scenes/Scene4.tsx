import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700"], subsets: ["latin"] });

const rows = [
  { label: "Fiscalité", fr: 45, ch: 85 },
  { label: "Coût de la vie", fr: 55, ch: 40 },
  { label: "Sécurité", fr: 65, ch: 90 },
  { label: "Qualité de vie", fr: 72, ch: 88 },
  { label: "Visas", fr: 80, ch: 60 },
];

export const Scene4Compare: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Header */}
      <div style={{ opacity: headerOpacity, marginBottom: 50, textAlign: "center" }}>
        <div style={{ fontFamily, fontSize: 44, fontWeight: 600, color: "white" }}>
          🇫🇷 France vs 🇨🇭 Suisse
        </div>
        <div style={{ fontFamily, fontSize: 20, color: "rgba(255,255,255,0.5)", marginTop: 8 }}>
          Comparaison personnalisée
        </div>
      </div>

      {/* Comparison table */}
      <div style={{ width: 900, display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Column headers */}
        <div style={{ display: "flex", alignItems: "center", paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ width: 200, fontFamily, fontSize: 16, color: "rgba(255,255,255,0.4)" }}>Critère</div>
          <div style={{ flex: 1, fontFamily, fontSize: 16, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>🇫🇷 France</div>
          <div style={{ flex: 1, fontFamily, fontSize: 16, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>🇨🇭 Suisse</div>
        </div>

        {rows.map((row, i) => {
          const delay = i * 8 + 15;
          const opacity = interpolate(frame, [delay, delay + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const barAnimFr = interpolate(frame, [delay + 5, delay + 30], [0, row.fr], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const barAnimCh = interpolate(frame, [delay + 5, delay + 30], [0, row.ch], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

          return (
            <div key={row.label} style={{ display: "flex", alignItems: "center", opacity }}>
              <div style={{ width: 200, fontFamily, fontSize: 18, fontWeight: 500, color: "white" }}>
                {row.label}
              </div>
              {/* France bar */}
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, justifyContent: "center" }}>
                <div style={{ width: 200, height: 12, background: "rgba(255,255,255,0.08)", borderRadius: 6 }}>
                  <div style={{ width: `${barAnimFr}%`, height: "100%", background: "rgba(59,130,246,0.7)", borderRadius: 6 }} />
                </div>
                <span style={{ fontFamily, fontSize: 16, color: "rgba(255,255,255,0.6)", width: 40 }}>{row.fr}%</span>
              </div>
              {/* Switzerland bar */}
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, justifyContent: "center" }}>
                <div style={{ width: 200, height: 12, background: "rgba(255,255,255,0.08)", borderRadius: 6 }}>
                  <div style={{ width: `${barAnimCh}%`, height: "100%", background: "linear-gradient(90deg, #C27A1A, #E8A84C)", borderRadius: 6 }} />
                </div>
                <span style={{ fontFamily, fontSize: 16, color: "rgba(255,255,255,0.6)", width: 40 }}>{row.ch}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
