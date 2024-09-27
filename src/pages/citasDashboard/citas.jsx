import React, { useState, useEffect } from "react";
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header/Header";
import { useTheme } from "@mui/material";
import useFetch from "../../hooks/useFetch";
import { useJwt } from "../../context/JWTContext";

const CitaDashboard = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { loading, triggerFetch } = useFetch();
    const { token } = useJwt(); // Obtener el token del contexto

    const [data, setData] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedCita, setSelectedCita] = useState(null);
    const [citaToDelete, setCitaToDelete] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!token) {
                console.error("Falta el token. El usuario puede necesitar iniciar sesión.");
                return; // Salir si no hay token
            }

            const respuesta = await triggerFetch("https://modisteria-back-production.up.railway.app/api/citas/getAllCitas", "GET", null, { "x-token": token });
            if (respuesta.status === 200 && respuesta.data) {
                const citasConId = respuesta.data.map(cita => ({
                    ...cita,
                    id: cita.id || data.length + 1 
                }));
                setData(citasConId);
                console.log("Datos cargados: ", citasConId);
            } else {
                console.error("Error al obtener datos: ", respuesta);
            }
        };
        fetchData();
    }, [token, triggerFetch]);

    const handleEdit = (id) => {
        const citaToEdit = data.find((cita) => cita.id === id);
        setSelectedCita(citaToEdit);
        setOpenModal(true);
    };

    const handleAdd = () => {
        setSelectedCita({ referencia: "", objetivo: "", usuarioId: "", estadoId: "", precio: "", tiempo: "", fecha: "" });
        setOpenModal(true);
    };

    const handleClose = () => {
        setOpenModal(false);
        setSelectedCita(null);
    };

    const handleSave = async () => {
        try {
            const method = selectedCita.id ? "PUT" : "POST";
            const url = selectedCita.id 
                ? `https://modisteria-back-production.up.railway.app/api/citas/updateCita/${selectedCita.id}`
                : "https://modisteria-back-production.up.railway.app/api/citas/createCita";

            const response = await triggerFetch(url, method, selectedCita, { "x-token": token });

            if (response.status === 200 || response.status === 201) {
                console.log(response.data.msg);
                if (method === "PUT") {
                    setData((prevData) =>
                        prevData.map((cita) =>
                            cita.id === selectedCita.id ? selectedCita : cita
                        )
                    );
                } else {
                    const newCita = { ...selectedCita, id: data.length + 1 }; 
                    setData((prevData) => [...prevData, newCita]);
                }
                handleClose();
            } else {
                console.error("Error al guardar los datos: ", response.data);
                alert("Error al guardar los datos. Revisa la consola para más detalles.");
            }
        } catch (error) {
            console.error("Error al realizar la solicitud:", error);
            alert("Ocurrió un error al realizar la solicitud. Inténtalo nuevamente.");
        }
    };

    const handleDelete = (id) => {
        const cita = data.find((cita) => cita.id === id);
        setCitaToDelete(cita);
        setOpenDeleteDialog(true);
    };

    const confirmDelete = async () => {
        try {
            const response = await triggerFetch(
                `https://modisteria-back-production.up.railway.app/api/citas/deleteCita/${citaToDelete.id}`,
                "DELETE",
                null,
                { "x-token": token }
            );

            if (response.status === 200 || response.status === 201) {
                console.log("Respuesta de eliminación: ", response.data);
                setData((prevData) => prevData.filter((cita) => cita.id !== citaToDelete.id));
                setOpenDeleteDialog(false);
                setCitaToDelete(null);
            } else {
                console.error("Error inesperado al eliminar datos: ", response.data);
                alert("Error inesperado al eliminar la cita. Revisa la consola para más información.");
            }
        } catch (error) {
            console.error("Error al realizar la solicitud:", error);
            alert("Ocurrió un error al realizar la solicitud de eliminación. Inténtalo nuevamente.");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedCita((prev) => ({ ...prev, [name]: value }));
    };

    const columns = [
        { field: "id", headerName: "ID", flex: 0.5 },
        { field: "referencia", headerName: "Referencia", flex: 1 },
        { field: "objetivo", headerName: "Objetivo", flex: 1 },
        { field: "usuarioId", headerName: "Usuario ID", flex: 1 },
        { field: "estadoId", headerName: "Estado ID", flex: 1 },
        { field: "precio", headerName: "Precio", flex: 1 },
        { field: "tiempo", headerName: "Tiempo", flex: 1 },
        { field: "fecha", headerName: "Fecha y Hora", flex: 1 }, // Cambiar el encabezado para reflejar el formato
        {
            field: "acciones",
            headerName: "Acciones",
            flex: 1,
            renderCell: (params) => (
                <Box>
                    <Button color="primary" onClick={() => handleEdit(params.row.id)}>
                        <img alt="editar" width="20px" height="20px" src="../../assets/editar.png" style={{ cursor: "pointer" }} />
                    </Button>
                    <Button variant="contained" color="error" onClick={() => handleDelete(params.row.id)} sx={{ ml: 1 }}>
                        <img alt="borrar" width="20px" height="20px" src="../../assets/borrar.png" style={{ cursor: "pointer" }} />
                    </Button>
                </Box>
            ),
        },
    ];

    return (
        <Box m="20px">
            <Header title="CITAS" subtitle="Lista de citas" />
            <Button variant="contained" color="primary" onClick={handleAdd} sx={{ mb: 2 }}>
                Agregar Cita
            </Button>
            <Box m="40px 0 0 0" height="75vh" sx={{
                "& .MuiDataGrid-root": { border: "none" },
                "& .MuiDataGrid-cell": { borderBottom: "none" },
                "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.blueAccent[700], borderBottom: "none" },
                "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
                "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: colors.blueAccent[700] },
                "& .MuiCheckbox-root": { color: `${colors.greenAccent[200]} !important` },
                "& .MuiDataGrid-toolbarContainer .MuiButton-text": { color: `${colors.grey[100]} !important` },
            }}>
                {loading ? (
                    <Typography>Cargando citas...</Typography>
                ) : (
                    <DataGrid 
                        rows={data} 
                        columns={columns} 
                        components={{ Toolbar: GridToolbar }} 
                    />
                )}
            </Box>

            {/* Modal para Agregar/Editar Cita */}
            <Dialog open={openModal} onClose={handleClose}>
                <DialogTitle>{selectedCita?.id ? "Editar Cita" : "Agregar Cita"}</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        name="referencia"
                        label="Referencia"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={selectedCita?.referencia || ""}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="objetivo"
                        label="Objetivo"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={selectedCita?.objetivo || ""}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="usuarioId"
                        label="Usuario ID"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={selectedCita?.usuarioId || ""}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="estadoId"
                        label="Estado ID"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={selectedCita?.estadoId || ""}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="precio"
                        label="Precio"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={selectedCita?.precio || ""}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="tiempo"
                        label="Tiempo"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={selectedCita?.tiempo || ""}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="fecha"
                        label="Fecha y Hora"
                        type="datetime-local"
                        fullWidth
                        variant="outlined"
                        value={selectedCita?.fecha || ""}
                        onChange={handleInputChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button onClick={handleSave}>Guardar</Button>
                </DialogActions>
            </Dialog>

            {/* Diálogo de Confirmación de Eliminación */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Confirmar Eliminación</DialogTitle>
                <DialogContent>
                    <Typography>¿Estás seguro de que deseas eliminar la cita "{citaToDelete?.referencia}"?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
                    <Button onClick={confirmDelete} color="error">Eliminar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CitaDashboard;
