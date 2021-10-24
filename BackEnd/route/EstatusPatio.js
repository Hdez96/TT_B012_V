const path = require('path')
const { Op } = require("sequelize")
const express = require("express")
const patio = express.Router()
const cors = require("cors")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const ExcelJS = require('exceljs')
var pdf = require("pdf-creator-node");
var fs = require('fs');

var options = {
    format: "Letter"
}

var pdfName = ""

const Patio = require('../Models/EstatusPatio.js')
patio.use(cors())

process.env.SECRET_KEY = 'secret'

patio.post('/patio',async (req, res) => {
    const today = new Date().toJSON()
    const formData = {
        NumeroEconomico: req.body.NumeroEconomico,
        Estatus: req.body.Estatus,
        Sistema: req.body.Sistema,
        Descripciondefalla: req.body.Descripciondefalla,
        Kilometraje: req.body.Kilometraje,
        Fechadeingreso: req.body.Fechadeingreso,
        Fechadeliberacion: null
    }
    Patio.findOne({
        where: { 
          NumeroEconomico: req.body.NumeroEconomico
        }
    })
    .then(patio => {
        if (!patio) {
            Patio.create(formData)
            .then(patio => {
                console.log("Registrado.")
                res.send({ status: 'Registrado!' })
            })
            .catch(err => {
                console.log(err)
                res.send('error: ' + err)
            })
        } else {
            res.json({ error: 'El numero economico ya existe' })
        }
    })
    .catch(err => {
        console.log(err)
      res.send('error: ' + err)
    })
})

patio.post('/patioPDF', (req,res) => {
/*var dia = req.body.Fechadeliberacion.substring(0,req.body.Fechadeliberacion.indexOf('/'))
var date = req.body.Fechadeliberacion.substring(req.body.Fechadeliberacion.indexOf('/')+1,req.body.Fechadeliberacion.length)
var mes = date.substring(0,date.indexOf('/'))
date = date.substring(date.indexOf('/')+1,date.length)
var año = date

req.body.Fechadeliberacion = año + '-' + mes + '-' + dia
*/
console.log(req.body.Fechadeliberacion)
console.log(req.body.FechaFin)

if(req.body.FechaFin && req.body.Fechadeliberacion)
{
	if(req.body.Fechadeliberacion > req.body.FechaFin)
	{
	        let faux = req.body.Fechadeliberacion
	        req.body.Fechadeliberacion = req.body.FechaFin
	        req.body.FechaFin = faux
	}
	console.log(req.body.Fechadeliberacion)
	console.log(req.body.FechaFin+1)
	Patio.findAll({
        	where:{
        		Fechadeingreso: {
            			[Op.between]: [req.body.Fechadeliberacion, req.body.FechaFin]
			}
        		//[Op.between]: [req.body.Fechadeliberacion, req.body.FechaFin]
			//Fechadeingreso: req.body.Fechadeliberacion
        //	 	Fechadeingreso: "2021-05-23"
        	}
    	})
    	.then(obj=>{
		let fechap = obj[0].Fechadeingreso
		let arr = []
		let arraux = []
		let mesesArray = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
		
		obj.sort(function (a, b) {
                          if (a.Fechadeingreso > b.Fechadeingreso) {
                            return 1;
                          }
                          if (a.Fechadeingreso < b.Fechadeingreso) {
                            return -1;
                          }
                          // a must be equal to b
                          return 0;
                        });
		for(let i in obj)
		{
//			console.log(obj[i].NumeroEconomico + ':'+obj[i].Fechadeingreso)
			if(obj[i].Fechadeingreso == fechap)
			{
				console.log("1 "+obj[i].NumeroEconomico)
				var objeto = {
                			NumeroEconomico: obj[i].NumeroEconomico,
                			Estatus: obj[i].Estatus,
                			Sistema: obj[i].Sistema,
                			Descripciondefalla: obj[i].Descripciondefalla,
                			Kilometraje: obj[i].Kilometraje,
                			Fechadeingreso: obj[i].Fechadeingreso,
                			Fechadeliberacion: obj[i].Fechadeliberacion
		       		}
			//	console.log(obj[i].NumeroEconomico)
				arraux.push(objeto)
			}
			else
			{
				console.log("cambio fecha")
				console.log("2 "+obj[i].NumeroEconomico)
				var objeto = {
                                        NumeroEconomico: obj[i].NumeroEconomico,
                                        Estatus: obj[i].Estatus,
                                        Sistema: obj[i].Sistema,
                                        Descripciondefalla: obj[i].Descripciondefalla,
                                        Kilometraje: obj[i].Kilometraje,
                                        Fechadeingreso: obj[i].Fechadeingreso,
                                        Fechadeliberacion: obj[i].Fechadeliberacion
                                }
				//arraux.push(objeto)
				let fe = new Date(fechap)
	                        let año = fe.getFullYear()
	                        let mes = mesesArray[parseInt(fe.getMonth())]
	                        let dia = fe.getDate()
	                        let fechas = dia + " de " + mes + " del " + año
				let obja = {
        				Fecha: fechas,
					Registros: arraux
				}
				arr.push(obja)
				fechap = obj[i].Fechadeingreso
				arraux = []
				arraux.push(objeto)
			}
		}
		console.log("Final final "+ arraux[0].NumeroEconomico)
			let fe = new Date(fechap)
                        let año = fe.getFullYear()
                        let mes = mesesArray[parseInt(fe.getMonth())]
                        let dia = fe.getDate()
                        let fechas = dia + " de " + mes + " del " + año
		let obja = {
                        Fecha: fechas,
			Registros: arraux
                }
			arr.push(obja)
		
		for(let a in arr)
		{
			console.log(arr[a].Fecha)
			let i = arr[a].Registros
			console.log("Tam "+i.length)
			for(let x in i)
				console.log(i[x].NumeroEconomico)
		}
		var html = fs.readFileSync( path.join(__dirname, '../Documents/Templates/EstatusPatio.html'),'utf-8');
        	var options = {
                    	phantomPath: path.resolve(
		   		process.cwd(),
    				"node_modules/phantomjs/bin/phantomjs"
  			),
                    	format: "A3",
                    	orientation: "portrait",
                    	border: "0mm",
                    	header: {
                        	height: "0mm",
                        	contents: '<div style="text-align: center;"></div>'
                    	},
                    	"footer": {
                        	"height": "0mm",
                        	"contents": {
                            		first: ' ',
                            		default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
                            		last: ' '
                        	}
                    	}
                };
		
		var document = {
            		html: html,
            		data: {
                		datos: arr
            		},
            		path:  path.join(__dirname, '../Documents/EstatusPatio/EstatusPatio') + req.body.Fechadeliberacion + "a" + req.body.FechaFin+ ".pdf"
        	}
        pdfName = "EstatusPatio"+ req.body.Fechadeliberacion +"a" + req.body.FechaFin + ".pdf"
	    console.log("HOLA: " +pdfName)
        pdf.create(document,options)
        .then(res => {
            //res.send(Promise.reject());
            console.log("Creado.")
        })
        .catch(error => {
            //res.send(Promise.resolve());
            console.log(error)
        })

		/*for(let i in arr)
		{
			console.log(arr[i].Fecha)
			for(let j in arr[i].datos)
				console.log(arr[i].datos[j])
		}*/
		res.send({success:true,data:obj.arr}) 
	})
	.catch(err=>{
        	console.log(err)
        	res.send({success:false, message:err});
    	})
}
else
{
	if(req.body.FechaFin && !req.body.Fechadeliberacion)
		req.body.Fechadeliberacion = req.body.FechaFin

    Patio.findAll({
        where: {
         Fechadeingreso: req.body.Fechadeliberacion
	 //Fechadeingreso: "2021-05-23"
	}
    })
    .then(obj=>{
        var html = fs.readFileSync( path.join(__dirname, '../Documents/Templates/EstatusPatio.html'),'utf-8');
        var options = {
		    phantomPath: path.resolve(
    process.cwd(),
    "node_modules/phantomjs/bin/phantomjs"
  ),
                    format: "A3",
                    orientation: "portrait",
                    border: "0mm",
                    header: {
                        height: "0mm",
                        contents: '<div style="text-align: center;"></div>'
                    },
                    "footer": {
                        "height": "0mm",
                        "contents": {
                            first: ' ',
                            default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
                            last: ' '
                        }
                    }
                };
        var patios=[]       
        
                
        for(const valor in obj){
            var objeto = {
                NumeroEconomico: obj[valor].NumeroEconomico,
                Estatus: obj[valor].Estatus,
                Sistema: obj[valor].Sistema,
                Descripciondefalla: obj[valor].Descripciondefalla,
                Kilometraje: obj[valor].Kilometraje,
                Fechadeingreso: obj[valor].Fechadeingreso,
		Fechadeliberacion: obj[valor].Fechadeliberacion
            }
            patios.push(objeto)
        }
        let mesesArray = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
        let fecha = new Date(req.body.Fechadeliberacion)
        let año = fecha.getFullYear()
        let mes = mesesArray[parseInt(fecha.getMonth())]
        let dia = fecha.getDate()
        let fechas = dia + " de " + mes + " del " + año

	let objeto1 = []
	let objeto2 = {
		Fecha: fechas,
		Registros: patios
	}
	objeto1.push(objeto2)
        var document = {
            html: html,
            data: {
                datos: objeto1
            },
            path:  path.join(__dirname, '../Documents/EstatusPatio/EstatusPatio') + req.body.Fechadeliberacion + ".pdf"
        }
        pdfName = "EstatusPatio"+ req.body.Fechadeliberacion +".pdf"
	console.log("HOLA: " +pdfName)
        pdf.create(document,options)
        .then(res => {
            //res.send(Promise.reject());
            console.log("Creado.")
        })
        .catch(error => {
            //res.send(Promise.resolve());
            console.log(error)
        })
        console.log(obj)
        res.send({success:true, data:obj});
    })
    .catch(err=>{
        console.log(err)
        res.send({success:false, message:err});
    })
}
})

patio.get('/fetch-pdf', async(req,res) => {
	console.log(req.query.PDF)
	
    var pdfName = req.query.PDF+".pdf"
    console.log(pdfName)
    var aux = path.join(__dirname,'../', 'Documents/EstatusPatio/', pdfName)
    console.log(aux)
    res.sendFile(aux)
})

patio.post('/patioExcel', async (req,res) =>{
    console.log('Peticion para crear EXCEL')
    console.log(req.body.Fechadeliberacion)
    console.log(req.body.FechaFin)
    if(req.body.FechaFin && req.body.Fechadeliberacion){
        if(req.body.Fechadeliberacion > req.body.FechaFin){
                let faux = req.body.Fechadeliberacion
                req.body.Fechadeliberacion = req.body.FechaFin
                req.body.FechaFin = faux
        }
	console.log('Creando excel de rango de fechas')
        console.log('Excel liberacion '+req.body.Fechadeliberacion)
        console.log('Excel fin ' + req.body.FechaFin)
        Patio.findAll({
                where:{
                    Fechadeingreso: {
                            [Op.between]: [req.body.Fechadeliberacion, req.body.FechaFin]
                }
                    //[Op.between]: [req.body.Fechadeliberacion, req.body.FechaFin]
                //Fechadeingreso: req.body.Fechadeliberacion
            //	 	Fechadeingreso: "2021-05-23"
                }
            })
            .then(async (obj)=>{
            let fechap = obj[0].Fechadeingreso
            let arr = []
            let arraux = []
            let mesesArray = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
            
            obj.sort(function (a, b) {
                            if (a.Fechadeingreso > b.Fechadeingreso) {
                                return 1;
                            }
                            if (a.Fechadeingreso < b.Fechadeingreso) {
                                return -1;
                            }
                            // a must be equal to b
                            return 0;
                            });
            for(let i in obj)
            {
                //console.log(obj[i].NumeroEconomico + ':'+obj[i].Fechadeingreso)
                if(obj[i].Fechadeingreso == fechap)
                {
                    var objeto = {
                                NumeroEconomico: obj[i].NumeroEconomico,
                                Estatus: obj[i].Estatus,
                                Sistema: obj[i].Sistema,
                                Descripciondefalla: obj[i].Descripciondefalla,
                                Kilometraje: obj[i].Kilometraje,
                                Fechadeingreso: obj[i].Fechadeingreso,
                                Fechadeliberacion: obj[i].Fechadeliberacion
                        }
                    //console.log(obj[i].NumeroEconomico)
                    arraux.push(objeto)
                }
                else
                {
                    let fe = new Date(fechap)
                                let año = fe.getFullYear()
                                let mes = mesesArray[parseInt(fe.getMonth())]
                                let dia = fe.getDate()
                                let fechas = dia + " de " + mes + " del " + año
                    let obja = {
                            Fecha: fechas,
                        Registros: arraux
                    }
		    if(obja.Registros.length != 0)
                    arr.push(obja)
                    fechap = obj[i].Fechadeingreso
                    arraux = []
                }
            }
                let fe = new Date(fechap)
                            let año = fe.getFullYear()
                            let mes = mesesArray[parseInt(fe.getMonth())]
                            let dia = fe.getDate()
                            let fechas = dia + " de " + mes + " del " + año
            let obja = {
                            Fecha: fechas,
                Registros: arraux
                    }
	    if(obja.Registros.length != 0)
            arr.push(obja)
            
            const workbook = new ExcelJS.Workbook();
            workbook.creator = "Sistema MB";
            workbook.lastModifiedBy = "Sistema MB";
            workbook.created = new Date(2021, 1, 1);
            workbook.lastPrinted = new Date(2021, 1, 1);
            workbook.views = [
            {
                x: 0, y:0, width: 10000, height: 20000,
                firstSheet: 0, activeTab: 1, visibility: 'visible'
            }
            ]
            for(const i in arr){            
	//	console.log('For ' + arr[i].Fecha)
                const worksheet = workbook.addWorksheet(arr[i].Fecha, {pageSetup: {paperSize: 9, orientation:'landscape'}}, {headerFooter: {firstHeader: "MB"}});
                worksheet.mergeCells('A1:G1');
                worksheet.getCell('F1').value = arr[i].Fecha;
                
                worksheet.columns = [
                {key: 'eco', width: 15},
                {key: 'estatus', width: 10},
                {key: 'sistema', width: 10, outlineLevel: 1},
                {key: 'descripcion', width: 30, outlineLevel: 1},
                {key: 'kilometraje', width: 20, outlineLevel: 1},
                {key: 'ingreso', width: 20, outlineLevel: 1},
                {key: 'liberacion', width: 20, outlineLevel: 1}
                ];
                worksheet.mergeCells('A2:A3');
                worksheet.mergeCells('B2:B3');
                worksheet.mergeCells('C2:C3');
                worksheet.mergeCells('D2:D3');
                worksheet.mergeCells('E2:E3');
                worksheet.mergeCells('F2:F3');
                worksheet.mergeCells('G2:G3');    
                worksheet.getCell('A2').value  = 'Económico';
                worksheet.getCell('B2').value  = 'Estatus';
                worksheet.getCell('C2').value  = 'Sistema';
                worksheet.getCell('D2').value  = 'Descripción de la falla';
                worksheet.getCell('E2').value  = 'Kilometraje con el que ingresa';
                worksheet.getCell('F2').value  = 'Fecha de ingreso';
                worksheet.getCell('G2').value  = 'Fecha de liberación';
                
		let itObj = arr[i].Registros;
                for(const j in itObj){                        
                     worksheet.addRow([itObj[j].NumeroEconomico, itObj[j].Estatus, itObj[j].Sistema, itObj[j].Descripciondefalla, itObj[j].Kilometraje, itObj[j].Fechadeingreso, itObj[j].Fechadeliberacion]);
                }

                worksheet.eachRow({}, (row,number) => {
                    row.eachCell((cell, colNumber) =>[
                    cell.font = {
                        name: 'Arial',
                        family: 2,
                        bold: false,
                        size: 12,
                    },
                    cell.border ={
                        top: {style: 'thin'},
                        left: {style: 'thin'},
                        bottom: {style: 'thin'},
                        right: {style: 'thin'},
                    },
                    cell.alignment = {
                        vertical: 'middle',
                        horizontal: 'center',
                        wrapText: true,
                    }
                    ]);
                });
            }
            pdfName = "EstatusPatio"+ req.body.Fechadeliberacion +"a" + req.body.FechaFin + ".xlsx"
	    console.log('Nombre del archivo: '+pdfName)
            await workbook.xlsx.writeFile(path.join(__dirname, '../Documents/EstatusPatio/EstatusPatio') + req.body.Fechadeliberacion + "a" + req.body.FechaFin + ".xlsx")
            .then(res => {
            console.log("Excel creado");
            })
            .catch(error => {
                console.log("Excel: " + error)
            })
            //res.send({success: true, data: obj});
            
            //console.log(obj)
            res.send({success:true, data:obj});
        })
        .catch(err=>{
                console.log(err)
                res.send({success:false, message:err});
            })
    }
    else{
    if(req.body.FechaFin && !req.body.Fechadeliberacion)
		req.body.Fechadeliberacion = req.body.FechaFin
    console.log('Creando excel de 1 sola fecha')
    Patio.findAll({
        where: {
         Fechadeingreso: req.body.Fechadeliberacion
	 //Fechadeingreso: "2021-05-23"
	}
    })
    .then(async (obj)=>{
        let mesesArray = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
        let fecha = new Date(req.body.Fechadeliberacion)
        let año = fecha.getFullYear()
        let mes = mesesArray[parseInt(fecha.getMonth())]
        let dia = fecha.getDate()
        let fechas = dia + " de " + mes + " del " + año
        const workbook = new ExcelJS.Workbook();
        workbook.creator = "Sistema MB";
        workbook.lastModifiedBy = "Sistema MB";
        workbook.created = new Date(2021, 1, 1);
        workbook.lastPrinted = new Date(2021, 1, 1);
        workbook.views = [
          {
            x: 0, y:0, width: 10000, height: 20000,
            firstSheet: 0, activeTab: 1, visibility: 'visible'
          }
        ]
        
        const worksheet = workbook.addWorksheet('My sheet', {pageSetup: {paperSize: 9, orientation:'landscape'}}, {headerFooter: {firstHeader: "MB"}});
        worksheet.mergeCells('A1:G1');
        worksheet.getCell('F1').value = fechas;
        
        worksheet.columns = [
          {key: 'eco', width: 15},
          {key: 'estatus', width: 10},
          {key: 'sistema', width: 10, outlineLevel: 1},
          {key: 'descripcion', width: 30, outlineLevel: 1},
          {key: 'kilometraje', width: 20, outlineLevel: 1},
          {key: 'ingreso', width: 20, outlineLevel: 1},
          {key: 'liberacion', width: 20, outlineLevel: 1}
        ];
        worksheet.mergeCells('A2:A3');
        worksheet.mergeCells('B2:B3');
        worksheet.mergeCells('C2:C3');
        worksheet.mergeCells('D2:D3');
        worksheet.mergeCells('E2:E3');
        worksheet.mergeCells('F2:F3');
        worksheet.mergeCells('G2:G3');    
        worksheet.getCell('A2').value  = 'Económico';
        worksheet.getCell('B2').value  = 'Estatus';
        worksheet.getCell('C2').value  = 'Sistema';
        worksheet.getCell('D2').value  = 'Descripción de la falla';
        worksheet.getCell('E2').value  = 'Kilometraje con el que ingresa';
        worksheet.getCell('F2').value  = 'Fecha de ingreso';
        worksheet.getCell('G2').value  = 'Fecha de liberación';
        var patios=[]       

        for(const valor in obj){                        
            worksheet.addRow([obj[valor].NumeroEconomico, obj[valor].Estatus, obj[valor].Sistema, obj[valor].Descripciondefalla, obj[valor].Kilometraje, obj[valor].Fechadeingreso, obj[valor].Fechadeliberacion]);          
        }

        worksheet.eachRow({}, (row,number) => {
            row.eachCell((cell, colNumber) =>[
              cell.font = {
                name: 'Arial',
                family: 2,
                bold: false,
                size: 12,
              },
              cell.border ={
                top: {style: 'thin'},
                left: {style: 'thin'},
                bottom: {style: 'thin'},
                right: {style: 'thin'},
              },
              cell.alignment = {
                vertical: 'middle',
                horizontal: 'center',
                wrapText: true,
              }
            ]);
          });
        await workbook.xlsx.writeFile(path.join(__dirname, '../Documents/EstatusPatio/EstatusPatio') + req.body.Fechadeliberacion + ".xlsx")
        .then(res => {
        console.log("Excel creado");
        })
        .catch(error => {
            console.log("Excel: " + error)
        })
        res.send({success: true, data: obj.arr});       
    })
    .catch(err=>{
        console.log(err)
        res.send({success:false, message:err});
    })
    }
})

patio.get('/fetch-excel', async(req,res) => {
	console.log(req.query.PDF)	
    var excelName = req.query.PDF+".xlsx"
    console.log(excelName)
    var aux = path.join(__dirname,'../', 'Documents/EstatusPatio/', excelName)
    console.log(aux)
    res.sendFile(aux)
})

patio.post('/get_liberacion', (req,res) => {
    Patio.findAll({
    where: {
        Fechadeliberacion: null
        } 
    })
    .then(obj=>{
        res.send({success:true, data:obj});
    })
    .catch(err=>{
        res.send({success:false, message:err});
    })
})

patio.post('/UpdateLiberacion', (req,res) =>
{
    const patioData = {
        NumeroEconomico: req.body.NumeroEconomico,
        Estatus: req.body.Estatus,
        Sistema: req.body.Sistema,
        Descripciondefalla: req.body.Descripciondefalla,
        Kilometraje: req.body.Kilometraje,
        Fechadeingreso: req.body.Fechadeingreso,
        Fechadeliberacion: req.body.Fechadeliberacion
    }
    Patio.findOne({
        where: {
          NumeroEconomico: req.body.NumeroEconomico,
          Fechadeingreso: req.body.Fechadeingreso
        }
    })
    .then(patio => {
      if(patio) {
            Patio.update({Fechadeliberacion: req.body.Fechadeliberacion}, {where: {NumeroEconomico: patioData.NumeroEconomico}})
            .then(patio => {
              res.send({status:"success",data:patioData})
            })
            .catch(err => {
              res.send('error: ' + err)
            })
      } else {
        res.send({ error: 'El usuario no existe' })
      }
    })
    .catch(err => {
      res.send('error: ' + err)
    })
})

module.exports = patio

