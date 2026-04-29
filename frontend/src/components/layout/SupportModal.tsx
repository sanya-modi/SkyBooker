import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, AlertCircle } from 'lucide-react'
import { supportApi } from '@/services/api'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface SupportModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const { user } = useAuth()
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // We assume the user is logged in if they click Support from the protected area,
    // or we use a fallback if they are not logged in.
    const userEmail = user?.email || ''
    const fullName = user ? `${user.firstName} ${user.lastName}` : 'Guest User'

    if (!userEmail) {
      setError('You must be logged in to submit a support request.')
      return
    }

    if (!title.trim() || !description.trim()) {
      setError('Please fill out all fields.')
      return
    }

    setIsSubmitting(true)
    setError('')
    
    try {
      await supportApi.submitSupportRequest({
        title,
        description,
        userEmail,
        fullName
      })
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setTitle('')
        setDescription('')
        onClose()
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to submit support request. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden pointer-events-auto"
            >
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-bold text-[#00236f]">Contact Support</h2>
                <button
                  onClick={onClose}
                  className="p-2 -mr-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-6">
                {success ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 text-green-700 p-6 rounded-xl border border-green-200 text-center"
                  >
                    <CheckCircle2 className="w-12 h-12 mb-3 mx-auto text-green-600" />
                    <p className="font-bold text-lg mb-1">Request Sent Successfully!</p>
                    <p className="text-sm">We've received your query and will get back to you within 24 hours.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-sm flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p>{error}</p>
                      </div>
                    )}
                    
                    {!user?.email && !error && (
                      <div className="bg-amber-50 text-amber-700 p-3 rounded-xl border border-amber-200 text-sm mb-4">
                        Please sign in first to submit a support request.
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">
                        Title
                      </label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Add your grievance title here"
                        className="bg-slate-50 border-slate-200 focus-visible:ring-[#00236f]"
                        disabled={!user?.email}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">
                        Explain the problem
                      </label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Type your query here"
                        className="min-h-[150px] resize-none bg-slate-50 border-slate-200 focus-visible:ring-[#00236f]"
                        disabled={!user?.email}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting || !user?.email}
                      className="w-full mt-4 bg-[#416a7f] hover:bg-[#325263] text-white font-semibold py-6 rounded-xl"
                    >
                      {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
