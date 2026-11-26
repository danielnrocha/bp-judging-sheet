(()=>{const db={bp_tournaments:[],bp_debates:[]};let n=0;const id=()=>'id'+(++n)+'-'+Math.random().toString(36).slice(2,6);
function Q(t){this.t=t;this.op='select';this.f=[];this.payload=null;this.one=false}
Q.prototype.select=function(){return this};Q.prototype.order=function(){return this};
Q.prototype.eq=function(k,v){this.f.push([k,v]);return this};Q.prototype.single=function(){this.one=true;return this};
Q.prototype.insert=function(p){this.op='insert';this.payload=p;return this};Q.prototype.update=function(p){this.op='update';this.payload=p;return this};Q.prototype.delete=function(){this.op='delete';return this};
Q.prototype.then=function(res,rej){if(window.__offline)return Promise.resolve({data:null,error:{message:'Failed to fetch'}}).then(res,rej);const T=db[this.t];const m=r=>this.f.every(([k,v])=>r[k]===v);let data;
if(this.op==='insert'){const r={id:id(),created_at:new Date().toISOString(),updated_at:new Date().toISOString(),...JSON.parse(JSON.stringify(this.payload))};T.push(r);data=[r]}
else if(this.op==='update'){data=T.filter(m);data.forEach(r=>Object.assign(r,JSON.parse(JSON.stringify(this.payload)),{updated_at:new Date().toISOString()}))}
else if(this.op==='delete'){data=T.filter(m);db[this.t]=T.filter(r=>!m(r));if(this.t==='bp_tournaments')db.bp_debates=db.bp_debates.filter(d=>!data.some(x=>x.id===d.tournament_id))}
else data=T.filter(m).map(r=>JSON.parse(JSON.stringify(r)));
const out=this.one?{data:data[0]||null,error:data[0]?null:{message:'not found'}}:{data,error:null};return Promise.resolve(out).then(res,rej)};
window.__db=db;
window.__sbMock={from:t=>new Q(t),auth:{getSession:()=>Promise.resolve({data:{session:{user:{id:'u1',email:'juiz@teste'}}}}),onAuthStateChange:()=>{},signOut:()=>Promise.resolve()}};})();
