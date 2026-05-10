function DynamicBackground() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const baseFill = isDark ? "hsl(224,32%,9%)" : "hsl(220,30%,97%)";
  const shapeStroke = isDark ? "rgba(255,255,255,0.06)" : "rgba(80,60,120,0.08)";

  const orbs = [
    { color: isDark ? "rgba(168,85,247,0.45)"  : "rgba(139,92,246,0.30)",  top: "0%",    left: "0%",   w: 600, ax: [0,70,15,0],   ay: [0,50,-15,0],  dur: 18, delay: 0 },
    { color: isDark ? "rgba(236,72,153,0.35)"  : "rgba(217,70,140,0.22)",  top: "15%",   right: "0%",  w: 520, ax: [0,-60,-10,0], ay: [0,60,10,0],   dur: 22, delay: 3 },
    { color: isDark ? "rgba(251,146,60,0.30)"  : "rgba(249,115,22,0.20)",  bottom: "0%", left: "25%",  w: 480, ax: [0,50,-5,0],   ay: [0,-50,5,0],   dur: 19, delay: 6 },
    { color: isDark ? "rgba(56,189,248,0.28)"  : "rgba(14,165,233,0.18)",  bottom: "10%",left: "-5%",  w: 400, ax: [0,40,5,0],    ay: [0,-35,-5,0],  dur: 25, delay: 9 },
    { color: isDark ? "rgba(52,211,153,0.25)"  : "rgba(16,185,129,0.18)",  top: "40%",   right: "10%", w: 360, ax: [0,-30,8,0],   ay: [0,40,-8,0],   dur: 28, delay: 5 },
  ];

  const shapes = [
    { id:"cart",    viewBox:"0 0 24 24", d:"M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6M10 17a1 1 0 1 0 2 0 1 1 0 0 0-2 0M16 17a1 1 0 1 0 2 0 1 1 0 0 0-2 0", size:56, top:"12%",    left:"6%",    ax:[0,18,5,0],  ay:[0,12,-4,0],  dur:30, rot:-8  },
    { id:"tag",     viewBox:"0 0 24 24", d:"M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01",                                                   size:46, top:"55%",    right:"7%",   ax:[0,-16,-4,0],ay:[0,20,5,0],   dur:36, rot:16  },
    { id:"scale",   viewBox:"0 0 24 24", d:"M12 3v18M7 7l5 2 5-2M3 17l4-4 2 3 3-4 2 3 4-4M7 21h10",                                                                                     size:52, bottom:"28%", left:"55%",   ax:[0,10,-6,0], ay:[0,-14,-2,0], dur:32, rot:5   },
    { id:"leaf",    viewBox:"0 0 24 24", d:"M17 8C17 8 8 4 3 9C3 9 4 19 12 21C20 19 21 9 17 8ZM12 21V12",                                                                                size:42, top:"38%",    left:"40%",   ax:[0,14,3,0],  ay:[0,18,-2,0],  dur:40, rot:-20 },
    { id:"coin",    viewBox:"0 0 24 24", d:"M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM8.5 9h7M8.5 13H14M14 13L10.5 18M11 9a3 3 0 0 1 0 4",                                               size:48, bottom:"30%", right:"18%",  ax:[0,-12,4,0], ay:[0,-16,7,0],  dur:42, rot:0   },
    { id:"basket",  viewBox:"0 0 24 24", d:"M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0",                                                            size:50, top:"70%",    left:"20%",   ax:[0,8,-7,0],  ay:[0,-10,4,0],  dur:34, rot:9   },
    { id:"star",    viewBox:"0 0 24 24", d:"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",                                              size:36, top:"22%",    right:"22%",  ax:[0,-10,5,0], ay:[0,14,-3,0],  dur:38, rot:12  },
    { id:"box",     viewBox:"0 0 24 24", d:"M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM12 2v20M3.27 6.96 12 12.01l8.73-5.05", size:44, bottom:"12%", left:"42%",   ax:[0,12,-5,0], ay:[0,-8,6,0],   dur:26, rot:-6  },
  ];

  return (
    <>
      <div style={{ position:"fixed", inset:0, zIndex:0, backgroundColor:baseFill, pointerEvents:"none" }} aria-hidden />
      <div style={{ position:"fixed", inset:0, zIndex:1, overflow:"hidden", pointerEvents:"none" }} aria-hidden>

        {/* Gradient orbs */}
        {orbs.map((orb, i) => (
          <motion.div key={i} style={{
            position:"absolute", borderRadius:"50%", filter:"blur(80px)",
            width:orb.w, height:orb.w,
            top:(orb as any).top, bottom:(orb as any).bottom,
            left:(orb as any).left, right:(orb as any).right,
            background:`radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
          }}
            animate={{ x:orb.ax, y:orb.ay }}
            transition={{ duration:orb.dur, repeat:Infinity, ease:"easeInOut", delay:orb.delay, times:[0,0.33,0.66,1] }}
          />
        ))}

        {/* Dot grid */}
        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity: isDark ? 0.06 : 0.05 }}>
          <defs><pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="currentColor"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#dots)"/>
        </svg>

        {/* Floating market icons */}
        {shapes.map((shape) => (
          <motion.div key={shape.id} style={{
            position:"absolute",
            top:(shape as any).top, bottom:(shape as any).bottom,
            left:(shape as any).left, right:(shape as any).right,
            rotate:shape.rot,
          }}
            animate={{ x:shape.ax, y:shape.ay, rotate:[shape.rot, shape.rot+5, shape.rot-3, shape.rot] }}
            transition={{ duration:shape.dur, repeat:Infinity, ease:"easeInOut", times:[0,0.33,0.66,1] }}
          >
            <svg width={shape.size} height={shape.size} viewBox={shape.viewBox}
              fill="none" stroke={shapeStroke} strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round">
              <path d={shape.d}/>
            </svg>
          </motion.div>
        ))}

        {/* Subtle vignette */}
        <div style={{
          position:"absolute", inset:0,
          background: isDark
            ? "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.45) 100%)"
            : "radial-gradient(ellipse at center, transparent 40%, rgba(200,190,230,0.25) 100%)",
        }}/>
      </div>
    </>
  );
}