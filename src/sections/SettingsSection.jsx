import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// ── I18N ──────────────────────────────────────────────────────────────────────
const LANG = {
  en: {
    settings_title:'Settings',settings_sub:'Manage your account and preferences',
    profile:'My Profile',profile_sub:'Name, email address, password',
    business:'My Business',business_sub:'Business info, contact, social media',
    appearance:'Appearance',appearance_sub:'Theme and display preferences',
    language:'Language',language_sub:'English, Français, Español',
    save:'Save changes',saving:'Saving...',saved:'Saved',cancel:'Cancel',
    update_pw:'Update password',
    full_name:'Full name',email_addr:'Email address',
    new_password:'New password',
    publish:'Publish profile',unpublish:'Unpublish',display_lang:'Display language',
    theme:'Theme',dark_mode:'Dark mode',save_lang:'Save language',
    cancel_sub:'Cancel subscription',keep_plan:'Keep my plan',confirm_cancel:'Yes, cancel',
  },
  fr: {
    settings_title:'Paramètres',settings_sub:'Gérer votre compte et préférences',
    profile:'Mon Profil',profile_sub:'Nom, email, mot de passe',
    business:'Mon Entreprise',business_sub:'Infos, contact, réseaux sociaux',
    appearance:'Apparence',appearance_sub:"Thème et préférences d'affichage",
    language:'Langue',language_sub:'English, Français, Español',
    save:'Enregistrer',saving:'Enregistrement...',saved:'Enregistré',cancel:'Annuler',
    update_pw:'Mettre à jour le mot de passe',
    full_name:'Nom complet',email_addr:'Adresse email',
    new_password:'Nouveau mot de passe',
    publish:'Publier le profil',unpublish:'Dépublier',display_lang:"Langue d'affichage",
    theme:'Thème',dark_mode:'Mode sombre',save_lang:'Enregistrer la langue',
    cancel_sub:'Terminer mon abonnement',keep_plan:'Conserver mon plan',confirm_cancel:'Oui, annuler',
  },
  es: {
    settings_title:'Configuración',settings_sub:'Gestiona tu cuenta y preferencias',
    profile:'Mi Perfil',profile_sub:'Nombre, correo, contraseña',
    business:'Mi Negocio',business_sub:'Información, contacto, redes sociales',
    appearance:'Apariencia',appearance_sub:'Tema y preferencias de visualización',
    language:'Idioma',language_sub:'English, Français, Español',
    save:'Guardar cambios',saving:'Guardando...',saved:'Guardado',cancel:'Cancelar',
    update_pw:'Actualizar contraseña',
    full_name:'Nombre completo',email_addr:'Correo electrónico',
    new_password:'Nueva contraseña',
    publish:'Publicar perfil',unpublish:'Despublicar',display_lang:'Idioma de visualización',
    theme:'Tema',dark_mode:'Modo oscuro',save_lang:'Guardar idioma',
    cancel_sub:'Cancelar suscripción',keep_plan:'Mantener mi plan',confirm_cancel:'Sí, cancelar',
  },
}
function t(lang, key) { return (LANG[lang] || LANG.en)[key] || LANG.en[key] || key }

// ── ICONS ─────────────────────────────────────────────────────────────────────
const I = {
  check: <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="1.5,5 4,7.5 8.5,2.5"/></svg>,
}

// ── DAILY INSPIRATION DATA (for Coach settings panel) ─────────────────────────
const INSPIRATION_QUOTES=[
  {icon:'✨',text:'The secret of getting ahead is getting started.',author:'Mark Twain'},
  {icon:'💎',text:'Quality is not an act, it is a habit.',author:'Aristotle'},
  {icon:'🌟',text:'Success is the sum of small efforts, repeated day in and day out.',author:'Robert Collier'},
  {icon:'🔥',text:'The only way to do great work is to love what you do.',author:'Steve Jobs'},
  {icon:'🌸',text:'Beauty begins the moment you decide to be yourself.',author:'Coco Chanel'},
  {icon:'⭐',text:"Hard work beats talent when talent doesn't work hard.",author:'Tim Notke'},
  {icon:'🎯',text:'The future belongs to those who believe in the beauty of their dreams.',author:'Eleanor Roosevelt'},
  {icon:'💡',text:'Your most unhappy customers are your greatest source of learning.',author:'Bill Gates'},
  {icon:'🌈',text:'Chase the vision, not the money; the money will end up following you.',author:'Tony Hsieh'},
  {icon:'🦋',text:'Small steps in the right direction can turn out to be the biggest step of your life.',author:'Unknown'},
  {icon:'🎨',text:'Creativity is intelligence having fun.',author:'Albert Einstein'},
  {icon:'🚀',text:'The best time to plant a tree was 20 years ago. The second best time is now.',author:'Chinese Proverb'},
  {icon:'💼',text:'Success usually comes to those who are too busy to be looking for it.',author:'Henry David Thoreau'},
  {icon:'🌙',text:'Each morning we are born again. What we do today is what matters most.',author:'Buddha'},
  {icon:'🏆',text:"Don't be afraid to give up the good to go for the great.",author:'John D. Rockefeller'},
  {icon:'🌺',text:'The woman who does not require validation from anyone is the most feared individual.',author:'Mohadesa Najumi'},
  {icon:'✊',text:'She believed she could, so she did.',author:'Unknown'},
  {icon:'🌱',text:'Plant seeds of happiness, hope, success, and love; it will all come back to you in abundance.',author:'Steve Maraboli'},
  {icon:'🎵',text:'Start where you are. Use what you have. Do what you can.',author:'Arthur Ashe'},
  {icon:'🌊',text:'The secret to your success is found in your daily routine.',author:'John C. Maxwell'},
  {icon:'⚡',text:"Believe you can and you're halfway there.",author:'Theodore Roosevelt'},
  {icon:'🌻',text:'Keep your face always toward the sunshine, and shadows will fall behind you.',author:'Walt Whitman'},
  {icon:'🎯',text:'A year from now you may wish you had started today.',author:'Karen Lamb'},
  {icon:'💪',text:"It always seems impossible until it's done.",author:'Nelson Mandela'},
  {icon:'🌟',text:'Strive not to be a success, but rather to be of value.',author:'Albert Einstein'},
  {icon:'💫',text:"Your talent is God's gift to you. What you do with it is your gift back.",author:'Leo Buscaglia'},
  {icon:'🌿',text:'Every day is a fresh start. Every morning we wake up is the first day of our new life.',author:'Unknown'},
  {icon:'💛',text:'What you do makes a difference, and you have to decide what kind of difference you want to make.',author:'Jane Goodall'},
  {icon:'💪',text:"Don't watch the clock; do what it does. Keep going.",author:'Sam Levenson'},
  {icon:'🧠',text:"The more that you read, the more things you will know. The more that you learn, the more places you'll go.",author:'Dr. Seuss'},
]
const BIBLE_VERSES=[
  {icon:'✝️',text:'I can do all things through Christ who strengthens me.',ref:'Philippians 4:13'},
  {icon:'📖',text:'Commit your work to the Lord, and your plans will be established.',ref:'Proverbs 16:3'},
  {icon:'✝️',text:'And whatever you do, do it heartily, as to the Lord and not to men.',ref:'Colossians 3:23'},
  {icon:'📖',text:'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you.',ref:'Jeremiah 29:11'},
  {icon:'✝️',text:'She is clothed with strength and dignity, and she laughs without fear of the future.',ref:'Proverbs 31:25'},
  {icon:'📖',text:'In all your ways acknowledge him, and he will make straight your paths.',ref:'Proverbs 3:6'},
  {icon:'✝️',text:'Do not be anxious about anything, but in every situation, present your requests to God.',ref:'Philippians 4:6'},
  {icon:'📖',text:'Whoever sows generously will also reap generously.',ref:'2 Corinthians 9:6'},
  {icon:'✝️',text:'Let your light shine before others, that they may see your good deeds.',ref:'Matthew 5:16'},
  {icon:'📖',text:'The Lord is my shepherd, I lack nothing.',ref:'Psalm 23:1'},
  {icon:'✝️',text:'Trust in the Lord with all your heart and lean not on your own understanding.',ref:'Proverbs 3:5'},
  {icon:'📖',text:'Be strong and courageous. Do not be afraid; do not be discouraged.',ref:'Joshua 1:9'},
  {icon:'✝️',text:'She watches over the affairs of her household and does not eat the bread of idleness.',ref:'Proverbs 31:27'},
  {icon:'📖',text:'Let us not become weary in doing good, for at the proper time we will reap a harvest.',ref:'Galatians 6:9'},
  {icon:'✝️',text:'Seek first his kingdom and his righteousness, and all these things will be given to you.',ref:'Matthew 6:33'},
  {icon:'📖',text:'Now to him who is able to do immeasurably more than all we ask or imagine.',ref:'Ephesians 3:20'},
  {icon:'✝️',text:'The plans of the diligent lead to profit as surely as haste leads to poverty.',ref:'Proverbs 21:5'},
  {icon:'📖',text:'With man this is impossible, but with God all things are possible.',ref:'Matthew 19:26'},
  {icon:'✝️',text:'The Lord your God is with you, the Mighty Warrior who saves.',ref:'Zephaniah 3:17'},
  {icon:'📖',text:'Delight yourself in the Lord, and he will give you the desires of your heart.',ref:'Psalm 37:4'},
  {icon:'✝️',text:'God has not given us a spirit of fear, but of power and of love and of a sound mind.',ref:'2 Timothy 1:7'},
  {icon:'📖',text:'She is worth far more than rubies.',ref:'Proverbs 31:10'},
  {icon:'✝️',text:'Ask and it will be given to you; seek and you will find; knock and the door will be opened.',ref:'Matthew 7:7'},
  {icon:'📖',text:'I have learned, in whatever state I am, to be content.',ref:'Philippians 4:11'},
  {icon:'✝️',text:'The Lord bless you and keep you; the Lord make his face shine on you and be gracious to you.',ref:'Numbers 6:24-25'},
  {icon:'📖',text:'Cast all your anxiety on him because he cares for you.',ref:'1 Peter 5:7'},
  {icon:'✝️',text:'Whatever is true, whatever is noble, whatever is right — think about such things.',ref:'Philippians 4:8'},
  {icon:'📖',text:'The Lord will open to you his good treasury to give rain to your land in its season.',ref:'Deuteronomy 28:12'},
  {icon:'✝️',text:'She is clothed in strength and dignity.',ref:'Proverbs 31:25'},
  {icon:'📖',text:'Commit to the Lord whatever you do, and he will establish your plans.',ref:'Proverbs 16:3'},
]
function getDailyEntry(arr){
  const now=new Date()
  const start=new Date(now.getFullYear(),0,0)
  const day=Math.floor((now-start)/86400000)
  return arr[day%arr.length]
}

// ── CANCEL SUBSCRIPTION CARD ──────────────────────────────────────────────────
function CancelSubscriptionCard({ toast, lang='en' }) {
  const [showConfirm,setShowConfirm]=useState(false)
  const [cancelling,setCancelling]=useState(false)
  async function cancel(){
    setCancelling(true)
    await new Promise(r=>setTimeout(r,1200))
    setCancelling(false);setShowConfirm(false)
    toast('A cancellation request has been sent. We will contact you shortly.')
  }
  return (
    <div className="card" style={{border:'1px solid rgba(192,57,43,.2)'}}>
      <div className="card-head">
        <div>
          <div className="card-title" style={{color:'var(--red)'}}>{t(lang,'cancel_sub')}</div>
          <div className="card-sub">You can cancel your subscription at any time.</div>
        </div>
      </div>
      <div style={{padding:'1.25rem 1.4rem'}}>
        {!showConfirm?(
          <button className="btn btn-sm" style={{color:'var(--red)',border:'1px solid rgba(192,57,43,.3)',background:'rgba(192,57,43,.04)',justifyContent:'center',width:'100%',padding:'.7rem'}} onClick={()=>setShowConfirm(true)}>
            {t(lang,'cancel_sub')}
          </button>
        ):(
          <div>
            <div style={{fontSize:'.82rem',color:'var(--ink-2)',marginBottom:'1rem',lineHeight:1.6}}>Your account will remain active until the end of your current billing period.</div>
            <div style={{display:'flex',gap:'.6rem'}}>
              <button className="btn btn-secondary" style={{flex:1,justifyContent:'center'}} onClick={()=>setShowConfirm(false)}>{t(lang,'keep_plan')}</button>
              <button className="btn btn-sm" style={{flex:1,justifyContent:'center',color:'var(--red)',border:'1px solid rgba(192,57,43,.3)',background:'rgba(192,57,43,.06)',padding:'.5rem'}} onClick={cancel} disabled={cancelling}>
                {cancelling?'Processing…':t(lang,'confirm_cancel')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── SETTINGS SUB-FORMS ────────────────────────────────────────────────────────
function SettingsProfileForm({ session, ownerData, toast, refetch, lang='en' }) {
  const [form,setForm]=useState({full_name:ownerData?.full_name||'',email:session?.user?.email||''})
  const [loading,setLoading]=useState(false),[saved,setSaved]=useState(false)
  useEffect(()=>{setForm(f=>({...f,full_name:ownerData?.full_name||''}))},[ownerData?.full_name])
  async function save(e){
    e.preventDefault();setLoading(true);setSaved(false)
    const uid=session?.user?.id
    if(uid){const{error}=await supabase.from('users').upsert({id:uid,full_name:form.full_name,email:session?.user?.email||''},{onConflict:'id'});if(error){toast('Error saving name: '+error.message);setLoading(false);return}}
    if(form.email&&form.email!==session?.user?.email){const{error}=await supabase.auth.updateUser({email:form.email});if(error){toast('Error updating email: '+error.message);setLoading(false);return}}
    setSaved(true);toast('Profile saved.');if(refetch) await refetch();setLoading(false)
  }
  return (
    <form onSubmit={save} className="card-body" style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
      <div className="field"><label>{t(lang,'full_name')}</label><input value={form.full_name} onChange={e=>setForm(f=>({...f,full_name:e.target.value}))} required/></div>
      <div className="field"><label>{t(lang,'email_addr')}</label><input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required/></div>
      <button type="submit" className="btn btn-primary" style={{justifyContent:'center',padding:'.75rem'}} disabled={loading}>{loading?t(lang,'saving'):saved?t(lang,'saved'):t(lang,'save')}</button>
    </form>
  )
}

function SettingsPasswordForm({ session, toast, lang='en' }) {
  const [pw,setPw]=useState(''),[loading,setLoading]=useState(false)
  async function save(e){e.preventDefault();setLoading(true);const{error}=await supabase.auth.updateUser({password:pw});if(error)toast(`Error: ${error.message}`);else{toast('Confirmation link sent to your email.');setPw('')};setLoading(false)}
  return (
    <form onSubmit={save} className="card-body" style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
      <div className="field"><label>New password</label><input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Minimum 8 characters" minLength={8} required/></div>
      <div style={{fontSize:'.76rem',color:'var(--ink-3)',lineHeight:1.55,padding:'.6rem .85rem',background:'var(--bg)',borderRadius:8}}>A confirmation link will be sent to your email before the change takes effect.</div>
      <button type="submit" className="btn btn-primary" style={{justifyContent:'center',padding:'.75rem'}} disabled={loading}>{loading?t(lang,'saving'):t(lang,'update_pw')}</button>
    </form>
  )
}

function SettingsBusinessForm({ workspace, toast, refetch, lang='en' }) {
  const blankForm=(ws)=>({
    name:ws?.name||'',tagline:ws?.tagline||'',bio:ws?.bio||'',
    address_street:ws?.address_street||'',address_city:ws?.address_city||'',
    address_province:ws?.address_province||'',address_postal:ws?.address_postal||'',
    address_country:ws?.address_country||'CA',
    show_address_on_page:ws?.show_address_on_page||false,
    address_in_confirmations:ws?.address_in_confirmations!==false,
    email:ws?.email||'',phone:ws?.phone||'',instagram:ws?.instagram||'',tiktok:ws?.tiktok||'',
    offers_domicile:ws?.offers_domicile||false,
    domicile_fee:ws?.domicile_fee||'45',
    domicile_radius_km:ws?.domicile_radius_km||25,
    domicile_notes:ws?.domicile_notes||''
  })
  const [form,setForm]=useState(()=>blankForm(workspace))
  useEffect(()=>{if(workspace)setForm(blankForm(workspace))},[workspace?.id])
  const [loading,setLoading]=useState(false),[saved,setSaved]=useState(false),[addrError,setAddrError]=useState('')
  const hasAnyAddr=form.address_street||form.address_city||form.address_postal
  const addrComplete=!hasAnyAddr||(form.address_street&&form.address_city&&form.address_postal)
  async function save(e){
    e.preventDefault()
    if(!addrComplete){setAddrError('Please complete the address — street, city, and postal code are required.');return}
    setAddrError('')
    if(!workspace?.id){toast('Workspace not loaded.');return}
    setLoading(true);setSaved(false)
    const{error}=await supabase.from('workspaces').update({
      name:form.name,tagline:form.tagline,bio:form.bio,
      address_street:form.address_street||null,address_city:form.address_city||null,
      address_province:form.address_province||null,address_postal:form.address_postal||null,
      address_country:form.address_country||'CA',
      show_address_on_page:form.show_address_on_page,
      address_in_confirmations:form.address_in_confirmations,
      email:form.email,phone:form.phone,instagram:form.instagram,tiktok:form.tiktok,
      offers_domicile:form.offers_domicile,
      domicile_fee:form.offers_domicile?Number(form.domicile_fee)||45:null,
      domicile_radius_km:form.offers_domicile?Number(form.domicile_radius_km)||25:null,
      domicile_notes:form.offers_domicile?(form.domicile_notes||null):null
    }).eq('id',workspace.id)
    if(error)toast(`Error: ${error.message}`);else{setSaved(true);toast('Business profile saved.');if(refetch) await refetch()}
    setLoading(false)
  }
  const iS={border:'1px solid var(--border-2)',borderRadius:8,padding:'.55rem .85rem',fontSize:'.88rem',fontFamily:'inherit',color:'var(--ink)',background:'var(--surface)',outline:'none',transition:'border .15s',width:'100%'}
  const foc=(e)=>e.target.style.borderColor='var(--gold)'
  const blu=(e)=>e.target.style.borderColor='var(--border-2)'
  return (
    <div className="card">
      <div className="card-head"><div className="card-title">Business profile</div></div>
      <form onSubmit={save} className="card-body" style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
        <div className="field"><label>Business name</label><input style={iS} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} onFocus={foc} onBlur={blu} required/></div>
        <div className="field"><label>Tagline</label><input style={iS} value={form.tagline} onChange={e=>setForm(f=>({...f,tagline:e.target.value}))} onFocus={foc} onBlur={blu} placeholder="e.g. Natural Hair Specialist · Montreal, QC"/></div>
        <div className="field"><label>Bio</label><textarea value={form.bio} onChange={e=>setForm(f=>({...f,bio:e.target.value}))} rows={3} placeholder="Tell your clients about your work..." style={{...iS,resize:'vertical'}}/></div>
        <div style={{height:1,background:'var(--border)',margin:'.15rem 0'}}/>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'.25rem'}}>
          <div style={{fontSize:'.68rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.08em'}}>Business Address</div>
          <div style={{fontSize:'.68rem',color:'var(--ink-3)'}}>Sent in every booking confirmation</div>
        </div>
        <div className="field"><label>Street address</label><input style={iS} value={form.address_street} onChange={e=>setForm(f=>({...f,address_street:e.target.value}))} onFocus={foc} onBlur={blu} placeholder="123 Rue Saint-Denis"/></div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.65rem'}}>
          <div className="field"><label>City</label><input style={iS} value={form.address_city} onChange={e=>setForm(f=>({...f,address_city:e.target.value}))} onFocus={foc} onBlur={blu} placeholder="Montreal"/></div>
          <div className="field"><label>Province / State</label><input style={iS} value={form.address_province} onChange={e=>setForm(f=>({...f,address_province:e.target.value}))} onFocus={foc} onBlur={blu} placeholder="QC"/></div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.65rem'}}>
          <div className="field"><label>Postal / ZIP</label><input style={iS} value={form.address_postal} onChange={e=>setForm(f=>({...f,address_postal:e.target.value}))} onFocus={foc} onBlur={blu} placeholder="H2X 1Y8"/></div>
          <div className="field"><label>Country</label>
            <select style={{...iS,cursor:'pointer'}} value={form.address_country} onChange={e=>setForm(f=>({...f,address_country:e.target.value}))} onFocus={foc} onBlur={blu}>
              <option value="CA">Canada</option><option value="US">United States</option>
              <option value="FR">France</option><option value="BE">Belgium</option>
              <option value="CH">Switzerland</option><option value="GB">United Kingdom</option>
              <option value="MA">Morocco</option><option value="SN">Senegal</option>
              <option value="CI">Côte d'Ivoire</option><option value="HT">Haiti</option>
            </select>
          </div>
        </div>
        {addrError&&<div style={{fontSize:'.78rem',color:'var(--red)',background:'rgba(192,57,43,.06)',border:'1px solid rgba(192,57,43,.15)',borderRadius:8,padding:'.55rem .85rem'}}>{addrError}</div>}
        {hasAnyAddr&&(
          <div style={{background:'var(--bg)',borderRadius:10,border:'1px solid var(--border)',overflow:'hidden'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'.85rem 1rem',borderBottom:'1px solid var(--border)'}}>
              <div>
                <div className="settings-row-label">Show on Business Page</div>
                <div style={{fontSize:'.72rem',color:'var(--ink-3)',marginTop:2}}>Visible to anyone visiting your public profile</div>
              </div>
              <label className="toggle-wrap"><input type="checkbox" checked={form.show_address_on_page} onChange={e=>setForm(f=>({...f,show_address_on_page:e.target.checked}))}/><div className="toggle-track"/><div className="toggle-thumb"/></label>
            </div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'.85rem 1rem'}}>
              <div>
                <div className="settings-row-label">Include in confirmation messages</div>
                <div style={{fontSize:'.72rem',color:'var(--ink-3)',marginTop:2}}>Sent to clients after booking — helps them find you</div>
              </div>
              <label className="toggle-wrap"><input type="checkbox" checked={form.address_in_confirmations} onChange={e=>setForm(f=>({...f,address_in_confirmations:e.target.checked}))}/><div className="toggle-track"/><div className="toggle-thumb"/></label>
            </div>
          </div>
        )}
        <div style={{height:1,background:'var(--border)',margin:'.15rem 0'}}/>
        <div style={{fontSize:'.68rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.08em'}}>Contact</div>
        <div className="field"><label>Business email</label><input type="email" style={iS} value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} onFocus={foc} onBlur={blu}/></div>
        <div className="field"><label>Phone</label><input style={iS} value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} onFocus={foc} onBlur={blu}/></div>
        <div style={{height:1,background:'var(--border)',margin:'.15rem 0'}}/>
        <div style={{fontSize:'.68rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.08em'}}>Social</div>
        <div className="field"><label>Instagram</label><input style={iS} value={form.instagram} onChange={e=>setForm(f=>({...f,instagram:e.target.value}))} onFocus={foc} onBlur={blu} placeholder="@yourstudio"/></div>
        <div className="field"><label>TikTok</label><input style={iS} value={form.tiktok} onChange={e=>setForm(f=>({...f,tiktok:e.target.value}))} onFocus={foc} onBlur={blu} placeholder="@yourstudio"/></div>
        <div style={{height:1,background:'var(--border)',margin:'.15rem 0'}}/>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:'.68rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.08em'}}>Home Visits</div>
            <div style={{fontSize:'.72rem',color:'var(--ink-3)',marginTop:2}}>Offer at-home appointments to your clients</div>
          </div>
          <label className="toggle-wrap"><input type="checkbox" checked={form.offers_domicile} onChange={e=>setForm(f=>({...f,offers_domicile:e.target.checked}))}/><div className="toggle-track"/><div className="toggle-thumb"/></label>
        </div>
        {form.offers_domicile&&(
          <div style={{background:'var(--bg)',borderRadius:10,border:'1px solid var(--border)',padding:'1rem',display:'flex',flexDirection:'column',gap:'.85rem'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.65rem'}}>
              <div className="field"><label>Travel fee ($)</label><input style={iS} type="number" min="0" step="1" value={form.domicile_fee} onChange={e=>setForm(f=>({...f,domicile_fee:e.target.value}))} onFocus={foc} onBlur={blu} placeholder="45"/></div>
              <div className="field"><label>Radius (km)</label><input style={iS} type="number" min="1" step="1" value={form.domicile_radius_km} onChange={e=>setForm(f=>({...f,domicile_radius_km:e.target.value}))} onFocus={foc} onBlur={blu} placeholder="25"/></div>
            </div>
            <div className="field"><label>Notes for clients <span style={{fontWeight:300,color:'var(--ink-3)'}}>— optional</span></label><textarea value={form.domicile_notes} onChange={e=>setForm(f=>({...f,domicile_notes:e.target.value}))} rows={2} placeholder="e.g. Clean, well-lit space required. Parking must be available nearby." style={{...iS,resize:'vertical'}}/></div>
          </div>
        )}
        <button type="submit" className="btn btn-primary" style={{justifyContent:'center',padding:'.75rem'}} disabled={loading}>{loading?t(lang,'saving'):saved?t(lang,'saved'):t(lang,'save')}</button>
      </form>
    </div>
  )
}

function SettingsAutomationsForm({ workspace, toast, refetch, lang='en' }) {
  const [form,setForm]=useState({
    review_requests_enabled: workspace?.review_requests_enabled!==false,
    google_review_url: workspace?.google_review_url||'',
    review_delay_hours: workspace?.review_delay_hours||2,
  })
  useEffect(()=>{
    if(workspace) setForm({
      review_requests_enabled: workspace.review_requests_enabled!==false,
      google_review_url: workspace.google_review_url||'',
      review_delay_hours: workspace.review_delay_hours||2,
    })
  },[workspace?.id])
  const [loading,setLoading]=useState(false),[saved,setSaved]=useState(false)
  async function save(){
    if(!workspace?.id) return
    setLoading(true);setSaved(false)
    const{error}=await supabase.from('workspaces').update({
      review_requests_enabled:form.review_requests_enabled,
      google_review_url:form.google_review_url.trim()||null,
      review_delay_hours:Number(form.review_delay_hours),
    }).eq('id',workspace.id)
    if(error) toast(`Error: ${error.message}`)
    else{setSaved(true);toast('Automations saved.');if(refetch) await refetch()}
    setLoading(false)
  }
  const iS={border:'1px solid var(--border-2)',borderRadius:8,padding:'.55rem .85rem',fontSize:'.88rem',fontFamily:'inherit',color:'var(--ink)',background:'var(--surface)',outline:'none',transition:'border .15s',width:'100%'}
  const foc=(e)=>e.target.style.borderColor='var(--gold)'
  const blu=(e)=>e.target.style.borderColor='var(--border-2)'
  const delayOptions=[{v:1,label:'1 hour after'},{v:2,label:'2 hours after'},{v:24,label:'24 hours after (next day)'}]
  return (
    <div className="card">
      <div className="card-body" style={{display:'flex',flexDirection:'column',gap:'1.1rem'}}>
        <div className="settings-row">
          <div>
            <div className="settings-row-label">Automatically request reviews</div>
            <div style={{fontSize:'.73rem',color:'var(--ink-3)',marginTop:2}}>Send a review request email to clients after their appointment</div>
          </div>
          <label className="toggle-wrap">
            <input type="checkbox" checked={form.review_requests_enabled} onChange={e=>setForm(f=>({...f,review_requests_enabled:e.target.checked}))}/>
            <div className="toggle-track"/><div className="toggle-thumb"/>
          </label>
        </div>
        {form.review_requests_enabled&&(
          <>
            <div style={{height:1,background:'var(--border)'}}/>
            <div className="field">
              <label style={{fontSize:'.72rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.08em',display:'block',marginBottom:'.4rem'}}>Send review request</label>
              <div style={{display:'flex',gap:'.5rem',flexWrap:'wrap'}}>
                {delayOptions.map(o=>(
                  <button key={o.v} onClick={()=>setForm(f=>({...f,review_delay_hours:o.v}))}
                    style={{padding:'.5rem 1rem',border:`1.5px solid ${form.review_delay_hours===o.v?'var(--gold)':'var(--border-2)'}`,borderRadius:8,
                      background:form.review_delay_hours===o.v?'rgba(197,169,106,.08)':'var(--surface)',
                      color:form.review_delay_hours===o.v?'var(--gold)':'var(--ink-3)',
                      fontWeight:form.review_delay_hours===o.v?600:400,
                      fontSize:'.82rem',cursor:'pointer',fontFamily:'inherit',transition:'all .15s'}}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{background:'var(--bg)',borderRadius:10,border:'1px solid var(--border)',padding:'1rem'}}>
              <div style={{fontSize:'.62rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.12em',color:'var(--gold)',marginBottom:'.65rem'}}>How it works</div>
              <div style={{display:'flex',flexDirection:'column',gap:'.5rem'}}>
                {['Client books and attends appointment','Email is sent automatically after the delay you choose','Client rates their visit on your Organized. page','You approve it → it appears on your public profile'].map((step,i)=>(
                  <div key={i} style={{display:'flex',gap:'.65rem',alignItems:'flex-start'}}>
                    <div style={{width:18,height:18,borderRadius:'50%',background:'var(--gold)',color:'#1a1814',fontSize:'.62rem',fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1}}>{i+1}</div>
                    <div style={{fontSize:'.78rem',color:'var(--ink-2)',lineHeight:1.5}}>{step}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{height:1,background:'var(--border)'}}/>
            <div>
              <div style={{fontSize:'.72rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:'.3rem'}}>Google Reviews <span style={{fontWeight:400,textTransform:'none',letterSpacing:0,fontSize:'.72rem'}}>(optional)</span></div>
              <div style={{fontSize:'.75rem',color:'var(--ink-3)',lineHeight:1.55,marginBottom:'.65rem'}}>If you have a Google Business page, paste your review link here. Clients who rate 5 stars will see an option to also post on Google.</div>
              <input style={iS} value={form.google_review_url}
                onChange={e=>setForm(f=>({...f,google_review_url:e.target.value}))}
                onFocus={foc} onBlur={blu}
                placeholder="https://g.page/r/your-business/review (optional)"/>
            </div>
          </>
        )}
        <button className="btn btn-primary" style={{justifyContent:'center',padding:'.75rem'}} onClick={save} disabled={loading}>
          {loading?'Saving…':saved?'Saved ✓':'Save'}
        </button>
      </div>
    </div>
  )
}

function SettingsNotificationsForm({ workspace, toast, refetch }) {
  const [form, setForm] = useState({
    sms_notifications_phone: workspace?.sms_notifications_phone || '',
    sms_on_new_booking:      workspace?.sms_on_new_booking      ?? false,
    sms_on_cancel:           workspace?.sms_on_cancel           ?? false,
    sms_reminder_24h:        workspace?.sms_reminder_24h        ?? false,
  })
  useEffect(() => {
    if (workspace) setForm({
      sms_notifications_phone: workspace.sms_notifications_phone || '',
      sms_on_new_booking:      workspace.sms_on_new_booking      ?? false,
      sms_on_cancel:           workspace.sms_on_cancel           ?? false,
      sms_reminder_24h:        workspace.sms_reminder_24h        ?? false,
    })
  }, [workspace?.id])
  const [loading, setLoading] = useState(false), [saved, setSaved] = useState(false)
  const iS = {border:'1px solid var(--border-2)',borderRadius:8,padding:'.55rem .85rem',fontSize:'.88rem',fontFamily:'inherit',color:'var(--ink)',background:'var(--surface)',outline:'none',transition:'border .15s',width:'100%'}
  const foc = e => e.target.style.borderColor='var(--gold)'
  const blu = e => e.target.style.borderColor='var(--border-2)'

  async function save() {
    if (!workspace?.id) return
    setLoading(true); setSaved(false)
    const { error } = await supabase.from('workspaces').update({
      sms_notifications_phone: form.sms_notifications_phone.trim() || null,
      sms_on_new_booking:      form.sms_on_new_booking,
      sms_on_cancel:           form.sms_on_cancel,
      sms_reminder_24h:        form.sms_reminder_24h,
    }).eq('id', workspace.id)
    if (error) toast(`Error: ${error.message}`)
    else { setSaved(true); toast('Notification preferences saved.'); if (refetch) await refetch() }
    setLoading(false)
  }

  const Toggle = ({ field, label, sub }) => (
    <div className="settings-row">
      <div>
        <div className="settings-row-label">{label}</div>
        {sub && <div style={{fontSize:'.73rem',color:'var(--ink-3)',marginTop:2}}>{sub}</div>}
      </div>
      <label className="toggle-wrap">
        <input type="checkbox" checked={form[field]} onChange={e => setForm(f => ({...f, [field]: e.target.checked}))}/>
        <div className="toggle-track"/><div className="toggle-thumb"/>
      </label>
    </div>
  )

  return (
    <div className="card">
      <div className="card-body" style={{display:'flex',flexDirection:'column',gap:'1.1rem'}}>
        <div className="field">
          <label style={{fontSize:'.72rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.08em',display:'block',marginBottom:'.4rem'}}>SMS Phone Number</label>
          <input style={iS} type="tel" value={form.sms_notifications_phone}
            onChange={e => setForm(f => ({...f, sms_notifications_phone: e.target.value}))}
            onFocus={foc} onBlur={blu} placeholder="+1 (514) 000-0000"/>
          <div style={{fontSize:'.72rem',color:'var(--ink-3)',marginTop:'.35rem'}}>Receive text alerts at this number. Leave empty to disable SMS.</div>
        </div>
        <div style={{height:1,background:'var(--border)'}}/>
        <Toggle field="sms_on_new_booking" label="SMS on new booking received"   sub="Get a text when a client books an appointment"/>
        <div style={{height:1,background:'var(--border)'}}/>
        <Toggle field="sms_on_cancel"      label="SMS on booking cancelled"       sub="Get a text when a client cancels"/>
        <div style={{height:1,background:'var(--border)'}}/>
        <Toggle field="sms_reminder_24h"   label="SMS reminder 24h before"        sub="Daily digest of tomorrow's appointments"/>
        <div style={{height:1,background:'var(--border)'}}/>
        <div style={{background:'var(--bg)',borderRadius:10,border:'1px solid var(--border)',padding:'1rem'}}>
          <div style={{fontSize:'.62rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.12em',color:'var(--gold)',marginBottom:'.5rem'}}>Email notifications</div>
          <div style={{fontSize:'.78rem',color:'var(--ink-2)',lineHeight:1.55}}>Email confirmations are sent automatically for every new booking. Configure review request emails in <strong>Automations</strong>.</div>
        </div>
        <button className="btn btn-primary" style={{justifyContent:'center',padding:'.75rem'}} onClick={save} disabled={loading}>
          {loading ? 'Saving…' : saved ? 'Saved ✓' : 'Save notifications'}
        </button>
      </div>
    </div>
  )
}

function SettingsLanguageForm({ ownerData, toast, refetch, lang='en' }) {
  const [selectedLang,setSelectedLang]=useState(ownerData?.language||'en')
  const [saved,setSaved]=useState(false),[loading,setLoading]=useState(false)
  const langs=[{key:'en',label:'English',region:'United States / Canada'},{key:'fr',label:'Français',region:'France / Canada'},{key:'es',label:'Español',region:'España / Latinoamérica'}]
  async function save(){
    setLoading(true);setSaved(false)
    const uid=ownerData?.id||null
    if(uid){const{error}=await supabase.from('users').update({language:selectedLang}).eq('id',uid);if(error){toast('Error saving language: '+error.message);setLoading(false);return}}
    setSaved(true);toast('Language saved.');if(refetch) await refetch();setLoading(false)
  }
  return (
    <div className="card">
      <div className="card-head"><div className="card-title">{t(lang,'display_lang')}</div></div>
      <div style={{padding:'1rem 1.4rem',display:'flex',flexDirection:'column',gap:'.5rem'}}>
        {langs.map(l=>(<div key={l.key} className={`lang-row${selectedLang===l.key?' lang-active':''}`} onClick={()=>setSelectedLang(l.key)}><div><div className="lang-label">{l.label}</div><div className="lang-sub">{l.region}</div></div><div className={`lang-check-circle${selectedLang===l.key?' lang-check-active':''}`}>{selectedLang===l.key&&<svg viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.5" width="10" height="10"><polyline points="1.5,5 4,7.5 8.5,2.5"/></svg>}</div></div>))}
        <button className="btn btn-primary" style={{justifyContent:'center',padding:'.75rem',marginTop:'.5rem'}} onClick={save} disabled={loading}>{loading?t(lang,'saving'):saved?t(lang,'saved'):t(lang,'save_lang')}</button>
      </div>
    </div>
  )
}

// ── SETTINGS ──────────────────────────────────────────────────────────────────
export default function SettingsSection({ workspace, toast, refetch, theme, setTheme, session, ownerData, lang='en' }) {
  const [section,setSection]=useState(null)
  const uid=session?.user?.id||'guest'
  const [faithPref,setFaithPref]=useState(()=>localStorage.getItem(`org_faith_${uid}`)==='true')
  function toggleFaith(val){setFaithPref(val);localStorage.setItem(`org_faith_${uid}`,val)}
  const BackBtn=()=>(
    <button className="settings-back-btn" onClick={()=>setSection(null)}>
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" width="13" height="13"><path d="M10 3L5 8l5 5"/></svg> Settings
    </button>
  )
  const sections=[
    {key:'profile',label:t(lang,'profile'),sub:t(lang,'profile_sub')},
    {key:'business',label:t(lang,'business'),sub:t(lang,'business_sub')},
    {key:'appearance',label:t(lang,'appearance'),sub:t(lang,'appearance_sub')},
    {key:'coach',label:'Coach',sub:'Daily inspiration and faith preferences'},
    {key:'automations',label:'Automations',sub:'Review requests and smart follow-ups'},
    {key:'notifications',label:'Notifications',sub:'SMS and email alerts for bookings'},
    {key:'language',label:t(lang,'language'),sub:t(lang,'language_sub')},
  ]
  if(section==='profile') return (
    <div>
      <div className="page-head"><div><BackBtn/><div className="page-title" style={{marginTop:'.4rem'}}>{t(lang,'profile')}</div></div></div>
      <div className="card" style={{marginBottom:'1.25rem'}}>
        <div className="card-head"><div className="card-title">Personal information</div></div>
        <SettingsProfileForm session={session} ownerData={ownerData} toast={toast} refetch={refetch} lang={lang}/>
      </div>
      <div className="card" style={{marginBottom:'1.25rem'}}>
        <div className="card-head"><div className="card-title">Password</div></div>
        <SettingsPasswordForm session={session} toast={toast} lang={lang}/>
      </div>
      <CancelSubscriptionCard toast={toast} lang={lang}/>
    </div>
  )
  if(section==='business') return (
    <div>
      <div className="page-head">
        <div><BackBtn/><div className="page-title" style={{marginTop:'.4rem'}}>{t(lang,'business')}</div></div>
        <button className="btn btn-secondary btn-sm" onClick={async()=>{await supabase.from('workspaces').update({is_published:!workspace.is_published}).eq('id',workspace.id);toast(workspace.is_published?'Profile unpublished.':'Profile is now live!');refetch()}}>{workspace?.is_published?t(lang,'unpublish'):t(lang,'publish')}</button>
      </div>
      <SettingsBusinessForm workspace={workspace} toast={toast} refetch={refetch} lang={lang}/>
    </div>
  )
  if(section==='appearance') return (
    <div>
      <div className="page-head"><div><BackBtn/><div className="page-title" style={{marginTop:'.4rem'}}>{t(lang,'appearance')}</div></div></div>
      <div style={{fontSize:'.68rem',fontWeight:700,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:'.65rem'}}>Dashboard Theme</div>
      <div className="card" style={{marginBottom:'1.75rem'}}>
        <div className="card-body">
          <div style={{fontSize:'.8rem',color:'var(--ink-3)',marginBottom:'1rem',lineHeight:1.55}}>Controls how <strong style={{color:'var(--ink)'}}>your dashboard</strong> looks. Only you see this.</div>
          <div className="theme-options">
            <div className={`theme-option${theme!=='dark'?' selected':''}`} onClick={()=>setTheme('light')}>
              <div className="theme-preview"><div className="tp-ls"/><div className="tp-lm"><div className="tp-lb"/><div className="tp-lb"/></div></div>
              <div className="theme-label">Light {theme!=='dark'&&<div className="theme-check">{I.check}</div>}</div>
            </div>
            <div className={`theme-option${theme==='dark'?' selected':''}`} onClick={()=>setTheme('dark')}>
              <div className="theme-preview"><div className="tp-ds"/><div className="tp-dm"><div className="tp-db"/><div className="tp-db"/></div></div>
              <div className="theme-label">Dark {theme==='dark'&&<div className="theme-check">{I.check}</div>}</div>
            </div>
          </div>
          <div className="settings-row" style={{marginTop:'1rem'}}>
            <div className="settings-row-label">Dark mode</div>
            <label className="toggle-wrap"><input type="checkbox" checked={theme==='dark'} onChange={e=>setTheme(e.target.checked?'dark':'light')}/><div className="toggle-track"/><div className="toggle-thumb"/></label>
          </div>
        </div>
      </div>
      <div style={{fontSize:'.68rem',fontWeight:700,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:'.65rem'}}>Business Page Theme</div>
      <div className="card">
        <div className="card-body">
          <div style={{fontSize:'.8rem',color:'var(--ink-3)',marginBottom:'1rem',lineHeight:1.55}}>Controls how <strong style={{color:'var(--ink)'}}>your public client page</strong> looks. Clients see this when they book.</div>
          <div className="theme-options">
            <div className={`theme-option${(!workspace?.theme||workspace?.theme==='warm')?' selected':''}`} onClick={async()=>{await supabase.from('workspaces').update({theme:'warm'}).eq('id',workspace.id);if(refetch)await refetch();toast('Business page set to Warm.')}}>
              <div className="theme-preview" style={{background:'linear-gradient(135deg,#1A1208 0%,#2C1F0A 100%)'}}><div style={{position:'absolute',inset:0,background:'radial-gradient(circle at 40% 60%,rgba(201,168,76,.35) 0%,transparent 65%)',borderRadius:4}}/></div>
              <div className="theme-label">Warm {(!workspace?.theme||workspace?.theme==='warm')&&<div className="theme-check">{I.check}</div>}</div>
            </div>
            <div className={`theme-option${workspace?.theme==='light'?' selected':''}`} onClick={async()=>{await supabase.from('workspaces').update({theme:'light'}).eq('id',workspace.id);if(refetch)await refetch();toast('Business page set to Light.')}}>
              <div className="theme-preview"><div className="tp-ls"/><div className="tp-lm"><div className="tp-lb"/><div className="tp-lb"/></div></div>
              <div className="theme-label">Light {workspace?.theme==='light'&&<div className="theme-check">{I.check}</div>}</div>
            </div>
            <div className={`theme-option${workspace?.theme==='dark'?' selected':''}`} onClick={async()=>{await supabase.from('workspaces').update({theme:'dark'}).eq('id',workspace.id);if(refetch)await refetch();toast('Business page set to Dark.')}}>
              <div className="theme-preview"><div className="tp-ds"/><div className="tp-dm"><div className="tp-db"/><div className="tp-db"/></div></div>
              <div className="theme-label">Dark {workspace?.theme==='dark'&&<div className="theme-check">{I.check}</div>}</div>
            </div>
          </div>
          <div style={{fontSize:'.73rem',color:'var(--ink-3)',marginTop:'1rem',lineHeight:1.55}}>
            Changes apply immediately to your public page — no save needed.
          </div>
        </div>
      </div>
    </div>
  )
  if(section==='coach') return (
    <div>
      <div className="page-head"><div><BackBtn/><div className="page-title" style={{marginTop:'.4rem'}}>Coach</div></div></div>
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Daily Inspiration</div>
            <div className="card-sub">First slide of your Coach feed — refreshes every day</div>
          </div>
        </div>
        <div className="card-body" style={{display:'flex',flexDirection:'column',gap:0}}>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">Faith-based content (Bible)</div>
              <div style={{fontSize:'.73rem',color:'var(--ink-3)',marginTop:2}}>Replace motivational quotes with a daily Bible verse</div>
            </div>
            <label className="toggle-wrap">
              <input type="checkbox" checked={faithPref} onChange={e=>toggleFaith(e.target.checked)}/>
              <div className="toggle-track"/><div className="toggle-thumb"/>
            </label>
          </div>
          <div style={{marginTop:'1rem',padding:'1rem',background:'var(--bg)',borderRadius:10,border:'1px solid var(--border)'}}>
            <div style={{fontSize:'.62rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.12em',color:'var(--gold)',marginBottom:'.65rem'}}>Today's slide preview</div>
            {(()=>{
              const arr=faithPref?BIBLE_VERSES:INSPIRATION_QUOTES
              const entry=getDailyEntry(arr)
              return (
                <div style={{display:'flex',flexDirection:'column',gap:'.35rem'}}>
                  <div style={{display:'flex',alignItems:'flex-start',gap:'.65rem'}}>
                    <span style={{fontSize:'1rem'}}>{entry.icon}</span>
                    <span style={{fontSize:'.82rem',color:'var(--ink-2)',lineHeight:1.6,fontStyle:'italic'}}>"{entry.text}"</span>
                  </div>
                  <div style={{fontSize:'.7rem',color:'var(--gold)',fontWeight:600,paddingLeft:'1.65rem'}}>— {faithPref?entry.ref:entry.author}</div>
                </div>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
  if(section==='automations') return (
    <div>
      <div className="page-head"><div><BackBtn/><div className="page-title" style={{marginTop:'.4rem'}}>Automations</div></div></div>
      <div style={{fontSize:'.68rem',fontWeight:700,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:'.65rem'}}>Review Requests</div>
      <SettingsAutomationsForm workspace={workspace} toast={toast} refetch={refetch} lang={lang}/>
    </div>
  )
  if(section==='notifications') return (
    <div>
      <div className="page-head"><div><BackBtn/><div className="page-title" style={{marginTop:'.4rem'}}>Notifications</div></div></div>
      <SettingsNotificationsForm workspace={workspace} toast={toast} refetch={refetch}/>
    </div>
  )
  if(section==='language') return (
    <div>
      <div className="page-head"><div><BackBtn/><div className="page-title" style={{marginTop:'.4rem'}}>{t(lang,'language')}</div></div></div>
      <SettingsLanguageForm ownerData={ownerData} toast={toast} refetch={refetch} lang={lang}/>
    </div>
  )
  return (
    <div>
      <div className="page-head"><div><div className="page-title">{t(lang,'settings_title')}</div><div className="page-sub">{t(lang,'settings_sub')}</div></div></div>
      <div className="card">
        {sections.map((s,i)=>(
          <div key={s.key} className="settings-section-row" style={{borderBottom:i<sections.length-1?'1px solid var(--border)':'none'}} onClick={()=>setSection(s.key)}>
            <div><div className="settings-section-label">{s.label}</div><div className="settings-section-sub">{s.sub}</div></div>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" width="14" height="14" style={{color:'var(--ink-3)',flexShrink:0}}><path d="M6 3l5 5-5 5"/></svg>
          </div>
        ))}
      </div>
    </div>
  )
}
