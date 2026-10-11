
const CATS={
 "Roads & Potholes":{k:["pothole","road","crack","footpath","pavement","speed breaker"],sla:7,dept:"Public Works"},
 "Water Supply":{k:["water","pipe","leak","tap","supply","sewage","drain","overflow"],sla:3,dept:"Water Board"},
 "Garbage & Sanitation":{k:["garbage","waste","trash","dustbin","smell","dump","toilet","clean"],sla:2,dept:"Sanitation"},
 "Street Lights":{k:["light","lamp","dark","pole","bulb"],sla:5,dept:"Electrical"},
 "Stray Animals":{k:["dog","cattle","cow","stray","monkey","animal"],sla:4,dept:"Animal Control"},
 "Other":{k:[],sla:10,dept:"General Services"}};
const URGENT=["accident","danger","injur","urgent","manhole","shock","fire","flood","fell","collapse","slipped","child","hospital"];
const STATES=["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry"];
const GEO={
"Karnataka":["Bagalkot","Ballari","Belagavi","Bengaluru Rural","Bengaluru Urban","Bidar","Chamarajanagar","Chikkaballapur","Chikkamagaluru","Chitradurga","Dakshina Kannada","Davanagere","Dharwad","Gadag","Hassan","Haveri","Kalaburagi","Kodagu","Kolar","Koppal","Mandya","Mysuru","Raichur","Ramanagara","Shivamogga","Tumakuru","Udupi","Uttara Kannada","Vijayanagara","Vijayapura","Yadgir"],
"Tamil Nadu":["Ariyalur","Chengalpattu","Chennai","Coimbatore","Cuddalore","Dharmapuri","Dindigul","Erode","Kallakurichi","Kancheepuram","Kanyakumari","Karur","Krishnagiri","Madurai","Mayiladuthurai","Nagapattinam","Namakkal","Nilgiris","Perambalur","Pudukkottai","Ramanathapuram","Ranipet","Salem","Sivaganga","Tenkasi","Thanjavur","Theni","Thoothukudi","Tiruchirappalli","Tirunelveli","Tirupathur","Tiruppur","Tiruvallur","Tiruvannamalai","Tiruvarur","Vellore","Viluppuram","Virudhunagar"],
"Kerala":["Alappuzha","Ernakulam","Idukki","Kannur","Kasaragod","Kollam","Kottayam","Kozhikode","Malappuram","Palakkad","Pathanamthitta","Thiruvananthapuram","Thrissur","Wayanad"],
"Andhra Pradesh":["Alluri Sitharama Raju","Anakapalli","Ananthapuramu","Annamayya","Bapatla","Chittoor","Dr. B.R. Ambedkar Konaseema","East Godavari","Eluru","Guntur","Kakinada","Krishna","Kurnool","Nandyal","NTR","Palnadu","Parvathipuram Manyam","Prakasam","Sri Sathya Sai","Srikakulam","SPSR Nellore","Tirupati","Visakhapatnam","Vizianagaram","West Godavari","YSR Kadapa"],
"Telangana":["Adilabad","Bhadradri Kothagudem","Hanumakonda","Hyderabad","Jagtial","Jangaon","Jayashankar Bhupalpally","Jogulamba Gadwal","Kamareddy","Karimnagar","Khammam","Kumuram Bheem Asifabad","Mahabubabad","Mahabubnagar","Mancherial","Medak","Medchal-Malkajgiri","Mulugu","Nagarkurnool","Nalgonda","Narayanpet","Nirmal","Nizamabad","Peddapalli","Rajanna Sircilla","Rangareddy","Sangareddy","Siddipet","Suryapet","Vikarabad","Wanaparthy","Warangal","Yadadri Bhuvanagiri"],
"Maharashtra":["Ahilyanagar","Akola","Amravati","Beed","Bhandara","Buldhana","Chandrapur","Chhatrapati Sambhajinagar","Dharashiv","Dhule","Gadchiroli","Gondia","Hingoli","Jalgaon","Jalna","Kolhapur","Latur","Mumbai City","Mumbai Suburban","Nagpur","Nanded","Nandurbar","Nashik","Palghar","Parbhani","Pune","Raigad","Ratnagiri","Sangli","Satara","Sindhudurg","Solapur","Thane","Wardha","Washim","Yavatmal"],
"Goa":["North Goa","South Goa"]};
const STATUS=["Submitted","Assigned","In Progress","Resolved"];
const DAY=864e5;
let DB=[],view="home",authed=false,STATS=null,GPS=null,PHOTO=null,CIT=null,MINE=[],cmode="login";
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const cls=s=>s.replace(/ /g,"-");
const fmt=t=>new Date(t).toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"});
const place=c=>[c.loc,c.wardNo?"Ward "+c.wardNo:(/^Ward \d/.test(c.ward||"")?c.ward:""),c.district,c.state,c.pin].filter(Boolean).join(", ");
const late=c=>c.status!=="Resolved"&&Date.now()>c.due;

const ICONS={"road": "<path d=\"M8 3 5 21M16 3l3 18M12 4v3M12 10v4M12 17v3\"/>", "drop": "<path d=\"M12 3C9 8 6 11 6 15a6 6 0 0 0 12 0c0-4-3-7-6-12z\"/>", "bin": "<path d=\"M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6\"/>", "bulb": "<path d=\"M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10c1 1 1 2 1 3h6c0-1 0-2 1-3a6 6 0 0 0-4-10z\"/>", "paw": "<circle cx=\"6.5\" cy=\"11\" r=\"1.6\"/><circle cx=\"10\" cy=\"6.5\" r=\"1.6\"/><circle cx=\"14.5\" cy=\"6.5\" r=\"1.6\"/><circle cx=\"18\" cy=\"11\" r=\"1.6\"/><path d=\"M12 12c-3 0-5 3-5 5 0 2 2 2.5 5 1.5 3 1 5 .5 5-1.5 0-2-2-5-5-5z\"/>", "alert": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 8v5M12 16v.5\"/>"};
const CATICON={"Roads & Potholes":"road","Water Supply":"drop","Garbage & Sanitation":"bin","Street Lights":"bulb","Stray Animals":"paw","Other":"alert"};
const ic=(cat,lg)=>`<span class="ico${lg?" lg":""}"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[CATICON[cat]||"alert"]}</svg></span>`;
function upCat(){$("caticon").innerHTML=ic($("cat").value)}
/* ---------- talking to the server ---------- */
async function api(method,url,body){
 let r;try{r=await fetch(url,{method,headers:body?{"Content-Type":"application/json"}:{},body:body?JSON.stringify(body):undefined,credentials:"same-origin"})}catch(e){throw new Error("Cannot reach the server. Start it with npm start, then open http://localhost:3000 in your browser.")}
 let d={};try{d=await r.json()}catch(e){}
 if(!r.ok){const e=new Error(d.error||"Something went wrong ("+r.status+")");e.status=r.status;e.fields=d.fields;throw e}
 return d}
async function loadStats(){
 try{STATS=await api("GET","/api/stats");$("banner").hidden=true}
 catch(e){$("banner").hidden=false;$("banner").textContent=location.protocol==="file:"?"This page was opened as a file, so it cannot reach the server. Start the server (double-click start.bat, or run npm start) and open http://localhost:3000 instead.":"Cannot reach the server. Make sure it is running (npm start)."}
 renderHome()}
async function loadStaff(){try{DB=await api("GET","/api/complaints");renderStaff()}catch(e){if(e.status===401)setAuth(false)}}
function setAuth(on,user){authed=on;$("login").hidden=on;$("staffbody").hidden=!on;if(on){$("who").textContent="Logged in as "+user;loadStaff()}else DB=[]}
async function checkMe(){try{const m=await api("GET","/api/me");setAuth(true,m.user)}catch(e){setAuth(false)}}
async function doLogin(){$("e_login").textContent="";try{const m=await api("POST","/api/login",{username:$("lu").value.trim(),password:$("lp").value});$("lp").value="";setAuth(true,m.user)}catch(e){$("e_login").textContent=e.message}}
/* ---------- citizen account ---------- */
async function checkCitizen(){try{CIT=(await api("GET","/api/citizen/me")).username}catch(e){CIT=null}paintCitizen()}
function paintCitizen(){
 $("cauth").hidden=!!CIT;$("cbody").hidden=!CIT;
 document.querySelector('nav button[data-t="account"]').textContent=CIT?"My account ("+CIT+")":"My account";
 $("acctnote").textContent=CIT?"You are logged in as "+CIT+". This complaint will appear in your account.":"Tip: create an account (My account tab) to keep all your complaints in one place. You can also report without one.";
 if(CIT)loadMine();else{MINE=[];}}
async function loadMine(){try{MINE=await api("GET","/api/my/complaints");renderMine()}catch(e){if(e.status===401){CIT=null;paintCitizen()}}}
function renderMine(){
 $("cwho").textContent="Welcome, "+CIT;
 $("clist").innerHTML=MINE.length?MINE.slice().reverse().map(tcard).join(""):'<div class="card">You have not reported anything yet. Use "Report a new issue".</div>'}
function setCmode(m){cmode=m;const r=m==="register";
 $("ctitle").textContent=r?"Create a citizen account":"Citizen login";$("cgo").textContent=r?"Create account":"Log in";
 $("cp2box").hidden=!r;$("cuhint").hidden=!r;$("cphint").hidden=!r;
 $("cmodeL").className=r?"btn ghost":"btn";$("cmodeR").className=r?"btn":"btn ghost";
 $("cp").autocomplete=r?"new-password":"current-password";$("e_cauth").textContent=""}
async function cGo(){
 const err=m=>{$("e_cauth").textContent=m},u=$("cu").value.trim(),p=$("cp").value;err("");
 if(cmode==="register"){
  if(!/^[A-Za-z0-9_.-]{3,30}$/.test(u))return err("Username must be 3 to 30 characters: letters, digits, dot, dash or underscore.");
  if(p.length<8)return err("Password must be at least 8 characters.");
  if(p!==$("cp2").value)return err("The two passwords do not match.")}
 else if(!u||!p)return err("Enter your username and password.");
 try{const m=await api("POST",cmode==="register"?"/api/citizen/register":"/api/citizen/login",{username:u,password:p});CIT=m.username;$("cp").value="";$("cp2").value="";paintCitizen()}
 catch(e){err(e.message)}}
async function cLogout(){try{await api("POST","/api/citizen/logout")}catch(e){}CIT=null;paintCitizen()}
async function doLogout(){try{await api("POST","/api/logout")}catch(e){}setAuth(false)}

/* ---------- Random Forest (trained in the browser when the page loads) ---------- */
const TRAIN=[
"big pothole on main road bikes slipping|R|H","deep pothole near school accident happened|R|H","road completely damaged full of potholes|R|M","cracks on the road near bus stand|R|M","footpath broken tiles pedestrians cannot walk|R|M","speed breaker too high damaging vehicles|R|L","road not repaired since months after digging|R|M","open manhole on the road danger to vehicles|R|H","pavement stones missing near market|R|L","faded zebra crossing and road markings|R|L","road caved in after rain big hole|R|H","uneven road surface causing dust and bumps|R|L","bridge road has large crack heavy vehicles|R|H","new road work left half finished with gravel|R|M",
"water pipe leaking on the street wasting water|W|M","no water supply in our area for three days|W|H","drinking water is dirty and smells bad|W|H","sewage overflowing on road and entering houses|W|H","drain blocked and water logging near house|W|M","tap water pressure very low in morning|W|L","main pipeline burst flooding the road|W|H","borewell pump not working water shortage|W|M","water tank overflow leaking all night|W|L","drainage smell mosquitoes breeding stagnant water|W|M","water meter not working bill problem|W|L","contaminated water children are sick|W|H","water tanker not coming regularly|W|M","underground drain cover broken sewage leaking|W|M",
"garbage not collected for four days bad smell|G|M","garbage dump near house attracts flies and rats|G|M","dustbin overflowing in the market street|G|M","burning of waste causing smoke and breathing problems|G|H","public toilet is dirty and not cleaned|G|M","waste thrown on empty plot people dumping trash|G|L","dead animal on the road rotting smell|G|H","street not swept for many days dust everywhere|G|L","plastic waste blocking drain near park|G|M","garbage truck did not come this week|G|M","medical waste dumped near hospital gate|G|H","no dustbin in our lane|G|L","sanitation workers not cleaning drains|G|M","heap of construction debris on roadside|G|L",
"street light not working very dark at night|L|M","lamp post bulb fused in our lane|L|L","electric pole leaning and may fall|L|H","wires hanging from the pole danger electric shock|L|H","all street lights off since two days unsafe for women|L|H","light blinking continuously near park|L|L","dark road near school no lights|L|M","street lamp broken glass fallen|L|M","high mast light not working at junction|L|M","need new street light installed in the lane|L|L","light pole rusted and unsafe|L|M","lights on during daytime wasting electricity|L|L","transformer sparking near the pole|L|H","dim lights in the main road|L|L",
"stray dogs chasing people on the street|A|M","dog bite incident children attacked|A|H","cattle roaming on the highway blocking traffic|A|M","too many stray dogs barking at night|A|L","monkeys entering houses and stealing|A|M","cow sitting in the middle of the road accident risk|A|M","rabid dog seen in the colony|A|H","pigs roaming in the lane near garbage|A|L","stray cattle eating garbage near market|A|L","dead dog on the roadside|A|M","bull attacked a person near the market|A|H","street dogs need sterilization and vaccination|A|L","snake found in the residential area|A|H","stray animals damaging crops and gardens|A|L",
"request for new park bench in the garden|O|L","illegal construction on public land|O|M","encroachment on footpath by shops|O|M","noise from loudspeaker late night|O|L","need birth certificate correction at office|O|L","property tax bill amount is wrong|O|L","trees fallen blocking road after storm|O|H","public park gate is locked always|O|L","unauthorized hoardings banners on road|O|L","bus shelter damaged needs repair|O|L","tree branches touching electric wires|O|M","community hall not maintained|O|L","playground equipment broken children injured|O|H","mosquito fogging not done in our area|O|M"];
const CODE={R:"Roads & Potholes",W:"Water Supply",G:"Garbage & Sanitation",L:"Street Lights",A:"Stray Animals",O:"Other"},PRI={H:"High",M:"Medium",L:"Low"};
const STOP=new Set("the and for are was not has have with this that from our near since very been into over their there when they them than its all can any too out who".split(" "));
const SEVERE=/accident|danger|injur|attack|bite|bitten|sick|shock|fall|fell|burst|flood|overflow|sewage|dirty|contaminat|burn|rabid|snake|hospital|child|women|unsafe|medical|spark|dead|caved|manhole|slip|crack|leaning|smoke|breath|no water|bull/;
const LONG=/days|weeks|months|since|never|continuous|always|regular|every/;
const MINOR=/dim|faded|blink|bench|noise|marking|need new|steriliz|meter|daytime|rusted|bump|dust|stone|tiles|bill|certificate/;
const KW={R:["pothole","road","crack","footpath","pavement","speed breaker"],W:["water","pipe","leak","tap","supply","sewage","drain","overflow"],G:["garbage","waste","trash","dustbin","smell","dump","toilet","clean"],L:["light","lamp","dark","pole","bulb"],A:["dog","cattle","cow","stray","monkey","animal"]};
const toks=t=>{t=t.toLowerCase();const w=(t.match(/\p{L}+/gu)||[]).filter(w=>w.length>2&&!STOP.has(w)).map(w=>w.replace(/(ing|ed|s)$/,""));
 for(const k in KW)if(KW[k].some(x=>t.includes(x)))w.push("_k"+k);
 if(SEVERE.test(t))w.push("_severe");if(LONG.test(t))w.push("_long");if(MINOR.test(t))w.push("_minor");return[...new Set(w)]};
function seeded(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const gini=(c,n)=>{let g=1;for(const k in c)g-=(c[k]/n)**2;return g};
const tally=(rows,y)=>{const c={};rows.forEach(i=>c[y[i]]=(c[y[i]]||0)+1);return c};
function grow(rows,X,y,rnd,depth){
 const c=tally(rows,y),n=rows.length;
 if(Object.keys(c).length===1||depth>=14)return{leaf:c};
 const cnt=new Map();rows.forEach(i=>X[i].forEach(f=>cnt.set(f,(cnt.get(f)||0)+1)));
 const pool=[...cnt].filter(e=>e[1]<n).map(e=>e[0]);
 if(!pool.length)return{leaf:c};
 const m=Math.max(2,Math.round(Math.sqrt(pool.length))),pick=new Set();
 while(pick.size<Math.min(m,pool.length))pick.add(pool[Math.floor(rnd()*pool.length)]);
 let best=null,bg=gini(c,n);
 for(const f of pick){
  const L=[],R=[];rows.forEach(i=>(X[i].has(f)?R:L).push(i));
  const g=(L.length*gini(tally(L,y),L.length)+R.length*gini(tally(R,y),R.length))/n;
  if(g<bg){bg=g;best={f,L,R}}}
 if(!best)return{leaf:c};
 return{f:best.f,l:grow(best.L,X,y,rnd,depth+1),r:grow(best.R,X,y,rnd,depth+1)}}
function leafProbs(t,x){while(!t.leaf)t=x.has(t.f)?t.r:t.l;let n=0;for(const k in t.leaf)n+=t.leaf[k];const p={};for(const k in t.leaf)p[k]=t.leaf[k]/n;return p}
function trainForest(docs,labels,nTrees,seed){
 const vocab=new Map();docs.forEach(d=>d.forEach(w=>{if(!vocab.has(w))vocab.set(w,vocab.size)}));
 const X=docs.map(d=>new Set(d.map(w=>vocab.get(w)))),rnd=seeded(seed),trees=[],oob=docs.map(()=>({}));
 for(let t=0;t<nTrees;t++){
  const idx=docs.map(()=>Math.floor(rnd()*docs.length)),inb=new Set(idx),tree=grow(idx,X,labels,rnd,0);
  trees.push(tree);
  docs.forEach((_,i)=>{if(!inb.has(i)){const p=leafProbs(tree,X[i]);for(const k in p)oob[i][k]=(oob[i][k]||0)+p[k]}})}
 let ok=0,tot=0;
 oob.forEach((o,i)=>{const ks=Object.keys(o).sort((a,b)=>o[b]-o[a]);if(ks.length){tot++;if(ks[0]===labels[i])ok++}});
 return{vocab,trees,acc:tot?ok/tot:0}}
function forestProbs(F,words){
 const x=new Set(words.filter(w=>F.vocab.has(w)).map(w=>F.vocab.get(w)));
 if(!x.size)return null;
 const p={};F.trees.forEach(t=>{const q=leafProbs(t,x);for(const k in q)p[k]=(p[k]||0)+q[k]/F.trees.length});return p}
const DOCS=TRAIN.map(s=>{const a=s.split("|");return{w:toks(a[0]),c:a[1],p:a[2]}});
const RF_CAT=trainForest(DOCS.map(d=>d.w),DOCS.map(d=>d.c),60,7);
const RF_PRI=trainForest(DOCS.map(d=>d.w),DOCS.map(d=>d.p),60,11);
function suggest(text){
 const w=toks(text),pc=forestProbs(RF_CAT,w),pp=forestProbs(RF_PRI,w);
 if(!pc)return{known:false};
 const top=Object.entries(pc).sort((a,b)=>b[1]-a[1])[0],pr=Object.entries(pp).sort((a,b)=>b[1]-a[1])[0];
 return{known:true,cat:CODE[top[0]],pri:PRI[pr[0]],conf:top[1],pconf:pr[1]}}



const V={
 name:v=>!v?"Enter your name.":!/^[\p{L}][\p{L}\p{M} .'-]{1,59}$/u.test(v)?"Use letters only (2 to 60 characters). No digits or symbols.":"",
 phone:v=>!v?"Enter your mobile number.":!/^[6-9]\d{9}$/.test(v)?"Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9.":"",
 pin:v=>!v?"Enter your PIN code.":!/^[1-9]\d{5}$/.test(v)?"PIN code must be 6 digits and cannot start with 0.":"",
 loc:v=>!v?"Enter the street, area or landmark.":(v.length<3||!/\p{L}/u.test(v))?"Enter at least 3 characters including letters.":"",
 desc:v=>!v?"Describe the problem.":v.length<10?"Write at least 10 characters.":(v.match(/\p{L}/gu)||[]).length<5?"Describe the problem in words.":""};
let pending=null;
function fillDistricts(){const s=$("state").value,l=GEO[s],sel=$("district");
 $("district2").value="";
 if(!s){sel.hidden=false;sel.disabled=true;sel.innerHTML='<option value="">Choose a state first</option>';$("district2").hidden=true;return}
 if(l){sel.hidden=false;sel.disabled=false;sel.innerHTML='<option value="">Select district</option>'+l.map(d=>`<option>${d}</option>`).join("")+'<option value="__o">My district is not listed</option>';$("district2").hidden=true}
 else{sel.hidden=true;$("district2").hidden=false}}
const typedDistrict=()=>$("district").hidden||$("district").value==="__o";
const districtVal=()=>typedDistrict()?$("district2").value.trim():$("district").value;
function vals(){return{name:$("name").value.trim().replace(/\s+/g," "),phone:$("phone").value.trim(),state:$("state").value,district:districtVal(),wardmode:$("wardmode").value,ward:$("ward").value.trim(),pin:$("pin").value.trim(),loc:$("loc").value.trim(),desc:$("desc").value.trim(),cat:$("cat").value,pri:$("pri").value}}
function validateAll(){
 const v=vals(),e={};
 e.name=V.name(v.name);e.phone=V.phone(v.phone);
 e.state=v.state?"":"Select your state or union territory.";
 e.district=!v.state?"":!v.district?"Select or type your district.":(typedDistrict()&&!/^[\p{L}\p{M} .'-]{2,50}$/u.test(v.district))?"District name must contain letters only.":"";
 e.wardmode=v.wardmode?"":"Choose whether your area has ward numbers.";
 e.ward=v.wardmode==="yes"&&!/^[1-9]\d{0,2}$/.test(v.ward)?"Enter your ward number (1 to 999), digits only.":"";
 e.pin=V.pin(v.pin);e.loc=V.loc(v.loc);e.desc=V.desc(v.desc);
 let ok=true;
 for(const k in e){$("e_"+k).textContent=e[k];const inp=$(k==="district"&&typedDistrict()?"district2":k);inp.classList.toggle("bad",!!e[k]);if(e[k]&&ok){ok=false;inp.focus()}}
 return ok}
function check(){
 if(!validateAll())return;
 const p=pending=vals();
 const wl=p.wardmode==="yes"?"Ward "+p.ward:p.wardmode==="no"?"No wards in this area":"Not sure (officer will find it)";
 const rows=[["Name",p.name],["Mobile","+91 "+p.phone],["State",p.state],["District",p.district],["Ward",wl],["PIN code",p.pin],["Location",p.loc],["Category",p.cat],["Priority",p.pri],["Problem",p.desc],["Map location",GPS?"Added":"Not added"],["Photo",PHOTO?"Attached":"Not attached"]];
 $("review").innerHTML='<h2>Review your complaint</h2><p class="meta">Check every detail. You will get updates on this mobile number.</p><dl class="rev">'+rows.map(r=>`<dt>${r[0]}</dt><dd>${esc(r[1])}</dd>`).join("")+'</dl><p class="err" id="e_confirm"></p><div class="ctrl"><button class="btn" id="confirm">Confirm and submit</button><button class="btn ghost" id="edit">Edit details</button></div>';
 $("formcard").hidden=true;$("review").hidden=false;$("done").hidden=true;window.scrollTo(0,0);
 $("confirm").onclick=confirmSubmit;$("edit").onclick=()=>{$("review").hidden=true;$("formcard").hidden=false}}
async function confirmSubmit(){
 const p=pending;if(!p)return;$("confirm").disabled=true;$("e_confirm").textContent="";
 try{
  const c=await api("POST","/api/complaints",{...p,lat:GPS&&GPS.lat,lng:GPS&&GPS.lng,photo:PHOTO});
  pending=null;$("review").hidden=true;$("done").hidden=false;
  $("done").innerHTML=`<h3>${c.merged?"Added to an existing complaint":"Complaint submitted"}</h3><p>Your complaint ID is <b style="font-size:24px">${c.id}</b>. Keep it, and use it with your mobile number to track progress.</p><p class="meta">Assigned to ${esc(c.dept)}. Target resolution by ${fmt(c.due)}.</p><div class="ctrl"><button class="btn" id="trk">Track this complaint</button>${CIT?'<button class="btn" id="mine">View in my account</button>':""}<button class="btn ghost" id="again">File another complaint</button></div>`;
  ["name","phone","pin","loc","desc","ward","district2"].forEach(i=>$(i).value="");$("wardmode").value="";$("wardbox").hidden=true;$("state").value="";fillDistricts();
  GPS=null;PHOTO=null;$("photo").value="";$("gpsmsg").textContent="Not added";$("photomsg").textContent="The photo is shrunk automatically before it is sent.";
  $("again").onclick=()=>{$("done").hidden=true;$("formcard").hidden=false};
  $("trk").onclick=()=>{$("tid").value=c.id;$("tphone").value=p.phone;go("track");track()};
  if($("mine"))$("mine").onclick=()=>go("account");
 }catch(e){$("confirm").disabled=false;$("e_confirm").textContent=e.message+" "+Object.values(e.fields||{}).join(" ")}}

const tcard=c=>`<div class="card"><div class="row"><h3 style="display:flex;gap:10px;align-items:center">${ic(c.cat)}${c.id}: ${esc(c.cat)}</h3><span class="tag s-${cls(c.status)}">${c.status}</span></div>
  <p>${esc(c.desc)}</p><p class="meta">${esc(place(c))} · Filed ${fmt(c.created)} · ${esc(c.dept)} · ${c.votes} report(s) · Target ${fmt(c.due)}</p>
  <ul class="tl">${c.log.map(l=>`<li><b>${l.s}</b> <span class="meta">${fmt(l.t)}</span><br>${esc(l.n)}</li>`).join("")}</ul></div>`;
async function track(){
 const id=$("tid").value.trim(),phone=$("tphone").value.replace(/\D/g,""),out=$("tres");
 if(!id||!phone){out.innerHTML='<div class="card">Enter both your complaint ID and the mobile number you used.</div>';return}
 out.innerHTML='<div class="card">Looking up...</div>';
 try{out.innerHTML=tcard(await api("GET","/api/track?id="+encodeURIComponent(id)+"&phone="+encodeURIComponent(phone)))}
 catch(e){out.innerHTML=`<div class="card">${esc(e.message)}</div>`}}

/* ---------- rendering ---------- */
function render(){renderHome();if(view==="staff"&&authed)renderStaff()}
function renderHome(){
 const S=STATS||{total:0,resolved:0,inProgress:0,overdue:0,latest:[]};
 $("live").innerHTML=[["Complaints filed",S.total],["Resolved",S.resolved],["In progress",S.inProgress],["Overdue",S.overdue]].map(s=>`<div class="stat"><b>${s[1]}</b><span>${s[0]}</span></div>`).join("");
 $("latest").innerHTML=S.latest.length?S.latest.map(c=>`<div class="ticket"><div class="row"><span style="display:flex;gap:8px;align-items:center">${ic(c.cat)}<b class="id">${c.id}</b></span><span class="tag s-${cls(c.status)}">${c.status}</span></div><div>${esc(c.cat)}</div><div class="meta">${esc([c.district,c.state].join(", "))} · ${fmt(c.created)}</div></div>`).join(""):'<div class="ticket full"><b class="id">No complaints yet</b><div class="meta">The first complaint filed will get the number MC-0001.</div></div>'}
function renderStaff(){
 const ds=[...new Set(DB.map(c=>c.district).filter(Boolean))].sort(),cur=$("fw").value;
 $("fw").innerHTML='<option value="">All districts</option>'+ds.map(d=>`<option>${esc(d)}</option>`).join("");$("fw").value=cur;
 const n=s=>DB.filter(c=>c.status===s).length;
 $("stats").innerHTML=[["Total",DB.length],["Submitted",n("Submitted")],["In progress",n("Assigned")+n("In Progress")],["Resolved",n("Resolved")],["Overdue",DB.filter(late).length]].map(s=>`<div class="stat"><b>${s[1]}</b><span>${s[0]}</span></div>`).join("");
 const max=Math.max(1,...Object.keys(CATS).map(k=>DB.filter(c=>c.cat===k).length));
 $("bars").innerHTML=Object.keys(CATS).map(k=>{const v=DB.filter(c=>c.cat===k).length;return `<div class="bar"><span>${k}</span><i style="width:${v/max*55}%;min-width:${v?4:0}px"></i><b>${v}</b></div>`}).join("");
 renderList()}
function renderList(){
 if($("list").contains(document.activeElement)&&document.activeElement.tagName==="INPUT")return;
 const fs=$("fs").value,fw=$("fw").value,o={High:0,Medium:1,Low:2};
 const rows=DB.filter(c=>(!fs||c.status===fs)&&(!fw||c.district===fw)).sort((a,b)=>(a.status==="Resolved")-(b.status==="Resolved")||o[a.pri]-o[b.pri]||a.n-b.n);
 $("list").innerHTML=rows.length?rows.map(c=>`<div class="item"><div class="row"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">${ic(c.cat)}<b>${c.id}</b> · ${esc(c.cat)} <span class="tag p-${c.pri}">${c.pri}</span> ${late(c)?'<span class="late">Overdue</span>':""}</div><span class="tag s-${cls(c.status)}">${c.status}</span></div>
  <p style="margin:4px 0">${esc(c.desc)}</p>${c.hasPhoto?`<a href="/api/complaints/${c.id}/photo" target="_blank" rel="noopener"><img src="/api/complaints/${c.id}/photo" alt="Photo for ${c.id}" style="max-width:160px;max-height:120px;border:1px solid var(--line);border-radius:4px;margin:4px 0"></a>`:""}${c.lat!=null?`<div class="meta"><a href="https://www.openstreetmap.org/?mlat=${c.lat}&mlon=${c.lng}#map=18/${c.lat}/${c.lng}" target="_blank" rel="noopener">View on map</a></div>`:""}<div class="meta">${esc(place(c))} · ${esc(c.name)}, ${esc(c.phone)} · Filed ${fmt(c.created)} · Due ${fmt(c.due)} · ${c.votes} report(s)</div>
  <div class="ctrl"><select data-id="${c.id}" aria-label="Status for ${c.id}">${STATUS.map(s=>`<option${s===c.status?" selected":""}>${s}</option>`).join("")}</select>
  <input data-id="${c.id}" placeholder="Add a note for the citizen" aria-label="Note for ${c.id}"><button class="btn" data-id="${c.id}" style="font-size:16px">Update</button></div></div>`).join(""):'<p class="meta">No complaints match these filters.</p>';
 $("list").querySelectorAll("button[data-id]").forEach(b=>b.onclick=async()=>{
  const id=b.dataset.id,c=DB.find(x=>x.id===id);
  const s=$("list").querySelector(`select[data-id="${id}"]`).value,nt=$("list").querySelector(`input[data-id="${id}"]`).value.trim();
  try{await api("PATCH","/api/complaints/"+id,{status:s,note:nt});await loadStaff()}catch(e){alert(e.message)}})}

/* ---------- Excel (.xlsx) writer, no external library needed ---------- */
const crcT=(()=>{const t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
const crc32=b=>{let c=0xFFFFFFFF;for(let i=0;i<b.length;i++)c=crcT[(c^b[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0};
const u16=n=>[n&255,(n>>8)&255],u32=n=>[n&255,(n>>8)&255,(n>>16)&255,(n>>>24)&255];
function makeZip(files){
 const enc=new TextEncoder(),parts=[],cd=[];let off=0;
 files.forEach(f=>{const nm=enc.encode(f.name),data=enc.encode(f.text),crc=crc32(data),sz=data.length;
  const lh=new Uint8Array([0x50,0x4b,3,4,...u16(20),...u16(0x800),...u16(0),...u16(0),...u16(0x21),...u32(crc),...u32(sz),...u32(sz),...u16(nm.length),...u16(0)]);
  parts.push(lh,nm,data);
  cd.push(new Uint8Array([0x50,0x4b,1,2,...u16(20),...u16(20),...u16(0x800),...u16(0),...u16(0),...u16(0x21),...u32(crc),...u32(sz),...u32(sz),...u16(nm.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(off)]),nm);
  off+=lh.length+nm.length+sz});
 const cdSize=cd.reduce((a,b)=>a+b.length,0);
 const end=new Uint8Array([0x50,0x4b,5,6,0,0,0,0,...u16(files.length),...u16(files.length),...u32(cdSize),...u32(off),0,0]);
 return new Blob([...parts,...cd,end],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"})}
const xe=v=>String(v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,"").replace(/[<>&"]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;"}[c]));
function makeXlsx(head,rows,widths){
 const H='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',NS='xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"';
 const all=[head,...rows];
 const body=all.map((r,ri)=>`<row r="${ri+1}">`+r.map((v,ci)=>{const ref=String.fromCharCode(65+ci)+(ri+1);
  return typeof v==="number"?`<c r="${ref}"><v>${v}</v></c>`:`<c r="${ref}" t="inlineStr"${ri===0?' s="1"':""}><is><t xml:space="preserve">${xe(v)}</t></is></c>`}).join("")+"</row>").join("");
 const sheet=H+`<worksheet ${NS}><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>`+widths.map((w,i)=>`<col min="${i+1}" max="${i+1}" width="${w}" customWidth="1"/>`).join("")+`</cols><sheetData>${body}</sheetData></worksheet>`;
 return makeZip([
  {name:"[Content_Types].xml",text:H+'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>'},
  {name:"_rels/.rels",text:H+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'},
  {name:"xl/workbook.xml",text:H+`<workbook ${NS} xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Complaints" sheetId="1" r:id="rId1"/></sheets></workbook>`},
  {name:"xl/_rels/workbook.xml.rels",text:H+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'},
  {name:"xl/styles.xml",text:H+`<styleSheet ${NS}><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`},
  {name:"xl/worksheets/sheet1.xml",text:sheet}])}
async function exportXlsx(){
 const head=["Complaint ID","Filed on","Name","Mobile","State","District","Ward","PIN code","Location","Category","Priority","Department","Status","Target date","Reports","Description"];
 const rows=DB.map(c=>[c.id,new Date(c.created).toLocaleString(),c.name,c.phone,c.state||"",c.district||"",c.wardNo?"Ward "+c.wardNo:(c.ward||""),c.pin||"",c.loc||"",c.cat,c.pri,c.dept,c.status,new Date(c.due).toLocaleDateString(),c.votes,c.desc]);
 const blob=makeXlsx(head,rows,[12,20,20,13,18,18,12,10,26,22,10,18,13,13,9,60]);
 try{const d=await window.claude.use("downloads");if(d){await d.save({filename:"complaints.xlsx",data:blob});return}}catch(e){if(e&&e.code==="declined")return}
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="complaints.xlsx";document.body.appendChild(a);a.click();a.remove()}

function go(n){view=n;["home","report","track","account","staff"].forEach(x=>$(x).hidden=x!==n);
 document.querySelectorAll("nav button").forEach(b=>b.setAttribute("aria-selected",b.dataset.t===n));
 window.scrollTo(0,0);if(n==="home")loadStats();if(n==="staff")checkMe();if(n==="account")checkCitizen();render()}

/* ---------- setup ---------- */
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>go(b.dataset.t));
document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go));
$("state").innerHTML='<option value="">Select state or UT</option>'+STATES.map(x=>`<option>${x}</option>`).join("");
$("state").onchange=fillDistricts;
$("district").onchange=()=>{$("district2").hidden=$("district").value!=="__o"};
$("wardmode").onchange=()=>{$("wardbox").hidden=$("wardmode").value!=="yes"};
const digits=(id,n,msg)=>$(id).addEventListener("input",()=>{const o=$(id).value;let d=o.replace(/\D/g,"");if(id==="phone"&&d.length>10&&d.startsWith("91"))d=d.slice(2);d=d.slice(0,n);$(id).value=d;$("e_"+id).textContent=d!==o?msg:""});
digits("phone",10,"Only digits are allowed in the mobile number.");digits("pin",6,"Only digits are allowed in the PIN code.");digits("ward",3,"Only digits are allowed in the ward number.");
$("name").addEventListener("input",()=>{const o=$("name").value,n=o.replace(/[^\p{L}\p{M} .'-]/gu,"");$("name").value=n;$("e_name").textContent=n!==o?"Only letters are allowed in the name.":""});
["name","phone","pin","loc","desc"].forEach(k=>$(k).addEventListener("blur",()=>{const v=$(k).value.trim();if(!v)return;const m=V[k](v);$("e_"+k).textContent=m;$(k).classList.toggle("bad",!!m)}));
$("cat").innerHTML=Object.keys(CATS).map(c=>`<option>${c}</option>`).join("");
$("cat").onchange=upCat;upCat();
$("tiles").innerHTML=Object.keys(CATS).map(k=>`<button class="tile" data-c="${k}">${ic(k,1)}<span><b>${k}</b><br><span class="meta">${CATS[k].dept} · fixed in about ${CATS[k].sla} days</span></span></button>`).join("");
$("tiles").onclick=e=>{const b=e.target.closest("button");if(b){$("cat").value=b.dataset.c;upCat();go("report")}};
$("fs").innerHTML+=STATUS.map(s=>`<option>${s}</option>`).join("");
const STEPI={"doc": "<path d=\"M6 3h9l4 4v14H6zM14 3v5h5M9 13h6M9 17h6\"/>", "tag": "<path d=\"M3 12V4h8l10 10-8 8z\"/><circle cx=\"7.5\" cy=\"8.5\" r=\"1\"/>", "shield": "<path d=\"M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z\"/><path d=\"m8.5 12 2.5 2.5L16 9.5\"/>", "pin": "<path d=\"M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z\"/><circle cx=\"12\" cy=\"10\" r=\"2.5\"/>"};
$("steps").innerHTML=[["Report","Describe the issue and give the location.","doc"],["Get an ID","A numbered ticket is created instantly.","tag"],["Officer acts","The right department is assigned with a deadline.","shield"],["Track","Follow every update until it is resolved.","pin"]].map(s=>`<div class="card step"><span class="ico lg"><svg viewBox="0 0 24 24" aria-hidden="true">${STEPI[s[2]]}</svg></span><h3 style="margin-top:8px">${s[0]}</h3><p class="meta">${s[1]}</p></div>`).join("");


$("desc").oninput=()=>{const v=$("desc").value;if(v.trim().length<8)return;
 const s=suggest(v);if(s.known){$("cat").value=s.cat;$("pri").value=s.pri;upCat()}
 const d=0;
 $("smart").textContent=(s.known?`Random Forest prediction: ${s.cat} (${Math.round(s.conf*100)}% of trees agree), ${s.pri} priority. Please check before submitting.`:"Not enough familiar words to predict. Please choose the category yourself.")+(d?` ${d} similar open complaint(s) in ${districtVal()||"your district"}. Use the same street name and PIN code to join them.`:"")};
$("rfinfo").textContent=`A Random Forest of ${RF_CAT.trees.length} decision trees reads the description and predicts the category and priority. It is trained in your browser on ${DOCS.length} sample complaints (out-of-bag accuracy: category ${Math.round(RF_CAT.acc*100)}%, priority ${Math.round(RF_PRI.acc*100)}%).`;
$("submit").onclick=check;$("csv").onclick=exportXlsx;
$("tbtn").onclick=track;[$("tid"),$("tphone")].forEach(el=>el.onkeydown=e=>{if(e.key==="Enter")track()});
$("tphone").oninput=()=>{$("tphone").value=$("tphone").value.replace(/\D/g,"").slice(0,10)};
$("lbtn").onclick=doLogin;$("lout").onclick=doLogout;
$("cmodeL").onclick=()=>setCmode("login");$("cmodeR").onclick=()=>setCmode("register");$("cgo").onclick=cGo;$("clout").onclick=cLogout;$("cnew").onclick=()=>go("report");
[$("cu"),$("cp"),$("cp2")].forEach(el=>el.onkeydown=e=>{if(e.key==="Enter")cGo()});[$("lu"),$("lp")].forEach(el=>el.onkeydown=e=>{if(e.key==="Enter")doLogin()});
$("gps").onclick=()=>{if(!navigator.geolocation){$("gpsmsg").textContent="Your browser cannot share location.";return}
 $("gpsmsg").textContent="Finding your location...";
 navigator.geolocation.getCurrentPosition(p=>{GPS={lat:+p.coords.latitude.toFixed(6),lng:+p.coords.longitude.toFixed(6)};$("gpsmsg").textContent="Location added ("+GPS.lat+", "+GPS.lng+")"},()=>{GPS=null;$("gpsmsg").textContent="Could not get your location. You can still submit without it."},{timeout:10000})};
$("photo").onchange=()=>{const f=$("photo").files[0];PHOTO=null;if(!f){$("photomsg").textContent="";return}
 if(!/^image\//.test(f.type)){$("photomsg").textContent="Please choose an image file.";$("photo").value="";return}
 const img=new Image(),url=URL.createObjectURL(f);
 img.onload=()=>{const k=Math.min(1,800/Math.max(img.width,img.height)),c=document.createElement("canvas");c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);c.getContext("2d").drawImage(img,0,0,c.width,c.height);const d=c.toDataURL("image/jpeg",0.7);URL.revokeObjectURL(url);
  if(d.length>580000){$("photomsg").textContent="Photo is too large even after shrinking. Try another.";return}
  PHOTO=d;$("photomsg").textContent="Photo ready ("+Math.round(d.length*0.75/1024)+" KB)"};
 img.onerror=()=>{$("photomsg").textContent="Could not read that image.";PHOTO=null};img.src=url};
$("fs").onchange=$("fw").onchange=renderList;
render();loadStats();checkCitizen();setInterval(()=>{if(view==="staff"&&authed)loadStaff();if(view==="home")loadStats();if(view==="account"&&CIT)loadMine()},15000);
