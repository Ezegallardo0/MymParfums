import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import './styles/App.css'
import Configuracion from './components/Configuracion'
import Login from './components/login'
import Home from './pages/Home'
import CrearCuenta from './components/register'
import Add from './components/Agregar'
import ResetPassword from './components/ResetPassword'
import Card from './components/productCard'
import Nuevopr from './components/Newproduct'

function App() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const handleNotification = (event) => {
      const { title, message, type } = event.detail || {}
      if (!message) {
        return
      }

      const toast = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        title: title || 'Mym Parfums',
        message,
        type: type || 'info',
      }

      setToasts((prev) => [...prev.slice(-2), toast])
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== toast.id))
      }, 4000)
    }

    window.addEventListener('app:notification', handleNotification)
    return () => window.removeEventListener('app:notification', handleNotification)
  }, [])

  return (
    <div className="app-shell">
      <div className="notification-stack" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`notification-toast ${toast.type}`}>
            <strong>{toast.title}</strong>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/configuracion" element={<Configuracion />} />
        <Route path="/login" element={<Login />} />
        <Route path="/crearcuenta" element={<CrearCuenta />} />
        <Route path="/configuracion/agregar" element={<Add />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path='/card' element={<Card />}/>
        <Route path='/Nuevo-Producto' element={<Nuevopr />}/>
      </Routes>
    </div>
  )
}

export default App
