const path = require('path')
const express = require('express')
const ExcelJS = require('exceljs')
const rendimientos = express.Router()
const fotos = express.Router()
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
var pdf = require('pdf-creator-node')
var fs = require('fs')
var options = {
	format: 'Letter'
}

var pdfName = ""

const Fotos = require('../Models/Fotos.js')
const Rendimientos = require('../Models/Rendimientos.js')
rendimientos.use(cors())

process.env.SECRET_KEY = 'secret'

rendimientos.post('/rendimientos',async (req, res) => {
	const today = new Date().toJSON()
	const formData = {
		NumeroEconomico: req.body.NumeroEconomico,
		Kilometraje: req.body.Kilometraje,
		ConsumoDiesel: req.body.ConsumoDiesel,
		RendimientoDiesel: req.body.RendimientoDiesel,
		Periodo: req.body.Periodo,
		Año: req.body.Año,
	}
	Rendimientos.findOne({
        where: { 
          NumeroEconomico: req.body.NumeroEconomico,
          Periodo: req.body.Periodo
        }
    })
    .then(rendimientos => {
        if (!rendimientos) {
            Rendimientos.create(formData)
            .then(rendimientos => {
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

rendimientos.post('/RendimientosExcel', (req,res) => {
    console.log("Alos")
    Rendimientos.findAll({
        where: {
            Periodo: req.body.Mes,
            Año: req.body.Año
        }
    })
    .then(async (obj)=>{
        Fotos.findOne({
        where: { 
            NumeroEconomico: "0000",
        }
        })
        .then(async(fotos) => {
            var users=[]
            for(const valor in obj){
                var objeto = {
                    NumeroEconomico: obj[valor].NumeroEconomico,
                    Kilometraje: obj[valor].Kilometraje,
                    ConsumoDiesel: obj[valor].ConsumoDiesel,
                    RendimientoDiesel: obj[valor].RendimientoDiesel,
                    Periodo: obj[valor].Periodo,
                    Año: obj[valor].Año
                }
                users.push(objeto)
            }

            const workbook = new ExcelJS.Workbook();
            workbook.creator = "Unidades De Transporte";
            workbook.lastModifiedBy = "MB";
            workbook.created = new Date(2021, 7, 2);
            workbook.lastPrinted = new Date(2021, 7, 2);
            workbook.views = [
                {
                    x: 0, y:0, width: 10000, height: 20000,
                    firstSheet: 0, activeTab: 1, visibility: 'visible'
                }
            ]    
            const worksheet = workbook.addWorksheet('My sheet', {pageSetup: {paperSize: 9, orientation:'landscape'}}, {headerFooter: {firstHeader: "Hola"}});
            var bufferBase64 = new Buffer(fotos.Foto, 'binary' ).toString('ascii');
            var tipo = "png"
            
            if(bufferBase64.search("jpeg")>=0)
                tipo = "jpeg"
            else if(bufferBase64.search("gif")>=0)
                tipo = "gif"
            else if(bufferBase64.search("png")>=0)
                tipo = "png"
            else if(bufferBase64.search("jpg")>=0)
                tipo = "jpg"
            else if(bufferBase64.search("svg")>=0)
                tipo = "svg"
            else if(bufferBase64.search("webp")>=0)
                tipo = "webbp"
            else if(bufferBase64.search("heic")>=0)
               tipo = "heic"

            console.log("Soy tipo: " + tipo)
            var imageID = workbook.addImage({
                /*filename: 'Logo_CDMX.png',
                extension: 'png',*/
                base64: bufferBase64,
                extension: tipo
            });
            
            worksheet.addImage(imageID, 'A1:B3');

            worksheet.mergeCells('A4:E4');
            worksheet.getCell('A4').value = 'RENDIMIENTOS';
            
            worksheet.columns = [
              {key: 'eco', width: 30,outlineLevel: 1},
              {key: 'km', width: 30, outlineLevel: 1},
              {key: 'consumo', width: 30, outlineLevel: 1},
              {key: 'rendimiento', width: 30, outlineLevel: 1},
              {key: 'periodo', width: 30, outlineLevel: 1}
            ];
            worksheet.mergeCells('A5:A6');
            worksheet.mergeCells('B5:B6');
            worksheet.mergeCells('C5:C6');
            worksheet.mergeCells('D5:D6');
            worksheet.mergeCells('E5:E6');
            worksheet.autoFilter = 'A6:E6';

            worksheet.getCell('A6').value  = 'ECONÓMICO';
            worksheet.getCell('B6').value = 'Km recorridos (MB).';
            worksheet.getCell('C6').value  = 'Consumo de Diesel (lts).';
            worksheet.getCell('D6').value = 'Rendimiento diesel (MB).';
            worksheet.getCell('E6').value  = 'Periodo';     
                    
            for(const j in users)
            {                        
                worksheet.addRow([users[j].NumeroEconomico, users[j].Kilometraje, users[j].ConsumoDiesel, users[j].RendimientoDiesel, users[j].Periodo]);
            }
            
            worksheet.eachRow({}, (row,number) => {
              row.eachCell((cell, colNumber) =>[
                cell.font = {
                  name: 'Arial',
                  family: 2,
                  bold: false,
                  size: 12,
                },
                cell.border = {
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
            pdfName = path.join(__dirname, '../Documents/Rendimientos/Rendimiento-') + req.body.Mes + ".xlsx"
            console.log('Nombre del archivo: '+pdfName)

            await workbook.xlsx.writeFile(pdfName)
            .then(res => {
                console.log("Excel creado");
            })
            .catch(error => {
                console.log("Excel: " + error)
            })

            res.send({success:true, data:obj});
            
        })
        .catch(err => {
            console.log(err)
          res.send('error: ' + err)
        })
    })
    .catch(err=>{
        res.send({success:false, message:err});
    })
})

rendimientos.post('/RendimientosPDF', (req,res) => {
    Rendimientos.findAll({
        where: {
            Periodo: req.body.Periodo,
            Año: req.body.Año
        }
    })
    .then(obj=>{
        var html = fs.readFileSync(path.join(__dirname, '../Documents/Templates/Rendimientos.html'),'utf-8');
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
        var users=[]
        for(const valor in obj){
            var objeto = {
                NumeroEconomico: obj[valor].NumeroEconomico,
                Kilometraje: obj[valor].Kilometraje,
                ConsumoDiesel: obj[valor].ConsumoDiesel,
                RendimientoDiesel: obj[valor].RendimientoDiesel,
                Periodo: obj[valor].Periodo,
                Año: obj[valor].Año
            }
            users.push(objeto)
        }

        var document = {
            html: html,
            data: {
                users: users
            },
            path:  path.join(__dirname, '../Documents/Rendimientos/Rendimiento-') + req.body.Periodo + ".pdf"
        }
        pdfName = "Rendimiento"+ req.body.Periodo+".pdf"
        pdf.create(document,options)
        .then(res => {
            //res.send(Promise.reject());
            console.log("Creado.")
        })
        .catch(error => {
            //res.send(Promise.resolve());
            console.log(error)
        })
//        console.log(obj)
        res.send({success:true, data:obj});
    })
    .catch(err=>{
        res.send({success:false, message:err});
    })
})

rendimientos.post('/getData', (req,res) => {
    console.log("Buscando rendimientos...")
    Rendimientos.findAll()
    .then(obj=>{
        let datos = []   
        let mesActual = obj[0].Periodo
        for(let valor in obj)
        {
//		console.log(obj[valor].Periodo)
            if(mesActual != obj[valor].Periodo)
            {
                let data ={
                    NombrePDF: "Rendimiento-"+mesActual,
                    Ruta: "/Rendimientos/fetch-pdf",
                    RutaExcel: "/Rendimientos/fetch-excel"
                } 
                mesActual = obj[valor].Periodo
                datos.push(data)
            }
        }
                let data ={
                    NombrePDF: "Rendimiento-"+obj[obj.length-1].Periodo,
                    Ruta: "/Rendimientos/fetch-pdf",
		    RutaExcel: "/Rendimientos/fetch-excel"
                }
                datos.push(data)
            
	console.log(datos)
            res.send({success:true, data:datos});
        })
        .catch(err=>{
            res.send({success:false, message:err});
        })
})

rendimientos.get('/fetch-excel', async(req,res) => {
    console.log(req.query.PDF)
    var pdfName = req.query.PDF+".xlsx"
    console.log(pdfName)
    var aux = path.join(__dirname,'../', 'Documents/Rendimientos/', pdfName)
    console.log(aux)
    res.sendFile(aux)
})


rendimientos.get('/fetch-pdf', async(req,res) => {
	console.log(req.query.PDF)
    var pdfName = req.query.PDF+".pdf"
    console.log(pdfName)
    var aux = path.join(__dirname,'../', 'Documents/Rendimientos/', pdfName)
    console.log(aux)
    res.sendFile(aux)
})


module.exports = rendimientos
