import { Camera, LogOut, Lock, Mail, User as UserIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/context/auth-context'

const avatarStorageKey = (userId: number) => `skybooker_avatar_${userId}`

export function ProfileMenu() {
  const navigate = useNavigate()
  const { user, profile, logout } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatar, setAvatar] = useState(() =>
    user ? localStorage.getItem(avatarStorageKey(user.userId)) ?? '' : '',
  )

  useEffect(() => {
    setAvatar(user ? localStorage.getItem(avatarStorageKey(user.userId)) ?? '' : '')
  }, [user])

  const displayName = useMemo(() => {
    if (profile?.firstName || profile?.lastName) {
      return `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim()
    }

    if (user?.firstName || user?.lastName) {
      return `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()
    }

    return user?.email.split('@')[0] ?? 'Passenger'
  }, [profile?.firstName, profile?.lastName, user?.email, user?.firstName, user?.lastName])

  const initials = useMemo(() => {
    return displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'P'
  }, [displayName])

  const email = profile?.email ?? user?.email ?? 'Not available'

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file || !user) return

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      setAvatar(result)
      localStorage.setItem(avatarStorageKey(user.userId), result)
    }
    reader.readAsDataURL(file)
  }

  function handleSignOut() {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-3 rounded-full border border-[#1e3a8a]/10 bg-white/80 px-2 py-1.5 transition-colors hover:bg-white"
        >
          <span className="hidden md:block text-sm font-semibold text-[#00236f] max-w-40 truncate">
            {displayName}
          </span>
          <Avatar className="size-10 border-2 border-[#1e3a8a]/10">
            {avatar ? <AvatarImage alt={displayName} src={avatar} /> : null}
            <AvatarFallback className="bg-[#f2f4f6] text-[#4f5c8e] font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 rounded-2xl border-slate-200 p-2">
        <DropdownMenuLabel className="px-3 py-2">
          <div className="space-y-1">
            <p className="text-sm font-bold text-[#00236f]">{displayName}</p>
            <p className="text-xs text-slate-500">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-3 py-2 space-y-3 text-sm">
          <ProfileRow icon={<UserIcon className="w-4 h-4 text-[#00236f]" />} label="Name" value={displayName} />
          <ProfileRow icon={<Mail className="w-4 h-4 text-[#00236f]" />} label="Email" value={email} />
          <ProfileRow icon={<UserIcon className="w-4 h-4 text-[#00236f]" />} label="DOB" value="Not available" />
          <ProfileRow icon={<Lock className="w-4 h-4 text-[#00236f]" />} label="Password" value="••••••••" />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="rounded-xl px-3 py-2.5" onSelect={() => fileInputRef.current?.click()}>
          <Camera className="w-4 h-4 text-[#00236f]" />
          Upload Profile Picture
        </DropdownMenuItem>
        <DropdownMenuItem className="rounded-xl px-3 py-2.5 text-red-600 focus:text-red-600" onSelect={handleSignOut}>
          <LogOut className="w-4 h-4 text-red-600" />
          Sign Out
        </DropdownMenuItem>
        <input
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
          type="file"
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ProfileRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
        <p className="font-medium text-slate-700 truncate">{value}</p>
      </div>
    </div>
  )
}
