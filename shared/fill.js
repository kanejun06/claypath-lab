/* ClayPath Lab / ClayMorph Lab — shared bottom fill
 *
 * Fills the bottom layers of a vase-mode part from its per-layer contours (each {pts:Float32Array(N*2), cx, cy}, CCW,
 * index-aligned). Concentric spiral rings when they can reach the centre; otherwise (necks, notches) one outline ring plus
 * back-and-forth lines turned 90 degrees per layer. The last bottom layer always ends on the outline at index 0, where
 * the wall spiral starts.
 */
window.ClayFill=(function(){
"use strict";
function inPoly(p,pts){ let c=false; for(let i=0,j=pts.length-1;i<pts.length;j=i++){ const a=pts[i],b=pts[j]; if(((a[1]>p[1])!==(b[1]>p[1])) && p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0]) c=!c; } return c; }
// parallel lines at "pitch" spacing clipped to the polygon (even-odd), trimmed by "inset" at both ends
function hatchSegs(poly,ang,pitch,inset){ const c=Math.cos(ang), s=Math.sin(ang); const R=poly.map(p=>[p[0]*c+p[1]*s, -p[0]*s+p[1]*c]); let y0=1e9,y1=-1e9; for(const p of R){ y0=Math.min(y0,p[1]); y1=Math.max(y1,p[1]); }
  const segs=[]; const n=R.length;
  for(let y=y0+inset*0.75; y<=y1-inset*0.75+1e-9; y+=pitch){ const xs=[]; for(let k=0;k<n;k++){ const a=R[k],b=R[(k+1)%n]; if((a[1]<=y)!==(b[1]<=y)) xs.push(a[0]+(y-a[1])/(b[1]-a[1])*(b[0]-a[0])); } xs.sort((u,v)=>u-v);
    for(let k=0;k+1<xs.length;k+=2){ const xa=xs[k]+inset, xb=xs[k+1]-inset; if(xb-xa>0.5) segs.push([[xa,y],[xb,y]].map(p=>[p[0]*c-p[1]*s, p[0]*s+p[1]*c])); } }
  return segs; }
// o: {contours, N, nB, lh, H, spiral, pitch, ext, bottomShape:'wall'|'stl', fillMode:'auto'|'concentric'|'zigzag', wallDxy(theta,z), pts}
// pushes points into o.pts and returns what the stats need
function bottom(o){ const {contours,N,nB,lh,H,spiral,pitch,wallDxy,pts}=o; o.fillMode=o.fillMode||'auto'; const d2r0=Math.PI/180;
  let lastC=null, fillRings=0, fillConcave=0, fillZig=0, fillTravel=0, bottomWaveMax=0;
  for(let k=0;k<nB;k++){ const c=contours[k]||lastC; if(!c) continue; lastC=c; const z=(k+1)*lh;
    // inward vertex normals (miter-limited)
    const nxs=new Float32Array(N), nys=new Float32Array(N);
    for(let i=0;i<N;i++){ const a=(i+N-1)%N, b=(i+1)%N; let e1x=c.pts[i*2]-c.pts[a*2], e1y=c.pts[i*2+1]-c.pts[a*2+1]; let e2x=c.pts[b*2]-c.pts[i*2], e2y=c.pts[b*2+1]-c.pts[i*2+1];
      const l1=Math.hypot(e1x,e1y)||1, l2=Math.hypot(e2x,e2y)||1; e1x/=l1;e1y/=l1;e2x/=l2;e2y/=l2; // CCW: inward normal = (-ty, tx)
      let nx=(-e1y-e2y)/2, ny=(e1x+e2x)/2; const nl=Math.hypot(nx,ny)||1; nx/=nl; ny/=nl; const cosh=Math.max(0.5,(-e1y*nx+e1x*ny)); nxs[i]=nx/cosh; nys[i]=ny/cosh;
      if((e1x*e2y-e1y*e2x)<-1e-3) fillConcave++; }
    // how deep can we go: ring stays valid while every edge keeps its direction and area stays positive
    const ringOK=d=>{ let area=0; for(let i=0;i<N;i++){ const b=(i+1)%N; const x1=c.pts[i*2]+nxs[i]*d, y1=c.pts[i*2+1]+nys[i]*d, x2=c.pts[b*2]+nxs[b]*d, y2=c.pts[b*2+1]+nys[b]*d; area+=x1*y2-x2*y1;
        const ox=c.pts[b*2]-c.pts[i*2], oy=c.pts[b*2+1]-c.pts[i*2+1]; if((x2-x1)*ox+(y2-y1)*oy<0) return false; } return area>pitch*pitch; };
    let R=0; while(R<400 && ringOK((R+1)*pitch)) R++; fillRings=Math.max(fillRings,R); const ext=o.ext;
    const outward = ((nB-1-k)%2)===0; // last bottom layer ends at the outer ring where the wall starts
    // innermost ring -> its centroid, so the final turn closes the centre
    // wavy outline: the outer ring follows the wall's first layer, inner rings fade back to the STL shape
    const wv=new Float32Array(N), rnx=new Float32Array(N), rny=new Float32Array(N); let wmax=0;
    for(let i=0;i<N;i++){ const x0=c.pts[i*2]-c.cx, y0=c.pts[i*2+1]-c.cy; const r0=Math.hypot(x0,y0)||1; rnx[i]=x0/r0; rny[i]=y0/r0;
      if(o.bottomShape==='wall'){ const zw=(nB+1)*lh+(spiral?(i/N)*lh:0); wv[i]=wallDxy(Math.atan2(y0,x0),zw); wmax=Math.max(wmax,Math.abs(wv[i])); } }
    bottomWaveMax=Math.max(bottomWaveMax,wmax); const fd=Math.max(2*pitch,4*wmax+pitch); // fade distance
    const fadeAt=d=> d<=0?1:Math.max(0,1-d/fd);
    // concentric rings stop where the offset would fold over (necks, notches). If a sizeable area is left inside, the single
    // "turn to the centre" cannot fill it, so fall back to an outline plus back-and-forth fill.
    let innerA=0; { const d=R*pitch; for(let i=0;i<N;i++){ const b=(i+1)%N; innerA+=(c.pts[i*2]+nxs[i]*d)*(c.pts[b*2+1]+nys[b]*d)-(c.pts[b*2]+nxs[b]*d)*(c.pts[i*2+1]+nys[i]*d); } innerA=Math.abs(innerA)/2; }
    const useZig = o.fillMode==='zigzag' || (o.fillMode==='auto' && innerA>Math.PI*(1.5*pitch)**2);
    if(useZig){ fillZig++;
      const ring=[]; for(let e=ext;e>=0;e--){ const d=-e*pitch; for(let i=(e<ext?1:0);i<=N;i++){ const ii=i%N; ring.push([c.pts[ii*2]+nxs[ii]*d+rnx[ii]*wv[ii], c.pts[ii*2+1]+nys[ii]*d+rny[ii]*wv[ii]]); } }
      const poly=[]; for(let i=0;i<N;i++) poly.push([c.pts[i*2]+rnx[i]*wv[i], c.pts[i*2+1]+rny[i]*wv[i]]);
      const segs=hatchSegs(poly,(45+90*(k%2))*d2r0,pitch,pitch*0.9);
      const push=(q,travel)=>{ const dx=q[0]-c.cx,dy=q[1]-c.cy; const dd=Math.hypot(dx,dy)||1; if(travel&&pts.length) fillTravel++; pts.push({x:q[0],y:q[1],z,theta:Math.atan2(dy,dx),h:z/H,nx:dx/dd,ny:dy/dd,layer:k,bottom:true,bm:1,travel:travel&&pts.length>0}); };
      const emitHatch=(start,firstTravel)=>{ let cur=start, first=true; const rem=segs.slice();
        while(rem.length){ let bi=0,rev=false,bd=1e18; for(let j=0;j<rem.length;j++){ const g=rem[j]; const d0=Math.hypot(g[0][0]-cur[0],g[0][1]-cur[1]), d1=Math.hypot(g[1][0]-cur[0],g[1][1]-cur[1]); if(d0<bd){bd=d0;bi=j;rev=false;} if(d1<bd){bd=d1;bi=j;rev=true;} }
          const g=rem.splice(bi,1)[0]; const a=rev?g[1]:g[0], b=rev?g[0]:g[1];
          // short hop between neighbouring lines stays inside: extrude it (zigzag) instead of lifting
          const mid=[(cur[0]+a[0])/2,(cur[1]+a[1])/2]; const hop= bd<2.5*pitch && inPoly(mid,poly);
          push(a, first? firstTravel : !hop); const sl=Math.hypot(b[0]-a[0],b[1]-a[1]), ns=Math.max(1,Math.ceil(sl/2)); for(let u=1;u<=ns;u++) push([a[0]+(b[0]-a[0])*u/ns, a[1]+(b[1]-a[1])*u/ns],false); cur=b; first=false; }
        return cur; };
      const last=k===nB-1;
      if(last){ // fill first, then the outline, ending at the seam where the wall starts
        emitHatch(pts.length? [pts[pts.length-1].x,pts[pts.length-1].y] : ring[0], true);
        ring.forEach((q,j)=>push(q, j===0)); }
      else { ring.forEach((q,j)=>push(q, j===0)); emitHatch(ring[ring.length-1], false); }
      continue; }
    const dR=R*pitch; let lcx=0,lcy=0; for(let i=0;i<N;i++){ lcx+=c.pts[i*2]+nxs[i]*dR; lcy+=c.pts[i*2+1]+nys[i]*dR; } lcx/=N; lcy/=N;
    // the first turn runs as a closed ring at the outer offset (no radial step at the seam), then spirals inward
    const ringEnd=(R+ext+1)*N, total=ringEnd+N; for(let s=0;s<=total;s++){ const ss=outward? total-s : s; const i=ss%N; let x,y;
      let bm=1;
      if(ss<=ringEnd){ const d=pitch*Math.max(0,ss-N)/N-ext*pitch; const f=fadeAt(d); x=c.pts[i*2]+nxs[i]*d+rnx[i]*wv[i]*f; y=c.pts[i*2+1]+nys[i]*d+rny[i]*wv[i]*f;
        // ring spacing grows at peaks / shrinks in valleys while the wave fades: match extrusion to the local spacing
        if(d>0&&d<fd) bm=Math.min(1.3,Math.max(0.7,1+wv[i]/fd)); }
      else { const u=(ss-ringEnd)/N; const rx=c.pts[i*2]+nxs[i]*dR, ry=c.pts[i*2+1]+nys[i]*dR; x=rx+(lcx-rx)*u; y=ry+(lcy-ry)*u; }
      const dx=x-c.cx,dy=y-c.cy; const dd=Math.hypot(dx,dy)||1;
      pts.push({x,y,z,theta:Math.atan2(dy,dx),h:z/H,nx:dx/dd,ny:dy/dd,layer:k,bottom:true,bm,travel:s===0&&pts.length>0}); } }
  return {lastC,fillRings,fillConcave,fillZig,fillTravel,bottomWaveMax}; }
return {bottom, hatchSegs, inPoly};
})();
