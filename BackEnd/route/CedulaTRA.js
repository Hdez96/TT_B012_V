
const path = require('path')
const express = require("express")
const cedulatra = express.Router()
const ExcelJS = require('exceljs')
const revtecini = express.Router()
const fotos = express.Router()
const cors = require("cors")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
var pdf = require("pdf-creator-node");
var fs = require('fs');

var pdfName = ""

const Fotos = require('../Models/Fotos.js')
const CedulaTRA = require('../Models/Cedulatra.js')
const RevTecIni = require('../Models/RevTecnicaInicial.js')
revtecini.use(cors())
cedulatra.use(cors())

process.env.SECRET_KEY = 'secret'

cedulatra.post('/cedulatra',async (req, res) => {
    const today = new Date()
    let date = today.getFullYear() + "-"+ parseInt(today.getMonth()+1) +"-"+  today.getDate()
    console.log(date)
    const formData = {
        NumeroFactura: req.body.NumeroFactura,
        FechaAlta: date,
        Propietario: req.body.Propietario,
        Domicilio: req.body.Domicilio,
        Telefonos: req.body.Telefonos,
        Responsable: req.body.Responsable,
        Marca: req.body.Marca,
        Modelo: req.body.Modelo,
        Año: parseInt(req.body.Año),
        NumeroMotor: req.body.NumeroMotor,
        NumeroChasis: req.body.NumeroChasis,
        NumeroCarroceria: req.body.NumeroCarroceria,
        NumeroTransmision: req.body.NumeroTransmision,
        NumeroEconomico: req.body.NumeroEconomico,
        PlacaVehicular: req.body.PlacaVehicular,
        Observaciones: req.body.Observaciones,
        Nombre: req.body.Nombre,
        FechaRegistro: req.body.FechaRegistro,
//        Firma: req.body.Firma
    }
    CedulaTRA.findOne({
        where: { 
          NumeroFactura: req.body.NumeroFactura
        }
    })
    .then(cedulatra => {
        if (!cedulatra) 
        {
		console.log("Tambien aqui")
            Fotos.findOne({
                where: { 
                    NumeroEconomico: "0000",
                }
            })
            .then(async(fotos) => {
		console.log("Ando aqui")
                CedulaTRA.create(formData)
                .then(async(cedulatra) => {
                    console.log("Registrado.")
                    var html = fs.readFileSync(path.join(__dirname, '../Documents/Templates/template.html'),'utf-8');
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

                    var cedulatrad = [
                        {
                            NumeroFactura : req.body.NumeroFactura,
                            FechaAlta : req.body.FechaAlta,
                            Propietario : req.body.Propietario,
                            Domicilio :  req.body.Domicilio,
                            Telefono : req.body.Telefonos,
                            Responsable : req.body.Responsable,
                            Marca : req.body.Marca,
                            Modelo: req.body.Modelo,
                            Año: req.body.Año,
                            NumeroMotor: req.body.NumeroMotor,
                            NumeroChasis: req.body.NumeroChasis,
                            NumeroCarroceria: req.body.NumeroCarroceria,
                            NumeroTransmision: req.body.NumeroTransmision,
                            NumeroEconomico: req.body.NumeroEconomico,
                            PlacaVehicular: req.body.PlacaVehicular,
                            Observaciones: req.body.Observaciones,
                            Nombre: req.body.Nombre,
                            FechaRegistro: req.body.FechaRegistro,
      //                      Firma: req.body.Firma
                        }
                    ]
    		        console.log(cedulatrad)
                    var document = {
                        html: html,
                        data: {
                            users: cedulatrad
                            //users: cedulatra
                        },
                        path:  path.join(__dirname, '../Documents/Cedulatra/') + req.body.NumeroFactura + ".pdf"
                    }
                    pdf.create(document,options)
                    .then(res => {
                        //res.send(Promise.reject());
                        console.log("Creado.")
                    })
                    .catch(error => {
                        //res.send(Promise.resolve());
                        console.log(error)
                    })

                    const workbook = new ExcelJS.Workbook();
                    workbook.creator = "Unidades de Transporte";
                    workbook.lastModifiedBy = "MB";
                    workbook.created = new Date(2021, 7, 2);
                    workbook.lastPrinted = new Date(2021, 7, 2);
                    workbook.views = [
                      {
                        x: 0, y:0, width: 10000, height: 20000,
                        firstSheet: 0, activeTab: 1, visibility: 'visible'
                      }
                    ]
                    
                    const worksheet = workbook.addWorksheet('Consumo', {pageSetup: {paperSize: 9, orientation:'landscape'}}, {headerFooter: {firstHeader: "Hola"}});
                    
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

                    var imageID = workbook.addImage({
/*                        filename: 'Logo_CDMX.png',
                        extension: 'png',*/
                        base64: bufferBase64,
                        extension: tipo
                    });

                    worksheet.addImage(imageID, `A1:D3`)
                    
                    worksheet.mergeCells('B5:J7');
                    worksheet.getCell('J7').value = 'CÉDULA TÉCNICA DE REGISTRO DEL AUTOBÚS CON NÚMERO ECONÓMICO';

                    worksheet.mergeCells('B9:E9');
                    worksheet.getCell('E9').value = 'Datos Generales';

		    worksheet.mergeCells('B11:C11');
                    worksheet.getCell('C11').value = 'Factura o Carta Factura No.';
                    worksheet.mergeCells('D11:J11');
                    worksheet.getCell('J11').value = req.body.NumeroFactura

                    worksheet.mergeCells('B13:C13');
                    worksheet.getCell('C13').value = 'Fecha de alta';
                    worksheet.mergeCells('D13:J13');
                    worksheet.getCell('J13').value = req.body.FechaAlta

                    worksheet.mergeCells('B15:C15');
                    worksheet.getCell('C15').value = 'Propietario';
                    worksheet.mergeCells('D15:J15');
                    worksheet.getCell('J15').value = req.body.Propietario
                    
                    worksheet.mergeCells('B17:C17');
                    worksheet.getCell('C17').value = 'Domicilio';
                    worksheet.mergeCells('D17:J17');
                    worksheet.getCell('J17').value = req.body.Domicilio

                    worksheet.mergeCells('B19:C19');
                    worksheet.getCell('C19').value = 'Teléfonos';
                    worksheet.mergeCells('D19:J19');
                    worksheet.getCell('J19').value = req.body.Telefonos;

                    worksheet.mergeCells('B21:C21');
                    worksheet.getCell('C21').value = 'Responsable';
                    worksheet.mergeCells('D21:J21');
                    worksheet.getCell('J21').value = req.body.Responsable;

                    worksheet.mergeCells('B23:E23');
                    worksheet.getCell('E23').value = 'Datos Autobús';

                    worksheet.mergeCells('B25:C25');
                    worksheet.getCell('C25').value = 'Marca';
                    worksheet.mergeCells('D25:J25');
                    worksheet.getCell('J25').value = req.body.Marca

                    worksheet.mergeCells('B27:C27');
                    worksheet.getCell('C27').value = 'Modelo';
                    worksheet.mergeCells('D27:J27');
                    worksheet.getCell('J27').value = req.body.Modelo;

                    worksheet.mergeCells('B29:C29');
                    worksheet.getCell('C29').value = 'Año';
                    worksheet.mergeCells('D29:J29');
                    worksheet.getCell('J29').value = req.body.Año

                    worksheet.mergeCells('B31:C31');
                    worksheet.getCell('C31').value = 'Motor No.';
                    worksheet.mergeCells('D31:J31');
                    worksheet.getCell('J31').value = req.body.NumeroMotor

                    worksheet.mergeCells('B33:C33');
                    worksheet.getCell('C33').value = 'Chasis No.';
                    worksheet.mergeCells('D33:J33');
                    worksheet.getCell('J33').value = req.body.NumeroChasis

                    worksheet.mergeCells('B35:C35');
                    worksheet.getCell('C35').value = 'Carroceria No.';
                    worksheet.mergeCells('D35:J35');
                    worksheet.getCell('J35').value = req.body.NumeroCarroceria

                    worksheet.mergeCells('B37:C37');
                    worksheet.getCell('C37').value = 'Transmisión No.';
                    worksheet.mergeCells('D37:J37');
                    worksheet.getCell('J37').value = req.body.NumeroTransmision

                    worksheet.mergeCells('B39:C39');
                    worksheet.getCell('C39').value = 'Económico No.';
                    worksheet.mergeCells('D39:J39');
                    worksheet.getCell('J39').value = req.body.NumeroEconomico

                    worksheet.mergeCells('B41:C41');
                    worksheet.getCell('C41').value = 'Placa Vehícular';
                    worksheet.mergeCells('D41:J41');
                    worksheet.getCell('J41').value = req.body.PlacaVehicular

                    worksheet.mergeCells('B43:C43');
                    worksheet.getCell('C43').value = 'Observaciones';
                    worksheet.mergeCells('D43:J45');
                    worksheet.getCell('J45').value = req.body.Observaciones

                    worksheet.mergeCells('A47:B47');
                    worksheet.getCell('B47').value = 'Elaboró';

                    worksheet.mergeCells('C47:F47');
                    worksheet.getCell('F47').value = req.body.Nombre

                    worksheet.mergeCells('G47:H47');
                    worksheet.getCell('H47').value = 'Fecha';

                    worksheet.mergeCells('I47:J47');
                    worksheet.getCell('J47').value = req.body.FechaRegistro

		    worksheet.mergeCells('A49:D49');
                    worksheet.getCell('D49').value = 'Recibió por Metrobus';

                    worksheet.mergeCells('E49:J49');
                    worksheet.getCell('J49').value = ' ';

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

                    await workbook.xlsx.writeFile(path.join(__dirname, '../Documents/Cedulatra/') + req.body.NumeroFactura + ".xlsx")
                    console.log("Excel creado");
                    res.send({ status: 'Registrado!' , success:true})
                })
                .catch(err1 => {
                    res.send('error: ' + err1)
                })
            })
            .catch(err => {
                console.log(err)
                res.send('error: ' + err)
            })
        }
        else 
            res.send({ error: 'La factura ya existe' })
            
    })
    .catch(err => {
      res.send('error: ' + err)
    })
})

cedulatra.get('/fetch-pdf', async(req,res) => {
	console.log(req.query.PDF)
    var pdfName = req.query.PDF+".pdf"
    console.log(pdfName)
    var aux = path.join(__dirname,'../', 'Documents/Cedulatra/', pdfName)
    console.log(aux)
    res.sendFile(aux)
})

cedulatra.get('/fetch-excel', async(req,res) => {
    console.log(req.query.PDF)
    var pdfName = req.query.PDF+".xlsx"
    console.log(pdfName)
    var aux = path.join(__dirname,'../', 'Documents/Cedulatra/', pdfName)
    console.log(aux)
    res.sendFile(aux)
})

cedulatra.post("/BusquedaPDF/fetch-cedulatra-pdf", async(req,res) => {
    CedulaTRA.findOne({
        where:{
            NumeroEconomico: req.body.NumeroEconomico
        }
    })
	.then(obj=>{
		let dat =[]
                let datos = {
                    NombrePDF: obj.NumeroFactura,
                    Ruta: "/CedulaTRA/fetch-pdf",
                    RutaExcel: "/CedulaTRA/fetch-excel"
                }
		dat.push(datos)
		console.log(dat[0].NumeroFactura)
        	res.send({success:true, data:dat});
    	})
    	.catch(err=>{
		console.log(err)
        	res.send({success:false, message:err});
    	})
})


cedulatra.post('/pdfCedulaTRA', (req, res) => {
    CedulaTRA.findOne({
        where:{
            NumeroEconomico: req.body.NumeroEconomico
        }
    }).then(cedulatra=> {
        console.log("Buscando...")
        if(cedulatra){
            console.log("Encontrado!")
            //Insertar función de pdf c on las dataValues
        }else{
            res.status(400).json({error: "Numero economico no encontrado"})
        }
    }).catch(err =>{
        res.status(400).json({error: err})
    })
})

cedulatra.post('/get_autobus', (req,res) => {
    CedulaTRA.findOne({
        where: {
           NumeroEconomico: req.body.NumeroEconomico
        }   
    })
    .then(obj1 =>{
        RevTecIni.findOne({
            where: {
               Carroceria: obj1.NumeroCarroceria
            }   
        })
        .then(obj =>{
            let objf =
            {
                NombreEmpresaOperadora: obj.EmpresaOperadora,
                Año: obj.Año,
                NumeroMotor: obj.Motor,
                NumeroChasis: obj.Chasis,
                NumeroTransmision: obj.Transmision,
                Marca: obj1.Marca,
                Modelo: obj.Modelo,
                PlacaVehicular: obj1.PlacaVehicular
            }
            res.send({success:true, data:objf});
        })
        .catch(err=>{
            console.log("Registro incompleto.");
            res.send({success:false, message:err});
        })
    })
    .catch(err=>{
        console.log("No hay autobus");
        res.send({success:false, message:err});
    })
})

cedulatra.post('/get_autobuses', (req,res) => {
    CedulaTRA.findAll({
        attributes: ['NumeroEconomico']
    })
    .then(obj1 =>{
      	
	res.send({success:true, data:obj1})
    })
    .catch(err=>{
        console.log("No hay autobus");
        res.send({success:false, message:err});
    })
})

module.exports = cedulatra

