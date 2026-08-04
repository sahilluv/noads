import { useState } from 'react'
import { AlertCircle, Check, Upload, X } from 'lucide-react'
import { cn } from '../../utils/tw'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { useShallowState } from '../../store'
import { calculateCellPrice } from '../../utils/pricing'

interface PaymentModalProps {
  open: boolean
  onClose: () => void
  cellIndex: number
  cellPrice: number
}

export const PaymentModal = ({
  open,
  onClose,
  cellIndex,
  cellPrice,
}: PaymentModalProps) => {
  const { balance, buyCell, setCellImage, ownedCells } = useShallowState(
    (state) => ({
      balance: state.balance,
      buyCell: state.buyCell,
      setCellImage: state.setCellImage,
      ownedCells: state.ownedCells,
    })
  )

  const [step, setStep] = useState<'confirm' | 'payment' | 'upload' | 'success'>(
    'confirm'
  )
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const isOwned = !!ownedCells[cellIndex]
  const canAfford = balance >= cellPrice

  const handleProceedToPayment = () => {
    if (!canAfford) {
      setError('Insufficient balance')
      return
    }
    setStep('payment')
  }

  const handlePayment = () => {
    // Simulate payment processing
    buyCell(cellIndex, cellPrice)
    setStep('upload')
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    setUploading(true)
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      if (dataUrl) {
        setPreview(dataUrl)
        setCellImage(cellIndex, dataUrl)
        setUploading(false)
        setStep('success')
      }
    }
    reader.onerror = () => {
      setError('Failed to read image')
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleClose = () => {
    setStep('confirm')
    setPreview(null)
    setError(null)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50">
        {/* Confirm Step */}
        {step === 'confirm' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                Purchase Cell #{cellIndex}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-6">
              {isOwned ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                  <p className="text-emerald-400 text-sm font-semibold">
                    ✓ You already own this cell
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                      <span className="text-slate-300">Cell Price</span>
                      <span className="text-2xl font-bold text-white">
                        ₹{cellPrice.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                      <span className="text-slate-300">Your Balance</span>
                      <span
                        className={cn('text-2xl font-bold', {
                          'text-emerald-400': canAfford,
                          'text-red-400': !canAfford,
                        })}
                      >
                        ₹{balance.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex gap-2">
                      <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  )}
                </>
              )}

              <p className="text-slate-400 text-sm leading-relaxed">
                {isOwned
                  ? 'Upload a custom image to this cell to display your ad or content.'
                  : 'Purchase this cell to display your custom ad or content. After payment, you can upload your image.'}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 bg-slate-700/20 hover:bg-slate-700/40 text-white border-slate-600/30"
              >
                Cancel
              </Button>
              <Button
                onClick={
                  isOwned ? () => setStep('upload') : handleProceedToPayment
                }
                disabled={!isOwned && !canAfford}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              >
                {isOwned ? 'Upload Image' : 'Proceed to Payment'}
              </Button>
            </div>
          </>
        )}

        {/* Payment Step */}
        {step === 'payment' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                Complete Payment
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-6">
              <div className="bg-slate-700/30 rounded-lg p-6 border border-slate-600/30 text-center space-y-2">
                <p className="text-slate-400 text-sm">Total Amount</p>
                <p className="text-4xl font-bold text-white">
                  ₹{cellPrice.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-slate-300 text-sm font-semibold">
                  Card Details
                </label>
                <div className="bg-slate-700/20 rounded-lg p-4 border border-slate-600/30">
                  <input
                    type="text"
                    placeholder="Card Number"
                    className="w-full bg-slate-800/50 text-white placeholder-slate-500 px-3 py-2 rounded border border-slate-600/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <p className="text-slate-400 text-xs text-center">
                This is a demo. In production, integrate with Stripe or your
                payment provider.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('confirm')}
                className="flex-1 bg-slate-700/20 hover:bg-slate-700/40 text-white border-slate-600/30"
              >
                Back
              </Button>
              <Button
                onClick={handlePayment}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
              >
                Pay ₹{cellPrice.toLocaleString('en-IN')}
              </Button>
            </div>
          </>
        )}

        {/* Upload Step */}
        {step === 'upload' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                Upload Your Image
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-6">
              {preview ? (
                <div className="relative group">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border border-slate-600/30"
                  />
                  <button
                    onClick={() => setPreview(null)}
                    className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-700 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-600/30 rounded-lg p-8 text-center hover:border-slate-500/50 transition-colors cursor-pointer bg-slate-700/20">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    disabled={uploading}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center gap-2 cursor-pointer"
                  >
                    <Upload className="h-8 w-8 text-slate-400" />
                    <p className="text-slate-300 font-semibold">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-slate-500 text-sm">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </label>
                </div>
              )}

              {uploading && (
                <div className="flex items-center justify-center gap-2 text-blue-400">
                  <div className="animate-spin">
                    <Upload className="h-4 w-4" />
                  </div>
                  <span>Uploading...</span>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex gap-2">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 bg-slate-700/20 hover:bg-slate-700/40 text-white border-slate-600/30"
              >
                Back
              </Button>
              <Button
                onClick={() => !preview && handleClose()}
                disabled={!preview}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white disabled:opacity-50"
              >
                {preview ? 'Image Ready' : 'Select Image First'}
              </Button>
            </div>
          </>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                Success! 🎉
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-6 text-center">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <Check className="h-8 w-8 text-emerald-400" />
              </div>

              <div className="space-y-2">
                <p className="text-white font-semibold">
                  Your image has been uploaded!
                </p>
                <p className="text-slate-400 text-sm">
                  Your custom content is now live on cell #{cellIndex}
                </p>
              </div>

              {preview && (
                <img
                  src={preview}
                  alt="Uploaded"
                  className="w-full h-32 object-cover rounded-lg border border-slate-600/30"
                />
              )}
            </div>

            <Button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            >
              Close & View
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
