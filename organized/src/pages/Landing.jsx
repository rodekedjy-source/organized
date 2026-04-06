import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{background:'#0d0c0a',minHeight:'100vh',fontFamily:'DM Sans,sans-serif'}}>
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 3rem',height:'60px',position:'sticky',top:0,background:'rgba(13,12,10,.92)',backdropFilter:'blur(12px)',borderBottom:'1px solid rgba(255,255,255,.06)',zIndex:100}}>
        <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.3rem',fontWeight:500,color:'#fff'}}>Organized<span style={{color:'#b5893a'}}>.</span></div>
        <button style={{background:'#b5893a',color:'#fff',border:'none',borderRadius:'7px',padding:'.5rem 1.25rem',fontSize:'.82rem',fontWeight:500,cursor:'pointer',fontFamily:'inherit'}} onClick={() => navigate('/auth')}>Get started free</button>
      </nav>
      <div style={{minHeight:'calc(100vh - 60px)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'6rem 2rem 4rem',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'-10%',left:'50%',transform:'translateX(-50%)',width:'700px',height:'500px',background:'radial-gradient(ellipse, rgba(181,137,58,.18) 0%, transparent 70%)',pointerEvents:'none'}}/>
        <h1 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(2.8rem,6vw,5rem)',fontWeight:500,color:'#fff',lineHeight:1.08,maxWidth:'820px',position:'relative',zIndex:1,marginBottom:'1.5rem'}}>
          Stop running your business<br/><em style={{fontStyle:'italic',color:'#b5893a'}}>from your DMs.</em>
        </h1>
        <p style={{fontSize:'1.05rem',color:'rgba(255,255,255,.45)',maxWidth:'520px',lineHeight:1.7,fontWeight:300,position:'relative',zIndex:1,marginBottom:'2.5rem'}}>
          Organized gives every service business a professional booking page, product shop, and client system — all in one place.
        </p>
        <div style={{display:'flex',gap:'1rem',justifyContent:'center',position:'relative',zIndex:1}}>
          <button style={{background:'#b5893a',color:'#fff',border:'none',borderRadius:'8px',padding:'.85rem 2rem',fontSize:'.9rem',fontWeight:500,cursor:'pointer',fontFamily:'inherit'}} onClick={() => navigate('/auth')}>Start free — no card needed</button>
        </div>
        <p style={{fontSize:'.73rem',color:'rgba(255,255,255,.25)',marginTop:'1rem',position:'relative',zIndex:1}}>14-day free trial. Cancel anytime.</p>
      </div>
      <div style={{background:'#fff',padding:'6rem 2rem'}}>
        <div style={{maxWidth:'1080px',margin:'0 auto',textAlign:'center'}}>
          <div style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(2rem,4vw,3rem)',fontWeight:500,color:'#0d0c0a',marginBottom:'3rem'}}>Everything your business needs.</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem',textAlign:'left'}}>
            {[
              {name:'Appointment Booking',desc:'Clients book directly from your profile, 24/7. No more back-and-forth.'},
              {name:'Product Shop',desc:'Sell your products directly from your profile page.'},
              {name:'Formations & Courses',desc:'Monetize your expertise with workshops and digital courses.'},
              {name:'Client Management',desc:'Every client, every visit, every dollar — tracked automatically.'},
            ].map((f,i) => (
              <div key={i} style={{border:'1px solid #e4e0d8',borderRadius:'14px',padding:'2rem'}}>
                <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.2rem',fontWeight:500,marginBottom:'.5rem'}}>{f.name}</div>
                <div style={{fontSize:'.85rem',color:'#7a7672',lineHeight:1.7,fontWeight:300}}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{background:'#080807',padding:'2rem 3rem',display:'flex',alignItems:'center',justifyContent:'space-between',borderTop:'1px solid rgba(255,255,255,.06)'}}>
        <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.1rem',color:'rgba(255,255,255,.4)'}}>Organized<span style={{color:'#b5893a'}}>.</span></div>
        <div style={{fontSize:'.72rem',color:'rgba(255,255,255,.15)'}}>© 2026 Organized — beorganized.io</div>
      </div>
    </div>
  )
}
