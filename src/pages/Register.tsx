import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // 1. Sign up user
        const { data: { user }, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
        })

        if (signUpError) {
            setError(signUpError.message)
            setLoading(false)
            return
        }

        if (user) {
            // 2. Create profile
            const { error: profileError } = await supabase.from('profiles').insert({
                id: user.id,
                full_name: fullName,
            })

            if (profileError) {
                console.error("Error creating profile:", profileError)
            }

            navigate('/')
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-lg shadow-xl border border-gray-800">
                <h1 className="text-3xl font-bold text-center text-purple-500">DAKITY</h1>
                <h2 className="text-xl text-center">Registro</h2>
                {error && <div className="p-3 text-red-500 bg-red-900/20 rounded border border-red-800">{error}</div>}
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nombre Completo</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-purple-500 outline-none text-white"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-purple-500 outline-none text-white"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-purple-500 outline-none text-white"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded transition-colors font-bold disabled:opacity-50"
                    >
                        {loading ? 'Registrarse' : 'Crear Cuenta'}
                    </button>
                </form>
                <div className="text-center text-sm text-gray-400">
                    ¿Ya tienes cuenta? <Link to="/login" className="text-purple-400 hover:text-purple-300">Inicia Sesión</Link>
                </div>
            </div>
        </div>
    )
}
