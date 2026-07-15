import { useState, useRef, useCallback } from 'react'
import { useShallowState } from '../../../store'
import { getPrice } from '../../../utils/pricing'
import type { BusinessInfo } from '../../../store/portfolio-slice'

const VIDEO_ADDON_PRICE = 500

// ── Inline styles ────────────────────────────────────────────────────────────

const overlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 5, 20, 0.82)',
  backdropFilter: 'blur(10px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '16px',
}

const card: React.CSSProperties = {
  background: 'linear-gradient(160deg, #050f28 0%, #071530 100%)',
  border: '1px solid rgba(30, 100, 220, 0.5)',
  borderRadius: '20px',
  width: '100%',
  maxWidth: '480px',
  boxShadow: '0 0 40px rgba(0, 150, 255, 0.18), 0 0 80px rgba(0, 100, 200, 0.08)',
  overflow: 'hidden',
  fontFamily: 'Inter, system-ui, sans-serif',
}

const header: React.CSSProperties = {
  padding: '20px 24px 16px',
  borderBottom: '1px solid rgba(30, 80, 180, 0.3)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const closeBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: 'rgba(255,255,255,0.6)',
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s',
}

const body: React.CSSProperties = {
  padding: '24px',
}

const label: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 600,
  color: 'rgba(100, 160, 255, 0.8)',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  marginBottom: '6px',
}

const input: React.CSSProperties = {
  width: '100%',
  background: 'rgba(5, 15, 40, 0.8)',
  border: '1px solid rgba(30, 80, 180, 0.4)',
  borderRadius: '10px',
  padding: '11px 14px',
  color: 'rgba(220, 235, 255, 0.95)',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
  fontFamily: 'inherit',
}

const fieldGroup: React.CSSProperties = {
  marginBottom: '16px',
}

const primaryBtn: React.CSSProperties = {
  width: '100%',
  background: 'linear-gradient(135deg, #1050d0 0%, #0a35a0 100%)',
  border: '1px solid rgba(60, 160, 255, 0.6)',
  borderRadius: '12px',
  color: '#ffffff',
  padding: '14px',
  fontSize: '15px',
  fontWeight: 700,
  cursor: 'pointer',
  letterSpacing: '0.05em',
  boxShadow: '0 0 20px rgba(0, 120, 255, 0.3)',
  transition: 'all 0.2s',
  fontFamily: 'inherit',
}

const uploadBox: React.CSSProperties = {
  border: '1.5px dashed rgba(40, 120, 255, 0.4)',
  borderRadius: '12px',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer',
  background: 'rgba(5, 20, 60, 0.4)',
  transition: 'all 0.2s',
  color: 'rgba(120, 170, 255, 0.7)',
  fontSize: '13px',
}

const successCard: React.CSSProperties = {
  textAlign: 'center',
  padding: '32px 24px',
}

// ── Step 1 — Tile Info & Confirm ────────────────────────────────────────────

function StepConfirm({
  cellIndex,
  price,
  onNext,
  onClose,
}: {
  cellIndex: number
  price: number
  onNext: () => void
  onClose: () => void
}) {
  return (
    <div>
      <div style={header}>
        <div>
          <div style={{ fontSize: '11px', color: 'rgba(0,210,255,0.8)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>
            ◆ AVAILABLE
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>Buy This Tile</div>
        </div>
        <button style={closeBtn} onClick={onClose}>✕</button>
      </div>

      <div style={body}>
        {/* Tile preview card */}
        <div style={{
          background: 'rgba(2, 10, 30, 0.9)',
          border: '1px solid rgba(0, 180, 255, 0.3)',
          borderRadius: '14px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: 'inset 0 0 30px rgba(0, 100, 200, 0.08)',
        }}>
          {/* Grid visual */}
          <div style={{ position: 'relative', height: '80px', marginBottom: '16px', overflow: 'hidden', borderRadius: '8px', background: 'rgba(0,5,20,0.8)' }}>
            <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.15 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <line key={`v${i}`} x1={`${(i + 1) * 12.5}%`} y1="0" x2={`${(i + 1) * 12.5}%`} y2="100%" stroke="#00d4ff" strokeWidth="0.5" />
              ))}
              {Array.from({ length: 5 }).map((_, i) => (
                <line key={`h${i}`} x1="0" y1={`${(i + 1) * 20}%`} x2="100%" y2={`${(i + 1) * 20}%`} stroke="#00d4ff" strokeWidth="0.5" />
              ))}
              <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="rgba(0,200,255,0.4)" fontSize="11" fontFamily="Inter" fontWeight="700" letterSpacing="4">
                TILE #{cellIndex}
              </text>
            </svg>
            {/* Corner brackets */}
            {[['8px','8px','right','bottom'],['calc(100% - 8px)','8px','left','bottom'],['8px','calc(100% - 8px)','right','top'],['calc(100% - 8px)','calc(100% - 8px)','left','top']].map(([x,y,bx,by], i) => (
              <div key={i} style={{ position: 'absolute', left: x, top: y, width: '14px', height: '14px',
                borderRight: bx === 'right' ? '1.5px solid rgba(0,210,255,0.7)' : 'none',
                borderLeft: bx === 'left' ? '1.5px solid rgba(0,210,255,0.7)' : 'none',
                borderBottom: by === 'bottom' ? '1.5px solid rgba(0,210,255,0.7)' : 'none',
                borderTop: by === 'top' ? '1.5px solid rgba(0,210,255,0.7)' : 'none',
              }} />
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(100,160,255,0.7)', fontWeight: 600, marginBottom: '2px' }}>BASE PRICE</div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff' }}>₹{price}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: 'rgba(100,160,255,0.7)', fontWeight: 600, marginBottom: '2px' }}>+ VIDEO ADDON</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'rgba(0,210,255,0.8)' }}>₹{VIDEO_ADDON_PRICE}</div>
            </div>
          </div>
        </div>

        {/* What's included */}
        <div style={{ marginBottom: '20px' }}>
          {[
            ['🖼️', 'Upload your ad image (PNG/JPG)'],
            ['🎬', `Upload 10-sec video (+₹${VIDEO_ADDON_PRICE})`, true],
            ['🔗', 'Add your business website link'],
            ['♾️', 'Permanent tile placement on the grid'],
          ].map(([icon, text, addon]) => (
            <div key={String(text)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '16px' }}>{icon}</span>
              <span style={{ fontSize: '13px', color: addon ? 'rgba(0,210,255,0.8)' : 'rgba(200,215,255,0.75)', flex: 1 }}>{String(text)}</span>
            </div>
          ))}
        </div>

        <button style={primaryBtn} onClick={onNext}>
          🛒 &nbsp; CONTINUE TO PURCHASE
        </button>
      </div>
    </div>
  )
}

// ── Step 2 — Business Form ───────────────────────────────────────────────────

function StepForm({
  cellIndex,
  basePrice,
  onComplete,
  onClose,
}: {
  cellIndex: number
  basePrice: number
  onComplete: (info: BusinessInfo, totalPaid: number) => void
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [link, setLink] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [hasVideo, setHasVideo] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const imageRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)

  const totalPrice = basePrice + (hasVideo ? VIDEO_ADDON_PRICE : 0)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Business name is required'
    if (!email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email'
    if (hasVideo && !videoFile) e.video = 'Please upload a video file'
    return e
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setVideoFile(file)
  }

  const handleSubmit = () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }

    const info: BusinessInfo = {
      name: name.trim(),
      email: email.trim(),
      link: link.trim() || undefined,
      imageUrl: imagePreview || undefined,
      videoUrl: videoFile ? URL.createObjectURL(videoFile) : undefined,
      hasVideo,
    }
    onComplete(info, totalPrice)
  }

  const inputStyle = (field: string): React.CSSProperties => ({
    ...input,
    borderColor: errors[field]
      ? 'rgba(255, 80, 80, 0.6)'
      : focusedField === field
      ? 'rgba(0, 180, 255, 0.7)'
      : 'rgba(30, 80, 180, 0.4)',
    boxShadow: focusedField === field ? '0 0 0 3px rgba(0,180,255,0.08)' : 'none',
  })

  return (
    <div>
      <div style={header}>
        <div>
          <div style={{ fontSize: '11px', color: 'rgba(0,210,255,0.8)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>
            STEP 2 OF 2
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>Your Business Details</div>
        </div>
        <button style={closeBtn} onClick={onClose}>✕</button>
      </div>

      <div style={{ ...body, maxHeight: '70vh', overflowY: 'auto' }}>

        {/* Business Name */}
        <div style={fieldGroup}>
          <label style={label}>
            Business Name <span style={{ color: 'rgba(255,80,80,0.9)' }}>*</span>
          </label>
          <input
            style={inputStyle('name')}
            placeholder="e.g. Sharma Electronics"
            value={name}
            onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })) }}
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField(null)}
          />
          {errors.name && <div style={{ color: 'rgba(255,100,100,0.9)', fontSize: '12px', marginTop: '5px' }}>{errors.name}</div>}
        </div>

        {/* Email */}
        <div style={fieldGroup}>
          <label style={label}>
            Business Email <span style={{ color: 'rgba(255,80,80,0.9)' }}>*</span>
          </label>
          <input
            type="email"
            style={inputStyle('email')}
            placeholder="contact@yourbusiness.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })) }}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
          />
          {errors.email && <div style={{ color: 'rgba(255,100,100,0.9)', fontSize: '12px', marginTop: '5px' }}>{errors.email}</div>}
        </div>

        {/* Business Link */}
        <div style={fieldGroup}>
          <label style={label}>Business Website / Link</label>
          <input
            style={inputStyle('link')}
            placeholder="https://yourbusiness.com"
            value={link}
            onChange={e => setLink(e.target.value)}
            onFocus={() => setFocusedField('link')}
            onBlur={() => setFocusedField(null)}
          />
        </div>

        {/* Ad Image Upload */}
        <div style={fieldGroup}>
          <label style={label}>Ad Image (PNG / JPG)</label>
          <input ref={imageRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
          <div
            style={{
              ...uploadBox,
              background: imagePreview ? 'rgba(0,20,60,0.6)' : uploadBox.background,
              borderColor: imagePreview ? 'rgba(0,210,255,0.5)' : 'rgba(40,120,255,0.4)',
              padding: imagePreview ? '8px' : '20px',
            }}
            onClick={() => imageRef.current?.click()}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Ad preview" style={{ width: '100%', maxHeight: '120px', objectFit: 'contain', borderRadius: '8px' }} />
            ) : (
              <>
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>🖼️</div>
                <div style={{ fontWeight: 600, marginBottom: '3px' }}>Click to upload your ad image</div>
                <div style={{ fontSize: '11px', opacity: 0.6 }}>PNG, JPG up to 10MB</div>
              </>
            )}
          </div>
        </div>

        {/* Video Upload — Optional with price addon */}
        <div style={fieldGroup}>
          <label style={label}>
            10-Second Ad Video{' '}
            <span style={{ color: 'rgba(0,210,255,0.9)', fontWeight: 700 }}>+₹{VIDEO_ADDON_PRICE}</span>
            {' '}(Optional)
          </label>

          {/* Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              background: hasVideo ? 'rgba(0, 40, 100, 0.5)' : 'rgba(5, 15, 40, 0.4)',
              border: `1px solid ${hasVideo ? 'rgba(0,200,255,0.4)' : 'rgba(30,80,180,0.3)'}`,
              borderRadius: '10px',
              cursor: 'pointer',
              marginBottom: hasVideo ? '10px' : '0',
              transition: 'all 0.2s',
            }}
            onClick={() => { setHasVideo(v => !v); setVideoFile(null); setErrors(p => ({ ...p, video: '' })) }}
          >
            {/* Toggle switch */}
            <div style={{
              width: '36px', height: '20px', borderRadius: '10px',
              background: hasVideo ? 'rgba(0,180,255,0.8)' : 'rgba(255,255,255,0.15)',
              position: 'relative', transition: 'background 0.2s', flexShrink: 0,
            }}>
              <div style={{
                position: 'absolute', top: '3px',
                left: hasVideo ? '19px' : '3px',
                width: '14px', height: '14px', borderRadius: '50%',
                background: '#fff', transition: 'left 0.2s',
              }} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: hasVideo ? 'rgba(0,210,255,0.9)' : 'rgba(180,200,255,0.7)' }}>
                Add video to my tile
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(120,150,200,0.6)', marginTop: '1px' }}>
                10 seconds max • MP4/WebM
              </div>
            </div>
          </div>

          {hasVideo && (
            <>
              <input ref={videoRef} type="file" accept="video/mp4,video/webm" style={{ display: 'none' }} onChange={handleVideoChange} />
              <div
                style={{
                  ...uploadBox,
                  borderColor: videoFile ? 'rgba(0,210,255,0.5)' : errors.video ? 'rgba(255,80,80,0.5)' : 'rgba(40,120,255,0.4)',
                }}
                onClick={() => videoRef.current?.click()}
              >
                {videoFile ? (
                  <div>
                    <div style={{ fontSize: '20px', marginBottom: '4px' }}>✅</div>
                    <div style={{ fontWeight: 600, color: 'rgba(0,210,255,0.9)', fontSize: '13px' }}>{videoFile.name}</div>
                    <div style={{ fontSize: '11px', opacity: 0.5, marginTop: '2px' }}>Click to change</div>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: '24px', marginBottom: '6px' }}>🎬</div>
                    <div style={{ fontWeight: 600, marginBottom: '3px' }}>Click to upload your video</div>
                    <div style={{ fontSize: '11px', opacity: 0.6 }}>MP4 or WebM • max 10 seconds</div>
                  </>
                )}
              </div>
              {errors.video && <div style={{ color: 'rgba(255,100,100,0.9)', fontSize: '12px', marginTop: '5px' }}>{errors.video}</div>}
            </>
          )}
        </div>

        {/* Price summary */}
        <div style={{
          background: 'rgba(0, 15, 45, 0.7)',
          border: '1px solid rgba(0, 150, 255, 0.25)',
          borderRadius: '12px',
          padding: '14px 16px',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '13px', color: 'rgba(150,180,255,0.7)' }}>Tile #{cellIndex}</span>
            <span style={{ fontSize: '13px', color: 'rgba(220,235,255,0.8)' }}>₹{basePrice}</span>
          </div>
          {hasVideo && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', color: 'rgba(150,180,255,0.7)' }}>Video Addon</span>
              <span style={{ fontSize: '13px', color: 'rgba(0,210,255,0.9)' }}>₹{VIDEO_ADDON_PRICE}</span>
            </div>
          )}
          <div style={{ borderTop: '1px solid rgba(30,80,180,0.3)', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>TOTAL</span>
            <span style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>₹{totalPrice}</span>
          </div>
        </div>

        <button style={primaryBtn} onClick={handleSubmit}>
          ✅ &nbsp; CONFIRM PURCHASE — ₹{totalPrice}
        </button>
        <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '11px', color: 'rgba(100,140,200,0.5)' }}>
          * Business Name and Email are required fields
        </div>
      </div>
    </div>
  )
}

// ── Step 3 — Success ─────────────────────────────────────────────────────────

function StepSuccess({ businessName, onClose }: { businessName: string; onClose: () => void }) {
  return (
    <div style={successCard}>
      <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
      <div style={{ fontSize: '22px', fontWeight: 900, color: '#fff', marginBottom: '8px' }}>
        Tile Purchased!
      </div>
      <div style={{ fontSize: '14px', color: 'rgba(150,190,255,0.8)', lineHeight: 1.6, marginBottom: '8px' }}>
        Congratulations, <strong style={{ color: 'rgba(0,210,255,0.9)' }}>{businessName}</strong>!
      </div>
      <div style={{ fontSize: '13px', color: 'rgba(120,160,220,0.7)', lineHeight: 1.6, marginBottom: '24px' }}>
        Your ad is now live on the NOads grid. Your tile will glow with a neon blue frame for the world to see.
      </div>
      <button style={primaryBtn} onClick={onClose}>
        VIEW MY TILE
      </button>
    </div>
  )
}

// ── Main Modal ───────────────────────────────────────────────────────────────

export const BuyModal = () => {
  const {
    buyModalOpen,
    buyModalCellIndex,
    buyModalCellX,
    buyModalCellY,
    closeBuyModal,
    completePurchase,
  } = useShallowState(s => ({
    buyModalOpen: s.buyModalOpen,
    buyModalCellIndex: s.buyModalCellIndex,
    buyModalCellX: s.buyModalCellX,
    buyModalCellY: s.buyModalCellY,
    closeBuyModal: s.closeBuyModal,
    completePurchase: s.completePurchase,
  }))

  const [step, setStep] = useState<'confirm' | 'form' | 'success'>('confirm')
  const [purchasedName, setPurchasedName] = useState('')

  const cellIndex = buyModalCellIndex ?? 0
  const price = getPrice(buyModalCellX, buyModalCellY, window.innerWidth, window.innerHeight)

  const handleClose = useCallback(() => {
    closeBuyModal()
    setStep('confirm')
  }, [closeBuyModal])

  const handleComplete = useCallback((info: BusinessInfo, totalPaid: number) => {
    completePurchase(cellIndex, price, totalPaid, info)
    setPurchasedName(info.name)
    setStep('success')
  }, [cellIndex, price, completePurchase])

  // Reset to confirm step when modal opens
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose()
  }

  if (!buyModalOpen) return null

  return (
    <div style={overlay} onClick={handleOverlayClick}>
      <div style={card}>
        {step === 'confirm' && (
          <StepConfirm
            cellIndex={cellIndex}
            price={price}
            onNext={() => setStep('form')}
            onClose={handleClose}
          />
        )}
        {step === 'form' && (
          <StepForm
            cellIndex={cellIndex}
            basePrice={price}
            onComplete={handleComplete}
            onClose={handleClose}
          />
        )}
        {step === 'success' && (
          <StepSuccess businessName={purchasedName} onClose={handleClose} />
        )}
      </div>
    </div>
  )
}
