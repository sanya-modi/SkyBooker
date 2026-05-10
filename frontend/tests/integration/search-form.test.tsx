import { render, screen } from '@testing-library/react'
import { SearchForm } from '../../src/components/booking/search-form'

describe('SearchForm', () => {
  const mockOnSubmit = vi.fn()

  it('renders form', () => {
    render(<SearchForm onSubmit={mockOnSubmit} />)
    expect(screen.getByText('Round Trip')).toBeInTheDocument()
    expect(screen.getByText('One Way')).toBeInTheDocument()
  })

  it('renders find tickets button', () => {
    render(<SearchForm onSubmit={mockOnSubmit} />)
    expect(screen.getByText('Find Tickets')).toBeInTheDocument()
  })

  it('renders passenger input', () => {
    render(<SearchForm onSubmit={mockOnSubmit} />)
    expect(screen.getByPlaceholderText('Passengers')).toBeInTheDocument()
  })

  it('renders direct flights checkbox', () => {
    render(<SearchForm onSubmit={mockOnSubmit} />)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<SearchForm onSubmit={mockOnSubmit} loading={true} />)
    expect(screen.getByText('Searching...')).toBeInTheDocument()
  })
})
