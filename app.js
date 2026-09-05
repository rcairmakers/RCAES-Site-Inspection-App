const API_URL = 'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';
const SESSION_KEY='rcaes_session_v1';
const QUEUE_KEY='rcaes_queue_v1';
let session=null, step=0;

const steps=[
  {title:'Customer & Project',html:()=>`
    <div class="step active"><div class="grid">
      ${field('customer_name','Customer Name','text',true)}
      ${field('customer_contact','Contact Number','tel',true)}
      ${field('customer_email','Email Address','email')}
      ${field('project_address','Project Address','text',true,true)}
      ${select('project_classification','Project Classification',['Residential','Condominium','Office','Commercial','Warehouse','Industrial','Government','Others'])}
      ${select('project_type','Project Type',['New Installation','Replacement','Relocation','Additional Unit Installation','Repair','Preventive Maintenance'])}
      ${field('sales_rep','Sales Representative','text')}
      ${field('inspection_date','Inspection Date','date',true)}
      ${field('target_installation_date','Target Installation Date','date')}
      ${field('inspector','Inspector / Technician','text')}
    </div></div>`},
  {title:'Aircon Units',html:()=>`<div class="step"><div id="unitsWrap"></div><button type="button" class="ghost" onclick="addUnit()">+ Add Aircon Unit</button></div>`},
  {title:'Site Assessment',html:()=>`<div class="step"><div class="grid">
    ${checks('indoor','Indoor Unit Location',['Customer-approved location','No airflow obstruction','No direct sunlight exposure','No nearby heat source','Adequate service clearance','Suitable wall structure','Accessible for maintenance'])}
    ${field('indoor_height','Indoor Unit Mounting Height (m)','number')}${field('ceiling_distance','Distance from Ceiling (mm)','number')}${field('sidewall_distance','Distance from Side Wall (mm)','number')}${field('indoor_remarks','Indoor Remarks','textarea',false,true)}
    ${checks('outdoor','Outdoor Unit Location',['Stable mounting surface','Adequate ventilation','Service clearance available','Not prone to flooding','Accessible for servicing','Safe installation area'])}
    ${select('outdoor_type','Installation Type',['Ground Mounted','Wall Mounted','Roof Mounted','Suspended Installation'])}${field('outdoor_height','Outdoor Unit Height (m)','number')}${field('indoor_outdoor_distance','Distance from Indoor Unit (m)','number')}${field('outdoor_remarks','Outdoor Remarks','textarea',false,true)}
  </div></div>`},
  {title:'Electrical / Drainage / Structure',html:()=>`<div class="step"><div class="grid">
    ${checks('electrical','Electrical Assessment',['Existing outlet available','Dedicated circuit available','Grounding available','Circuit breaker available','Additional wiring required','Additional breaker required','Electrical works required'])}
    ${field('voltage','Supply Voltage (V)','number')}${field('existing_breaker','Existing Breaker Rating (A)','number')}${field('recommended_breaker','Recommended Breaker Rating (A)','number')}${field('wire_size','Wire Size Available (mm²)','number')}${field('source_distance','Distance to Electrical Source (m)','number')}${select('dedicated_circuit','Dedicated Circuit Required',['Yes','No'])}${field('electrical_remarks','Electrical Remarks','textarea',false,true)}
    ${checks('drainage','Drainage Assessment',['Existing drain available','Gravity drain possible','Additional drain required','Condensate pump required'])}${field('drain_length','Drain Length (m)','number')}${field('drain_drop','Drain Drop (mm)','number')}${field('drainage_remarks','Drainage Remarks','textarea',false,true)}
    ${select('wall_type','Wall Type',['CHB','Reinforced Concrete','Drywall','Wood Partition','Glass','Steel Panel','ACP','Others'])}${checks('drilling','Drilling Requirements',['Standard Drilling','Concrete Coring','Beam Penetration','Multiple Penetrations'])}${field('wall_thickness','Wall Thickness (mm)','number')}${field('hole_size','Hole Size (mm)','number')}${field('drilling_depth','Estimated Drilling Depth (mm)','number')}${field('structural_remarks','Structural Remarks','textarea',false,true)}
  </div></div>`},
  {title:'Piping / Access / Safety',html:()=>`<div class="step"><div class="grid">
    ${checks('piping_routes','Piping Route',['Back-to-Back Installation','Side Exit Route','Concealed Route','Ceiling Route','Roof Route','Vertical Route'])}${field('copper_tube','Copper Tube (m)','number')}${field('drain_hose','Drain Hose (m)','number')}${field('control_wire','Control Wire (m)','number')}${field('power_cable','Power Cable (m)','number')}${field('total_pipe_route','Total Estimated Pipe Route Length (m)','number')}${field('vertical_rise','Vertical Rise Height (m)','number')}${field('piping_remarks','Piping Remarks','textarea',false,true)}
    ${checks('site_access','Site Access',['Ground Floor Access','Upper Floor Access','Elevator Available','Stair Access Only','Restricted Access','Parking Available','Loading Area Available','Narrow Passageway','Roof Access Required','Confined Space'])}${checks('equipment_required','Equipment Required',['Ladder','Scaffold','Boom Lift','Rope Access','Additional Manpower'])}
    ${checks('hazards','Hazards Identified',['Working at Height','Live Electrical Source','Wet Area','Fragile Ceiling','Restricted Workspace','Heavy Lifting Required','Roof Work','Falling Object Hazard','Confined Space','No Significant Risk Identified'])}${checks('controls','Required Controls',['PPE Required','Lockout / Tagout','Safety Barricade','Spotter Required','Fall Protection Equipment','Permit to Work Required','Safety Orientation Required'])}${select('risk_level','Overall Risk Level',['Low','Medium','High','Critical'])}${field('safety_remarks','Safety Remarks','textarea',false,true)}
  </div></div>`},
  {title:'Materials / Additional Works',html:()=>`<div class="step"><div class="grid">
    ${field('copper_est','Copper Tube (m)','number')}${field('insulation_est','Pipe Insulation (m)','number')}${field('drain_est','Drain Hose (m)','number')}${field('interconnect_est','Interconnecting Wire (m)','number')}${field('power_est','Power Cable (m)','number')}${field('tape_est','PVC Tape (roll)','number')}${field('electrical_tape_est','Electrical Tape (roll)','number')}${field('ties_est','Cable Ties (pcs)','number')}${field('sleeve_est','Wall Sleeve (pcs)','number')}${field('anchor_est','Anchor Bolts (pcs)','number')}${field('bracket_est','Outdoor Bracket (set)','number')}${field('breaker_est','Circuit Breaker (pcs)','number')}${field('pvc_est','PVC Pipe (m)','number')}${field('elbow_est','PVC Elbow (pcs)','number')}
    ${checks('additional_works','Additional Works',['Electrical Works','Concrete Coring','Scaffolding','Boom Truck / Lifter','Ceiling Works','Masonry Works','Waterproofing','Dismantling Existing Unit','Relocation of Existing Unit','Additional Copper Tubing','Additional Drain Hose','Additional Wiring','Refrigerant Charging','Others'])}
  </div></div>`},
  {title:'Approval & Recommendation',html:()=>`<div class="step"><div class="grid">
    ${select('installation_difficulty','Installation Difficulty',['Easy','Moderate','Difficult','Special Project'])}${select('estimated_duration','Estimated Installation Duration',['Half Day','One Day','Two Days','More Than Two Days'])}${select('free_installation','Free Standard Installation Qualification',['Qualified for Free Standard Installation','Requires Additional Charges','Subject to Detailed Quotation'])}${select('recommendation','Installation Recommendation',['Proceed with Standard Installation','Proceed with Additional Charges','Requires Further Site Survey','Requires Specialist Contractor','Requires Engineering Review','Not Recommended'])}
    ${field('additional_charges','Total Additional Charges (₱)','number')}${field('customer_name_ack','Customer Name','text')}${field('customer_signature','Customer Approval / Signature (type name for V1)','text')}${field('customer_ack_date','Customer Approval Date','date')}${field('final_remarks','Final / Installer Remarks','textarea',false,true)}
  </div></div>`}
];

function field(id,label,type='text',required=false,full=false){if(type==='textarea')return `<label class="${full?'full':''}">${label}<textarea id="${id}" ${required?'required':''}></textarea></label>`;return `<label class="${full?'full':''}">${label}<input id="${id}" type="${type}" ${required?'required':''}></label>`;}
function select(id,label,opts,full=false){return `<label class="${full?'full':''}">${label}<select id="${id}"><option value="">Select...</option>${opts.map(x=>`<option>${x}</option>`).join('')}</select></label>`;}
function checks(id,label,opts){return `<div class="full"><div class="field-title">${label}</div><div class="checks">${opts.map((x,i)=>`<label class="check"><input type="checkbox" data-group="${id}" value="${x}"><span>${x}</span></label>`).join('')}</div></div>`;}

let unitCount=0;
function addUnit(prefill={}){
 unitCount++;
 const n=unitCount;
 const wrap=document.getElementById('unitsWrap');
 const div=document.createElement('div');
 div.className='unit-card';
 div.dataset.unit=n;
 div.innerHTML=`<div class="unit-head"><strong>Unit ${n}</strong><button type="button" class="ghost" onclick="this.closest('.unit-card').remove()">Remove</button></div><div class="grid">${field('unit_brand_'+n,'Brand')}${field('unit_model_'+n,'Model')}${field('unit_hp_'+n,'HP')}${field('unit_indoor_'+n,'Indoor Location')}${field('unit_outdoor_'+n,'Outdoor Location')}</div>`;
 wrap.appendChild(div);
 Object.entries(prefill||{}).forEach(([k,v])=>{const id={brand:'unit_brand_'+n,model:'unit_model_'+n,hp:'unit_hp_'+n,indoorLocation:'unit_indoor_'+n,outdoorLocation:'unit_outdoor_'+n}[k];if(id&&v!==undefined)document.getElementById(id).value=v;});
}

function showStep(){
 const form=document.getElementById('inspectionForm');
 // Render the wizard once, then only switch the visible step.
 // Re-rendering on every Next would clear all previously entered values.
 if(!form.innerHTML.trim()) form.innerHTML=steps.map((s,i)=>s.html()).join('');
 document.querySelectorAll('.step').forEach((el,i)=>el.classList.toggle('active',i===step));
 document.getElementById('stepTitle').textContent=steps[step].title;
 document.getElementById('progressBar').style.width=((step+1)/steps.length*100)+'%';
 document.getElementById('prevBtn').style.visibility=step===0?'hidden':'visible';
 document.getElementById('nextBtn').textContent=step===steps.length-1?'Save Inspection':'Next';
 if(step===1&&!document.querySelector('.unit-card'))addUnit();
}
function read(id){return document.getElementById(id)?.value||''}
function readChecks(group){return [...document.querySelectorAll(`[data-group="${group}"]:checked`)].map(x=>x.value)}
function collect(){
 const units=[...document.querySelectorAll('.unit-card')].map(c=>{const n=c.dataset.unit;return {brand:read('unit_brand_'+n),model:read('unit_model_'+n),hp:read('unit_hp_'+n),indoorLocation:read('unit_indoor_'+n),outdoorLocation:read('unit_outdoor_'+n)}});
 const assessments={
  indoor:{checks:readChecks('indoor'),height:read('indoor_height'),ceilingDistance:read('ceiling_distance'),sideWallDistance:read('sidewall_distance'),remarks:read('indoor_remarks')},
  outdoor:{checks:readChecks('outdoor'),type:read('outdoor_type'),height:read('outdoor_height'),distance:read('indoor_outdoor_distance'),remarks:read('outdoor_remarks')},
  electrical:{checks:readChecks('electrical'),voltage:read('voltage'),existingBreaker:read('existing_breaker'),recommendedBreaker:read('recommended_breaker'),wireSize:read('wire_size'),sourceDistance:read('source_distance'),dedicatedCircuit:read('dedicated_circuit'),remarks:read('electrical_remarks')},
  drainage:{checks:readChecks('drainage'),length:read('drain_length'),drop:read('drain_drop'),remarks:read('drainage_remarks')},
  structural:{wallType:read('wall_type'),drilling:readChecks('drilling'),wallThickness:read('wall_thickness'),holeSize:read('hole_size'),depth:read('drilling_depth'),remarks:read('structural_remarks')},
  piping:{routes:readChecks('piping_routes'),copperTube:read('copper_tube'),drainHose:read('drain_hose'),controlWire:read('control_wire'),powerCable:read('power_cable'),totalRoute:read('total_pipe_route'),verticalRise:read('vertical_rise'),remarks:read('piping_remarks')},
  access:{checks:readChecks('site_access'),equipment:readChecks('equipment_required')},
  safety:{hazards:readChecks('hazards'),controls:readChecks('controls'),risk:read('risk_level'),remarks:read('safety_remarks')},
  customerApproval:{name:read('customer_name_ack'),signature:read('customer_signature'),date:read('customer_ack_date')}
 };
 const mats=[['Copper Tube',read('copper_est'),'Meters'],['Pipe Insulation',read('insulation_est'),'Meters'],['Drain Hose',read('drain_est'),'Meters'],['Interconnecting Wire',read('interconnect_est'),'Meters'],['Power Cable',read('power_est'),'Meters'],['PVC Tape',read('tape_est'),'Roll'],['Electrical Tape',read('electrical_tape_est'),'Roll'],['Cable Ties',read('ties_est'),'Pcs'],['Wall Sleeve',read('sleeve_est'),'Pcs'],['Anchor Bolts',read('anchor_est'),'Pcs'],['Outdoor Bracket',read('bracket_est'),'Set'],['Circuit Breaker',read('breaker_est'),'Pcs'],['PVC Pipe',read('pvc_est'),'Meters'],['PVC Elbow',read('elbow_est'),'Pcs']].filter(x=>x[1]!=='' ).map(x=>({material:x[0],qty:x[1],unit:x[2]}));
 const selectedWorks=readChecks('additional_works'); const additionalWorks=['Electrical Works','Concrete Coring','Scaffolding','Boom Truck / Lifter','Ceiling Works','Masonry Works','Waterproofing','Dismantling Existing Unit','Relocation of Existing Unit','Additional Copper Tubing','Additional Drain Hose','Additional Wiring','Refrigerant Charging','Others'].map(w=>({work:w,required:selectedWorks.includes(w),remarks:''}));
 return {inspectionId:null,projectId:null,customerId:null,customer:{name:read('customer_name'),contact:read('customer_contact'),email:read('customer_email')},projectAddress:read('project_address'),projectClassification:read('project_classification'),projectType:read('project_type'),salesRepresentative:read('sales_rep'),inspectionDate:read('inspection_date'),targetInstallationDate:read('target_installation_date'),inspectorTechnician:read('inspector'),units,assessments,materials:mats,additionalWorks,costing:{'Additional Charges':Number(read('additional_charges')||0)},status:'For Quotation',riskLevel:read('risk_level'),installationDifficulty:read('installation_difficulty'),estimatedDuration:read('estimated_duration'),freeInstallationQualification:read('free_installation'),recommendation:read('recommendation'),totalAdditionalCharges:Number(read('additional_charges')||0)};
}

async function api(action,body){const res=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,...body})});return res.json();}
function queue(){return JSON.parse(localStorage.getItem(QUEUE_KEY)||'[]')}
function setQueue(q){localStorage.setItem(QUEUE_KEY,JSON.stringify(q))}
async function syncQueue(){if(!navigator.onLine||API_URL.includes('PASTE_'))return;let q=queue();if(!q.length)return;const remaining=[];for(const item of q){try{const r=await api('saveInspection',{session,inspection:item});if(!r.ok)throw new Error(r.error)}catch(e){remaining.push(item)}}setQueue(remaining);updateOfflineBanner();loadDashboard();}
function updateOfflineBanner(){document.getElementById('offlineBanner').classList.toggle('hidden',navigator.onLine);}
function saveSession(s){session=s;localStorage.setItem(SESSION_KEY,JSON.stringify(s));}
function loadSession(){try{session=JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch(e){session=null}return session}
function logout(){session=null;localStorage.removeItem(SESSION_KEY);document.getElementById('mainView').classList.add('hidden');document.getElementById('loginView').classList.remove('hidden')}

async function login(e){e.preventDefault();const msg=document.getElementById('loginMsg');msg.textContent='Signing in...';if(API_URL.includes('PASTE_')){msg.textContent='Configure API_URL in app.js first.';return}if(!navigator.onLine){const cached=loadSession();if(cached){boot();return}msg.textContent='First login requires internet.';return}try{const r=await api('login',{username:read('username'),password:read('password')});if(!r.ok)throw new Error(r.error);saveSession(r.session);boot();}catch(err){msg.textContent=err.message}}
async function loadDashboard(){if(!session)return;try{const r=await api('dashboard',{session});if(!r.ok)throw new Error(r.error);renderDashboard(r)}catch(e){if(navigator.onLine) console.warn(e)}}
function renderDashboard(r){const c=r.counts||{};document.getElementById('stats').innerHTML=[['Total',c.total||0],['Last 30 Days',c.recent30||0],['For Quotation',c.forQuotation||0],['For Scheduling',c.forScheduling||0],['High/Critical Risk',c.highRisk||0]].map(x=>`<div class="stat"><strong>${x[1]}</strong><span>${x[0]}</span></div>`).join('');document.getElementById('recentList').innerHTML=(r.recent||[]).map(x=>`<div class="recent"><div><strong>${x.inspectionId}</strong><div>${x.recommendation||'—'}</div></div><span class="badge">${x.status||'—'}</span></div>`).join('')||'<p>No inspections yet.</p>'}
function startInspection(){step=0;unitCount=0;document.getElementById('dashboardPanel').classList.add('hidden');document.getElementById('inspectionPanel').classList.remove('hidden');document.getElementById('inspectionForm').innerHTML='';showStep()}
function cancelInspection(){document.getElementById('inspectionPanel').classList.add('hidden');document.getElementById('dashboardPanel').classList.remove('hidden')}
function next(){const inputs=[...document.querySelectorAll('.step.active input,.step.active select,.step.active textarea')];const valid=inputs.every(x=>x.checkValidity());if(!valid){inputs.find(x=>!x.checkValidity())?.reportValidity();return}if(step<steps.length-1){step++;showStep()}else saveInspection()}
async function saveInspection(){const data=collect();if(!navigator.onLine||API_URL.includes('PASTE_')){const q=queue();q.push(data);setQueue(q);finishSaved('Saved offline — will sync automatically when online.');return}try{const r=await api('saveInspection',{session,inspection:data});if(!r.ok)throw new Error(r.error);finishSaved(`Inspection ${r.inspectionId} saved to Google Sheets.`);loadDashboard();}catch(e){const q=queue();q.push(data);setQueue(q);finishSaved('Saved on device because the server is unavailable.');}}
function finishSaved(msg){document.getElementById('inspectionPanel').classList.add('hidden');document.getElementById('dashboardPanel').classList.remove('hidden');alert(msg);updateOfflineBanner()}
function boot(){document.getElementById('loginView').classList.add('hidden');document.getElementById('mainView').classList.remove('hidden');document.getElementById('userName').textContent=session?.fullName?`Signed in as ${session.fullName}`:'';updateOfflineBanner();loadDashboard();syncQueue();}

document.getElementById('loginForm').addEventListener('submit',login);document.getElementById('logoutBtn').addEventListener('click',logout);document.getElementById('newInspectionBtn').addEventListener('click',startInspection);document.getElementById('cancelInspectionBtn').addEventListener('click',cancelInspection);document.getElementById('prevBtn').addEventListener('click',()=>{if(step>0){step--;showStep()}});document.getElementById('nextBtn').addEventListener('click',next);document.getElementById('refreshBtn').addEventListener('click',()=>{loadDashboard();syncQueue()});window.addEventListener('online',()=>{updateOfflineBanner();syncQueue()});window.addEventListener('offline',updateOfflineBanner);window.addEventListener('load',()=>{if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});if(loadSession())boot();});
