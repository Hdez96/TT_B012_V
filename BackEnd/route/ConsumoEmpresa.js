 const path = require('path')
const express = require("express")
const consumoE = express.Router()
const cors = require("cors")
const fotos = express.Router()
const ExcelJS = require('exceljs')
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
var pdf = require("pdf-creator-node");
var fs = require('fs');

var pdfName = ""

const Fotos = require('../Models/Fotos.js')
const ConsumoE = require('../Models/ConsumoEmpresa.js')
const Mantenimientos = require('../Models/Mantenimientos.js')
consumoE.use(cors())

process.env.SECRET_KEY = 'secret'

consumoE.post('/consumoE',async (req, res) => {
    const today = new Date().toJSON()
    const formData = {
        NumeroEconomico: req.body.NumeroEconomico,
        Mes: req.body.Mes,
	    KilometrajePorMes: req.body.KilometrajePorMes,
        RendimientoDiesel: req.body.RendimientoDiesel,
        RendimientoAdblue: req.body.RendimientoAdblue,
        ConsumoMensualDiesel: req.body.ConsumoMensualDiesel,
        ConsumoMensualAdblue: req.body.ConsumoMensualAdblue
    }
    ConsumoE.findOne({
        where: { 
            NumeroEconomico: req.body.NumeroEconomico,
            Mes: req.body.Mes
        }
    })
    .then(consumoE => {
        if (!consumoE) {
            ConsumoE.create(formData)
            .then(consumoE => {
                console.log("Registrado.")
		res.send({ status: 'Registrado!' })
            })
            .catch(err => {
                res.send('error: ' + err)
            })
        } else {
            res.json({ error: 'La factura ya existe' })
        }
    })
    .catch(err => {
      res.send('error: ' + err)
    })
})


consumoE.post('/ConsumoEPDF', (req,res) => {
	//console.log(req.body.Mes)
    ConsumoE.findAll({
        where: {
            Mes: req.body.Mes
            //Año: req.body.Año
        }
    })
    .then(obj =>{
        Mantenimientos.findAll({
            where: {
                Mes: req.body.Mes,
                Año: req.body.Año
            }
        })
        .then(objm =>{
	//console.log(obj)
            var html = fs.readFileSync(path.join(__dirname, '../Documents/Templates/Consumo_y_Mantenimiento_de_Empresas.html'),'utf-8');
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
            var users = [] 
            var user = []      
//            let EO = objm[0].EmpresaOperadora
	//console.log(objm.dataValues)
	  let EO = "ECO"
          for(const valor in objm){
                let cont = parseInt(valor) + parseInt(1)
                var objeto = {
//                    EmpresaOperadora: objm[valor].EmpresaOperadora,
                    NumeroEconomico: objm[valor].NumeroEconomico,
                    Numero: cont,
                    Fecha: objm[valor].Dia + "-" + objm[valor].Mes + "-" + objm[valor].Año,
                    TipoMantenimiento: objm[valor].TipoMantenimiento,
                    LecturaOdometroAnterior: objm[valor].LecturaOdometroAnterior,
                    LecturaOdometro: objm[valor].LecturaOdometro,
                    Observaciones: objm[valor].Observaciones
                }
                user.push(objeto)
            }

            for(const valor in obj){
                var objeto = {
                    NumeroEconomico: obj[valor].NumeroEconomico,
                    Mes: obj[valor].Mes,
                    KilometrajePorMes: obj[valor].KilometrajePorMes,
                    RendimientoDiesel: obj[valor].RendimientoDiesel,
                    RendimientoAdblue: obj[valor].RendimientoAdblue,
                    ConsumoMensualDiesel: obj[valor].ConsumoMensualDiesel,
                    ConsumoMensualAdblue: obj[valor].ConsumoMensualAdblue
                }
                users.push(objeto)
            }
		//console.log("HOLA")
		//console.log(objm + ' '+ obj)
            var document = {
                html: html,
                data: {
                    users: users,
                    user:user,
                    Mes: req.body.Mes,
                    Año: req.body.Año,
                    EmpresaOperadora: EO
                },
                path:  path.join(__dirname, '../Documents/ConsumoMantenimiento/Consumo-y-Mantenimiento-Empresas') + req.body.Mes + ".pdf"
            }
            pdfName = "Consumo"+ req.body.Mes+".pdf"
            pdf.create(document,options)
            .then(res => {
                //res.send(Promise.reject());
                console.log("Creado.")
            })
            .catch(error => {
                //res.send(Promise.resolve());
                console.log(error)
            })
            res.send({success:true, data:obj,data1:objm});
        })
        .catch(err1 =>{
		console.log(err1)
            res.send({success:false, message:err1});
        })
    })
    .catch(err =>{
	console.log(err)
        res.send({success:false, message:err});
    })
})

consumoE.post('/ConsumoEExcel', (req,res) => {
    //console.log(req.body.Mes)
    ConsumoE.findAll({
        where: {
            Mes: req.body.Mes
            //Año: req.body.Año
        }
    })
    .then(obj =>{
        Mantenimientos.findAll({
            where: {
                Mes: req.body.Mes,
                Año: req.body.Año
            }
        })
        .then(async(objm) =>{
            Fotos.findOne({
                where: { 
                    NumeroEconomico: "0000",
                }
            })
            .then(async(fotos) => {
                var users = [] 
                var user = []      

                //console.log(objm.dataValues)
                let EO = "ECO"
                for(const valor in objm)
                {
                    let cont = parseInt(valor) + parseInt(1)
                    var objeto = {
                        //EmpresaOperadora: objm[valor].EmpresaOperadora,
                        NumeroEconomico: objm[valor].NumeroEconomico,
                        Numero: cont,
                        Fecha: objm[valor].Dia + "-" + objm[valor].Mes + "-" + objm[valor].Año,
                        TipoMantenimiento: objm[valor].TipoMantenimiento,
                        LecturaOdometroAnterior: objm[valor].LecturaOdometroAnterior,
                        LecturaOdometro: objm[valor].LecturaOdometro,
                        Observaciones: objm[valor].Observaciones
                    }
                    user.push(objeto)
                }

                for(const valor in obj){
                    var objeto = {
                        NumeroEconomico: obj[valor].NumeroEconomico,
                        Mes: obj[valor].Mes,
                        KilometrajePorMes: obj[valor].KilometrajePorMes,
                        RendimientoDiesel: obj[valor].RendimientoDiesel,
                        RendimientoAdblue: obj[valor].RendimientoAdblue,
                        ConsumoMensualDiesel: obj[valor].ConsumoMensualDiesel,
                        ConsumoMensualAdblue: obj[valor].ConsumoMensualAdblue
                    }
                    users.push(objeto)
                }
                //console.log("HOLA")
                //console.log(objm + ' '+ obj)
                
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
                    /*filename: 'Logo_CDMX.png',
                    extension: 'png',*/
                    base64: bufferBase64,
                    extension: tipo
                });

                worksheet.addImage(imageID, `A1:D3`)
                worksheet.mergeCells('A4:F4');
                worksheet.getCell('F4').value = 'Información del mes de ' + req.body.Mes + ' del ' + req.body.Año;

                    worksheet.columns = [
                  {key: 'No.', width: 13},
                  {key: 'Descripción', width: 13},
                  {key: 'Estado', width: 14, outlineLevel: 80},
                  {key: 'Funcionamiento', width: 13, outlineLevel: 80},
                  {key: 'No.', width: 14},
                  {key: 'Descripción', width: 12}
                ];

                worksheet.mergeCells(6,1,7,4);
                worksheet.getCell('E6').value = 'Consumo';
                worksheet.getCell('E7').value = 'Rendimiento';

                worksheet.getCell('F6').value = 'Litros';
                worksheet.getCell('F7').value = 'Km/lt';

                worksheet.mergeCells(8,1,9,1);
                worksheet.getCell('A9').value = 'ECO';
                worksheet.mergeCells(8,2,9,2);
                worksheet.getCell('B9').value = 'KM Recorrido por Mes';

                worksheet.mergeCells('C8:D8');
                worksheet.getCell('D8').value = 'Consumos'; 
                worksheet.mergeCells('E8:F8');
                worksheet.getCell('F8').value = 'Rendimiento';

                worksheet.getCell('C9').value = 'Diesel';
                worksheet.getCell('D9').value = 'Adblue';

                worksheet.getCell('E9').value = 'Diesel';
                worksheet.getCell('F9').value = 'Adblue';

                worksheet.getCell('D7').value = 'Diesel y Adblue'; 

                for(j in users)
                {
                    worksheet.getCell('A'+(((j-0)+1)+9)).value = users[j].NumeroEconomico;
                    worksheet.getCell('B'+(((j-0)+1)+9)).value = users[j].KilometrajePorMes;
                    worksheet.getCell('C'+(((j-0)+1)+9)).value = users[j].RendimientoDiesel;
                    worksheet.getCell('D'+(((j-0)+1)+9)).value = users[j].RendimientoAdblue;
                    worksheet.getCell('E'+(((j-0)+1)+9)).value = users[j].ConsumoMensualDiesel;
                    worksheet.getCell('F'+(((j-0)+1)+9)).value = users[j].ConsumoMensualAdblue;
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

                worksheet.getRow(6).height = 46;

                const worksheet2 = workbook.addWorksheet('Mantenimiento', {pageSetup: {paperSize: 9, orientation:'landscape'}}, {headerFooter: {firstHeader: "Hola"}});
                worksheet2.addImage(imageID, `A1:D3`)
                worksheet2.mergeCells('A4:I4');
                worksheet2.getCell('I4').value = 'REPORTE MENSUAL DE MANTENIMIENTO PREVENTIVO';

                worksheet2.columns = [
                  {key: 'A', width: 6},
                  {key: 'B', width: 15},
                  {key: 'C', width: 18, outlineLevel: 80},
                  {key: 'D', width: 19, outlineLevel: 80},
                  {key: 'E', width: 25},
                  {key: 'F', width: 25},
                  {key: 'G', width: 17},
                  {key: 'H', width: 17},
                  {key: 'I', width: 17}
                ];

                worksheet2.mergeCells('A6:B6');
                worksheet2.getCell('B6').value = 'Empresa Operadora';
                worksheet2.getCell('C6').value = '';
                worksheet2.getCell('D6').value = 'Mes';
                worksheet2.getCell('E6').value = req.body.Mes;
                worksheet2.getCell('F6').value = 'Año';
                worksheet2.getCell('G6').value = req.body.Año;
                worksheet2.getCell('H6').value = 'Hoja';
                worksheet2.getCell('I6').value = '';

                worksheet2.getCell('A7').value = 'No°';
                worksheet2.getCell('B7').value = 'Económico';
                worksheet2.getCell('C7').value = 'Fecha de Mantenimiento';
                worksheet2.getCell('D7').value = 'Tipo de Mantenimiento';
                worksheet2.getCell('E7').value = 'Lectura de Odómetro del Mantenimiento Anterior';
                worksheet2.getCell('F7').value = 'Lectura de Odómetro';
                worksheet2.mergeCells('G7:I7');
                worksheet2.getCell('G7').value = 'Observaciones';

                for(j in user)
                {
                    worksheet2.getCell('A8').value = j+1;
                    worksheet2.getCell('B8').value = user[j].NumeroEconomico;
                    worksheet2.getCell('C8').value = user[j].Fecha;
                    worksheet2.getCell('D8').value = user[j].TipoMantenimiento;
                    worksheet2.getCell('E8').value = user[j].LecturaOdometroAnterior;
                    worksheet2.getCell('F8').value = user[j].LecturaOdometro;
    //                worksheet2.mergeCells('G5:I5');
                    worksheet2.getCell('G8').value = user[j].Observaciones;
                }


                worksheet2.eachRow({}, (row,number) => {
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


                worksheet2.getRow(4).height = 26;
                worksheet2.getRow(7).height = 26;
                worksheet2.getRow(6).height = 26;



                pdfName = path.join(__dirname, '../Documents/ConsumoMantenimiento/Consumo-y-Mantenimiento-Empresas') + req.body.Mes + ".xlsx"
                await workbook.xlsx.writeFile(pdfName);
                console.log("Excel creado");
                res.send({success:true, data:obj,data1:objm});
            })
            .catch(err => {
                console.log(err)
              res.send('error: ' + err)
            })
        })
        .catch(err1 =>{
        console.log(err1)
            res.send({success:false, message:err1});
        })
    })
    .catch(err =>{
    console.log(err)
        res.send({success:false, message:err});
    })
})



consumoE.post('/getData', (req,res) => {
    ConsumoE.findAll()
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
                    NombrePDF: "Consumo-y-Mantenimiento-Empresas"+obj[valor].Mes,
                    Ruta: "/ConsumoE/fetch-pdf",
                    RutaExcel: "/ConsumoE/fetch-excel"
                }                   
                MES = obj[valor].Mes
                mes.push(data)
            }
        }
        console.log("Enviando meses de ConsumoEmpresa")
            res.send({success:true, data:mes});
        })
        .catch(err=>{
            res.send({success:false, message:err});
        })
})

consumoE.get('/fetch-pdf', (req, res) =>{
    console.log(req.query.PDF)
    var pdfName = req.query.PDF+".pdf"
    console.log(pdfName)
    var aux = path.join(__dirname,'../', 'Documents/ConsumoMantenimiento/', pdfName)
    console.log(aux)
    res.sendFile(aux)

    //res.sendFile("./Documents/ConsumoMantenimiento/Consumo" + pdfName + ".pdf")
})

consumoE.get('/fetch-excel', async(req,res) => {
    console.log(req.query.PDF)
    var pdfName = req.query.PDF+".xlsx"
    console.log(pdfName)
    var aux = path.join(__dirname,'../', 'Documents/ConsumoMantenimiento/', pdfName)
    console.log(aux)
    res.sendFile(aux)
})


module.exports = consumoE
