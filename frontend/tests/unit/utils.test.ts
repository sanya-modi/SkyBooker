import { cn } from '../../src/lib/utils'

describe('Utils', () => {
  describe('cn', () => {
    it('merges class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('handles conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
    })

    it('handles arrays', () => {
      expect(cn(['foo', 'bar'])).toBe('foo bar')
    })

    it('handles objects', () => {
      expect(cn({ foo: true, bar: false })).toBe('foo')
    })

    it('merges tailwind classes', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4')
    })

    it('handles empty input', () => {
      expect(cn()).toBe('')
    })

    it('handles null and undefined', () => {
      expect(cn('foo', null, undefined, 'bar')).toBe('foo bar')
    })
  })
})
