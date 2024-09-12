import Metadata from "../../components/metadata/Metadata";
import "./register.css";
import foto from "/foto1.jfif";
import { useForm } from "react-hook-form";
import Input from "../../components/input_basico/Input";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import constants from "../../assets/constants.d";
import axios from "axios";
import Loading from "../../components/loading/Loading";
import { useNavigate } from "react-router-dom";
export default function Register() {
  // REACT HOOK FORM
  const { register, handleSubmit, watch, setFocus } = useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  //PONER EL FOCO AL INICIAR LA PÁGINA AL NOMBRE
  useEffect(() => {
    setFocus("nombre");
  }, [setFocus]);

  // MANEJO DEL ENVÍO FORMULARIO
  const onSubmit = async (data) => {
    console.log(data);
    setLoading(true);
    axios
      .post(
        "https://modisteria-back-production.up.railway.app/api/usuarios/createUser",
        {
          nombre: data.nombre,
          email: data.correo,
          telefono: data.telefono,
          password: data.contrasenia,
          roleId: 1,
        }
      )
      .then((response) => {
        toast.success(`${response.data.msg}`, {
          position: "top-right",
          toastId: "success-toast-fetch-register",
          autoClose: 1000,
          onClose: setTimeout(() => {
            navigate("/sesion");
          }, 1000),
        });
      })

      .catch((error) => {
        toast.error(`${error.response.data.msg}!`, {
          position: "top-right",
          toastId: "error-toast-fetch-register",
          autoClose: 1000,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  //VALIDATION
  const colombianPhone = () => {
    return constants.PHONE_REGEX.test(watch("telefono"));
  };
  const mailValidation = () => {
    return constants.EMAIL_REGEX.test(watch("correo"));
  };
  const samePass = () => {
    return watch("contrasenia") === watch("repetirContrasenia");
  };
  const minPassword = watch("contrasenia")?.length < 8 ? "#f00" : "#000";
  const minUserName = watch("nombre")?.length < 4 ? "#f00" : "#000";
  return (
    <>
      {loading && <Loading></Loading>}
      <Metadata title={"Registro - Modistería Doña Luz"}></Metadata>
      <br />
      <br />
      <span className="black">Regis</span>
      <span className="black">trate</span>
      <hr className="separacion" />
      <br />

      <div className="contenedor">
        <div className="imagen">
          <img src={foto} alt="" className="imagenForm" />
        </div>
        <div className="form">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              type={"text"}
              {...register("nombre", { required: true, minLength: 4 })}
              description={
                watch("nombre")?.length > 0
                  ? "Debe tener al menos 4 caracteres"
                  : ""
              }
              placeholder={"Nombres"}
              color={minUserName}
            ></Input>
            <Input
              type={"text"}
              {...register("telefono", {
                validate: colombianPhone,
                maxLength: 10,
              })}
              color={colombianPhone() ? "#000" : "#f00"}
              description={
                watch("telefono")?.length > 0
                  ? "Ingrese un número válido (+57)"
                  : ""
              }
              placeholder={"Télefono"}
            ></Input>
            <Input
              type={"text"}
              {...register("correo", {
                validate: mailValidation,
              })}
              description={
                watch("correo")?.length > 0 ? "Ingrese un correo válido" : ""
              }
              placeholder={"Correo"}
              color={mailValidation() ? "#000" : "#f00"}
            ></Input>
            <Input
              {...register("contrasenia", { required: true, minLength: 8 })}
              description={
                watch("contrasenia")?.length > 0
                  ? "Debe tener al menos 8 caracteres"
                  : ""
              }
              placeholder={"Contraseña"}
              color={minPassword}
              canHidden
            ></Input>
            <Input
              {...register("repetirContrasenia", {
                validate: samePass,
              })}
              description={
                watch("repetirContrasenia")?.length > 0
                  ? "Las contraseñas deben coincidir"
                  : ""
              }
              placeholder={"Repetir contraseña"}
              color={samePass() ? "#000" : "#f00"}
              canHidden
            ></Input>
            <button className="btn-registro">
              <span>Registrarme</span>
            </button>
          </form>
        </div>
      </div>
      <ToastContainer></ToastContainer>
    </>
  );
}
