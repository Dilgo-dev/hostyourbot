import { render, screen } from '@testing-library/react'
import Hero from './Hero'

describe('Hero', () => {
  it("affiche le titre principal", () => {
    render(<Hero />)
    expect(screen.getByRole('heading', { name: /Déployez vos bots/i })).toBeInTheDocument()
    expect(screen.getByText(/en quelques clics/i)).toBeInTheDocument()
  })

  it("affiche les appels à l'action principaux", () => {
    render(<Hero />)
    expect(screen.getByRole('button', { name: /Commencer gratuitement/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Voir la documentation/i })).toBeInTheDocument()
  })
})
