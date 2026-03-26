import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export const PersistentBackground: React.FC = () => {
  const frame = useCurrentFrame();
  
  const gradientAngle = interpolate(frame, [0, 450], [135, 200]);
  const orbY1 = interpolate(frame, [0, 450], [0, -60]);
  const orbY2 = interpolate(frame, [0, 450], [0, 40]);
  
  return (
    <AbsoluteFill>
      {/* Base gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(${gradientAngle}deg, #0F172A 0%, #1E293B 40%, #0F172A 100%)`,
        }}
      />
      
      {/* Gold orb top-right */}
      <div
        style={{
          position: "absolute",
          top: `${10 + Math.sin(frame * 0.02) * 5}%`,
          right: "8%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(194,122,26,0.25) 0%, transparent 70%)",
          filter: "blur(60px)",
          transform: `translateY(${orbY1}px)`,
        }}
      />
      
      {/* Blue orb bottom-left */}
      <div
        style={{
          position: "absolute",
          bottom: `${5 + Math.sin(frame * 0.015) * 4}%`,
          left: "5%",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
          filter: "blur(50px)",
          transform: `translateY(${orbY2}px)`,
        }}
      />
      
      {/* Grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.06,
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
    </AbsoluteFill>
  );
};
