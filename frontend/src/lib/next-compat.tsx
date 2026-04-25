// Compatibility layer for Next.js components
import { Link as RouterLink } from 'react-router-dom'
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { ReactNode } from 'react'

interface LinkProps {
  href?: string
  to?: string
  children: ReactNode
  [key: string]: any
}

// Link component wrapper that converts href to to
export function Link({ href, to: toPath, children, ...props }: LinkProps) {
  const destination = toPath || href || '/'
  return <RouterLink to={destination} {...props}>{children}</RouterLink>
}

export default Link

interface ImageProps {
  src: string
  alt: string
  fill?: boolean
  className?: string
  [key: string]: any
}

// Image component wrapper
export function Image({ src, alt, fill, className, ...props }: ImageProps) {
  if (fill) {
    return (
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover ${className || ''}`}
        {...props}
      />
    )
  }
  return <img src={src} alt={alt} className={className} {...props} />
}

// useRouter hook wrapper
export function useRouter() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const [searchParams] = useSearchParams()
  
  return {
    push: (path: string) => navigate(path),
    replace: (path: string) => navigate(path, { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
    pathname: location.pathname,
    query: Object.fromEntries(searchParams.entries()),
    params,
  }
}
