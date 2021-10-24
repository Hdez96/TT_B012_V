const path = require('path')
const express = require("express")
const kilometraje = express.Router()
const fotos = express.Router()
const ExcelJS = require('exceljs')
const cors = require("cors")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
var pdf = require("pdf-creator-node");
var fs = require('fs');

var options = {
    format: "Letter"
}

var pdfName = ""

const Fotos = require('../Models/Fotos.js')
const Kilometraje = require('../Models/Kilometraje.js')
kilometraje.use(cors())

process.env.SECRET_KEY = 'secret'

kilometraje.post('/kilometraje',async (req, res) => {
    const today = new Date().toJSON()
    const formData = {
        NumeroEconomico: req.body.NumeroEconomico,
        Kilometraje: req.body.Kilometraje,
        Periodo: req.body.Periodo,
        Mes: req.body.Mes,
        Año: req.body.Año
    }
    Kilometraje.findOne({
        where: { 
            NumeroEconomico: req.body.NumeroEconomico,
            Periodo: req.body.Periodo,
            Mes: req.body.Mes,
            Año: req.body.Año
        }
    })
    .then(kilometraje => {
        if (!kilometraje) {
            Kilometraje.create(formData)
            .then(kilometraje => {
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
      res.send('error: ' + err)
    })
})


kilometraje.post('/KilometrajePDF', (req,res) => {
	console.log(req)
    Kilometraje.findAll({
    	where: {
            Periodo: 1,
    		Mes: req.body.Mes,
    		Año: req.body.Año,
//            EmpresaOperadora: req.body.EmpresaOperadora
    	}
    })
    .then(obj1 =>{
            Kilometraje.findAll({
                where: {
                    Periodo: 2,
                    Mes: req.body.Mes,
                    Año: req.body.Año,
  //                  EmpresaOperadora: req.body.EmpresaOperadora
                }
            })
            .then(obj2 =>{
                    Kilometraje.findAll({
                        where: {
                            Periodo: 3,
                            Mes: req.body.Mes,
                            Año: req.body.Año,
   //                         EmpresaOperadora: req.body.EmpresaOperadora
                        }
                    })
                    .then(obj3 =>{
//			            console.log("HOLA"+__dirname)
                        var html = fs.readFileSync(path.join(__dirname, '../Documents/Templates/Kilometraje.html'),'utf-8');
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

                        let obj = obj1.concat(obj2,obj3)
//                        console.log(obj)
			obj.sort(function (a, b) {
                          if (a.NumeroEconomico > b.NumeroEconomico) {
                            return 1;
                          }
                          if (a.NumeroEconomico < b.NumeroEconomico) {
                            return -1;
                          }
                          // a must be equal to b
                          return 0;
                        });

                        const user = []
                        let mesn = 0
                        let mesesArray = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
                        for(let i = 0; i < 12; i++)
                            if(mesesArray[i] == req.body.Mes)
                            {
                                mesn = i
                                i = 13
                            }
			console.log("adios"+obj[0])
                        let NumeroEconomicoRef = obj[0].NumeroEconomico
                        let Km1 = 0
                        let Km2 = 0
                        let Km3 = 0
                        let KmTotal = 0;
                        let dias = [31,28,31,30,31,30,31,31,30,31,30,31]
                        let dia = 1

                        let fecha1 = "1-"+req.body.Mes.substr(0,3)+'-'+req.body.Año
                        let fecha2 = "15-"+req.body.Mes.substr(0,3)+'-'+req.body.Año
                        let fecha3 = dias[mesn]+'-'+req.body.Mes.substr(0,3)+'-'+req.body.Año
  //                      console.log(fecha3)
                        for(const valor in obj)
                        {
                            if(NumeroEconomicoRef != obj[valor].NumeroEconomico && NumeroEconomicoRef != null)
                            {
                                if(req.body.Periodo == 1)
                                    dia = 1
                                else if(req.body.Periodo == 2)
                                    dia = 15
                                else
                                    dia = dias[mesn]

                                var objeto = {
                                    NumeroEconomico: NumeroEconomicoRef,
                                    Dia: dia,
                                    Mes: req.body.Mes,
                                    Año: req.body.Año,
                                    Km1: Km1,
                                    Km2: Km2,
                                    Km3: Km3,
                                    KmTotal: KmTotal
                                }
                                if(NumeroEconomicoRef != " ")
                                    user.push(objeto)
                                NumeroEconomicoRef = obj[valor].NumeroEconomico
                                Km1 = 0
                                Km2 = 0
                                Km3 = 0
                                KmTotal = 0
                            }
                                if(obj[valor].Periodo == 1)
                                {
                                    Km1 = obj[valor].Kilometraje
                                    KmTotal += obj[valor].Kilometraje
                                }
                                else if(obj[valor].Periodo == 2)
                                {
                                    KmTotal += obj[valor].Kilometraje
                                    Km2 = obj[valor].Kilometraje
                                }
                                else if(obj[valor].Periodo == 3)
                                {
                                    KmTotal += obj[valor].Kilometraje
                                    Km3 = obj[valor].Kilometraje
                                }
                        }
                                if(req.body.Periodo == 1)
                                    dia = 1
                                else if(req.body.Periodo == 2)
                                    dia = 15
                                else
                                    dia = dias[mesn]

                                var objeto = {
                                    NumeroEconomico: NumeroEconomicoRef,
                                    Dia: dia,
                                    Mes: req.body.Mes,
                                    Año: req.body.Año,
                                    Km1: Km1,
                                    Km2: Km2,
                                    Km3: Km3,
                                    KmTotal: KmTotal
                                }
                                if(NumeroEconomicoRef != " ")
                                    user.push(objeto)
                        
                        var document = {
                            html: html,
                            data: {
                                users: user,
                                Fecha1: fecha1,
                                Fecha2: fecha2,
                                Fecha3: fecha3,
                                Mes: req.body.Mes
                            },
                            path: path.join(__dirname, '../Documents/Kilometraje/Kilometraje') + req.body.Mes + ".pdf"
                        }
                        pdfName = "Kilometraje"+ req.body.Mes +".pdf"
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
                        res.send({success:true, data:obj})
                    })
                    .catch(err3 =>{
                        console.log(err3)
                        res.send({success:false, message:err3});
                    })
            })
            .catch(err2 =>{
                console.log(err2)
                res.send({success:false, message:err2});
            })
    })
    .catch(err1 =>{
        console.log(err1)
        res.send({success:false, message:err1});
    })
})

kilometraje.post('/KilometrajeExcel', (req,res) => {
    console.log(req)
    Kilometraje.findAll({
        where: {
            Periodo: 1,
            Mes: req.body.Mes,
            Año: req.body.Año,
//            EmpresaOperadora: req.body.EmpresaOperadora
        }
    })
    .then(obj1 =>{
            Kilometraje.findAll({
                where: {
                    Periodo: 2,
                    Mes: req.body.Mes,
                    Año: req.body.Año,
  //                  EmpresaOperadora: req.body.EmpresaOperadora
                }
            })
            .then(obj2 =>{
                    Kilometraje.findAll({
                        where: {
                            Periodo: 3,
                            Mes: req.body.Mes,
                            Año: req.body.Año,
   //                         EmpresaOperadora: req.body.EmpresaOperadora
                        }
                    })
                    .then(async(obj3) =>{
                        Fotos.findOne({
                            where: { 
                                NumeroEconomico: "0000",
                            }
                        })
                        .then(async(fotos) => {
                            let obj = obj1.concat(obj2,obj3)
    //                      console.log(obj)
                            obj.sort(function (a, b) {
                                if (a.NumeroEconomico > b.NumeroEconomico) 
                                    return 1;
                                if (a.NumeroEconomico < b.NumeroEconomico) 
                                    return -1;
                                return 0;
                            });

                            const user = []
                            let mesn = 0
                            let mesesArray = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
                            
                            for(let i = 0; i < 12; i++)
                                if(mesesArray[i] == req.body.Mes)
                                {
                                    mesn = i
                                    i = 13
                                }

                            let NumeroEconomicoRef = obj[0].NumeroEconomico
                            let Km1 = 0
                            let Km2 = 0
                            let Km3 = 0
                            let KmTotal = 0;
                            let dias = [31,28,31,30,31,30,31,31,30,31,30,31]
                            let dia = 1

                            let fecha1 = "1-"+req.body.Mes.substr(0,3)+'-'+req.body.Año
                            let fecha2 = "15-"+req.body.Mes.substr(0,3)+'-'+req.body.Año
                            let fecha3 = dias[mesn]+'-'+req.body.Mes.substr(0,3)+'-'+req.body.Año
      
                            for(const valor in obj)
                            {
                                if(NumeroEconomicoRef != obj[valor].NumeroEconomico && NumeroEconomicoRef != null)
                                {
                                    if(req.body.Periodo == 1)
                                        dia = 1
                                    else if(req.body.Periodo == 2)
                                        dia = 15
                                    else
                                        dia = dias[mesn]

                                    var objeto = {
                                        NumeroEconomico: NumeroEconomicoRef,
                                        Dia: dia,
                                        Mes: req.body.Mes,
                                        Año: req.body.Año,
                                        Km1: Km1,
                                        Km2: Km2,
                                        Km3: Km3,
                                        KmTotal: KmTotal
                                    }
                                    if(NumeroEconomicoRef != " ")
                                        user.push(objeto)
                                    NumeroEconomicoRef = obj[valor].NumeroEconomico
                                    Km1 = 0
                                    Km2 = 0
                                    Km3 = 0
                                    KmTotal = 0
                                }
                                    if(obj[valor].Periodo == 1)
                                    {
                                        Km1 = obj[valor].Kilometraje
                                        KmTotal += obj[valor].Kilometraje
                                    }
                                    else if(obj[valor].Periodo == 2)
                                    {
                                        KmTotal += obj[valor].Kilometraje
                                        Km2 = obj[valor].Kilometraje
                                    }
                                    else if(obj[valor].Periodo == 3)
                                    {
                                        KmTotal += obj[valor].Kilometraje
                                        Km3 = obj[valor].Kilometraje
                                    }
                            }

                            if(req.body.Periodo == 1)
                                dia = 1
                            else if(req.body.Periodo == 2)
                                dia = 15
                            else
                                dia = dias[mesn]

                            var objeto = {
                                NumeroEconomico: NumeroEconomicoRef,
                                Dia: dia,
                                Mes: req.body.Mes,
                                Año: req.body.Año,
                                Km1: Km1,
                                Km2: Km2,
                                Km3: Km3,
                                KmTotal: KmTotal
                            }

                            if(NumeroEconomicoRef != " ")
                                user.push(objeto)
                        
                            const workbook = new ExcelJS.Workbook();
                            workbook.creator = "Metrobús";
                            workbook.lastModifiedBy = "Metrobús";
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

                            worksheet.addImage(imageID, `A1:D3`)
                            worksheet.mergeCells('A4:E4');
                            worksheet.getCell('A4').value = 'Kilometraje '+ req.body.Año;
                            
                            worksheet.columns = [
                              {key: 'eco', width: 20, outlineLevel: 1},
                              {key: 'parte1', width: 20, outlineLevel: 1},
                              {key: 'parte2', width: 20, outlineLevel: 1},
                              {key: 'parte3', width: 20, outlineLevel: 1},
                              {key: 'total1', width: 10, outlineLevel: 1},
                              {key: 'parte4', width: 20, outlineLevel: 1},
                              {key: 'parte5', width: 20, outlineLevel: 1},
                              {key: 'parte6', width: 20, outlineLevel: 1},
                              {key: 'total2', width: 10, outlineLevel: 1},
                              {key: 'parte7', width: 20, outlineLevel: 1},
                              {key: 'parte8', width: 20, outlineLevel: 1},
                              {key: 'parte9', width: 20, outlineLevel: 1},
                              {key: 'total3', width: 10, outlineLevel: 1}
                            ];
                            worksheet.mergeCells('A5:A6');
                            worksheet.mergeCells('E5:E6');
                            worksheet.autoFilter = 'A6:E6';

                            worksheet.getCell('A6').value  = 'NO. ECO';
                            worksheet.getCell('B5').value = fecha1;
                            worksheet.getCell('B6').value  = 'KILOMETRAJE';
                            worksheet.getCell('C5').value = fecha2;
                            worksheet.getCell('C6').value  = 'KILOMETRAJE';
                            worksheet.getCell('D5').value = fecha3;
                            worksheet.getCell('D6').value  = 'KILOMETRAJE';    
                            worksheet.getCell('E6').value  = 'TOTAL';

                            for(i in user)
                                worksheet.addRow([user[i].NumeroEconomico,user[i].Km1,user[i].Km2,user[i].Km3,user[i].KmTotal]);
                            
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
                            
                            

                            await workbook.xlsx.writeFile(path.join(__dirname, '../Documents/Kilometraje/Kilometraje') + req.body.Mes + ".xlsx");
                            console.log("Excel creado");
                        })
                        .catch(err => {
                            res.send('error: ' + err)
                        })
                    })
                    .catch(err3 =>{
                        console.log(err3)
                        res.send({success:false, message:err3});
                    })
            })
            .catch(err2 =>{
                console.log(err2)
                res.send({success:false, message:err2});
            })
    })
    .catch(err1 =>{
        console.log(err1)
        res.send({success:false, message:err1});
    })
})



kilometraje.post('/getData', (req,res) => {
    Kilometraje.findAll()
    .then(obj=>{
        let mes = []
        let MES = 0
        obj.sort(function (a,b) {
            if(a.Mes > b.Mes){
                return 1;
            }
            if(a.Mes < b.Mes){
                return -1
            }
            return 0
        });
        for(let valor in obj){
            if(MES != obj[valor].Mes){ 
                let data = {
                    NombrePDF: "Kilometraje" + obj[valor].Mes,
                    Ruta: "/km/fetch-pdf",
                    RutaExcel: "/km/fetch-excel"
                }                   
                MES = obj[valor].Mes
                mes.push(data)
            }
        }
            res.send({success:true, data:mes});
        })
        .catch(err=>{
            res.send({success:false, message:err});
        })
})

kilometraje.get('/fetch-excel', async(req,res) => {
    console.log(req.query.PDF)
    var pdfName = req.query.PDF+".xlsx"
    console.log(pdfName)
    var aux = path.join(__dirname,'../', 'Documents/Kilometraje/', pdfName)
    console.log(aux)
    res.sendFile(aux)
})

kilometraje.get('/fetch-pdf', async(req,res) => {
	console.log(req.query.PDF)
    var pdfName = req.query.PDF+".pdf"
    console.log(pdfName)
    var aux = path.join(__dirname,'../', 'Documents/Kilometraje/', pdfName)
    console.log(aux)
    res.sendFile(aux)
})



module.exports = kilometraje

