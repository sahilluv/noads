import { About } from './about'
import { AdPreview } from './ad-preview'
import { PaymentModal } from '../modals/payment-modal'
import { HotkeysView } from './hotkeys'
import { LowFpsAlert } from './low-fps-alert'
import { Settings } from './settings'
import { useShallowState } from '../../store'
import { calculateCellPrice } from '../../utils/pricing'

const PrimaryViews = () => {
  const { paymentModalOpen, paymentModalCellIndex, closePaymentModal } =
    useShallowState((state) => ({
      paymentModalOpen: state.paymentModalOpen,
      paymentModalCellIndex: state.paymentModalCellIndex,
      closePaymentModal: state.closePaymentModal,
    }))

  const cellPrice = paymentModalCellIndex
    ? calculateCellPrice(0, 0) // You can enhance this to calculate based on actual cell position
    : 0

  return (
    <>
      <Settings />
      <About />
      <LowFpsAlert />
      <HotkeysView />
      <AdPreview />
      <PaymentModal
        open={paymentModalOpen}
        onClose={closePaymentModal}
        cellIndex={paymentModalCellIndex || 0}
        cellPrice={cellPrice}
      />
    </>
  )
}

export default PrimaryViews
