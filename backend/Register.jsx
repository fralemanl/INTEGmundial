import React, { useState } from "react"
import axios from "axios"
import { Link } from "react-router-dom"

export default function Register({ onLogin }) {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" })
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post("/api/users/register", formData)
      onLogin(res.data)
    } catch (err) {
      setError("Error al registrar. El usuario o email ya existen.")
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
        <h2 className="text-3xl font-black text-white mb-6 text-center">Crear Cuenta</h2>
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4 text-sm text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-1">Usuario</label>
            <input 
              type="text" 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-colors"
              value={formData.username}
              onChange={e => setFormData({...formData, username: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-1">Email</label>
            <input 
              type="email" 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-colors"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-1">Contraseña</label>
            <input 
              type="password" 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-colors"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-green-900/20 transition-all transform active:scale-95">Registrarse</button>
        </form>
        <p className="mt-6 text-center text-gray-400 text-sm">¿Ya tienes cuenta? <Link to="/login" className="text-green-400 hover:underline">Inicia sesión</Link></p>
      </div>
    </div>
  )
}
