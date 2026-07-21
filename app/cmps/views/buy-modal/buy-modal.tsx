import { useState, useCallback } from 'react'
import { CheckCircle, Upload, Video, X, Zap } from 'lucide-react'
import { useShallowState } from '../../../store'
import { getPrice } from '../../../utils/pricing'
import type { BusinessInfo } from '../../../store/portfolio-slice'
import config from '../../../config'

// ── Types ─────────────────────────────────────────────────────────────────────

type Step = 'review' | 'details' | 'success'

// ── Design tokens ─────────────────────────────────────────────────────────────

const CYAN        = 'hsl(196, 100%, 55%)'
const CYAN_DIM    = 'rgba(0, 210, 255, 0.14)'
const CYAN_BORDER = 'rgba(0, 210, 255, 0.25)'
const SURFACE     = 'rgba(5, 9, 28, 0.96)'
const CARD_BORDER = 'rgba(0, 210, 255, 0.18)'

// ── Primitive components ──────────────────────────────────────────────────────

const Field = ({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(180,200,220,0.55)', textTransform: 'uppercase' }}>
      {label}{required && <span style={{ color: CYAN, marginLeft: '4px' }}>*</span>}
    </label>
    {children}
  </div>
)

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    style={{
      width: '100%',
      padding: '10px 14px',
      borderRadius: '10px',
      border: `1px solid ${CYAN_BORDER}`,
      background: 'rgba(0, 210, 255, 0.04)',
      color: 'white',
      fontSize: '14px',
      fontFamily: "'Space Grotesk', sans-serif",
      outline: 'none',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box',
      ...props.style,
    }}
  />
)

const PrimaryBtn = ({
  children,
  onClick,
  disabled,
  fullWidth,
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  fullWidth?: boolean
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      width: fullWidth ? '100%' : undefined,
      padding: '12px 24px',
      borderRadius: '12px',
      border: `1px solid ${CYAN_BORDER}`,
      background: disabled
        ? 'rgba(255,255,255,0.05)'
        : 'linear-gradient(135deg, hsl(255 60% 30%), hsl(196 100% 42%))',
      color: disabled ? 'rgba(255,255,255,0.3)' : 'white',
      fontSize: '14px',
      fontWeight: 700,
      letterSpacing: '0.05em',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s',
      boxShadow: disabled ? 'none' : `0 0 20px rgba(0, 210, 255, 0.2)`,
      fontFamily: "'Space Grotesk', sans-serif",
    }}
  >
    {children}
  </button>
)

const GhostBtn = ({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick?: () => void
}) => (
  <button
    onClick={onClick}
    style={{
      padding: '10px 20px',
      borderRadius: '10px',
      border: '1px solid rgba(255,255,255,0.1)',
      background: 'transparent',
      color: 'rgba(255,255,255,0.5)',
      fontSize: '13px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontFamily: "'Space Grotesk', sans-serif",
    }}
  >
    {children}
  </button>
)

const UploadZone = ({
  label,
  accept,
  preview,
  onFile,
  icon,
}: {
  label: string
  accept: string
  preview?: string | null
  onFile: (f: File) => void
  icon: React.ReactNode
}) => (
  <label
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '20px',
      borderRadius: '12px',
      border: `1.5px dashed ${CYAN_BORDER}`,
      background: preview ? 'transparent' : CYAN_DIM,
      cursor: 'pointer',
      minHeight: '90px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}
  >
    {preview ? (
      <img
        src={preview}
        alt='preview'
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
      />
    ) : (
      <>
        <span style={{ color: CYAN }}>{icon}</span>
        <span style={{ fontSize: '12px', color: 'rgba(180,200,220,0.55)', textAlign: 'center' }}>{label}</span>
      </>
    )}
    <input
      type='file'
      accept={accept}
      style={{ display: 'none' }}
      onChange={(e) => {
        const f = e.target.files?.[0]
        if (f) onFile(f)
      }}
    />
  </label>
)

// ── Step 1 — Review ───────────────────────────────────────────────────────────

const StepReview = ({
  cellIndex,
  basePrice,
  hasVideo,
  onToggleVideo,
  onNext,
  onClose,
}: {
  cellIndex: number
  basePrice: number
  hasVideo: boolean
  onToggleVideo: () => void
  onNext: () => void
  onClose: () => void
}) => {
  const total = basePrice + (hasVideo ? config.videoAddonPrice : 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Tile info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '16px', borderRadius: '14px', background: CYAN_DIM, border: `1px solid ${CYAN_BORDER}` }}>
        <span style={{ fontSize: '11px', letterSpacing: '0.08em', color: 'rgba(180,200,220,0.5)', textTransform: 'uppercase' }}>Tile ID</span>
        <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, color: CYAN, fontSize: '22px' }}>#{cellIndex}</span>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Permanent placement · Visible globally · Never expires</span>
      </div>

      {/* Pricing breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
          <span>Base tile price</span>
          <span style={{ fontFamily: "'Space Mono', monospace" }}>₹{basePrice.toLocaleString('en-IN')}</span>
        </div>
        {hasVideo && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
            <span>Video ad addon</span>
            <span style={{ fontFamily: "'Space Mono', monospace" }}>₹{config.videoAddonPrice.toLocaleString('en-IN')}</span>
          </div>
        )}
        <div style={{ height: '1px', background: 'rgba(0,210,255,0.12)', margin: '4px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 700 }}>
          <span style={{ color: 'white' }}>Total</span>
          <span style={{ color: CYAN, fontFamily: "'Space Mono', monospace" }}>₹{total.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Video toggle */}
      <div
        onClick={onToggleVideo}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderRadius: '12px',
          border: `1px solid ${hasVideo ? CYAN_BORDER : 'rgba(255,255,255,0.08)'}`,
          background: hasVideo ? CYAN_DIM : 'rgba(255,255,255,0.02)',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Video style={{ color: hasVideo ? CYAN : 'rgba(255,255,255,0.35)', width: 16, height: 16 }} />
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: hasVideo ? CYAN : 'rgba(255,255,255,0.7)' }}>Add 10-sec Video Ad</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>+₹{config.videoAddonPrice} · MP4 or WebM</div>
          </div>
        </div>
        <div style={{
          width: '36px', height: '20px', borderRadius: '10px',
          background: hasVideo ? CYAN : 'rgba(255,255,255,0.12)',
          position: 'relative', transition: 'background 0.2s',
        }}>
          <div style={{
            position: 'absolute', top: '3px', left: hasVideo ? '18px' : '3px',
            width: '14px', height: '14px', borderRadius: '50%',
            background: 'white', transition: 'left 0.2s',
          }} />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <GhostBtn onClick={onClose}>Cancel</GhostBtn>
        <PrimaryBtn onClick={onNext} fullWidth>Continue →</PrimaryBtn>
      </div>
    </div>
  )
}

// ── Step 2 — Business Details ─────────────────────────────────────────────────

const StepDetails = ({
  hasVideo,
  onBack,
  onConfirm,
}: {
  hasVideo: boolean
  onBack: () => void
  onConfirm: (info: BusinessInfo, imagePreview: string | null) => void
}) => {
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [link, setLink]       = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [errors, setErrors]   = useState<Record<string, string>>({})

  const handleImage = useCallback((file: File) => {
    setImagePreview(URL.createObjectURL(file))
  }, [])

  const handleVideo = useCallback((file: File) => {
    setVideoPreview(URL.createObjectURL(file))
  }, [])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Business name is required'
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Valid email is required'
    if (hasVideo && !videoPreview) e.video = 'Please upload your video ad'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = () => {
    if (!validate()) return
    onConfirm(
      { name: name.trim(), email: email.trim(), link: link.trim() || undefined, imageUrl: imagePreview ?? undefined, hasVideo },
      imagePreview,
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Field label='Business Name' required>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='e.g. Acme Corp'
        />
        {errors.name && <span style={{ fontSize: '11px', color: '#f87171' }}>{errors.name}</span>}
      </Field>

      <Field label='Business Email' required>
        <Input
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='hello@yourbrand.com'
        />
        {errors.email && <span style={{ fontSize: '11px', color: '#f87171' }}>{errors.email}</span>}
      </Field>

      <Field label='Website Link'>
        <Input
          type='url'
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder='https://yourbrand.com'
        />
      </Field>

      <Field label='Ad Image'>
        <UploadZone
          label='Drop PNG / JPG here or click to upload'
          accept='image/png,image/jpeg,image/webp'
          preview={imagePreview}
          onFile={handleImage}
          icon={<Upload style={{ width: 20, height: 20 }} />}
        />
      </Field>

      {hasVideo && (
        <Field label='Video Ad (10 sec max)' required>
          <UploadZone
            label='Drop MP4 / WebM here or click to upload'
            accept='video/mp4,video/webm'
            preview={videoPreview}
            onFile={handleVideo}
            icon={<Video style={{ width: 20, height: 20 }} />}
          />
          {errors.video && <span style={{ fontSize: '11px', color: '#f87171' }}>{errors.video}</span>}
        </Field>
      )}

      <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
        <GhostBtn onClick={onBack}>← Back</GhostBtn>
        <PrimaryBtn onClick={submit} fullWidth>Confirm Purchase</PrimaryBtn>
      </div>
    </div>
  )
}

// ── Step 3 — Success ──────────────────────────────────────────────────────────

const StepSuccess = ({ businessName, onClose }: { businessName: string; onClose: () => void }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '12px 0' }}>
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        position: 'absolute', width: '80px', height: '80px', borderRadius: '50%',
        background: 'rgba(0,210,255,0.12)', animation: 'ping 1.5s ease-out infinite',
      }} />
      <CheckCircle style={{ width: 52, height: 52, color: CYAN }} />
    </div>
    <div style={{ textAlign: 'center' }}>
      <h3 style={{ fontWeight: 700, fontSize: '20px', color: 'white', margin: '0 0 6px' }}>You're Live!</h3>
      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
        <span style={{ color: CYAN, fontWeight: 600 }}>{businessName}</span> is now permanently on the NoAds board.
      </p>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', padding: '12px 16px', borderRadius: '12px', background: CYAN_DIM, border: `1px solid ${CYAN_BORDER}` }}>
      {['Tile is permanently yours', 'Ad is visible globally', 'No renewals ever needed'].map((t) => (
        <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
          <CheckCircle style={{ width: 13, height: 13, color: CYAN, flexShrink: 0 }} />
          {t}
        </div>
      ))}
    </div>
    <PrimaryBtn onClick={onClose} fullWidth>Close</PrimaryBtn>
  </div>
)

// ── Modal shell ───────────────────────────────────────────────────────────────

const STEP_LABELS: Record<Step, string> = {
  review:  'Review Tile',
  details: 'Your Business',
  success: 'Confirmed!',
}

export const BuyModal = () => {
  const {
    buyModalOpen,
    buyModalCellIndex,
    buyModalCellX,
    buyModalCellY,
    closeBuyModal,
    completePurchase,
  } = useShallowState((state) => ({
    buyModalOpen:       state.buyModalOpen,
    buyModalCellIndex:  state.buyModalCellIndex,
    buyModalCellX:      state.buyModalCellX,
    buyModalCellY:      state.buyModalCellY,
    closeBuyModal:      state.closeBuyModal,
    completePurchase:   state.completePurchase,
  }))

  const [step, setStep]         = useState<Step>('review')
  const [hasVideo, setHasVideo] = useState(false)
  const [bizName, setBizName]   = useState('')

  if (!buyModalOpen || buyModalCellIndex === null) return null

  const basePrice = getPrice(buyModalCellX, buyModalCellY, window.innerWidth, window.innerHeight)
  const total     = basePrice + (hasVideo ? config.videoAddonPrice : 0)

  const handleClose = () => {
    closeBuyModal()
    setTimeout(() => { setStep('review'); setHasVideo(false); setBizName('') }, 300)
  }

  const handleConfirm = (info: BusinessInfo) => {
    setBizName(info.name)
    completePurchase(buyModalCellIndex, basePrice, total, info)
    setStep('success')
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0, 4, 18, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%', maxWidth: '460px',
          background: SURFACE,
          border: `1px solid ${CARD_BORDER}`,
          borderRadius: '22px',
          boxShadow: '0 0 60px rgba(0, 150, 255, 0.15), 0 24px 80px rgba(0,0,0,0.7)',
          overflow: 'hidden',
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 22px 16px',
          borderBottom: `1px solid rgba(0,210,255,0.1)`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '8px',
              background: 'linear-gradient(135deg, hsl(255 60% 28%), hsl(196 100% 38%))',
              boxShadow: '0 0 10px rgba(0,210,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap style={{ width: 15, height: 15, color: 'white' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'white' }}>{STEP_LABELS[step]}</div>
              <div style={{ fontSize: '11px', color: 'rgba(180,200,220,0.4)', letterSpacing: '0.06em' }}>
                {step === 'success' ? 'NoAds Platform' : `Step ${step === 'review' ? 1 : 2} of 2`}
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)', width: '32px', height: '32px',
              borderRadius: '8px', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
            }}
          >
            <X style={{ width: 15, height: 15 }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '22px' }}>
          {step === 'review' && (
            <StepReview
              cellIndex={buyModalCellIndex}
              basePrice={basePrice}
              hasVideo={hasVideo}
              onToggleVideo={() => setHasVideo((v) => !v)}
              onNext={() => setStep('details')}
              onClose={handleClose}
            />
          )}
          {step === 'details' && (
            <StepDetails
              hasVideo={hasVideo}
              onBack={() => setStep('review')}
              onConfirm={handleConfirm}
            />
          )}
          {step === 'success' && (
            <StepSuccess businessName={bizName} onClose={handleClose} />
          )}
        </div>
      </div>
    </div>
  )
}
