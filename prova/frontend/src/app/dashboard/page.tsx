"use client"

import { useEffect, useMemo, useState } from "react"

type Quote = {
  id: number
  quote: string
  author: string
}

type FormState = {
  quote: string
  author: string
}

export default function DashboardPage() {
  const [connected, setConnected] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [form, setForm] = useState<FormState>({ quote: "", author: "" })
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [authors, setAuthors] = useState<string[]>([])
  const [message, setMessage] = useState<string>("")
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const token = window.localStorage.getItem("authToken") ||
      document.cookie.split("; ").find((cookie) => cookie.startsWith("authToken="))?.split("=")[1]

    setConnected(Boolean(token))
  }, [])

  useEffect(() => {
    const storedAuthors = window.localStorage.getItem("quoteAuthors")
    if (storedAuthors) {
      setAuthors(JSON.parse(storedAuthors))
    }
  }, [])

  useEffect(() => {
    if (connected) {
      fetchQuotes()
    } else if (connected === false) {
      setLoading(false)
    }
  }, [connected])

  useEffect(() => {
    if (authors.length > 0) {
      window.localStorage.setItem("quoteAuthors", JSON.stringify(authors))
    }
  }, [authors])

  const quoteAuthors = useMemo(() => {
    return Array.from(new Set(authors.filter((author) => author.trim().length > 0))).sort()
  }, [authors])

  async function fetchQuotes() {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("https://dummyjson.com/quotes?limit=50")
      if (!response.ok) {
        throw new Error("Falha ao carregar as citações")
      }
      const data = await response.json()
      const fetchedQuotes: Quote[] = Array.isArray(data.quotes)
        ? data.quotes.map((item: any) => ({
            id: item.id,
            quote: item.quote,
            author: item.author,
          }))
        : []

      setQuotes(fetchedQuotes)
      setAuthors((previous) =>
        Array.from(
          new Set([
            ...previous,
            ...fetchedQuotes.map((quote) => quote.author).filter(Boolean),
          ]),
        ),
      )
    } catch (err) {
      setError("Não foi possível obter as frases. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setSelectedId(null)
    setForm({ quote: "", author: "" })
    setMessage("")
  }

  function validateForm() {
    if (!form.quote.trim()) {
      setMessage("A frase é obrigatória")
      return false
    }
    if (!form.author.trim()) {
      setMessage("O autor é obrigatório")
      return false
    }
    return true
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validateForm()) {
      return
    }

    const quotePayload: Quote = {
      id: selectedId ?? Date.now(),
      quote: form.quote.trim(),
      author: form.author.trim(),
    }

    if (selectedId) {
      setQuotes((current) =>
        current.map((item) => (item.id === selectedId ? quotePayload : item)),
      )
      setMessage("Citação atualizada com sucesso")
      try {
        await fetch(`https://dummyjson.com/quotes/${selectedId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quote: quotePayload.quote, author: quotePayload.author }),
        })
      } catch {
        // fallback para estado local
      }
    } else {
      setQuotes((current) => [quotePayload, ...current])
      setMessage("Citação criada com sucesso")
      try {
        await fetch("https://dummyjson.com/quotes/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quote: quotePayload.quote, author: quotePayload.author }),
        })
      } catch {
        // fallback para estado local
      }
    }

    setAuthors((current) =>
      Array.from(new Set([...current, quotePayload.author])),
    )
    resetForm()
  }

  async function handleDelete(id: number) {
    setQuotes((current) => current.filter((item) => item.id !== id))
    setMessage("Citação removida")
    if (selectedId === id) {
      resetForm()
    }
    try {
      await fetch(`https://dummyjson.com/quotes/${id}`, {
        method: "DELETE",
      })
    } catch {
      // fallback
    }
  }

  if (connected === null) {
    return <div>Verificando se você está conectado...</div>
  }

  return (
    <main style={{ minHeight: "100vh", padding: "2rem 1rem", fontFamily: "system-ui, sans-serif", display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
      <div style={{ width: "100%", maxWidth: "900px", margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Dashboard de Quotes</h1>

        <section style={{ marginBottom: "1.5rem" }}>
          <h2>Formulário de CRUD</h2>
          <form
            onSubmit={handleSave}
            style={{ display: "grid", gap: "0.75rem", maxWidth: "640px", margin: "0 auto", padding: "1.25rem", border: "1px solid #d1d5db", borderRadius: "0.75rem", background: "#fff" }}
          >
            <label style={{ display: "grid", gap: "0.25rem" }}>
              Frase
              <textarea
                value={form.quote}
                onChange={(event) => setForm((current) => ({ ...current, quote: event.target.value }))}
                rows={3}
                style={{ width: "100%", padding: "0.75rem", marginTop: "0.25rem", border: "1px solid #cbd5e1", borderRadius: "0.5rem", boxSizing: "border-box" }}
              />
            </label>
            <label style={{ display: "grid", gap: "0.25rem" }}>
              Autor
              <input
                list="authors-values"
                value={form.author}
                onChange={(event) => setForm((current) => ({ ...current, author: event.target.value }))}
                style={{ width: "100%", padding: "0.75rem", marginTop: "0.25rem", border: "1px solid #cbd5e1", borderRadius: "0.5rem", boxSizing: "border-box" }}
              />
              <datalist id="authors-values">
                {quoteAuthors.map((author) => (
                  <option key={author} value={author} />
                ))}
              </datalist>
            </label>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <button type="submit" style={{ padding: "0.75rem 1rem" }}>
                {selectedId ? "Atualizar" : "Criar"}
              </button>
              <button type="button" onClick={resetForm} style={{ padding: "0.75rem 1rem" }}>
                Limpar
              </button>
            </div>
            {message && <p style={{ color: "#0a7", marginTop: "0.5rem" }}>{message}</p>}
          </form>
        </section>

        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginBottom: "1rem" }}>
            <h2>Lista de Quotes</h2>
            {loading && <span>Carregando...</span>}
          </div>
          {error ? (
            <p style={{ color: "#c00" }}>{error}</p>
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {quotes.map((quote) => (
                <article key={quote.id} style={{ border: "1px solid #ddd", borderRadius: "0.5rem", padding: "1rem" }}>
                  <p style={{ margin: 0, fontStyle: "italic" }}>&ldquo;{quote.quote}&rdquo;</p>
                  <p style={{ margin: "0.5rem 0 0", fontWeight: 600 }}>— {quote.author}</p>
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(quote.id)
                        setForm({ quote: quote.quote, author: quote.author })
                        setMessage("")
                      }}
                      style={{ padding: "0.5rem 0.75rem" }}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(quote.id)}
                      style={{ padding: "0.5rem 0.75rem", background: "#fee", border: "1px solid #d00" }}
                    >
                      Apagar
                    </button>
                  </div>
                </article>
              ))}
              {!loading && quotes.length === 0 && <p>Nenhuma citação disponível.</p>}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
