import { Routes, Route } from 'react-router-dom'
import './styles/App.css'
import Configuracion from './components/Configuracion'
import Login from './components/login'
import Home from './pages/Home'
import CrearCuenta from './components/register'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/configuracion" element={<Configuracion />}/>
      <Route path="/login" element={<Login />} />
      <Route path='/crearcuenta' element={<CrearCuenta />}/>
    </Routes>
  )
}

export default App
