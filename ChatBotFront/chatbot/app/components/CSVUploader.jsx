'use client'

import { useState } from 'react'
import { uploadCsvFile } from '../../lib/api/chat'

export default function CSVUploader() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)

    try {
      const blob = await uploadCsvFile(file)

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'resultado.csv'
      a.click()
      a.remove()
    } catch (error) {
      console.error(error)
      alert('Erro ao processar o arquivo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Enviando...' : 'Enviar CSV'}
      </button>
    </div>
  )
}
