/* ClayMorph Lab — save the vessel as one closed STL solid
 * Builds a watertight solid from the per-layer contours (the wall centre line the nozzle follows):
 * each contour is pushed outward by half the line width (so a slicer that runs its outer wall half a line width inside
 * the surface — Cura's vase mode, for one — lands on the same path), stacked from Z=0 to the top, and closed with a
 * flat bottom and a flat top. mm, part centred on the origin, bed at Z=0. Modulation (thickness, speed, XY, Z) is not
 * in it: it is the designed form, for slicing, CAD and rendering.
 */
window.ClaySTL=(function(){
"use strict";
// contours: [{pts:Float32Array(N*2), ...}] CCW and index-aligned; zs: height of each contour; returns Float32Array of triangles (9 floats each)
function solid(contours,zs,zTop,offset){ const L=contours.length; if(!L) return null; const N=contours[0].pts.length/2;
  const ring=c=>{ const p=c.pts, out=new Array(N);
    for(let i=0;i<N;i++){ const a=(i+N-1)%N, b=(i+1)%N; let e1x=p[i*2]-p[a*2], e1y=p[i*2+1]-p[a*2+1], e2x=p[b*2]-p[i*2], e2y=p[b*2+1]-p[i*2+1];
      const l1=Math.hypot(e1x,e1y)||1, l2=Math.hypot(e2x,e2y)||1; e1x/=l1; e1y/=l1; e2x/=l2; e2y/=l2;
      let nx=(e1y+e2y)/2, ny=-(e1x+e2x)/2; const nl=Math.hypot(nx,ny)||1; nx/=nl; ny/=nl; // CCW: outward normal = (ty, -tx)
      const cosh=Math.max(0.5, e1y*nx-e1x*ny); out[i]=[p[i*2]+nx*offset/cosh, p[i*2+1]+ny*offset/cosh]; }
    return out; };
  const R=contours.map(ring); const levels=[{r:R[0],z:0}]; for(let k=0;k<L;k++) levels.push({r:R[k],z:zs[k]}); levels.push({r:R[L-1],z:zTop});
  const tris=[]; const T=(a,b,c)=>tris.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);
  for(let k=0;k+1<levels.length;k++){ const A=levels[k], B=levels[k+1]; if(B.z<=A.z) continue;
    for(let i=0;i<N;i++){ const j=(i+1)%N; const a=[A.r[i][0],A.r[i][1],A.z], b=[A.r[j][0],A.r[j][1],A.z], c=[B.r[j][0],B.r[j][1],B.z], d=[B.r[i][0],B.r[i][1],B.z]; T(a,b,c); T(a,c,d); } }
  // caps: triangulate the bottom and top rings (concave shapes too); bottom faces down, top faces up
  const cap=(lv,up)=>{ const shape=lv.r.map(q=>new THREE.Vector2(q[0],q[1])); let faces;
    try{ faces=THREE.ShapeUtils.triangulateShape(shape,[]); }catch(e){ faces=[]; }
    for(const f of faces){ let [a,b,c]=f.map(i=>[lv.r[i][0],lv.r[i][1],lv.z]); const cross=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]); if((cross>0)!==up) [b,c]=[c,b]; T(a,b,c); } };
  cap(levels[0],false); cap(levels[levels.length-1],true);
  return new Float32Array(tris); }
function binary(tri){ const n=tri.length/9; const buf=new ArrayBuffer(84+50*n), dv=new DataView(buf); const head='ClayMorph Lab STL: closed vessel solid, mm';
  for(let i=0;i<Math.min(80,head.length);i++) dv.setUint8(i,head.charCodeAt(i)); dv.setUint32(80,n,true); let o=84;
  for(let t=0;t<n;t++){ const v=tri.subarray(t*9,t*9+9); const ux=v[3]-v[0],uy=v[4]-v[1],uz=v[5]-v[2], wx=v[6]-v[0],wy=v[7]-v[1],wz=v[8]-v[2];
    let nx=uy*wz-uz*wy, ny=uz*wx-ux*wz, nz=ux*wy-uy*wx; const l=Math.hypot(nx,ny,nz)||1;
    dv.setFloat32(o,nx/l,true); dv.setFloat32(o+4,ny/l,true); dv.setFloat32(o+8,nz/l,true); o+=12; for(let k=0;k<9;k++){ dv.setFloat32(o,v[k],true); o+=4; } dv.setUint16(o,0,true); o+=2; }
  return buf; }
// returns {ok,msg} for the page to show
function save(tri,base){ if(!tri||!tri.length) return {ok:false,msg:'保存する形がありません'}; const buf=binary(tri); const n=tri.length/9;
  const name=(base||'clay').replace(/[^\w\-一-龠ぁ-んァ-ヶー]/g,'_')+'.stl'; const mb=(buf.byteLength/1048576).toFixed(1);
  try{ const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([buf],{type:'model/stl'})); a.download=name; document.body.appendChild(a); a.click(); a.remove();
    return {ok:true,msg:`${name} を書き出しました（閉じた立体、${n.toLocaleString()} 三角形、${mb} MB）`}; }
  catch(e){ return {ok:false,msg:'この表示では STL を保存できません'}; } }
return {solid,binary,save};
})();
