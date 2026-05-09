import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// ── LOCAL HELPERS ─────────────────────────────────────────────────────────────
const fmtRev = n => `$${Number(n||0).toLocaleString()}`

function useScrollLock() {
  useEffect(()=>{
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return ()=>{ document.body.style.overflow = prev }
  },[])
}

// ── ICONS ─────────────────────────────────────────────────────────────────────
const I = {
  grad: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2L1 6l7 4 7-4-7-4z"/><path d="M3 8.5V12c0 1 2 2.5 5 2.5s5-1.5 5-2.5V8.5"/></svg>,
}

// ── FILE HELPERS ──────────────────────────────────────────────────────────────
const FILE_ICONS={pdf:'📄',image:'🖼️',video:'🎬',other:'📎'}
function fileType(f){if(f.type?.startsWith('video')) return 'video';if(f.type?.startsWith('image')) return 'image';if(f.type==='application/pdf'||f.name?.endsWith('.pdf')) return 'pdf';return 'other'}
function fmtBytes(b){if(b<1024) return b+'B';if(b<1048576) return (b/1024).toFixed(0)+'KB';return (b/1048576).toFixed(1)+'MB'}

async function compressImage(file, maxWidth=1400, quality=0.82) {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      if (img.width <= maxWidth) { resolve(file); return }
      const scale = maxWidth / img.width
      const canvas = document.createElement('canvas')
      canvas.width = maxWidth
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', quality)
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
    img.src = url
  })
}

async function uploadFormationFile(file, workspaceId) {
  const kind=fileType(file),toUpload=kind==='image'?await compressImage(file):file
  const ext=file.name.split('.').pop(),path=`${workspaceId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const{error}=await supabase.storage.from('formation-files').upload(path,toUpload,{upsert:true,contentType:file.type})
  if(error) return{name:file.name,size:file.size,kind,url:null,preview:null,error:error.message}
  const{data:urlData}=supabase.storage.from('formation-files').getPublicUrl(path)
  return{name:file.name,size:file.size,kind,url:urlData?.publicUrl||null,preview:kind==='image'?URL.createObjectURL(file):null,error:null}
}

// ── FORMATION EDIT MODAL ──────────────────────────────────────────────────────
function FormationEditModal({ formation, workspaceId, onClose, onSaved, onDeleted, toast }) {
  useScrollLock()
  const [form,setForm]=useState({title:formation.title||'',price:String(formation.price??''),duration_label:formation.duration_label||'',description:formation.description||''})
  const [existingFiles,setExistingFiles]=useState(formation.files||[])
  const [newFiles,setNewFiles]=useState([])
  const [uploading,setUploading]=useState(false)
  const [saving,setSaving]=useState(false)
  const [confirmDelete,setConfirmDelete]=useState(false)
  useEffect(()=>{const h=e=>{if(e.key==='Escape')onClose()};window.addEventListener('keydown',h);return()=>window.removeEventListener('keydown',h)},[])
  async function handleFiles(e){const files=[...e.target.files];if(!files.length) return;setUploading(true);const results=await Promise.all(files.map(f=>uploadFormationFile(f,workspaceId)));if(results.filter(r=>r.error).length>0)toast('Upload failed');setNewFiles(prev=>[...prev,...results]);setUploading(false)}
  async function save(){
    setSaving(true)
    const finalFiles=[...existingFiles,...newFiles.filter(f=>f.url).map(({name,size,kind,url})=>({name,size,kind,url}))]
    const{error}=await supabase.from('offerings').update({title:form.title,price:parseFloat(form.price)||0,duration_label:form.duration_label,description:form.description,files:finalFiles}).eq('id',formation.id)
    setSaving(false);if(error){toast('Error saving.');return};toast(`"${form.title}" updated.`);onSaved();onClose()
  }
  async function deleteFormation(){await supabase.from('offerings').delete().eq('id',formation.id);toast(`"${formation.title}" deleted.`);onDeleted();onClose()}
  const iS={width:'100%',padding:'.58rem .82rem',border:'1px solid var(--border-2)',borderRadius:9,fontSize:'.84rem',fontFamily:'inherit',color:'var(--ink)',background:'var(--surface)',outline:'none',transition:'border .15s'}
  const allFiles=[...existingFiles,...newFiles.filter(f=>f.url)]
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.68)',zIndex:300,display:'flex',alignItems:'flex-end',justifyContent:'center',backdropFilter:'blur(4px)'}} onClick={onClose}>
      <div style={{background:'var(--surface)',borderRadius:'18px 18px 0 0',width:'100%',maxWidth:640,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 -16px 60px rgba(0,0,0,.25)',display:'flex',flexDirection:'column'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1.1rem 1.4rem',borderBottom:'1px solid var(--border)',flexShrink:0}}>
          <div><div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.15rem',fontWeight:500,color:'var(--ink)'}}>Edit formation</div><div style={{fontSize:'.72rem',color:'var(--ink-3)',marginTop:2}}>{formation.title}</div></div>
          <button onClick={onClose} style={{background:'var(--bg)',border:'1px solid var(--border)',width:30,height:30,borderRadius:'50%',cursor:'pointer',color:'var(--ink-3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.85rem'}}>✕</button>
        </div>
        <div style={{padding:'1.25rem 1.4rem',display:'flex',flexDirection:'column',gap:'1rem',overflowY:'auto'}}>
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'.75rem'}}>
            <div className="field"><label>Title</label><input style={iS} value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/></div>
            <div className="field"><label>Price (CAD)</label><input style={iS} type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:'.75rem'}}>
            <div className="field"><label>Duration</label><input style={iS} value={form.duration_label} onChange={e=>setForm(f=>({...f,duration_label:e.target.value}))} placeholder="e.g. 4h · 3 sessions" onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/></div>
            <div className="field"><label>Description</label><input style={iS} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/></div>
          </div>
          {allFiles.length>0&&(<div><div style={{fontSize:'.72rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'.55rem'}}>Files — click ✕ to remove</div><div style={{display:'flex',flexDirection:'column',gap:'.35rem'}}>{existingFiles.map((file,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:'.65rem',padding:'.5rem .85rem',background:'var(--bg)',borderRadius:9,border:'1px solid var(--border)'}}>{file.preview?<img src={file.preview} alt="" style={{width:34,height:34,objectFit:'cover',borderRadius:6,flexShrink:0}}/>:<span style={{fontSize:'1.1rem',flexShrink:0}}>{FILE_ICONS[file.kind]||FILE_ICONS.other}</span>}<div style={{flex:1,overflow:'hidden'}}><div style={{fontSize:'.8rem',fontWeight:500,color:'var(--ink)',textOverflow:'ellipsis',overflow:'hidden',whiteSpace:'nowrap'}}>{file.name}</div><div style={{fontSize:'.68rem',color:'var(--ink-3)'}}>{fmtBytes(file.size)}</div></div><a href={file.url} target="_blank" rel="noopener noreferrer" style={{fontSize:'.7rem',color:'var(--gold)',textDecoration:'none',fontWeight:500,padding:'2px 6px',border:'1px solid var(--gold-dim)',borderRadius:5}}>Open</a><button type="button" onClick={()=>setExistingFiles(prev=>prev.filter((_,idx)=>idx!==i))} style={{background:'rgba(192,57,43,.1)',border:'1px solid rgba(192,57,43,.2)',color:'var(--red)',width:24,height:24,borderRadius:'50%',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.65rem'}}>✕</button></div>))}</div></div>)}
          <div>
            <div style={{fontSize:'.72rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'.5rem'}}>Add or replace files</div>
            <label style={{display:'block',border:'2px dashed var(--border-2)',borderRadius:11,padding:'1rem',textAlign:'center',cursor:'pointer',transition:'all .15s',background:'var(--bg)'}} onMouseEnter={e=>e.currentTarget.style.borderColor='var(--gold)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-2)'}><input type="file" accept="image/*,video/*,application/pdf,.pdf" multiple style={{display:'none'}} onChange={handleFiles}/><div style={{fontSize:'1.2rem',marginBottom:'.2rem'}}>📎</div><div style={{fontSize:'.78rem',fontWeight:500,color:'var(--ink-2)'}}>{uploading?'Uploading…':'Click to upload PDF · image · video'}</div></label>
          </div>
          <div style={{display:'flex',gap:'.6rem',paddingTop:'.25rem',paddingBottom:'.5rem'}}>
            <button className="btn btn-primary" style={{flex:1,justifyContent:'center',padding:'.72rem'}} onClick={save} disabled={saving||uploading}>{saving?'Saving…':uploading?'Uploading…':'Save changes'}</button>
            {!confirmDelete?<button className="btn btn-xs" style={{color:'var(--red)',border:'1px solid rgba(192,57,43,.25)',background:'var(--surface)',padding:'.45rem 1rem'}} onClick={()=>setConfirmDelete(true)}>Delete</button>
              :<button className="btn btn-xs" style={{color:'#fff',background:'var(--red)',border:'none',padding:'.45rem 1rem'}} onClick={deleteFormation}>Confirm delete</button>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── OFFERINGS (FORMATIONS) ────────────────────────────────────────────────────
export default function OfferingsSection({ workspace, toast, subscription }) {
  const [data,setData]=useState([])
  const [showForm,setShowForm]=useState(false)
  const [form,setForm]=useState({title:'',price:'',duration_label:'',description:''})
  const [pendingFiles,setPendingFiles]=useState([])
  const [uploading,setUploading]=useState(false)
  const [saving,setSaving]=useState(false)
  const [selectMode,setSelectMode]=useState(false)
  const [selected,setSelected]=useState(new Set())
  const [showDotMenu,setShowDotMenu]=useState(false)
  const [deleting,setDeleting]=useState(false)
  const [editFormation,setEditFormation]=useState(null)
  useEffect(()=>{if(workspace)fetchData()},[workspace])
  async function fetchData(){const{data}=await supabase.from('offerings').select('*').eq('workspace_id',workspace.id).order('created_at',{ascending:false});setData(data||[])}
  function enterSelectMode(){setSelectMode(true);setSelected(new Set());setShowDotMenu(false);setShowForm(false)}
  function exitSelectMode(){setSelectMode(false);setSelected(new Set())}
  function toggleSelect(id){setSelected(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n})}
  async function deleteSelected(){if(!selected.size) return;setDeleting(true);await Promise.all([...selected].map(id=>supabase.from('offerings').delete().eq('id',id)));toast(`${selected.size} formation${selected.size>1?'s':''} deleted.`);setDeleting(false);exitSelectMode();fetchData()}
  async function handleFiles(e){const files=[...e.target.files];if(!files.length) return;setUploading(true);const results=await Promise.all(files.map(f=>uploadFormationFile(f,workspace.id)));if(results.filter(r=>r.error).length>0)toast('Upload failed');setPendingFiles(prev=>[...prev,...results]);setUploading(false)}
  async function add(e){
    e.preventDefault();setSaving(true)
    const filesData=pendingFiles.filter(f=>f.url).map(({name,size,kind,url})=>({name,size,kind,url}))
    await supabase.from('offerings').insert({workspace_id:workspace.id,title:form.title,price:parseFloat(form.price)||0,duration_label:form.duration_label,description:form.description,files:filesData})
    toast(`"${form.title}" created.`);setForm({title:'',price:'',duration_label:'',description:''});setPendingFiles([]);setShowForm(false);setSaving(false);fetchData()
  }
  const iS={width:'100%',padding:'.6rem .85rem',border:'1px solid var(--border-2)',borderRadius:9,fontSize:'.85rem',fontFamily:'inherit',color:'var(--ink)',background:'var(--surface)',outline:'none',transition:'border .15s'}
  return (
    <div>
      <div className="page-head">
        <div><div className="page-title">Formations</div><div className="page-sub">Monetize your expertise — courses, workshops, masterclasses</div></div>
        <div style={{display:'flex',gap:'.5rem',alignItems:'center',position:'relative'}}>
          {selectMode?(<><span style={{fontSize:'.8rem',color:'var(--ink-3)'}}>{selected.size} selected</span><button className="btn btn-xs" style={{color:'var(--red)',border:'1px solid rgba(192,57,43,.25)',background:'var(--surface)'}} onClick={deleteSelected} disabled={!selected.size||deleting}>{deleting?'Deleting…':`Delete ${selected.size||''}`}</button><button className="btn btn-secondary btn-sm" onClick={exitSelectMode}>Cancel</button></>):(
            <><button className="btn btn-primary" onClick={()=>{setShowForm(s=>!s);setSelectMode(false)}}>{showForm?'Cancel':'Create formation'}</button>
            <div style={{position:'relative'}}>
              <button className="btn btn-secondary btn-sm" style={{padding:'.35rem .6rem',fontSize:'1rem'}} onClick={()=>setShowDotMenu(s=>!s)}>⋮</button>
              {showDotMenu&&(<><div style={{position:'fixed',inset:0,zIndex:98}} onClick={()=>setShowDotMenu(false)}/><div style={{position:'absolute',right:0,top:'calc(100% + 6px)',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,boxShadow:'0 8px 24px rgba(0,0,0,.12)',minWidth:175,zIndex:99,overflow:'hidden'}}><div style={{padding:'.65rem 1rem',fontSize:'.82rem',color:'var(--red)',cursor:'pointer',display:'flex',alignItems:'center',gap:'.5rem'}} onClick={enterSelectMode}>☑ Select to delete</div></div></>)}
            </div></>
          )}
        </div>
      </div>
      {showForm&&!selectMode&&(
        <div className="card" style={{marginBottom:'1.25rem'}}>
          <div className="card-head"><div><div className="card-title">New formation</div><div className="card-sub">Share your knowledge. Set your price. Own your revenue.</div></div></div>
          <form onSubmit={add} className="card-body" style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'1rem'}}>
              <div className="field"><label>Formation title</label><input style={iS} value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Box Braids Masterclass" required onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/></div>
              <div className="field"><label>Price (CAD)</label><input style={iS} type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="149" required onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:'1rem'}}>
              <div className="field"><label>Duration</label><input style={iS} value={form.duration_label} onChange={e=>setForm(f=>({...f,duration_label:e.target.value}))} placeholder="e.g. 4h · 3 sessions" onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/></div>
              <div className="field"><label>Description</label><input style={iS} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="What students will learn..." onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/></div>
            </div>
            <div>
              <div style={{fontSize:'.78rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'.6rem'}}>Course content — PDFs, images, videos</div>
              <label style={{display:'block',border:'2px dashed var(--border-2)',borderRadius:12,padding:'1.25rem',textAlign:'center',cursor:'pointer',transition:'all .15s',background:'var(--bg)'}} onMouseEnter={e=>e.currentTarget.style.borderColor='var(--gold)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-2)'}><input type="file" accept="image/*,video/*,application/pdf,.pdf" multiple style={{display:'none'}} onChange={handleFiles}/><div style={{fontSize:'1.5rem',marginBottom:'.35rem'}}>📚</div><div style={{fontSize:'.82rem',fontWeight:500,color:'var(--ink-2)'}}>{uploading?'Uploading…':'Upload course materials'}</div><div style={{fontSize:'.72rem',color:'var(--ink-3)',marginTop:'.2rem'}}>PDF guides · tutorial photos · intro videos</div></label>
              {pendingFiles.length>0&&(<div style={{display:'flex',flexDirection:'column',gap:'.4rem',marginTop:'.65rem'}}>{pendingFiles.map((f,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:'.65rem',padding:'.55rem .85rem',background:'var(--bg)',borderRadius:9,border:`1px solid ${f.error?'var(--red)':'var(--border)'}`}}>{f.preview?<img src={f.preview} alt="" style={{width:38,height:38,objectFit:'cover',borderRadius:6,flexShrink:0}}/>:<span style={{fontSize:'1.2rem',flexShrink:0}}>{FILE_ICONS[f.kind]||FILE_ICONS.other}</span>}<div style={{flex:1,overflow:'hidden'}}><div style={{fontSize:'.8rem',fontWeight:500,color:f.error?'var(--red)':'var(--ink)',textOverflow:'ellipsis',overflow:'hidden',whiteSpace:'nowrap'}}>{f.name}</div><div style={{fontSize:'.7rem',color:'var(--ink-3)'}}>{f.error?f.error:fmtBytes(f.size)}</div></div>{f.url&&<span style={{fontSize:'.7rem',color:'var(--green)',fontWeight:600}}>✓</span>}<button type="button" onClick={()=>setPendingFiles(prev=>prev.filter((_,idx)=>idx!==i))} style={{background:'none',border:'none',cursor:'pointer',color:'var(--ink-3)',fontSize:'.85rem',padding:'2px'}}>✕</button></div>))}</div>)}
            </div>
            <button type="submit" className="btn btn-primary" style={{justifyContent:'center',padding:'.75rem'}} disabled={saving||uploading}>{uploading?'Uploading…':saving?'Saving…':'Create formation'}</button>
          </form>
        </div>
      )}
      {selectMode&&data.length>0&&(<div style={{background:'var(--gold-lt)',border:'1px solid var(--gold-dim)',borderRadius:10,padding:'.65rem 1rem',marginBottom:'1rem',fontSize:'.8rem',color:'var(--ink-2)'}}>Tap formations to select, then hit Delete.<button style={{marginLeft:'.75rem',fontSize:'.75rem',color:'var(--gold)',fontWeight:600,background:'none',border:'none',cursor:'pointer'}} onClick={()=>setSelected(new Set(data.map(f=>f.id)))}>Select all ({data.length})</button></div>)}
      <div className="card">
        {data.length===0?<div className="empty-state"><div className="empty-icon">{I.grad}</div><div className="empty-title">Monetize your expertise</div><div className="empty-sub">Create your first course or workshop and start earning from your knowledge.</div></div>
          :data.map(f=>{
            const isSelected=selected.has(f.id)
            return (
              <div key={f.id} className="formation-row" onClick={()=>selectMode?toggleSelect(f.id):setEditFormation(f)}
                style={{cursor:'pointer',background:isSelected?'var(--gold-lt)':'',transition:'background .12s,box-shadow .12s',position:'relative'}}
                onMouseEnter={e=>{if(!selectMode)e.currentTarget.style.boxShadow='inset 3px 0 0 var(--gold)'}} onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
                {selectMode&&(<div style={{width:22,height:22,borderRadius:6,border:`2px solid ${isSelected?'var(--gold)':'var(--border-2)'}`,background:isSelected?'var(--gold)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all .12s',marginRight:'.5rem'}}>{isSelected&&<svg viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.5" width="10" height="10"><polyline points="1.5,5 4,7.5 8.5,2.5"/></svg>}</div>)}
                {!selectMode&&<div className="formation-icon-block">{I.grad}</div>}
                <div className="formation-info">
                  <div style={{display:'flex',alignItems:'center',gap:'.5rem'}}>
                    <div className="formation-name">{f.title}</div>
                    {!selectMode&&<span style={{fontSize:'.68rem',color:'var(--ink-3)',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:4,padding:'1px 6px'}}>✏️ Edit</span>}
                  </div>
                  <div className="formation-desc">{f.description}</div>
                  <div style={{display:'flex',gap:'.6rem',marginTop:'.4rem',flexWrap:'wrap',alignItems:'center'}}>
                    {f.duration_label&&<div className="formation-meta"><span>{f.duration_label}</span></div>}
                    {(f.files||[]).length>0&&(<div style={{display:'flex',gap:'.25rem',flexWrap:'wrap'}}>{(f.files||[]).slice(0,4).map((file,fi)=>(<a key={fi} href={file.url} target="_blank" rel="noopener noreferrer" title={file.name} onClick={e=>e.stopPropagation()} style={{display:'inline-flex',alignItems:'center',gap:'.2rem',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:6,padding:'2px 7px',fontSize:'.68rem',color:'var(--ink-2)',textDecoration:'none'}} onMouseEnter={e=>e.currentTarget.style.borderColor='var(--gold)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>{FILE_ICONS[file.kind]||FILE_ICONS.other} {file.name.length>14?file.name.slice(0,14)+'…':file.name}</a>))}{(f.files||[]).length>4&&<span style={{fontSize:'.68rem',color:'var(--ink-3)',alignSelf:'center'}}>+{f.files.length-4} more</span>}</div>)}
                  </div>
                </div>
                <div className="formation-price">{fmtRev(f.price)}</div>
              </div>
            )
          })}
      </div>
      {editFormation&&!selectMode&&(<FormationEditModal formation={editFormation} workspaceId={workspace.id} onClose={()=>setEditFormation(null)} onSaved={fetchData} onDeleted={fetchData} toast={toast}/>)}
    </div>
  )
}
