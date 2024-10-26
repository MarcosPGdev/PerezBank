import { useState } from "react";
import { useEffect } from "react";
import axios from 'axios';
import { toast } from "react-toastify";

function RegisterForm (){
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Hacer que el componente sea visible al montarse
        setIsVisible(true);
    }, []);

    const [formData, setFormData] = useState({
      username: "",
      password: "",
      name: "",
      surname: "",
      direction: "",
      province: "",
      cp: "",
      dni: ""
    });
      
    const handleChange = (name) => {
        setFormData({
            ...formData,
            [name.target.name]: name.target.value
        });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      console.log(formData);
      const dniRegex = /^\d{8}[A-Za-z]$/;
      if (!dniRegex.test(formData.dni)) {
        toast.error("El DNI debe contener 8 números seguidos de una letra.");
        return; // No continúa si el DNI no es válido
      }
      
      axios.post('http://localhost:5000/register', formData)
      .then(response => {
        console.log('Registro exitoso:', response.data);
        toast.success('Usuario registrado con éxito');
      })
      .catch(error => {
        console.error('Error al registrar:', error);
        toast.error(error.response.data);
      });
    };
      
    return(
        <form onSubmit={handleSubmit} className={`contenedorForm ${isVisible ? "fade-in" : ""}`}>
            <h2 style={{textAlign:"center", width:"100%"}}>FORMULARIO DE REGISTRO</h2>
            <div className="contenedorInput">
                <label htmlFor="username">Usuario:</label>
                <input name="username" type="text" value={formData.username} onChange={handleChange} className="input" />
            </div>
            <div className="contenedorInput">
                <label htmlFor="password">Contraseña:</label>
                <input name="password" type="text"  value={formData.password} onChange={handleChange} className="input" />
            </div>
            <div className="contenedorInput">
                <label htmlFor="name">Nombre</label>
                <input name="name" type="text" value={formData.name} onChange={handleChange} className="input" />
            </div>
            <div className="contenedorInput">
                <label htmlFor="surname">Apellido</label>
                <input name="surname" type="text" value={formData.surname}  onChange={handleChange} className="input" />
            </div>
            <div className="contenedorInput">
                <label htmlFor="direction">Dirección:</label>
                <input name="direction" type="text" value={formData.direction} onChange={handleChange} className="input" />
            </div>
            <div className="contenedorInput">
                <label htmlFor="province">Provincia:</label>
                <input name="province" type="text" value={formData.province} onChange={handleChange} className="input" />
            </div>
            <div className="contenedorInput">
                <label htmlFor="cp">Código postal:</label>
                <input name="cp" type="text" value={formData.cp} onChange={handleChange} className="input" />
            </div>
            <div className="contenedorInput">
                <label htmlFor="dni">DNI/NIF:</label>
                <input name="dni" type="text"  value={formData.dni} onChange={handleChange} className="input" />
            </div>
            <div className="registerButtonContainer">
                <button className="button" type="submit">
                    <span className="transition"></span>
                    <span className="gradient"></span>
                    <span className="label">Aceptar</span>
                </button>
            </div>
        </form>
    )
}


export default RegisterForm