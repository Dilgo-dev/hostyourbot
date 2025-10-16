import { render, screen } from '@testing-library/react'
import Features from './Features'

describe('Features', () => {
  it("affiche le titre de la section", () => {
    render(<Features />)
    expect(screen.getByRole('heading', { name: /Tout ce dont vous avez besoin/i })).toBeInTheDocument()
    expect(screen.getByText(/plateforme complète/i)).toBeInTheDocument()
  })

  it("affiche toutes les cartes fonctionnelles", () => {
    render(<Features />)
    const cards = screen.getAllByRole('heading', { level: 3 })
    expect(cards).toHaveLength(10)
  })
})
