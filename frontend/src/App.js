// import { useState, useCallback } from "react";

// // ─── Color mapping: blue (cold) → cyan → green → yellow → red (hot) ───
// function tempToColor(T, minT, maxT) {
//   const ratio = Math.max(0, Math.min(1, (T - minT) / (maxT - minT + 1e-9)));
//   let r, g, b;
//   if (ratio < 0.25) {
//     r = 0; g = Math.round(ratio * 4 * 255); b = 255;
//   } else if (ratio < 0.5) {
//     r = 0; g = 255; b = Math.round((1 - (ratio - 0.25) * 4) * 255);
//   } else if (ratio < 0.75) {
//     r = Math.round((ratio - 0.5) * 4 * 255); g = 255; b = 0;
//   } else {
//     r = 255; g = Math.round((1 - (ratio - 0.75) * 4) * 255); b = 0;
//   }
//   return `rgb(${r},${g},${b})`;
// }

// function tempTextColor(T, minT, maxT) {
//   const ratio = (T - minT) / (maxT - minT + 1e-9);
//   return ratio > 0.45 && ratio < 0.75 ? "#000" : "#fff";
// }

// // ─── NO solveFDM here — computation is done by C++ backend ────────────

// // ─── Main App ──────────────────────────────────────────────────────────
// export default function App() {
//   const [gridSize, setGridSize] = useState(4);
//   const [bTop,  setBTop]  = useState(500);
//   const [bBot,  setBBot]  = useState(100);
//   const [bLeft, setBLeft] = useState(100);
//   const [bRight,setBRight]= useState(100);
//   const [boxI,  setBoxI]  = useState(2);
//   const [boxJ,  setBoxJ]  = useState(2);

//   const [temps,   setTemps]   = useState(null);
//   const [result,  setResult]  = useState(null);
//   const [iters,   setIters]   = useState(0);
//   const [minT,    setMinT]    = useState(0);
//   const [maxT,    setMaxT]    = useState(500);
//   const [solved,  setSolved]  = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [apiError,setApiError]= useState(null);

//   // ── computeBox: runs on the received grid in JS (just 4 additions) ──
//   const computeBox = useCallback((T, N, bi, bj) => {
//     const i = parseInt(bi), j = parseInt(bj);
//     if (i < 1 || i > N || j < 1 || j > N) {
//       return { error: `Box (${i},${j}) out of range. Valid: 1–${N}` };
//     }
//     const TL = T[i - 1][j - 1];
//     const TR = T[i - 1][j];
//     const BL = T[i][j - 1];
//     const BR = T[i][j];
//     const centerT = (TL + TR + BL + BR) / 4;
//     return { TL, TR, BL, BR, centerT, i, j };
//   }, []);

//   // ── handleSolve: sends params to C++ backend via REST API ───────────
//   const handleSolve = async () => {
//     const N = parseInt(gridSize);
//     if (N < 2 || N > 30) return;

//     setLoading(true);
//     setSolved(false);
//     setTemps(null);
//     setResult(null);
//     setApiError(null);

//     try {
//       const response = await fetch("http://localhost:3001/solve", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           N,
//           top:    parseFloat(bTop),
//           bottom: parseFloat(bBot),
//           left:   parseFloat(bLeft),
//           right:  parseFloat(bRight),
//         }),
//       });

//       if (!response.ok) {
//         const err = await response.json();
//         throw new Error(err.error || `HTTP ${response.status}`);
//       }

//       // data.grid is (N+1)×(N+1) — same shape as the original JS solver
//       const data = await response.json();

//       setTemps(data.grid);
//       setIters(data.iterations);
//       setMinT(data.minT);
//       setMaxT(data.maxT);
//       setSolved(true);
//       setResult(computeBox(data.grid, N, boxI, boxJ));
//     } catch (err) {
//       setApiError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBoxClick = (bi, bj) => {
//     if (!temps) return;
//     setBoxI(bi);
//     setBoxJ(bj);
//     setResult(computeBox(temps, parseInt(gridSize), bi, bj));
//   };

//   const N = parseInt(gridSize);
//   const cellPx = Math.max(18, Math.min(54, Math.floor(380 / N)));
//   const showLabels = cellPx >= 32;

//   return (
//     <div style={{
//       minHeight: "100vh",
//       background: "#090d1a",
//       color: "#c9d1e0",
//       fontFamily: "'Courier New', Courier, monospace",
//       padding: "24px 16px",
//     }}>
//       {/* ── Title ── */}
//       <div style={{ textAlign: "center", marginBottom: 28 }}>
//         <div style={{
//           fontSize: 11, letterSpacing: 6, color: "#ff7f00", textTransform: "uppercase",
//           marginBottom: 6
//         }}>Numerical Methods — FDM Solver</div>
//         <h1 style={{
//           fontSize: "clamp(1.3rem, 3vw, 2rem)", fontWeight: 900, margin: 0,
//           background: "linear-gradient(90deg,#ff7f00,#ffcd44,#ff7f00)",
//           WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
//           letterSpacing: 2
//         }}>
//           2D STEADY-STATE HEAT CONDUCTION
//         </h1>
//         <div style={{ fontSize: 11, color: "#455070", marginTop: 6, letterSpacing: 3 }}>
//           ∂²T/∂x² + ∂²T/∂y² = 0 &nbsp;|&nbsp; C++ JACOBI FDM BACKEND
//         </div>
//       </div>

//       {/* ── Layout ── */}
//       <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start" }}>

//         {/* ─ Control Panel ─ */}
//         <div style={{
//           background: "#0e1425", border: "1px solid #1e2a40", borderRadius: 12,
//           padding: 20, minWidth: 230, maxWidth: 270
//         }}>
//           <SectionLabel>① Grid Setup</SectionLabel>
//           <Row label="Grid Size N×N">
//             <NumInput value={gridSize} min={2} max={30}
//               onChange={v => { setGridSize(v); setSolved(false); setTemps(null); setResult(null); }} />
//             <span style={{ color: "#455070", marginLeft: 6, fontSize: 11 }}>boxes</span>
//           </Row>
//           <div style={{ height: 16 }} />

//           <SectionLabel>② Boundary Temperatures</SectionLabel>
//           <div style={{ display: "grid", gap: 8 }}>
//             <BndInput label="🔴 Top"    color="#ff4444" value={bTop}   onChange={v => { setBTop(v);   setSolved(false); }} />
//             <BndInput label="🔵 Bottom" color="#4488ff" value={bBot}   onChange={v => { setBBot(v);   setSolved(false); }} />
//             <BndInput label="🟢 Left"   color="#44cc77" value={bLeft}  onChange={v => { setBLeft(v);  setSolved(false); }} />
//             <BndInput label="🟡 Right"  color="#ffbb22" value={bRight} onChange={v => { setBRight(v); setSolved(false); }} />
//           </div>
//           <div style={{ height: 16 }} />

//           <SectionLabel>③ Query Box (i, j)</SectionLabel>
//           <div style={{ fontSize: 11, color: "#455070", marginBottom: 8 }}>
//             Box row i and col j (1 to {N})
//           </div>
//           <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
//             <span style={{ color: "#ff7f00", fontSize: 13 }}>i =</span>
//             <NumInput value={boxI} min={1} max={N} onChange={setBoxI} small />
//             <span style={{ color: "#ff7f00", fontSize: 13, marginLeft: 8 }}>j =</span>
//             <NumInput value={boxJ} min={1} max={N} onChange={setBoxJ} small />
//           </div>
//           <div style={{ height: 18 }} />

//           <button
//             onClick={handleSolve}
//             disabled={loading}
//             style={{
//               width: "100%", padding: "10px 0",
//               background: loading
//                 ? "linear-gradient(135deg,#664400,#553300)"
//                 : "linear-gradient(135deg,#ff7f00,#e65c00)",
//               border: "none", borderRadius: 8, color: "#fff", fontWeight: 900, fontSize: 14,
//               letterSpacing: 2, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit",
//               boxShadow: "0 4px 20px rgba(255,127,0,0.3)", transition: "opacity .15s"
//             }}>
//             {loading ? "⏳ COMPUTING C++…" : "▶ SOLVE FDM"}
//           </button>

//           {solved && (
//             <div style={{ marginTop: 10, fontSize: 11, color: "#455070", textAlign: "center" }}>
//               Converged in <span style={{ color: "#ff7f00" }}>{iters}</span> iterations &nbsp;|&nbsp;
//               ({N + 1}×{N + 1} nodes)
//             </div>
//           )}

//           {/* C++ backend info badge */}
//           <div style={{
//             marginTop: 14, padding: "8px 10px",
//             background: "#0a1020", border: "1px solid #1a3020",
//             borderRadius: 8, fontSize: 10, color: "#336644", lineHeight: 1.7
//           }}>
//             <span style={{ color: "#44aa66" }}>⚡ C++ Backend</span><br />
//             Jacobi FDM · 5000 iter<br />
//             <span style={{ color: "#224433" }}>localhost:3001/solve</span>
//           </div>
//         </div>

//         {/* ─ Grid Visuals ─ */}
//         {temps && (
//           <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>

//             {/* Node grid */}
//             <GridPanel title="NODE TEMPERATURES" subtitle="Each cell = a grid node">
//               <GridTopBnd value={bTop} color="#ff4444" span={N + 1} cellPx={cellPx} />
//               <div style={{ display: "flex" }}>
//                 <BndLabel value={bLeft} color="#44cc77" vertical />
//                 <div>
//                   {Array.from({ length: N + 1 }, (_, i) => (
//                     <div key={i} style={{ display: "flex" }}>
//                       {Array.from({ length: N + 1 }, (_, j) => {
//                         const t = temps[i][j];
//                         const highlighted = result && !result.error &&
//                           ((i === result.i - 1 && j === result.j - 1) ||
//                            (i === result.i - 1 && j === result.j) ||
//                            (i === result.i     && j === result.j - 1) ||
//                            (i === result.i     && j === result.j));
//                         return (
//                           <div key={j} style={{
//                             width: cellPx, height: cellPx,
//                             background: highlighted ? "#ffcd44" : tempToColor(t, minT, maxT),
//                             border: highlighted ? "2.5px solid #ff7f00" : "1px solid rgba(0,0,0,0.25)",
//                             display: "flex", alignItems: "center", justifyContent: "center",
//                             fontSize: Math.max(7, cellPx / 5.5),
//                             color: highlighted ? "#000" : tempTextColor(t, minT, maxT),
//                             fontWeight: highlighted ? 900 : 600,
//                             boxSizing: "border-box", position: "relative",
//                             zIndex: highlighted ? 2 : 1,
//                             boxShadow: highlighted ? "0 0 8px #ff7f00" : "none",
//                             transition: "background .3s"
//                           }}>
//                             {showLabels ? t.toFixed(cellPx >= 46 ? 1 : 0) : ""}
//                           </div>
//                         );
//                       })}
//                     </div>
//                   ))}
//                 </div>
//                 <BndLabel value={bRight} color="#ffbb22" vertical right />
//               </div>
//               <GridBotBnd value={bBot} color="#4488ff" span={N + 1} cellPx={cellPx} />
//               <ColorScale minT={minT} maxT={maxT} />
//             </GridPanel>

//             {/* Box grid — clickable */}
//             <GridPanel title="BOX SELECTOR" subtitle="Click a box to query its center temp">
//               <GridTopBnd value={bTop} color="#ff4444" span={N} cellPx={cellPx} />
//               <div style={{ display: "flex" }}>
//                 <BndLabel value={bLeft} color="#44cc77" vertical />
//                 <div style={{ border: "1px solid #1e2a40" }}>
//                   {Array.from({ length: N }, (_, i) => (
//                     <div key={i} style={{ display: "flex" }}>
//                       {Array.from({ length: N }, (_, j) => {
//                         const avgT = (temps[i][j] + temps[i][j+1] + temps[i+1][j] + temps[i+1][j+1]) / 4;
//                         const sel  = result && !result.error && result.i === i + 1 && result.j === j + 1;
//                         return (
//                           <div key={j}
//                             onClick={() => handleBoxClick(i + 1, j + 1)}
//                             title={`Box (${i+1},${j+1}) — avg ≈ ${avgT.toFixed(2)}°C`}
//                             style={{
//                               width: cellPx, height: cellPx,
//                               background: sel
//                                 ? "rgba(255,205,68,0.55)"
//                                 : tempToColor(avgT, minT, maxT),
//                               border: sel ? "2.5px solid #ff7f00" : "1px solid rgba(0,0,0,0.3)",
//                               display: "flex", alignItems: "center", justifyContent: "center",
//                               fontSize: Math.max(7, cellPx / 6),
//                               color: sel ? "#000" : tempTextColor(avgT, minT, maxT),
//                               fontWeight: sel ? 900 : 500,
//                               cursor: "pointer", boxSizing: "border-box",
//                               boxShadow: sel ? "0 0 10px #ff7f00" : "none",
//                               transition: "all .2s",
//                             }}>
//                             {showLabels ? `(${i+1},${j+1})` : ""}
//                           </div>
//                         );
//                       })}
//                     </div>
//                   ))}
//                 </div>
//                 <BndLabel value={bRight} color="#ffbb22" vertical right />
//               </div>
//               <GridBotBnd value={bBot} color="#4488ff" span={N} cellPx={cellPx} />
//               <div style={{ fontSize: 10, color: "#455070", textAlign: "center", marginTop: 6 }}>
//                 Boxes colored by average of 4 corner node temps
//               </div>
//             </GridPanel>
//           </div>
//         )}
//       </div>

//       {/* ─ API Error ─ */}
//       {apiError && (
//         <div style={{
//           maxWidth: 480, margin: "24px auto",
//           background: "#1a0a0a", border: "1px solid #cc2222",
//           borderRadius: 10, padding: "16px 20px",
//           textAlign: "center", color: "#ff8888", fontSize: 13
//         }}>
//           <div style={{ fontSize: 15, marginBottom: 8 }}>⚠ Backend Error</div>
//           <div style={{ color: "#ff6666", marginBottom: 10 }}>{apiError}</div>
//           <div style={{ fontSize: 11, color: "#884444", lineHeight: 1.8 }}>
//             Make sure you have:<br />
//             1. Compiled: <code style={{ color: "#ffaa88" }}>g++ -O2 -o heat2d heat2d.cpp</code><br />
//             2. Started server: <code style={{ color: "#ffaa88" }}>node server.js</code><br />
//             3. Server running at <code style={{ color: "#ffaa88" }}>localhost:3001</code>
//           </div>
//         </div>
//       )}

//       {/* ─ Result Panel ─ */}
//       {result && !result.error && (
//         <div style={{
//           maxWidth: 560, margin: "28px auto 0",
//           background: "#0e1425", border: "1px solid #ff7f0066",
//           borderRadius: 14, padding: 24, boxShadow: "0 0 40px rgba(255,127,0,0.08)"
//         }}>
//           <div style={{ fontSize: 11, color: "#ff7f00", letterSpacing: 4, marginBottom: 4 }}>RESULT</div>
//           <h2 style={{ margin: "0 0 18px", color: "#ffcd44", fontSize: "1.2rem" }}>
//             Center of Box ({result.i}, {result.j})
//           </h2>

//           {/* 2×2 node display */}
//           <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
//             <div style={{ fontSize: 11, color: "#455070", marginBottom: 8 }}>
//               4 surrounding nodes (C++ FDM solved temperatures):
//             </div>
//             <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 4, alignItems: "center" }}>
//               <NodeBox label={`(${result.i-1},${result.j-1})`} value={result.TL} />
//               <div style={{ fontSize: 18, color: "#455070", padding: "0 8px" }}>⟷</div>
//               <NodeBox label={`(${result.i-1},${result.j})`} value={result.TR} />
//             </div>
//             <div style={{ display: "flex", justifyContent: "center", color: "#455070", fontSize: 18, margin: "4px 0" }}>↕</div>
//             <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 4, alignItems: "center" }}>
//               <NodeBox label={`(${result.i},${result.j-1})`} value={result.BL} />
//               <div style={{ fontSize: 18, color: "#455070", padding: "0 8px" }}>⟷</div>
//               <NodeBox label={`(${result.i},${result.j})`} value={result.BR} />
//             </div>
//           </div>

//           {/* Formula strip */}
//           <div style={{
//             background: "#090d1a", borderRadius: 8, padding: "12px 16px",
//             marginBottom: 16, fontSize: 12, color: "#6880a0", lineHeight: 2
//           }}>
//             <div>T<sub>center</sub> = ( T<sub>TL</sub> + T<sub>TR</sub> + T<sub>BL</sub> + T<sub>BR</sub> ) / 4</div>
//             <div style={{ color: "#8899bb" }}>
//               = ({result.TL.toFixed(3)} + {result.TR.toFixed(3)} + {result.BL.toFixed(3)} + {result.BR.toFixed(3)}) / 4
//             </div>
//             <div style={{ color: "#aabbcc" }}>
//               = {(result.TL + result.TR + result.BL + result.BR).toFixed(3)} / 4
//             </div>
//           </div>

//           {/* Big answer */}
//           <div style={{
//             background: "linear-gradient(135deg,#1a0e00,#291500)",
//             border: "1px solid #ff7f00", borderRadius: 10, padding: "18px",
//             textAlign: "center"
//           }}>
//             <div style={{ fontSize: 11, color: "#ff7f00", letterSpacing: 4, marginBottom: 8 }}>
//               TEMPERATURE AT CENTER OF BOX ({result.i},{result.j})
//             </div>
//             <div style={{
//               fontSize: "2.6rem", fontWeight: 900, letterSpacing: 2,
//               background: "linear-gradient(90deg,#ff7f00,#ffcd44)",
//               WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
//             }}>
//               {result.centerT.toFixed(6)}
//             </div>
//             <div style={{ fontSize: 18, color: "#ff7f00aa", marginTop: 4 }}>°C</div>
//           </div>
//         </div>
//       )}

//       {result && result.error && (
//         <div style={{
//           maxWidth: 400, margin: "24px auto", background: "#1a0a0a",
//           border: "1px solid #cc2222", borderRadius: 10, padding: 16,
//           textAlign: "center", color: "#ff8888"
//         }}>
//           ⚠ {result.error}
//         </div>
//       )}
//     </div>
//   );
// }

// // ─── Sub-components (unchanged) ────────────────────────────────────────

// function SectionLabel({ children }) {
//   return (
//     <div style={{ fontSize: 10, color: "#ff7f00", letterSpacing: 3, marginBottom: 8, textTransform: "uppercase" }}>
//       {children}
//     </div>
//   );
// }

// function Row({ label, children }) {
//   return (
//     <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, fontSize: 12, color: "#8899bb" }}>
//       <span style={{ minWidth: 70 }}>{label}</span>
//       {children}
//     </div>
//   );
// }

// function NumInput({ value, min, max, onChange, small }) {
//   return (
//     <input type="number" value={value} min={min} max={max}
//       onChange={e => onChange(parseInt(e.target.value) || min)}
//       style={{
//         width: small ? 52 : 68, background: "#131b2e", color: "#ffcd44",
//         border: "1px solid #2a3550", borderRadius: 5, padding: "4px 8px",
//         fontFamily: "inherit", fontSize: 13, fontWeight: 700
//       }} />
//   );
// }

// function BndInput({ label, color, value, onChange }) {
//   return (
//     <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//       <span style={{ color, fontSize: 12, minWidth: 72 }}>{label}</span>
//       <input type="number" value={value}
//         onChange={e => onChange(parseFloat(e.target.value) || 0)}
//         style={{
//           flex: 1, background: "#131b2e", color,
//           border: `1px solid ${color}55`, borderRadius: 5,
//           padding: "4px 8px", fontFamily: "inherit", fontSize: 13, fontWeight: 700
//         }} />
//       <span style={{ fontSize: 11, color: "#455070" }}>°C</span>
//     </div>
//   );
// }

// function GridPanel({ title, subtitle, children }) {
//   return (
//     <div style={{ background: "#0e1425", border: "1px solid #1e2a40", borderRadius: 12, padding: 16 }}>
//       <div style={{ fontSize: 10, color: "#ff7f00", letterSpacing: 3, marginBottom: 2 }}>{title}</div>
//       <div style={{ fontSize: 10, color: "#455070", marginBottom: 10 }}>{subtitle}</div>
//       {children}
//     </div>
//   );
// }

// function GridTopBnd({ value, color, span, cellPx }) {
//   return (
//     <div style={{ display: "flex", marginBottom: 2, paddingLeft: cellPx + 2 }}>
//       <div style={{
//         width: cellPx * span, textAlign: "center",
//         fontSize: 11, color, fontWeight: 700, paddingBottom: 2,
//         borderBottom: `2px solid ${color}`
//       }}>T={value}°C (Top)</div>
//     </div>
//   );
// }

// function GridBotBnd({ value, color, span, cellPx }) {
//   return (
//     <div style={{ display: "flex", marginTop: 2, paddingLeft: cellPx + 2 }}>
//       <div style={{
//         width: cellPx * span, textAlign: "center",
//         fontSize: 11, color, fontWeight: 700, paddingTop: 2,
//         borderTop: `2px solid ${color}`
//       }}>T={value}°C (Bottom)</div>
//     </div>
//   );
// }

// function BndLabel({ value, color, vertical, right }) {
//   return (
//     <div style={{
//       display: "flex", alignItems: "center", justifyContent: "center",
//       padding: "0 6px", fontSize: 10, color, fontWeight: 700, writingMode: "vertical-rl",
//       textOrientation: "mixed", transform: right ? "none" : "rotate(180deg)",
//       borderRight: right ? undefined : `2px solid ${color}`,
//       borderLeft: right ? `2px solid ${color}` : undefined,
//       minWidth: 22,
//     }}>
//       {value}°C
//     </div>
//   );
// }

// function ColorScale({ minT, maxT }) {
//   const stops = [0, 0.25, 0.5, 0.75, 1];
//   const gradient = stops.map(s => {
//     const t = minT + s * (maxT - minT);
//     return tempToColor(t, minT, maxT);
//   }).join(",");
//   return (
//     <div style={{ marginTop: 10 }}>
//       <div style={{
//         height: 8, borderRadius: 4,
//         background: `linear-gradient(90deg,${gradient})`,
//         margin: "0 8px"
//       }} />
//       <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#455070", margin: "3px 8px 0" }}>
//         <span>{minT.toFixed(1)}°C</span>
//         <span>{((minT + maxT) / 2).toFixed(1)}°C</span>
//         <span>{maxT.toFixed(1)}°C</span>
//       </div>
//     </div>
//   );
// }

// function NodeBox({ label, value }) {
//   return (
//     <div style={{
//       background: "#131b2e", border: "1px solid #2a3550",
//       borderRadius: 8, padding: "10px 14px", textAlign: "center"
//     }}>
//       <div style={{ fontSize: 10, color: "#455070", marginBottom: 4 }}>Node {label}</div>
//       <div style={{ fontSize: 15, color: "#ffcd44", fontWeight: 700 }}>{value.toFixed(4)}</div>
//       <div style={{ fontSize: 10, color: "#455070" }}>°C</div>
//     </div>
//   );
// }


// import { useState, useCallback, useRef, useEffect } from "react";

// // ─── Color mapping: blue (cold) → cyan → green → yellow → red (hot) ───
// function tempToRGB(T, minT, maxT) {
//   const ratio = Math.max(0, Math.min(1, (T - minT) / (maxT - minT + 1e-9)));
//   let r, g, b;
//   if (ratio < 0.25) {
//     r = 0; g = Math.round(ratio * 4 * 255); b = 255;
//   } else if (ratio < 0.5) {
//     r = 0; g = 255; b = Math.round((1 - (ratio - 0.25) * 4) * 255);
//   } else if (ratio < 0.75) {
//     r = Math.round((ratio - 0.5) * 4 * 255); g = 255; b = 0;
//   } else {
//     r = 255; g = Math.round((1 - (ratio - 0.75) * 4) * 255); b = 0;
//   }
//   return [r, g, b];
// }

// function tempToColor(T, minT, maxT) {
//   const [r, g, b] = tempToRGB(T, minT, maxT);
//   return `rgb(${r},${g},${b})`;
// }

// function tempTextColor(T, minT, maxT) {
//   const ratio = (T - minT) / (maxT - minT + 1e-9);
//   return ratio > 0.45 && ratio < 0.75 ? "#000" : "#fff";
// }

// // ─── Canvas Grid: renders node or box grid using ImageData (very fast) ─
// function HeatCanvas({ temps, N, minT, maxT, result, onBoxClick, isBoxGrid }) {
//   const canvasRef = useRef(null);
//   const size    = isBoxGrid ? N : N + 1;
//   const cellPx  = Math.max(2, Math.min(54, Math.floor(560 / size)));
//   const canvasW = cellPx * size;
//   const canvasH = cellPx * size;
//   const showLabels = cellPx >= 32;

//   useEffect(() => {
//     if (!temps || !canvasRef.current) return;
//     const canvas = canvasRef.current;
//     const ctx    = canvas.getContext("2d");

//     // ── fast pixel fill using ImageData ──
//     const img = ctx.createImageData(canvasW, canvasH);
//     const data = img.data;

//     for (let i = 0; i < size; i++) {
//       for (let j = 0; j < size; j++) {
//         const t = isBoxGrid
//           ? (temps[i][j] + temps[i][j + 1] + temps[i + 1][j] + temps[i + 1][j + 1]) / 4
//           : temps[i][j];

//         // Is this cell highlighted?
//         let highlighted = false;
//         if (result && !result.error) {
//           if (isBoxGrid) {
//             highlighted = result.i === i + 1 && result.j === j + 1;
//           } else {
//             highlighted =
//               (i === result.i - 1 && j === result.j - 1) ||
//               (i === result.i - 1 && j === result.j)     ||
//               (i === result.i     && j === result.j - 1) ||
//               (i === result.i     && j === result.j);
//           }
//         }

//         const [r, g, b] = highlighted ? [255, 205, 68] : tempToRGB(t, minT, maxT);

//         // fill cellPx × cellPx pixels
//         for (let dy = 0; dy < cellPx; dy++) {
//           for (let dx = 0; dx < cellPx; dx++) {
//             const px = ((i * cellPx + dy) * canvasW + (j * cellPx + dx)) * 4;
//             data[px]     = r;
//             data[px + 1] = g;
//             data[px + 2] = b;
//             data[px + 3] = 255;
//           }
//         }
//       }
//     }
//     ctx.putImageData(img, 0, 0);

//     // ── grid lines (only when cells are big enough) ──
//     if (cellPx >= 6) {
//       ctx.strokeStyle = "rgba(0,0,0,0.2)";
//       ctx.lineWidth   = 0.5;
//       for (let i = 0; i <= size; i++) {
//         ctx.beginPath(); ctx.moveTo(0, i * cellPx); ctx.lineTo(canvasW, i * cellPx); ctx.stroke();
//         ctx.beginPath(); ctx.moveTo(i * cellPx, 0); ctx.lineTo(i * cellPx, canvasH); ctx.stroke();
//       }
//     }

//     // ── highlight border for selected box ──
//     if (result && !result.error && isBoxGrid) {
//       const bi = result.i - 1, bj = result.j - 1;
//       ctx.strokeStyle = "#ff7f00";
//       ctx.lineWidth   = Math.max(2, cellPx / 8);
//       ctx.strokeRect(bj * cellPx + 1, bi * cellPx + 1, cellPx - 2, cellPx - 2);
//     }

//     // ── text labels (only for small grids where cells are large) ──
//     if (showLabels) {
//       const fontSize = Math.max(7, Math.floor(cellPx / 5.5));
//       ctx.font        = `600 ${fontSize}px "Courier New", monospace`;
//       ctx.textAlign   = "center";
//       ctx.textBaseline = "middle";
//       for (let i = 0; i < size; i++) {
//         for (let j = 0; j < size; j++) {
//           const t = isBoxGrid
//             ? (temps[i][j] + temps[i][j + 1] + temps[i + 1][j] + temps[i + 1][j + 1]) / 4
//             : temps[i][j];

//           const highlighted = result && !result.error && (
//             isBoxGrid
//               ? result.i === i + 1 && result.j === j + 1
//               : (i === result.i - 1 && j === result.j - 1) ||
//                 (i === result.i - 1 && j === result.j) ||
//                 (i === result.i     && j === result.j - 1) ||
//                 (i === result.i     && j === result.j)
//           );

//           ctx.fillStyle = highlighted ? "#000" : tempTextColor(t, minT, maxT);
//           const label = isBoxGrid
//             ? (cellPx >= 46 ? `(${i+1},${j+1})` : `${t.toFixed(0)}`)
//             : t.toFixed(cellPx >= 46 ? 1 : 0);
//           ctx.fillText(label, j * cellPx + cellPx / 2, i * cellPx + cellPx / 2);
//         }
//       }
//     }
//   }, [temps, result, minT, maxT, size, cellPx, canvasW, canvasH, isBoxGrid, showLabels]);

//   const handleClick = useCallback((e) => {
//     if (!isBoxGrid || !onBoxClick || !canvasRef.current) return;
//     const rect = canvasRef.current.getBoundingClientRect();
//     // account for CSS scaling
//     const scaleX = canvasW / rect.width;
//     const scaleY = canvasH / rect.height;
//     const x = (e.clientX - rect.left) * scaleX;
//     const y = (e.clientY - rect.top)  * scaleY;
//     const j = Math.floor(x / cellPx) + 1;
//     const i = Math.floor(y / cellPx) + 1;
//     if (i >= 1 && i <= N && j >= 1 && j <= N) onBoxClick(i, j);
//   }, [isBoxGrid, onBoxClick, canvasW, canvasH, cellPx, N]);

//   return (
//     <canvas
//       ref={canvasRef}
//       width={canvasW}
//       height={canvasH}
//       onClick={handleClick}
//       style={{
//         display: "block",
//         cursor: isBoxGrid ? "crosshair" : "default",
//         maxWidth: "100%",
//         imageRendering: cellPx <= 3 ? "pixelated" : "auto",
//       }}
//     />
//   );
// }

// // ─── Main App ──────────────────────────────────────────────────────────
// export default function App() {
//   const [gridSize, setGridSize] = useState(10);
//   const [bTop,  setBTop]  = useState(500);
//   const [bBot,  setBBot]  = useState(100);
//   const [bLeft, setBLeft] = useState(100);
//   const [bRight,setBRight]= useState(100);
//   const [boxI,  setBoxI]  = useState(2);
//   const [boxJ,  setBoxJ]  = useState(2);

//   const [temps,    setTemps]    = useState(null);
//   const [result,   setResult]   = useState(null);
//   const [iters,    setIters]    = useState(0);
//   const [minT,     setMinT]     = useState(0);
//   const [maxT,     setMaxT]     = useState(500);
//   const [solved,   setSolved]   = useState(false);
//   const [loading,  setLoading]  = useState(false);
//   const [apiError, setApiError] = useState(null);
//   const [solveMs,  setSolveMs]  = useState(null);

//   const computeBox = useCallback((T, N, bi, bj) => {
//     const i = parseInt(bi), j = parseInt(bj);
//     if (i < 1 || i > N || j < 1 || j > N)
//       return { error: `Box (${i},${j}) out of range. Valid: 1–${N}` };
//     const TL = T[i - 1][j - 1], TR = T[i - 1][j];
//     const BL = T[i][j - 1],     BR = T[i][j];
//     return { TL, TR, BL, BR, centerT: (TL + TR + BL + BR) / 4, i, j };
//   }, []);

//   const handleSolve = async () => {
//     const N = parseInt(gridSize);
//     if (N < 2 || N > 200) return;
//     setLoading(true); setSolved(false); setTemps(null); setResult(null); setApiError(null);
//     const t0 = performance.now();
//     try {
//       const response = await fetch("http://localhost:3001/solve", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ N, top: parseFloat(bTop), bottom: parseFloat(bBot), left: parseFloat(bLeft), right: parseFloat(bRight) }),
//       });
//       if (!response.ok) { const e = await response.json(); throw new Error(e.error || `HTTP ${response.status}`); }
//       const data = await response.json();
//       setSolveMs(Math.round(performance.now() - t0));
//       setTemps(data.grid); setIters(data.iterations); setMinT(data.minT); setMaxT(data.maxT);
//       setSolved(true);
//       setResult(computeBox(data.grid, N, boxI, boxJ));
//     } catch (err) {
//       setApiError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBoxClick = (bi, bj) => {
//     if (!temps) return;
//     setBoxI(bi); setBoxJ(bj);
//     setResult(computeBox(temps, parseInt(gridSize), bi, bj));
//   };

//   const N = parseInt(gridSize);

//   return (
//     <div style={{
//       minHeight: "100vh", background: "#090d1a", color: "#c9d1e0",
//       fontFamily: "'Courier New', Courier, monospace", padding: "24px 16px",
//     }}>
//       {/* ── Title ── */}
//       <div style={{ textAlign: "center", marginBottom: 28 }}>
//         <div style={{ fontSize: 11, letterSpacing: 6, color: "#ff7f00", textTransform: "uppercase", marginBottom: 6 }}>
//           Numerical Methods — FDM Solver
//         </div>
//         <h1 style={{
//           fontSize: "clamp(1.3rem, 3vw, 2rem)", fontWeight: 900, margin: 0,
//           background: "linear-gradient(90deg,#ff7f00,#ffcd44,#ff7f00)",
//           WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: 2
//         }}>
//           2D STEADY-STATE HEAT CONDUCTION
//         </h1>
//         <div style={{ fontSize: 11, color: "#455070", marginTop: 6, letterSpacing: 3 }}>
//           ∂²T/∂x² + ∂²T/∂y² = 0 &nbsp;|&nbsp; C++ JACOBI FDM · UP TO 200×200
//         </div>
//       </div>

//       {/* ── Layout ── */}
//       <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start" }}>

//         {/* ─ Control Panel ─ */}
//         <div style={{ background: "#0e1425", border: "1px solid #1e2a40", borderRadius: 12, padding: 20, minWidth: 240, maxWidth: 275 }}>
//           <SectionLabel>① Grid Setup</SectionLabel>
//           <Row label="Grid Size N×N">
//             <NumInput value={gridSize} min={2} max={200}
//               onChange={v => { setGridSize(v); setSolved(false); setTemps(null); setResult(null); }} />
//             <span style={{ color: "#455070", marginLeft: 6, fontSize: 11 }}>boxes</span>
//           </Row>

//           {/* Size presets */}
//           <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 4 }}>
//             {[4, 10, 20, 50, 100, 200].map(s => (
//               <button key={s} onClick={() => { setGridSize(s); setSolved(false); setTemps(null); setResult(null); }}
//                 style={{
//                   padding: "2px 8px", fontSize: 10, border: "1px solid #2a3550",
//                   borderRadius: 4, background: gridSize === s ? "#ff7f00" : "#131b2e",
//                   color: gridSize === s ? "#000" : "#8899bb", cursor: "pointer", fontFamily: "inherit"
//                 }}>{s}×{s}</button>
//             ))}
//           </div>

//           {N >= 50 && (
//             <div style={{ fontSize: 10, color: "#44aa66", marginBottom: 8, padding: "4px 8px", background: "#0a1a10", borderRadius: 5 }}>
//               ⚡ Large grid — canvas rendering active
//             </div>
//           )}
//           <div style={{ height: 12 }} />

//           <SectionLabel>② Boundary Temperatures</SectionLabel>
//           <div style={{ display: "grid", gap: 8 }}>
//             <BndInput label="🔴 Top"    color="#ff4444" value={bTop}   onChange={v => { setBTop(v);   setSolved(false); }} />
//             <BndInput label="🔵 Bottom" color="#4488ff" value={bBot}   onChange={v => { setBBot(v);   setSolved(false); }} />
//             <BndInput label="🟢 Left"   color="#44cc77" value={bLeft}  onChange={v => { setBLeft(v);  setSolved(false); }} />
//             <BndInput label="🟡 Right"  color="#ffbb22" value={bRight} onChange={v => { setBRight(v); setSolved(false); }} />
//           </div>
//           <div style={{ height: 16 }} />

//           <SectionLabel>③ Query Box (i, j)</SectionLabel>
//           <div style={{ fontSize: 11, color: "#455070", marginBottom: 8 }}>Click grid or type (1 to {N})</div>
//           <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
//             <span style={{ color: "#ff7f00", fontSize: 13 }}>i =</span>
//             <NumInput value={boxI} min={1} max={N} onChange={v => { setBoxI(v); temps && setResult(computeBox(temps, N, v, boxJ)); }} small />
//             <span style={{ color: "#ff7f00", fontSize: 13, marginLeft: 8 }}>j =</span>
//             <NumInput value={boxJ} min={1} max={N} onChange={v => { setBoxJ(v); temps && setResult(computeBox(temps, N, boxI, v)); }} small />
//           </div>
//           <div style={{ height: 18 }} />

//           <button onClick={handleSolve} disabled={loading} style={{
//             width: "100%", padding: "10px 0",
//             background: loading ? "linear-gradient(135deg,#664400,#553300)" : "linear-gradient(135deg,#ff7f00,#e65c00)",
//             border: "none", borderRadius: 8, color: "#fff", fontWeight: 900, fontSize: 14,
//             letterSpacing: 2, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit",
//             boxShadow: "0 4px 20px rgba(255,127,0,0.3)", transition: "opacity .15s"
//           }}>
//             {loading ? "⏳ COMPUTING C++…" : "▶ SOLVE FDM"}
//           </button>

//           {solved && (
//             <div style={{ marginTop: 10, fontSize: 11, color: "#455070", textAlign: "center", lineHeight: 1.8 }}>
//               <span style={{ color: "#ff7f00" }}>{iters}</span> iterations &nbsp;|&nbsp; {N+1}×{N+1} nodes<br />
//               <span style={{ color: "#44aa66" }}>⚡ {solveMs}ms total (incl. network)</span>
//             </div>
//           )}

//           <div style={{
//             marginTop: 14, padding: "8px 10px", background: "#0a1020",
//             border: "1px solid #1a3020", borderRadius: 8, fontSize: 10, color: "#336644", lineHeight: 1.7
//           }}>
//             <span style={{ color: "#44aa66" }}>⚡ C++ Backend</span><br />
//             Jacobi FDM · 5000 iter<br />
//             Canvas render · up to 200×200<br />
//             <span style={{ color: "#224433" }}>localhost:3001/solve</span>
//           </div>
//         </div>

//         {/* ─ Grid Visuals ─ */}
//         {temps && (
//           <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>

//             <GridPanel title="NODE TEMPERATURES" subtitle={`${N+1}×${N+1} nodes · each cell = a grid node`}>
//               <GridTopBnd value={bTop} color="#ff4444" />
//               <div style={{ display: "flex" }}>
//                 <BndLabel value={bLeft} color="#44cc77" />
//                 <HeatCanvas temps={temps} N={N} minT={minT} maxT={maxT} result={result} isBoxGrid={false} />
//                 <BndLabel value={bRight} color="#ffbb22" right />
//               </div>
//               <GridBotBnd value={bBot} color="#4488ff" />
//               <ColorScale minT={minT} maxT={maxT} />
//             </GridPanel>

//             <GridPanel title="BOX SELECTOR" subtitle={`${N}×${N} boxes · click to query center temp`}>
//               <GridTopBnd value={bTop} color="#ff4444" />
//               <div style={{ display: "flex" }}>
//                 <BndLabel value={bLeft} color="#44cc77" />
//                 <HeatCanvas temps={temps} N={N} minT={minT} maxT={maxT} result={result} isBoxGrid onBoxClick={handleBoxClick} />
//                 <BndLabel value={bRight} color="#ffbb22" right />
//               </div>
//               <GridBotBnd value={bBot} color="#4488ff" />
//               <div style={{ fontSize: 10, color: "#455070", textAlign: "center", marginTop: 6 }}>
//                 Colored by average of 4 corner nodes
//               </div>
//             </GridPanel>
//           </div>
//         )}
//       </div>

//       {/* ─ API Error ─ */}
//       {apiError && (
//         <div style={{
//           maxWidth: 480, margin: "24px auto", background: "#1a0a0a",
//           border: "1px solid #cc2222", borderRadius: 10, padding: "16px 20px",
//           textAlign: "center", color: "#ff8888", fontSize: 13
//         }}>
//           <div style={{ fontSize: 15, marginBottom: 8 }}>⚠ Backend Error</div>
//           <div style={{ color: "#ff6666", marginBottom: 10 }}>{apiError}</div>
//           <div style={{ fontSize: 11, color: "#884444", lineHeight: 1.8 }}>
//             1. Compile: <code style={{ color: "#ffaa88" }}>g++ -O2 -o heat2d heat2d.cpp</code><br />
//             2. Start: <code style={{ color: "#ffaa88" }}>node server.js</code><br />
//             3. Server must be at <code style={{ color: "#ffaa88" }}>localhost:3001</code>
//           </div>
//         </div>
//       )}

//       {/* ─ Result Panel ─ */}
//       {result && !result.error && (
//         <div style={{
//           maxWidth: 560, margin: "28px auto 0", background: "#0e1425",
//           border: "1px solid #ff7f0066", borderRadius: 14, padding: 24,
//           boxShadow: "0 0 40px rgba(255,127,0,0.08)"
//         }}>
//           <div style={{ fontSize: 11, color: "#ff7f00", letterSpacing: 4, marginBottom: 4 }}>RESULT</div>
//           <h2 style={{ margin: "0 0 18px", color: "#ffcd44", fontSize: "1.2rem" }}>
//             Center of Box ({result.i}, {result.j})
//           </h2>

//           <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
//             <div style={{ fontSize: 11, color: "#455070", marginBottom: 8 }}>4 surrounding nodes (C++ FDM solved temperatures):</div>
//             <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 4, alignItems: "center" }}>
//               <NodeBox label={`(${result.i-1},${result.j-1})`} value={result.TL} />
//               <div style={{ fontSize: 18, color: "#455070", padding: "0 8px" }}>⟷</div>
//               <NodeBox label={`(${result.i-1},${result.j})`} value={result.TR} />
//             </div>
//             <div style={{ display: "flex", justifyContent: "center", color: "#455070", fontSize: 18, margin: "4px 0" }}>↕</div>
//             <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 4, alignItems: "center" }}>
//               <NodeBox label={`(${result.i},${result.j-1})`} value={result.BL} />
//               <div style={{ fontSize: 18, color: "#455070", padding: "0 8px" }}>⟷</div>
//               <NodeBox label={`(${result.i},${result.j})`} value={result.BR} />
//             </div>
//           </div>

//           <div style={{
//             background: "#090d1a", borderRadius: 8, padding: "12px 16px",
//             marginBottom: 16, fontSize: 12, color: "#6880a0", lineHeight: 2
//           }}>
//             <div>T<sub>center</sub> = ( T<sub>TL</sub> + T<sub>TR</sub> + T<sub>BL</sub> + T<sub>BR</sub> ) / 4</div>
//             <div style={{ color: "#8899bb" }}>
//               = ({result.TL.toFixed(3)} + {result.TR.toFixed(3)} + {result.BL.toFixed(3)} + {result.BR.toFixed(3)}) / 4
//             </div>
//             <div style={{ color: "#aabbcc" }}>= {(result.TL+result.TR+result.BL+result.BR).toFixed(3)} / 4</div>
//           </div>

//           <div style={{
//             background: "linear-gradient(135deg,#1a0e00,#291500)",
//             border: "1px solid #ff7f00", borderRadius: 10, padding: "18px", textAlign: "center"
//           }}>
//             <div style={{ fontSize: 11, color: "#ff7f00", letterSpacing: 4, marginBottom: 8 }}>
//               TEMPERATURE AT CENTER OF BOX ({result.i},{result.j})
//             </div>
//             <div style={{
//               fontSize: "2.6rem", fontWeight: 900, letterSpacing: 2,
//               background: "linear-gradient(90deg,#ff7f00,#ffcd44)",
//               WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
//             }}>
//               {result.centerT.toFixed(6)}
//             </div>
//             <div style={{ fontSize: 18, color: "#ff7f00aa", marginTop: 4 }}>°C</div>
//           </div>
//         </div>
//       )}

//       {result && result.error && (
//         <div style={{
//           maxWidth: 400, margin: "24px auto", background: "#1a0a0a",
//           border: "1px solid #cc2222", borderRadius: 10, padding: 16,
//           textAlign: "center", color: "#ff8888"
//         }}>⚠ {result.error}</div>
//       )}
//     </div>
//   );
// }

// // ─── Sub-components ────────────────────────────────────────────────────

// function SectionLabel({ children }) {
//   return <div style={{ fontSize: 10, color: "#ff7f00", letterSpacing: 3, marginBottom: 8, textTransform: "uppercase" }}>{children}</div>;
// }

// function Row({ label, children }) {
//   return (
//     <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, fontSize: 12, color: "#8899bb" }}>
//       <span style={{ minWidth: 70 }}>{label}</span>{children}
//     </div>
//   );
// }

// function NumInput({ value, min, max, onChange, small }) {
//   return (
//     <input type="number" value={value} min={min} max={max}
//       onChange={e => onChange(parseInt(e.target.value) || min)}
//       style={{
//         width: small ? 52 : 72, background: "#131b2e", color: "#ffcd44",
//         border: "1px solid #2a3550", borderRadius: 5, padding: "4px 8px",
//         fontFamily: "inherit", fontSize: 13, fontWeight: 700
//       }} />
//   );
// }

// function BndInput({ label, color, value, onChange }) {
//   return (
//     <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//       <span style={{ color, fontSize: 12, minWidth: 72 }}>{label}</span>
//       <input type="number" value={value} onChange={e => onChange(parseFloat(e.target.value) || 0)}
//         style={{
//           flex: 1, background: "#131b2e", color,
//           border: `1px solid ${color}55`, borderRadius: 5,
//           padding: "4px 8px", fontFamily: "inherit", fontSize: 13, fontWeight: 700
//         }} />
//       <span style={{ fontSize: 11, color: "#455070" }}>°C</span>
//     </div>
//   );
// }

// function GridPanel({ title, subtitle, children }) {
//   return (
//     <div style={{ background: "#0e1425", border: "1px solid #1e2a40", borderRadius: 12, padding: 16 }}>
//       <div style={{ fontSize: 10, color: "#ff7f00", letterSpacing: 3, marginBottom: 2 }}>{title}</div>
//       <div style={{ fontSize: 10, color: "#455070", marginBottom: 10 }}>{subtitle}</div>
//       {children}
//     </div>
//   );
// }

// function GridTopBnd({ value, color }) {
//   return (
//     <div style={{ textAlign: "center", fontSize: 11, color, fontWeight: 700, paddingBottom: 4, borderBottom: `2px solid ${color}`, marginBottom: 2 }}>
//       T = {value}°C (Top)
//     </div>
//   );
// }

// function GridBotBnd({ value, color }) {
//   return (
//     <div style={{ textAlign: "center", fontSize: 11, color, fontWeight: 700, paddingTop: 4, borderTop: `2px solid ${color}`, marginTop: 2 }}>
//       T = {value}°C (Bottom)
//     </div>
//   );
// }

// function BndLabel({ value, color, right }) {
//   return (
//     <div style={{
//       display: "flex", alignItems: "center", justifyContent: "center",
//       padding: "0 6px", fontSize: 10, color, fontWeight: 700,
//       writingMode: "vertical-rl", textOrientation: "mixed",
//       transform: right ? "none" : "rotate(180deg)",
//       borderRight: right ? undefined : `2px solid ${color}`,
//       borderLeft:  right ? `2px solid ${color}` : undefined,
//       minWidth: 22,
//     }}>
//       {value}°C
//     </div>
//   );
// }

// function ColorScale({ minT, maxT }) {
//   const stops = [0, 0.25, 0.5, 0.75, 1];
//   const gradient = stops.map(s => tempToColor(minT + s * (maxT - minT), minT, maxT)).join(",");
//   return (
//     <div style={{ marginTop: 10 }}>
//       <div style={{ height: 8, borderRadius: 4, background: `linear-gradient(90deg,${gradient})`, margin: "0 8px" }} />
//       <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#455070", margin: "3px 8px 0" }}>
//         <span>{minT.toFixed(1)}°C</span>
//         <span>{((minT + maxT) / 2).toFixed(1)}°C</span>
//         <span>{maxT.toFixed(1)}°C</span>
//       </div>
//     </div>
//   );
// }

// function NodeBox({ label, value }) {
//   return (
//     <div style={{ background: "#131b2e", border: "1px solid #2a3550", borderRadius: 8, padding: "10px 14px", textAlign: "center" }}>
//       <div style={{ fontSize: 10, color: "#455070", marginBottom: 4 }}>Node {label}</div>
//       <div style={{ fontSize: 15, color: "#ffcd44", fontWeight: 700 }}>{value.toFixed(4)}</div>
//       <div style={{ fontSize: 10, color: "#455070" }}>°C</div>
//     </div>
//   );
// }



import { useState, useCallback, useRef, useEffect } from "react";

// ─── Color mapping: blue→cyan→green→yellow→red ─────────────────────────
function tempToRGB(T, minT, maxT) {
  const ratio = Math.max(0, Math.min(1, (T - minT) / (maxT - minT + 1e-9)));
  let r, g, b;
  if      (ratio < 0.25) { r = 0;                              g = Math.round(ratio * 4 * 255);           b = 255; }
  else if (ratio < 0.5)  { r = 0;                              g = 255;                                   b = Math.round((1 - (ratio - 0.25) * 4) * 255); }
  else if (ratio < 0.75) { r = Math.round((ratio - 0.5) * 4 * 255); g = 255;                             b = 0; }
  else                   { r = 255;                             g = Math.round((1 - (ratio - 0.75) * 4) * 255); b = 0; }
  return [r, g, b];
}

function tempToColor(T, minT, maxT) {
  const [r, g, b] = tempToRGB(T, minT, maxT);
  return `rgb(${r},${g},${b})`;
}

function tempTextColor(T, minT, maxT) {
  const ratio = (T - minT) / (maxT - minT + 1e-9);
  return ratio > 0.45 && ratio < 0.75 ? "#000" : "#fff";
}

// ─── Canvas component (ImageData pixel-fill — handles 1000×1000) ───────
function HeatCanvas({ flatGrid, N, nodeN, minT, maxT, result, onBoxClick, isBoxGrid }) {
  const canvasRef = useRef(null);
  const size    = isBoxGrid ? N : nodeN;            // N boxes  OR  nodeN=N+1 nodes
  const CANVAS  = 560;                              // fixed display size in px
  const cellPx  = Math.max(1, Math.floor(CANVAS / size));
  const canvasW = cellPx * size;
  const canvasH = cellPx * size;
  const showLabels = cellPx >= 32;

  // Helper: get temp from flat array  (node grid uses nodeN stride)
  const getT = useCallback((i, j) => {
    if (isBoxGrid) {
      // average of 4 corners
      return (flatGrid[i * nodeN + j] +
              flatGrid[i * nodeN + (j + 1)] +
              flatGrid[(i + 1) * nodeN + j] +
              flatGrid[(i + 1) * nodeN + (j + 1)]) / 4;
    }
    return flatGrid[i * nodeN + j];
  }, [flatGrid, nodeN, isBoxGrid]);

  useEffect(() => {
    if (!flatGrid || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    const img    = ctx.createImageData(canvasW, canvasH);
    const data   = img.data;

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const t = getT(i, j);

        let highlighted = false;
        if (result && !result.error) {
          highlighted = isBoxGrid
            ? (result.i === i + 1 && result.j === j + 1)
            : ((i === result.i - 1 && j === result.j - 1) ||
               (i === result.i - 1 && j === result.j)     ||
               (i === result.i     && j === result.j - 1) ||
               (i === result.i     && j === result.j));
        }

        const [r, g, b] = highlighted ? [255, 205, 68] : tempToRGB(t, minT, maxT);

        // write cellPx × cellPx pixel block
        for (let dy = 0; dy < cellPx; dy++) {
          const rowBase = ((i * cellPx + dy) * canvasW + j * cellPx) * 4;
          for (let dx = 0; dx < cellPx; dx++) {
            const p = rowBase + dx * 4;
            data[p]   = r;
            data[p+1] = g;
            data[p+2] = b;
            data[p+3] = 255;
          }
        }
      }
    }
    ctx.putImageData(img, 0, 0);

    // Grid lines only when cells are large enough to see them
    if (cellPx >= 6) {
      ctx.strokeStyle = "rgba(0,0,0,0.18)";
      ctx.lineWidth   = 0.5;
      for (let k = 0; k <= size; k++) {
        ctx.beginPath(); ctx.moveTo(0,           k * cellPx); ctx.lineTo(canvasW, k * cellPx); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(k * cellPx,  0          ); ctx.lineTo(k * cellPx, canvasH); ctx.stroke();
      }
    }

    // Highlight border for selected box
    if (result && !result.error && isBoxGrid) {
      ctx.strokeStyle = "#ff7f00";
      ctx.lineWidth   = Math.max(2, cellPx / 6);
      const bj = result.j - 1, bi = result.i - 1;
      ctx.strokeRect(bj * cellPx + 1, bi * cellPx + 1, cellPx - 2, cellPx - 2);
    }

    // Text labels (only when cells are big enough)
    if (showLabels) {
      const fs = Math.max(7, Math.floor(cellPx / 5.5));
      ctx.font         = `600 ${fs}px "Courier New", monospace`;
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const t = getT(i, j);
          const hi = result && !result.error && (
            isBoxGrid
              ? result.i === i+1 && result.j === j+1
              : (i===result.i-1&&j===result.j-1)||(i===result.i-1&&j===result.j)||
                (i===result.i&&j===result.j-1)||(i===result.i&&j===result.j)
          );
          ctx.fillStyle = hi ? "#000" : tempTextColor(t, minT, maxT);
          ctx.fillText(
            isBoxGrid ? (cellPx >= 46 ? `(${i+1},${j+1})` : t.toFixed(0)) : t.toFixed(cellPx >= 46 ? 1 : 0),
            j * cellPx + cellPx / 2,
            i * cellPx + cellPx / 2
          );
        }
      }
    }
  }, [flatGrid, result, minT, maxT, size, cellPx, canvasW, canvasH, isBoxGrid, showLabels, getT]);

  const handleClick = useCallback((e) => {
    if (!isBoxGrid || !onBoxClick || !canvasRef.current) return;
    const rect   = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasW / rect.width;
    const scaleY = canvasH / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top)  * scaleY;
    const j = Math.floor(x / cellPx) + 1;
    const i = Math.floor(y / cellPx) + 1;
    if (i >= 1 && i <= N && j >= 1 && j <= N) onBoxClick(i, j);
  }, [isBoxGrid, onBoxClick, canvasW, canvasH, cellPx, N]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasW}
      height={canvasH}
      onClick={handleClick}
      style={{
        display: "block",
        cursor: isBoxGrid ? "crosshair" : "default",
        maxWidth: "100%",
        imageRendering: cellPx <= 2 ? "pixelated" : "auto",
      }}
    />
  );
}

// ─── Main App ───────────────────────────────────────────────────────────
export default function App() {
  const [gridSize, setGridSize] = useState(10);
  const [bTop,   setBTop]   = useState(500);
  const [bBot,   setBBot]   = useState(100);
  const [bLeft,  setBLeft]  = useState(100);
  const [bRight, setBRight] = useState(100);
  const [boxI,   setBoxI]   = useState(2);
  const [boxJ,   setBoxJ]   = useState(2);

  const [flatGrid,   setFlatGrid]   = useState(null);  // flat Float64Array
  const [result,     setResult]     = useState(null);
  const [iters,      setIters]      = useState(0);
  const [converged,  setConverged]  = useState(false);
  const [minT,       setMinT]       = useState(0);
  const [maxT,       setMaxT]       = useState(500);
  const [solved,     setSolved]     = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [apiError,   setApiError]   = useState(null);
  const [solveMs,    setSolveMs]    = useState(null);

  // nodeN = N+1  (server stores this on solve)
  const nodeNRef = useRef(0);

  // computeBox: works on flat array
  const computeBox = useCallback((flat, nodeN, N, bi, bj) => {
    const i = parseInt(bi), j = parseInt(bj);
    if (i < 1 || i > N || j < 1 || j > N)
      return { error: `Box (${i},${j}) out of range. Valid: 1–${N}` };
    const TL = flat[(i-1)*nodeN + (j-1)];
    const TR = flat[(i-1)*nodeN + j];
    const BL = flat[ i   *nodeN + (j-1)];
    const BR = flat[ i   *nodeN + j];
    return { TL, TR, BL, BR, centerT: (TL+TR+BL+BR)/4, i, j };
  }, []);

  const handleSolve = async () => {
    const N = parseInt(gridSize);
    if (N < 2 || N > 1000) return;
    setLoading(true); setSolved(false); setFlatGrid(null); setResult(null); setApiError(null);
    const t0 = performance.now();

    try {
      // const resp = await fetch("http://localhost:3001/solve", {
      //   method : "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body   : JSON.stringify({
      //     N,
      //     top:    parseFloat(bTop),
      //     bottom: parseFloat(bBot),
      //     left:   parseFloat(bLeft),
      //     right:  parseFloat(bRight),
      //   }),
      // });
    const API = process.env.REACT_APP_API || "http://localhost:3001";

const resp = await fetch(`${API}/solve`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    N,
    top: parseFloat(bTop),
    bottom: parseFloat(bBot),
    left: parseFloat(bLeft),
    right: parseFloat(bRight)
  })
});
      if (!resp.ok) { const e = await resp.json(); throw new Error(e.error || `HTTP ${resp.status}`); }

      const data = await resp.json();
      setSolveMs(Math.round(performance.now() - t0));

      const nodeN = data.N;                         // C++ sends actual node count
      nodeNRef.current = nodeN;

      // Store as Float64Array for memory efficiency
      const flat = new Float64Array(data.grid);

      setFlatGrid(flat);
      setIters(data.iterations);
      setConverged(data.converged);
      setMinT(data.minT);
      setMaxT(data.maxT);
      setSolved(true);
      setResult(computeBox(flat, nodeN, N, boxI, boxJ));

    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBoxClick = (bi, bj) => {
    if (!flatGrid) return;
    const N = parseInt(gridSize);
    setBoxI(bi); setBoxJ(bj);
    setResult(computeBox(flatGrid, nodeNRef.current, N, bi, bj));
  };

  const N = parseInt(gridSize);

  return (
    <div style={{ minHeight:"100vh", background:"#090d1a", color:"#c9d1e0",
      fontFamily:"'Courier New',Courier,monospace", padding:"24px 16px" }}>

      {/* Title */}
      <div style={{ textAlign:"center", marginBottom:28 }}>
        {/* <div style={{ fontSize:11, letterSpacing:6, color:"#ff7f00", textTransform:"uppercase", marginBottom:6 }}>
          Numerical Methods — FDM Solver
        </div> */}
        <h1 style={{
          fontSize:"clamp(1.3rem,3vw,2rem)", fontWeight:900, margin:0,
          background:"linear-gradient(90deg,#ff7f00,#ffcd44,#ff7f00)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", letterSpacing:2
        }}>2D STEADY-STATE HEAT CONDUCTION</h1>
        {/* <div style={{ fontSize:11, color:"#455070", marginTop:6, letterSpacing:3 }}>
          ∂²T/∂x² + ∂²T/∂y² = 0 &nbsp;|&nbsp; C++ GAUSS-SEIDEL FDM · UP TO 1000×1000
        </div> */}
      </div>

      {/* Layout */}
      <div style={{ display:"flex", gap:20, flexWrap:"wrap", justifyContent:"center", alignItems:"flex-start" }}>

        {/* Control Panel */}
        <div style={{ background:"#0e1425", border:"1px solid #1e2a40", borderRadius:12, padding:20, minWidth:240, maxWidth:278 }}>

          <SectionLabel>① Grid Setup</SectionLabel>
          <Row label="Grid Size N×N">
            <NumInput value={gridSize} min={2} max={1000}
              onChange={v => { setGridSize(v); setSolved(false); setFlatGrid(null); setResult(null); }} />
            <span style={{ color:"#455070", marginLeft:6, fontSize:11 }}>boxes</span>
          </Row>

          {/* Quick presets */}
          {/* <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:6 }}>
            {[4,10,20,50,100,200,500,1000].map(s => (
              <button key={s}
                onClick={() => { setGridSize(s); setSolved(false); setFlatGrid(null); setResult(null); }}
                style={{
                  padding:"2px 7px", fontSize:10, border:"1px solid #2a3550",
                  borderRadius:4,
                  background: gridSize===s ? "#ff7f00" : "#131b2e",
                  color:      gridSize===s ? "#000"    : "#8899bb",
                  cursor:"pointer", fontFamily:"inherit"
                }}>{s}</button>
            ))}
          </div> */}

          {/* {N >= 50 && (
            <div style={{ fontSize:10, color:"#44aa66", marginBottom:8, padding:"4px 8px", background:"#0a1a10", borderRadius:5 }}>
              ⚡ Large grid — canvas pixel render active
            </div>
          )}
          {N >= 500 && (
            <div style={{ fontSize:10, color:"#ffbb22", marginBottom:8, padding:"4px 8px", background:"#1a1400", borderRadius:5 }}>
              ⚠ {N}×{N} may take 30–120 s. Please wait.
            </div>
          )}
          <div style={{ height:10 }} /> */}

          <SectionLabel>② Boundary Temperatures</SectionLabel>
          <div style={{ display:"grid", gap:8 }}>
            <BndInput label="🔴 Top"    color="#ff4444" value={bTop}   onChange={v=>{ setBTop(v);   setSolved(false); }} />
            <BndInput label="🔵 Bottom" color="#4488ff" value={bBot}   onChange={v=>{ setBBot(v);   setSolved(false); }} />
            <BndInput label="🟢 Left"   color="#44cc77" value={bLeft}  onChange={v=>{ setBLeft(v);  setSolved(false); }} />
            <BndInput label="🟡 Right"  color="#ffbb22" value={bRight} onChange={v=>{ setBRight(v); setSolved(false); }} />
          </div>
          <div style={{ height:16 }} />

          <SectionLabel>③ Query Box (i, j)</SectionLabel>
          <div style={{ fontSize:11, color:"#455070", marginBottom:8 }}>Click grid or type (1 to {N})</div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <span style={{ color:"#ff7f00", fontSize:13 }}>i =</span>
            <NumInput value={boxI} min={1} max={N} small
              onChange={v => { setBoxI(v); flatGrid && setResult(computeBox(flatGrid, nodeNRef.current, N, v, boxJ)); }} />
            <span style={{ color:"#ff7f00", fontSize:13, marginLeft:8 }}>j =</span>
            <NumInput value={boxJ} min={1} max={N} small
              onChange={v => { setBoxJ(v); flatGrid && setResult(computeBox(flatGrid, nodeNRef.current, N, boxI, v)); }} />
          </div>
          <div style={{ height:18 }} />

          <button onClick={handleSolve} disabled={loading} style={{
            width:"100%", padding:"10px 0",
            background: loading
              ? "linear-gradient(135deg,#664400,#553300)"
              : "linear-gradient(135deg,#ff7f00,#e65c00)",
            border:"none", borderRadius:8, color:"#fff", fontWeight:900, fontSize:14,
            letterSpacing:2, cursor:loading?"not-allowed":"pointer", fontFamily:"inherit",
            boxShadow:"0 4px 20px rgba(255,127,0,0.3)", transition:"opacity .15s"
          }}>
            {loading ? "⏳ COMPUTING C++…" : "▶ SOLVE FDM"}
          </button>

          {solved && (
            <div style={{ marginTop:10, fontSize:11, color:"#455070", textAlign:"center", lineHeight:2 }}>
              <span style={{ color:"#ff7f00" }}>{iters}</span> iterations &nbsp;|&nbsp;
              {N+1}×{N+1} nodes<br />
              {converged
                ? <span style={{ color:"#44cc77" }}>✔ Converged (tol 1e-5)</span>
                : <span style={{ color:"#ffbb22" }}>⚠ Max iters reached (10 000)</span>}
              <br />
              <span style={{ color:"#44aa66" }}>⚡ {solveMs}ms</span>
            </div>
          )}

          {/* <div style={{
            marginTop:14, padding:"8px 10px", background:"#0a1020",
            border:"1px solid #1a3020", borderRadius:8, fontSize:10, color:"#336644", lineHeight:1.8
          }}>
            <span style={{ color:"#44aa66" }}>⚡ C++ Backend</span><br />
            Gauss-Seidel FDM · tol 1e-5<br />
            Flat array · 3 dp JSON<br />
            Canvas render · up to 1000×1000<br />
            <span style={{ color:"#224433" }}>localhost:3001/solve</span>
          </div> */}
        </div>

        {/* Grid Visuals */}
        {flatGrid && (
          <div style={{ display:"flex", gap:20, flexWrap:"wrap", justifyContent:"center" }}>

            <GridPanel
              title="NODE TEMPERATURES"
              subtitle={`${N+1}×${N+1} nodes`}>
              <GridTopBnd value={bTop} color="#ff4444" />
              <div style={{ display:"flex" }}>
                <BndLabel value={bLeft} color="#44cc77" />
                <HeatCanvas
                  flatGrid={flatGrid} N={N} nodeN={nodeNRef.current}
                  minT={minT} maxT={maxT} result={result}
                  isBoxGrid={false} />
                <BndLabel value={bRight} color="#ffbb22" right />
              </div>
              <GridBotBnd value={bBot} color="#4488ff" />
              <ColorScale minT={minT} maxT={maxT} />
            </GridPanel>

            <GridPanel
              title="BOX SELECTOR"
              subtitle={`${N}×${N} boxes · click to query`}>
              <GridTopBnd value={bTop} color="#ff4444" />
              <div style={{ display:"flex" }}>
                <BndLabel value={bLeft} color="#44cc77" />
                <HeatCanvas
                  flatGrid={flatGrid} N={N} nodeN={nodeNRef.current}
                  minT={minT} maxT={maxT} result={result}
                  isBoxGrid onBoxClick={handleBoxClick} />
                <BndLabel value={bRight} color="#ffbb22" right />
              </div>
              <GridBotBnd value={bBot} color="#4488ff" />
              <div style={{ fontSize:10, color:"#455070", textAlign:"center", marginTop:6 }}>
                Avg of 4 corner nodes
              </div>
            </GridPanel>
          </div>
        )}
      </div>

      {/* API Error */}
      {apiError && (
        <div style={{
          maxWidth:480, margin:"24px auto", background:"#1a0a0a",
          border:"1px solid #cc2222", borderRadius:10, padding:"16px 20px",
          textAlign:"center", color:"#ff8888", fontSize:13
        }}>
          <div style={{ fontSize:15, marginBottom:8 }}>⚠ Backend Error</div>
          <div style={{ color:"#ff6666", marginBottom:10 }}>{apiError}</div>
          <div style={{ fontSize:11, color:"#884444", lineHeight:1.8 }}>
            1. Compile: <code style={{ color:"#ffaa88" }}>g++ -O2 -o heat2d heat2d.cpp</code><br />
            2. Start:&nbsp;&nbsp; <code style={{ color:"#ffaa88" }}>node server.js</code><br />
            3. Server must be at <code style={{ color:"#ffaa88" }}>localhost:3001</code>
          </div>
        </div>
      )}

      {/* Result Panel */}
      {result && !result.error && (
        <div style={{
          maxWidth:560, margin:"28px auto 0", background:"#0e1425",
          border:"1px solid #ff7f0066", borderRadius:14, padding:24,
          boxShadow:"0 0 40px rgba(255,127,0,0.08)"
        }}>
          <div style={{ fontSize:11, color:"#ff7f00", letterSpacing:4, marginBottom:4 }}>RESULT</div>
          <h2 style={{ margin:"0 0 18px", color:"#ffcd44", fontSize:"1.2rem" }}>
            Center of Box ({result.i}, {result.j})
          </h2>

          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:20 }}>
            <div style={{ fontSize:11, color:"#455070", marginBottom:8 }}>
              4 surrounding nodes (C++ Gauss-Seidel temperatures):
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:4, alignItems:"center" }}>
              <NodeBox label={`(${result.i-1},${result.j-1})`} value={result.TL} />
              <div style={{ fontSize:18, color:"#455070", padding:"0 8px" }}>⟷</div>
              <NodeBox label={`(${result.i-1},${result.j})`}   value={result.TR} />
            </div>
            <div style={{ display:"flex", justifyContent:"center", color:"#455070", fontSize:18, margin:"4px 0" }}>↕</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:4, alignItems:"center" }}>
              <NodeBox label={`(${result.i},${result.j-1})`}   value={result.BL} />
              <div style={{ fontSize:18, color:"#455070", padding:"0 8px" }}>⟷</div>
              <NodeBox label={`(${result.i},${result.j})`}     value={result.BR} />
            </div>
          </div>

          <div style={{
            background:"#090d1a", borderRadius:8, padding:"12px 16px",
            marginBottom:16, fontSize:12, color:"#6880a0", lineHeight:2
          }}>
            <div>T<sub>center</sub> = ( T<sub>TL</sub> + T<sub>TR</sub> + T<sub>BL</sub> + T<sub>BR</sub> ) / 4</div>
            <div style={{ color:"#8899bb" }}>
              = ({result.TL.toFixed(3)} + {result.TR.toFixed(3)} + {result.BL.toFixed(3)} + {result.BR.toFixed(3)}) / 4
            </div>
            <div style={{ color:"#aabbcc" }}>= {(result.TL+result.TR+result.BL+result.BR).toFixed(3)} / 4</div>
          </div>

          <div style={{
            background:"linear-gradient(135deg,#1a0e00,#291500)",
            border:"1px solid #ff7f00", borderRadius:10, padding:18, textAlign:"center"
          }}>
            <div style={{ fontSize:11, color:"#ff7f00", letterSpacing:4, marginBottom:8 }}>
              TEMPERATURE AT CENTER OF BOX ({result.i},{result.j})
            </div>
            <div style={{
              fontSize:"2.6rem", fontWeight:900, letterSpacing:2,
              background:"linear-gradient(90deg,#ff7f00,#ffcd44)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"
            }}>
              {result.centerT.toFixed(6)}
            </div>
            <div style={{ fontSize:18, color:"#ff7f00aa", marginTop:4 }}>°C</div>
          </div>
        </div>
      )}

      {result && result.error && (
        <div style={{
          maxWidth:400, margin:"24px auto", background:"#1a0a0a",
          border:"1px solid #cc2222", borderRadius:10, padding:16,
          textAlign:"center", color:"#ff8888"
        }}>⚠ {result.error}</div>
      )}
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return <div style={{ fontSize:10, color:"#ff7f00", letterSpacing:3, marginBottom:8, textTransform:"uppercase" }}>{children}</div>;
}
function Row({ label, children }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6, fontSize:12, color:"#8899bb" }}>
      <span style={{ minWidth:70 }}>{label}</span>{children}
    </div>
  );
}
function NumInput({ value, min, max, onChange, small }) {
  return (
    <input type="number" value={value} min={min} max={max}
      onChange={e => onChange(parseInt(e.target.value) || min)}
      style={{
        width:small?52:72, background:"#131b2e", color:"#ffcd44",
        border:"1px solid #2a3550", borderRadius:5, padding:"4px 8px",
        fontFamily:"inherit", fontSize:13, fontWeight:700
      }} />
  );
}
function BndInput({ label, color, value, onChange }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <span style={{ color, fontSize:12, minWidth:72 }}>{label}</span>
      <input type="number" value={value} onChange={e => onChange(parseFloat(e.target.value)||0)}
        style={{
          flex:1, background:"#131b2e", color,
          border:`1px solid ${color}55`, borderRadius:5,
          padding:"4px 8px", fontFamily:"inherit", fontSize:13, fontWeight:700
        }} />
      <span style={{ fontSize:11, color:"#455070" }}>°C</span>
    </div>
  );
}
function GridPanel({ title, subtitle, children }) {
  return (
    <div style={{ background:"#0e1425", border:"1px solid #1e2a40", borderRadius:12, padding:16 }}>
      <div style={{ fontSize:10, color:"#ff7f00", letterSpacing:3, marginBottom:2 }}>{title}</div>
      <div style={{ fontSize:10, color:"#455070", marginBottom:10 }}>{subtitle}</div>
      {children}
    </div>
  );
}
function GridTopBnd({ value, color }) {
  return (
    <div style={{ textAlign:"center", fontSize:11, color, fontWeight:700,
      paddingBottom:4, borderBottom:`2px solid ${color}`, marginBottom:2 }}>
      T = {value}°C (Top)
    </div>
  );
}
function GridBotBnd({ value, color }) {
  return (
    <div style={{ textAlign:"center", fontSize:11, color, fontWeight:700,
      paddingTop:4, borderTop:`2px solid ${color}`, marginTop:2 }}>
      T = {value}°C (Bottom)
    </div>
  );
}
function BndLabel({ value, color, right }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"0 6px", fontSize:10, color, fontWeight:700,
      writingMode:"vertical-rl", textOrientation:"mixed",
      transform: right ? "none" : "rotate(180deg)",
      borderRight: right ? undefined : `2px solid ${color}`,
      borderLeft:  right ? `2px solid ${color}` : undefined,
      minWidth:22,
    }}>
      {value}°C
    </div>
  );
}
function ColorScale({ minT, maxT }) {
  const stops = [0,0.25,0.5,0.75,1];
  const grad  = stops.map(s => tempToColor(minT + s*(maxT-minT), minT, maxT)).join(",");
  return (
    <div style={{ marginTop:10 }}>
      <div style={{ height:8, borderRadius:4, background:`linear-gradient(90deg,${grad})`, margin:"0 8px" }} />
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:9, color:"#455070", margin:"3px 8px 0" }}>
        <span>{minT.toFixed(1)}°C</span>
        <span>{((minT+maxT)/2).toFixed(1)}°C</span>
        <span>{maxT.toFixed(1)}°C</span>
      </div>
    </div>
  );
}
function NodeBox({ label, value }) {
  return (
    <div style={{ background:"#131b2e", border:"1px solid #2a3550", borderRadius:8, padding:"10px 14px", textAlign:"center" }}>
      <div style={{ fontSize:10, color:"#455070", marginBottom:4 }}>Node {label}</div>
      <div style={{ fontSize:15, color:"#ffcd44", fontWeight:700 }}>{value.toFixed(4)}</div>
      <div style={{ fontSize:10, color:"#455070" }}>°C</div>
    </div>
  );
}