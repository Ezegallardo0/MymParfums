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
  return (
    <div className="app-shell">
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
