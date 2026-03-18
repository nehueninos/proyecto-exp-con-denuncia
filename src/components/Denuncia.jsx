import React, { useState } from "react";

const Denuncia = ({ onClose }) => {

const [form,setForm] = useState({
nombreCompleto:"",
dni:"",
telefono:"",
email:"",
domicilio:"",
ciudad:"Formosa",
hora:"",
dia:"",
mes:"",
anio:"2025",
motivoDenuncia:"",
domicilioComercial:"",
relacionConsumo:"",
documentalesAdjuntas:""
})

const handleChange = (e)=>{
setForm({
...form,
[e.target.name]:e.target.value
})
}

const generarPDF = async ()=>{

try{

const res = await fetch("http://localhost:5000/api/denuncias/pdf",{
method:"POST",
credentials:"include",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(form)
})

if(!res.ok){
throw new Error("Error generando PDF")
}

const blob = await res.blob()

const url = window.URL.createObjectURL(blob)

const a = document.createElement("a")
a.href = url
a.download = "denuncia.pdf"
a.click()

}catch(err){
alert("Error generando PDF")
console.error(err)
}

}

return(

<div style={{
position:"fixed",
top:0,
left:0,
right:0,
bottom:0,
background:"rgba(0,0,0,0.4)",
display:"flex",
justifyContent:"center",
alignItems:"center",
zIndex:1000
}}>

<div style={{
background:"white",
padding:30,
width:"700px",
maxHeight:"90vh",
overflow:"auto",
borderRadius:8
}}>

<h2>Nueva Denuncia</h2>

<input name="nombreCompleto" placeholder="Nombre completo" onChange={handleChange} style={{width:"100%",marginBottom:10}}/>

<input name="dni" placeholder="DNI" onChange={handleChange} style={{width:"100%",marginBottom:10}}/>

<input name="telefono" placeholder="Teléfono" onChange={handleChange} style={{width:"100%",marginBottom:10}}/>

<input name="email" placeholder="Email" onChange={handleChange} style={{width:"100%",marginBottom:10}}/>

<input name="domicilio" placeholder="Domicilio" onChange={handleChange} style={{width:"100%",marginBottom:10}}/>

<input name="ciudad" placeholder="Ciudad" defaultValue="Formosa" onChange={handleChange} style={{width:"100%",marginBottom:10}}/>

<div style={{display:"flex",gap:10,marginBottom:10}}>

<input name="hora" placeholder="Hora" onChange={handleChange} style={{flex:1}}/>

<input name="dia" placeholder="Día" onChange={handleChange} style={{flex:1}}/>

<input name="mes" placeholder="Mes" onChange={handleChange} style={{flex:1}}/>

<input name="anio" placeholder="Año" defaultValue="2025" onChange={handleChange} style={{flex:1}}/>

</div>

<input name="motivoDenuncia" placeholder="Empresa denunciada" onChange={handleChange} style={{width:"100%",marginBottom:10}}/>

<input name="domicilioComercial" placeholder="Domicilio comercial" onChange={handleChange} style={{width:"100%",marginBottom:10}}/>

<textarea 
name="relacionConsumo"
placeholder="Relación de consumo / Descripción"
onChange={handleChange}
style={{width:"100%",height:100,marginBottom:10}}
/>

<textarea 
name="documentalesAdjuntas"
placeholder="Documentales adjuntas"
onChange={handleChange}
style={{width:"100%",height:80,marginBottom:10}}
/>

<div style={{
display:"flex",
justifyContent:"space-between"
}}>

<button onClick={onClose}>
Cancelar
</button>

<button onClick={generarPDF}>
Descargar PDF
</button>

</div>

</div>
</div>

)

}

export default Denuncia