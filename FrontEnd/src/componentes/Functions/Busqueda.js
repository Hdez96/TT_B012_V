
import axios from 'axios'
import { saveAs } from 'file-saver'

export const sendData =  newForm => {
    let dir = newForm.mes
    return axios
        .post('consumoE/ConsumoEPDF',{
           Mes : newForm.mes
        })
        .then((res1) =>{
          console.log("enviado") 
          console.log(dir) 
          let direc = "Consumo"+dir+".pdf"
          axios.get('consumoE/fetch-pdf', { params: {PDF: dir},responseType: 'blob' })
          .then((res) => {
            const pdfBlob = new Blob([res.data], {type: 'application/pdf'})
            saveAs(pdfBlob, direc)
          })
          .catch(err =>{
            console.log("Error descargando:" + err)
          })
        })
        .catch(err =>{
          console.log("Error creando:" + err)
        })
}

export function downloadPDF(name, route){
//  console.log("Solicitando"  + name + " a: "+route);
  let dir = name
  return axios
.get(route, { params: {PDF: dir},responseType: 'blob' })
          .then((res) => {
              const pdfBlob = new Blob([res.data], {type: 'application/pdf'})
//		console.log("Mi ruta"+route)
		if(route.indexOf("Cedularti")>0)
                {
//			console.log("Aqui no")
			saveAs(pdfBlob, "Cedularti-"+name+'.pdf')
	        }
		else if(route.indexOf("CedulaTRA")>0)
		{
//			console.log("Aqui si")
             		saveAs(pdfBlob, "Cedulatra-"+ name+'.pdf')
		}
		else
		{
//			console.log("Aqui tal vez")
			saveAs(pdfBlob, name+'.pdf')
        	}
	  })
}

export function downloadExcel(name, route){
  console.log("Solicitando"  + name + " a: "+route);
  let dir = name
  return axios
.get(route, { params: {PDF: dir},responseType: 'blob' })
          .then((res) => {
              const pdfBlob = new Blob([res.data], {type: 'application/vnd.ms-excel'})
		if(route.indexOf("revtecinicial")>0)
                {
                      console.log("Aqui no")
                        saveAs(pdfBlob, "Cedularti-"+name+'.xlsx')
                }
                else if(route.indexOf("CedulaTRA")>0)
                {
                      console.log("Aqui si")
                        saveAs(pdfBlob, "Cedulatra-"+ name+'.xlsx')
                }
                else
                {
	              saveAs(pdfBlob, name+'.xlsx')
        	}  
	})
}


export function generarPDF(name,route)
{	
  //console.log("Solicitando"  + name + " a: "+route);
 console.log("ALOS")  
 return axios.post('pruebasdesempeno/PruebasPDF',{
        NumeroEconomico: name
  })
  .then(res => {
        console.log("Creando...")
  })
  .catch(err => {
        console.log(err)
  })

}

export const downloadExcelP = newForm =>{
//      console.log("HOLASES")
        let name = newForm.NombrePDF
  return axios
        .post('pruebasdesempeno/PruebasPDF',{
           NumeroEconomico : newForm.NombrePDF,
           Fecha: newForm.Fecha
        })
        .then((res1) =>{
          console.log("enviado") 
          console.log(name) 
          let direc = name+".xlsx"
          axios.get('pruebasdesempeno/fetch-excel', { params: {PDF: name},responseType: 'blob' })
          .then((res) => {
            const pdfBlob = new Blob([res.data], {type: 'application/vnd.ms-excel'})
            saveAs(pdfBlob, direc)
          })
          .catch(err =>{
            console.log("Error descargando:" + err)
          })
        })
        .catch(err =>{
          console.log("Error creando:" + err)
        })

}

export const downloadPDFP = newForm =>{
//	console.log("HOLASES")
	let name = newForm.NombrePDF
  return axios
        .post('pruebasdesempeno/PruebasPDF',{
           NumeroEconomico : newForm.NombrePDF,
	   Fecha: newForm.Fecha
        })
        .then((res1) =>{
          console.log("enviado") 
          console.log(name) 
          let direc = name+".pdf"
          axios.get('pruebasdesempeno/fetch-pdf', { params: {PDF: name},responseType: 'blob' })
          .then((res) => {
            const pdfBlob = new Blob([res.data], {type: 'application/pdf'})
            saveAs(pdfBlob, direc)
          })
          .catch(err =>{
            console.log("Error descargando:" + err)
          })
        })
        .catch(err =>{
          console.log("Error creando:" + err)
        })

}

export function EXCEL(newForm) {
        console.log("Creando PDF")
        return axios
        .post(newForm.route,  {
                Año: newForm.Año,
                Mes: newForm.Mes
        })
            .then((res) => {
                        //const pdfBlob = new Blob([res.data], {type: 'application/pdf'})
                        //saveAs(pdfBlob, 'Factura'+newForm.Año+'.pdf')
                        console.log("Creado!")
            })
        .catch(err => {
                console.log(err)
        })
}
