import { gsap } from 'gsap'
import { Calendar, Mail, Phone, Shield, User } from 'lucide-react'
import { useLayoutEffect, useRef, useState } from 'react'
import type { PassengerFormData } from '../../context/booking-flow-context'

const FIELDS = [
  { key: 'firstName', label: 'First Name', placeholder: 'As per passport', icon: User, type: 'text', col: 1 },
  { key: 'lastName', label: 'Last Name', placeholder: 'As per passport', icon: User, type: 'text', col: 1 },
  { key: 'dateOfBirth', label: 'Date of Birth', placeholder: '', icon: Calendar, type: 'date', col: 1 },
  { key: 'gender', label: 'Gender', placeholder: '', icon: User, type: 'select', col: 1 },
  { key: 'passportNumber', label: 'Passport / ID Number', placeholder: 'A1234567', icon: Shield, type: 'text', col: 1 },
  { key: 'email', label: 'Email Address', placeholder: 'you@example.com', icon: Mail, type: 'email', col: 2 },
  { key: 'phoneNumber', label: 'Phone Number', placeholder: '+91 98765 43210', icon: Phone, type: 'tel', col: 1 },
] as const

const COUNTRY_CODES = ['+91', '+1', '+44'] as const

export function PassengerForm({
  seatLabel,
  title,
  value,
  errors = {},
  onChange,
}: {
  seatLabel?: string
  title?: string
  value: PassengerFormData
  errors?: Partial<Record<keyof PassengerFormData, string>>
  onChange: (next: PassengerFormData) => void
}) {
  const formRef = useRef<HTMLDivElement>(null)
  const [countryCode, setCountryCode] = useState<(typeof COUNTRY_CODES)[number]>('+91')

  useLayoutEffect(() => {
    if (!formRef.current) return
    gsap.fromTo(formRef.current.querySelectorAll('.pf-field'),
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out' }
    )
  }, [])

  return (
    <div ref={formRef} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <User size={18} className="text-[#1e3a8a]" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-base">{title ?? 'Passenger Details'}</h2>
            <p className="text-slate-400 text-xs mt-0.5">
              {seatLabel ? `Seat ${seatLabel} · ` : ''}Enter details exactly as on your passport / ID
            </p>
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FIELDS.map((field) => {
          const Icon = field.icon
          const val = value[field.key]
          const isEmpty = !val
          const fieldError = errors[field.key]

          return (
            <div
              className={`pf-field flex flex-col gap-1.5 ${field.col === 2 ? 'sm:col-span-2' : ''}`}
              key={field.key}
            >
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                {field.label}
              </label>
              <div className={`flex items-center gap-3 px-4 h-12 rounded-xl border-2 transition-all bg-slate-50 ${
                fieldError
                  ? 'border-red-300 bg-red-50/60'
                  : isEmpty
                  ? 'border-slate-200'
                  : 'border-[#1e3a8a]/30 bg-blue-50/30'
              } focus-within:border-[#1e3a8a] focus-within:bg-white focus-within:shadow-sm focus-within:shadow-blue-900/10`}>
                <Icon size={15} className={fieldError ? 'text-red-400' : isEmpty ? 'text-slate-300' : 'text-[#1e3a8a]'} />
                {field.key === 'gender' ? (
                  <select
                    className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-900"
                    onChange={(e) => onChange({ ...value, gender: e.target.value })}
                    value={value.gender}
                  >
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                ) : field.key === 'phoneNumber' ? (
                  <>
                    <select
                      className="bg-transparent border-none outline-none text-sm font-medium text-slate-900"
                      onChange={(e) => setCountryCode(e.target.value as (typeof COUNTRY_CODES)[number])}
                      value={countryCode}
                    >
                      {COUNTRY_CODES.map((code) => (
                        <option key={code} value={code}>{code}</option>
                      ))}
                    </select>
                    <input
                      className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-900 placeholder:text-slate-300"
                      inputMode="numeric"
                      maxLength={10}
                      onChange={(e) => onChange({ ...value, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      placeholder="9876543210"
                      required
                      type="tel"
                      value={value.phoneNumber}
                    />
                  </>
                ) : (
                  <input
                    className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-900 placeholder:text-slate-300"
                    max={field.key === 'dateOfBirth' ? new Date().toISOString().slice(0, 10) : undefined}
                    onChange={(e) => onChange({ ...value, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    required
                    type={field.type}
                    value={val}
                  />
                )}
              </div>
              {fieldError ? (
                <p className="text-[11px] font-medium text-red-600">{fieldError}</p>
              ) : null}
            </div>
          )
        })}
      </div>

      {/* Footer note */}
      <div className="px-6 pb-5">
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <Shield size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700 font-medium">
            Passenger details must match your government-issued ID exactly. Incorrect details may result in boarding denial.
          </p>
        </div>
      </div>
    </div>
  )
}
