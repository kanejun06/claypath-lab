/* ClayPath Lab / ClayMorph Lab — wall helpers
 * slope(): slope compensation. On a leaning wall a bead of width w laid flat is only w·cosθ thick across the wall
 * (θ = lean from vertical), so flaring or leaning parts come out thin and weak. This widens the bead there by
 * 1/cosθ = √(1+tan²θ) (capped) so the thickness across the wall stays at the line width. The lean is measured on the
 * designed form (before XY / Z / bump modulation) against the point one turn below.
 */
window.ClayWall=(function(){
"use strict";
// pts: path points ({x,y,z, m, f, bottom, join, layer}); stride: points per turn; cap: largest factor; flow: true when
// thickness is made by slowing down (flow mode), so speed is divided by the same factor. Returns stats.
function slope(pts,stride,cap,flow){ let n=0, kmax=1;
  for(let i=stride;i<pts.length;i++){ const p=pts[i], q=pts[i-stride]; if(p.bottom||q.bottom||p.join) continue;
    const dz=p.z-q.z; if(dz<=1e-6) continue; const t=Math.hypot(p.x-q.x,p.y-q.y)/dz; const k=Math.min(cap,Math.sqrt(1+t*t));
    if(k>1.005){ p.m*=k; if(flow) p.f/=k; n++; if(k>kmax) kmax=k; } }
  return {n,kmax}; }
return {slope};
})();
