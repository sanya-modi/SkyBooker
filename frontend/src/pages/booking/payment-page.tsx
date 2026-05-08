import { gsap } from 'gsap'
import { ArrowLeft, CreditCard, Smartphone, Building2, Wallet, CheckCircle2, Shield, Lock } from 'lucide-react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MEALS, BAGGAGE } from '../../components/addons/addons-section'
import { MobileDock } from '../../components/booking/mobile-dock'
import { PaymentSummary } from '../../components/booking/payment-summary'
import { getEffectiveSeatClass, getSeatPrice } from '../../components/booking/seat-picker'
import { TopNav } from '../../components/booking/top-nav'
import { useAuth } from '../../context/auth-context'
import { useBookingFlow } from '../../context/booking-flow-context'
import { bookingApi, flightApi, passengerApi, paymentApi, seatApi, type EnrichedFlightResult, type SeatResult } from '../../services/api'

declare global {
  interface Window {
    Razorpay: any
  }
}

function enrichFlight(flight: Awaited<ReturnType<typeof flightApi.getById>>): EnrichedFlightResult {
  return { ...flight, stopCount: 0, stopsLabel: 'Direct' }
}

function fmtTime(v: string) {
  return new Date(v).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function isSeatConflictError(message: string) {
  const normalized = message.toLowerCase()
  return normalized.includes('duplicate key') || normalized.includes('seat already booked') || normalized.includes('seat is already booked')
}

function isPassengerSchemaMismatchError(message: string) {
  const normalized = message.toLowerCase()
  return (
    normalized.includes('column "email"') && normalized.includes('passengers')
  ) || (
    normalized.includes('column "phone_number"') && normalized.includes('passengers')
  )
}

type PaymentMethod = 'CREDIT_CARD' | 'UPI' | 'NET_BANKING' | 'WALLET'
type PassengerErrors = {
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  category?: string
  gender?: string
  passportNumber?: string
  email?: string
  phoneNumber?: string
}

const validationPatterns = {
  name: /^[A-Za-z][A-Za-z\s'-]{1,49}$/,
  passport: /^[A-Z0-9]{6,20}$/,
  nationality: /^[A-Za-z][A-Za-z\s-]{1,49}$/,
  email: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
  phoneNumber: /^\d{10}$/,
} as const

const PAYMENT_METHODS = [
  { id: 'CREDIT_CARD' as PaymentMethod, name: 'Credit/Debit Card', icon: CreditCard, popular: true },
  { id: 'UPI' as PaymentMethod, name: 'UPI', icon: Smartphone, popular: true },
  { id: 'NET_BANKING' as PaymentMethod, name: 'Net Banking', icon: Building2, popular: false },
  { id: 'WALLET' as PaymentMethod, name: 'Wallets', icon: Wallet, popular: false },
]

function calculateAge(dateOfBirth: string) {
  const today = new Date()
  const dob = new Date(dateOfBirth)
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1
  }
  return age
}

function getCategoryAgeError(category: string, dateOfBirth: string) {
  if (!category || !dateOfBirth) return undefined

  const age = calculateAge(dateOfBirth)
  if (Number.isNaN(age) || age < 0) {
    return 'Date of birth cannot be in the future'
  }

  if (category === 'ADULT' && age <= 12) {
    return 'Passenger must be older than 12 years'
  }
  if (category === 'CHILD' && (age < 2 || age > 12)) {
    return 'Passenger age must be between 2 and 12 years'
  }
  if (category === 'INFANT' && age >= 2) {
    return 'Passenger must be below 2 years'
  }

  return undefined
}

function validatePassenger(entry: {
  firstName: string
  lastName: string
  dateOfBirth: string
  category: string
  gender: string
  passportNumber: string
  email: string
  phoneNumber: string
}): PassengerErrors {
  const errors: PassengerErrors = {}
  const firstName = entry.firstName.trim()
  const lastName = entry.lastName.trim()
  const passportNumber = entry.passportNumber.trim().toUpperCase()
  const email = entry.email.trim()
  const phoneNumber = entry.phoneNumber.trim()

  if (!firstName) errors.firstName = 'First name is required'
  else if (!validationPatterns.name.test(firstName)) errors.firstName = 'First name must be 2-50 letters only'

  if (!lastName) errors.lastName = 'Last name is required'
  else if (!validationPatterns.name.test(lastName)) errors.lastName = 'Last name must be 2-50 letters only'

  if (!entry.dateOfBirth) errors.dateOfBirth = 'Date of birth is required'
  const categoryAgeError = getCategoryAgeError(entry.category, entry.dateOfBirth)
  if (categoryAgeError) errors.dateOfBirth = categoryAgeError

  if (!entry.category.trim()) errors.category = 'Category is required'
  if (!entry.gender.trim()) errors.gender = 'Gender is required'

  if (!passportNumber) errors.passportNumber = 'Passport number is required'
  else if (!validationPatterns.passport.test(passportNumber)) errors.passportNumber = 'Passport number must be 6-20 uppercase letters or digits'

  if (!email) errors.email = 'Email address is required'
  else if (!validationPatterns.email.test(email)) errors.email = 'Please enter a valid email address'

  if (!phoneNumber) errors.phoneNumber = 'Mobile number is required'
  else if (!validationPatterns.phoneNumber.test(phoneNumber)) errors.phoneNumber = 'Mobile number must be exactly 10 digits'

  return errors
}

function getPassengerNationality(nationality?: string | null) {
  const normalized = nationality?.trim() || ''
  if (validationPatterns.nationality.test(normalized)) {
    return normalized
  }
  return 'Indian'
}

export function PaymentPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { isLoggedIn, user, profile, updateProfile } = useAuth()
  const { passengers, selectedFlight, selectedSeatIds, selectedMealId, selectedBaggageId, passenger, setConfirmedBooking } = useBookingFlow()
  const [flight, setFlight] = useState<EnrichedFlightResult | null>(selectedFlight)
  const [seats, setSeats] = useState<SeatResult[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('CREDIT_CARD')
  const flightId = Number(params.get('flightId'))

  const headerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    gsap.fromTo(headerRef.current, { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' })
    gsap.fromTo(contentRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.55, delay: 0.12, ease: 'power3.out' })
  }, [])

  useEffect(() => {
    if (!isLoggedIn) {
      navigate(`/login?redirect=${encodeURIComponent(`/payment?flightId=${flightId}`)}`)
    }
  }, [flightId, isLoggedIn, navigate])

  useEffect(() => {
    if (selectedSeatIds.length === 0) {
      navigate(`/booking?flightId=${flightId}`)
    }
  }, [flightId, navigate, selectedSeatIds])

  useEffect(() => {
    async function load() {
      if (!flightId || (selectedFlight && selectedFlight.id === flightId)) return
      try {
        setFlight(enrichFlight(await flightApi.getById(flightId)))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load flight details.')
      }
    }
    void load()
  }, [flightId, selectedFlight])

  useEffect(() => {
    async function loadSeats() {
      if (!flightId) return
      try {
        setSeats(await seatApi.getAllByFlight(flightId))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load seat details.')
      }
    }
    void loadSeats()
  }, [flightId])

  const primaryPassenger = passengers[0] ?? passenger
  const selectedPassengers = passengers.slice(0, selectedSeatIds.length)
  const selectedSeatLabel = selectedSeatIds.join(', ')
  const selectedSeat = selectedSeatIds.length === 1
    ? seats.find((seat) => seat.seatNumber === selectedSeatIds[0]) ?? null
    : null
  const selectedSeatClass = selectedSeat ? getEffectiveSeatClass(selectedSeat) : undefined
  const taxes = useMemo(() => Math.round(Number(flight?.baseFare ?? 0) * 0.12), [flight])
  const seatCharge = useMemo(() => selectedSeatIds.reduce((sum, seatNumber) => sum + getSeatPrice(seats, seatNumber), 0), [seats, selectedSeatIds])
  const mealCharge = useMemo(() => MEALS.find(m => m.id === selectedMealId)?.price ?? 0, [selectedMealId])
  const baggageCharge = useMemo(() => BAGGAGE.find(b => b.id === selectedBaggageId)?.price ?? 0, [selectedBaggageId])
  const total = Number(flight?.baseFare ?? 0) + taxes + seatCharge + mealCharge + baggageCharge
  const passengerNationality = useMemo(() => getPassengerNationality(profile?.nationality), [profile?.nationality])
  const passengerErrors = useMemo(() => selectedPassengers.map(validatePassenger), [selectedPassengers])
  const invalidPassengerSummaries = useMemo(
    () =>
      passengerErrors
        .map((entry, index) => {
          const messages = Object.values(entry).filter((message): message is string => Boolean(message))
          if (messages.length === 0) return null
          return `Passenger ${index + 1}: ${messages[0]}`
        })
        .filter((entry): entry is string => Boolean(entry)),
    [passengerErrors],
  )

  async function syncUserContactDetails() {
    // Intentionally empty: do not update the user details by the information they are filling when booking the tickets
  }

  async function handleConfirm() {
    if (submitting) {
      return
    }
    if (!user) {
      setError('Please log in to continue with payment.')
      return
    }
    if (!flight) {
      setError('Flight details are missing. Please return to booking and try again.')
      return
    }
    if (selectedSeatIds.length === 0) {
      setError('Please select at least one seat before continuing to payment.')
      return
    }
    if (!primaryPassenger.firstName.trim() || !primaryPassenger.lastName.trim() || !primaryPassenger.email.trim() || !primaryPassenger.phoneNumber.trim()) {
      setError('Passenger details are missing. Please return to booking and complete them before payment.')
      return
    }

    if (invalidPassengerSummaries.length > 0) {
      setError(`Please correct these passenger details before payment: ${invalidPassengerSummaries.join(' | ')}`)
      return
    }

    setSubmitting(true)
    setError('')
    
    try {

      const latestSeats = await seatApi.getAllByFlight(flight.id)
      setSeats(latestSeats)

      const unavailableSeat = selectedSeatIds.find((seatNumber) => {
        const seat = latestSeats.find((entry) => entry.seatNumber === seatNumber)
        return !seat || (seat.status !== 'AVAILABLE' && !(seat.status === 'HELD' && seat.passengerId === user.userId))
      })

      if (unavailableSeat) {
        setError('This seat is already booked. Please select another seat.')
        setSubmitting(false)
        return
      }

      console.log('Creating booking...', {
        userId: user.userId,
        flightId: flight.id,
        numberOfPassengers: selectedSeatIds.length,
        selectedSeats: selectedSeatIds,
      })

      // Step 1: Create booking with PENDING status
      const booking = await bookingApi.create({
        userId: user.userId,
        flightId: flight.id,
        numberOfPassengers: selectedSeatIds.length,
        selectedSeats: selectedSeatIds,
        taxes,
        seatCharge,
        mealCharge,
        baggageCharge,
        passengers: selectedPassengers.map((entry) => ({
          dateOfBirth: entry.dateOfBirth,
          category: entry.category as 'ADULT' | 'CHILD' | 'INFANT',
        })),
      })

      console.log('Booking created:', booking)

      try {
        await Promise.all(
          selectedPassengers.map((entry) =>
            passengerApi.create({
              bookingId: booking.id,
              firstName: entry.firstName.trim(),
              lastName: entry.lastName.trim(),
              email: entry.email.trim(),
              phoneNumber: entry.phoneNumber.trim(),
              passportNumber: entry.passportNumber.trim().toUpperCase(),
              dateOfBirth: entry.dateOfBirth,
              category: entry.category as 'ADULT' | 'CHILD' | 'INFANT',
              gender: entry.gender as 'MALE' | 'FEMALE' | 'OTHER',
              nationality: passengerNationality,
            }),
          ),
        )
      } catch (passengerError) {
        const passengerMessage = passengerError instanceof Error ? passengerError.message : 'Failed to save passenger details.'
        if (isPassengerSchemaMismatchError(passengerMessage)) {
          console.warn('Passenger persistence failed due to backend schema mismatch:', passengerMessage)
        }
        if (passengerMessage.toLowerCase().includes('passport number already exists')) {
          throw new Error('This passport number is already registered. Each passenger must have a unique passport number.')
        }
        throw new Error(passengerMessage)
      }

      const bookingAmount = Number(booking.totalAmount ?? booking.totalFare)

      // Step 2: Create Razorpay order
      const orderData = await paymentApi.createOrder(
        {
          bookingId: booking.id,
          amount: bookingAmount,
          currency: 'INR',
          userId: user.userId,
          paymentMethod: selectedMethod
        },
        primaryPassenger.email.trim() || user.email,
        `${primaryPassenger.firstName.trim()} ${primaryPassenger.lastName.trim()}`.trim() || user.email
      )

      console.log('Razorpay order created:', orderData)

      // Step 3: Initialize Razorpay
      const options = {
        key: orderData.keyId,
        amount: orderData.amount * 100,
        currency: orderData.currency,
        name: 'SkyBooker',
        description: `Flight Booking - ${flight.flightNumber}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            console.log('Payment successful, verifying...', response)
            await paymentApi.verify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })

            console.log('Payment verified successfully')
            setConfirmedBooking(await bookingApi.getById(booking.id))
            navigate('/confirmation')
          } catch (err) {
            console.error('Payment verification failed:', err)
            setError('Payment verification failed. Please contact support.')
            setSubmitting(false)
          }
        },
        prefill: {
          name: `${primaryPassenger.firstName.trim()} ${primaryPassenger.lastName.trim()}`.trim(),
          email: primaryPassenger.email.trim() || user.email,
          contact: primaryPassenger.phoneNumber.trim() || passenger.phoneNumber,
        },
        theme: {
          color: '#00236f',
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false)
            setError('Payment cancelled by user')
          },
        },
      }

      if (typeof window === 'undefined' || typeof window.Razorpay !== 'function') {
        setError('Payment service is currently unavailable. Please try again in a moment.')
        setSubmitting(false)
        return
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (err) {
      console.error('Payment initiation failed:', err)
      const message = err instanceof Error ? err.message : 'Unable to initiate payment.'
      setError(isSeatConflictError(message) ? 'This seat is already booked. Please select another seat.' : message)
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav />

      <div ref={headerRef} className="bg-gradient-to-br from-[#00236f] via-[#1e3a8a] to-[#1d4ed8] pt-[60px]">
        <div className="max-w-[1280px] mx-auto px-6 py-6">
          <button
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-semibold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-all mb-4"
            onClick={() => navigate(-1)}
            type="button"
          >
            <ArrowLeft size={15} /> Back to Booking
          </button>

          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <h1 className="text-white font-black text-2xl leading-none tracking-tight mb-2">
                Complete Your Payment
              </h1>
              {flight && (
                <p className="text-blue-200 text-sm">
                  {flight.flightNumber} · {flight.departureAirport?.city} → {flight.arrivalAirport?.city} · {fmtTime(flight.departureTime)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
              <Shield size={15} className="text-blue-300" />
              <span className="text-white font-semibold text-sm">Secure Payment</span>
            </div>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex">
            {['Seat & Passenger', 'Payment', 'Confirmation'].map((step, i) => (
              <div
                key={step}
                className={`flex-1 py-2.5 text-center text-xs font-bold border-b-2 transition-all ${
                  i === 1 ? 'border-white text-white' : 'border-white/20 text-white/40'
                }`}
              >
                {i + 1}. {step}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div ref={contentRef} className="max-w-[1280px] mx-auto px-6 py-7">
        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 text-sm font-semibold flex items-center gap-2">
            <span>⚠</span> {error}
          </div>
        )}

        {invalidPassengerSummaries.length > 0 && (
          <div className="mb-5 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl px-5 py-4">
            <p className="text-sm font-bold mb-2">Passenger details need attention before payment.</p>
            <div className="flex flex-col gap-1 text-sm">
              {invalidPassengerSummaries.map((entry) => (
                <p key={entry}>{entry}</p>
              ))}
            </div>
            <button
              className="mt-3 text-sm font-bold text-[#00236f] hover:underline"
              onClick={() => navigate(-1)}
              type="button"
            >
              Go back to booking details
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
          <div className="flex flex-col gap-5">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-[#00236f] to-[#1e3a8a] px-6 py-5">
                <h2 className="text-white font-black text-xl tracking-tight mb-1">Select Payment Method</h2>
                <p className="text-blue-200 text-sm">Choose your preferred payment option</p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon
                    const isSelected = selectedMethod === method.id
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-[#00236f] bg-blue-50 shadow-md'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            isSelected ? 'bg-[#00236f]' : 'bg-slate-100'
                          }`}
                        >
                          <Icon size={20} className={isSelected ? 'text-white' : 'text-slate-600'} />
                        </div>
                        <div className="flex-1 text-left">
                          <p className={`font-bold text-sm ${isSelected ? 'text-[#00236f]' : 'text-slate-800'}`}>
                            {method.name}
                          </p>
                          {method.popular && (
                            <span className="text-xs text-green-600 font-semibold">Popular</span>
                          )}
                        </div>
                        {isSelected && (
                          <CheckCircle2 size={20} className="text-[#00236f] absolute top-3 right-3" />
                        )}
                      </button>
                    )
                  })}
                </div>

                <div className="bg-slate-50 rounded-xl p-5">
                  {selectedMethod === 'CREDIT_CARD' && (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-[#00236f] to-[#1e3a8a] rounded-xl p-5 text-white mb-4">
                        <div className="flex justify-between items-start mb-8">
                          <CreditCard size={32} className="text-white/80" />
                          <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded">VISA</span>
                        </div>
                        <div className="font-mono text-lg tracking-wider mb-4">•••• •••• •••• 4242</div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="uppercase">{user?.email?.split('@')[0] || 'CARDHOLDER'}</span>
                          <span>12/25</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Card Number</label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#00236f] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Expiry Date</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#00236f] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">CVV</label>
                          <input
                            type="text"
                            placeholder="123"
                            maxLength={3}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#00236f] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Cardholder Name</label>
                        <input
                          type="text"
                          placeholder="Name on card"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#00236f] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {selectedMethod === 'UPI' && (
                    <div className="space-y-4">
                      <div className="bg-white rounded-xl p-5 border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                            <Smartphone size={24} className="text-purple-600" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">UPI Payment</p>
                            <p className="text-xs text-slate-500">Fast & Secure</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">UPI ID</label>
                        <input
                          type="text"
                          placeholder="yourname@upi"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#00236f] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Lock size={12} />
                        <span>Your UPI ID is encrypted and secure</span>
                      </div>
                    </div>
                  )}

                  {selectedMethod === 'NET_BANKING' && (
                    <div className="space-y-4">
                      <div className="bg-white rounded-xl p-5 border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Building2 size={24} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">Net Banking</p>
                            <p className="text-xs text-slate-500">All major banks supported</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Select Your Bank</label>
                        <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#00236f] focus:ring-2 focus:ring-blue-100 outline-none transition-all">
                          <option>State Bank of India</option>
                          <option>HDFC Bank</option>
                          <option>ICICI Bank</option>
                          <option>Axis Bank</option>
                          <option>Kotak Mahindra Bank</option>
                          <option>Punjab National Bank</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {selectedMethod === 'WALLET' && (
                    <div className="space-y-4">
                      <div className="bg-white rounded-xl p-5 border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                            <Wallet size={24} className="text-orange-600" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">Digital Wallets</p>
                            <p className="text-xs text-slate-500">Quick checkout</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {['Paytm', 'PhonePe', 'Google Pay', 'Amazon Pay'].map((wallet) => (
                          <button
                            key={wallet}
                            className="px-4 py-3 rounded-xl border-2 border-slate-200 hover:border-[#00236f] hover:bg-blue-50 transition-all text-sm font-semibold text-slate-700"
                          >
                            {wallet}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
                  <Shield size={20} className="text-white" />
                </div>
                <h3 className="font-bold text-slate-800">Your Payment is Secure</h3>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle2 size={14} className="text-green-600" />
                  <span>256-bit SSL</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle2 size={14} className="text-green-600" />
                  <span>PCI DSS</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle2 size={14} className="text-green-600" />
                  <span>Encrypted</span>
                </div>
              </div>
            </div>
          </div>

          <PaymentSummary
            buttonLabel="Confirm & Pay"
            flight={flight}
            loading={submitting}
            onAction={handleConfirm}
            seatCharge={seatCharge}
            mealCharge={mealCharge}
            baggageCharge={baggageCharge}
            seatLabel={selectedSeatLabel}
            seatClass={selectedSeatClass}
            taxes={taxes}
            total={total}
          />
        </div>
      </div>

      <MobileDock active="payment" />
    </div>
  )
}
