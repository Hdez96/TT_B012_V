const path = require('path')
const express = require('express')
const ExcelJS = require('exceljs')
const fotos = express.Router()
const reffa = express.Router()
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
var pdf = require('pdf-creator-node')
var fs = require('fs')

var options = {
	format: 'Letter'
}


const Fotos = require('../Models/Fotos.js')
const Reffa = require('../Models/REFFA.js')
const Fallos = require('../Models/Fallos.js')
const CedulaTRA = require('../Models/Cedulatra.js')
const RevTecInicial = require('../Models/RevTecnicaInicial.js')
const { monitorEventLoopDelay } = require('perf_hooks')

reffa.use(cors())
fotos.use(cors())

process.env.SECRET_KEY = 'secret'

fotos.get('/fetchPDF', async (req,res) => {        
    console.log(req)    
    Reffa.findOne({
        where:{
            NumeroEconomico: req.query.PDF
        }
    })
    .then(obj1 =>{        
        Fallos.findAll({
            where:{
                NumeroEconomico: req.query.PDF
            }
        })
        .then(obj2 => {
            Fotos.findAll({
                where:{
                    NumeroEconomico: req.query.PDF
                }                                    
            })
            .then(obj3 => {                               
                CedulaTRA.findOne({
                    where:{
                        NumeroEconomico: req.query.PDF
                    }
                })
                .then(obj4 => {                    
                    RevTecInicial.findOne({
                        where:{
                            Carroceria: obj4.NumeroCarroceria
                        }
                    }).then(obj5 => {
                        Fotos.findOne({
                            where:{
                                NumeroEconomico: "0000"
                            }                                    
                        })
                        .then(obj6 => {    
                            //PDF                    
				console.log("Mi km "+obj1.Kilometraje)
//			console.log(obj1)
                            var html = fs.readFileSync(path.join(__dirname, '../Documents/Templates/REFFA.html'),'utf-8');
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
                            const obj = {
                                EmpresaOperadora: obj5.EmpresaOperadora,
                                NumeroEconomico: obj1.NumeroEconomico,
                                FechaMatePreventivo: obj1.FechaMantePreventivo,
				Kilometraje: obj1.Kilometraje,
                                VerificacionVehicular: obj1.VerificacionVehicular,
                                ConsumoPromedioDispCalc: obj1.ConsumoPromedioDispCalc,
                                UltFechaFumigacion: obj1.UltFechaFumigacion,
                                NotaExtra: obj1.NotaExtra
                            }
                            let camion =
                            {
                                NombreEmpresaOperadora: obj5.EmpresaOperadora,
                                Año: obj5.Año,
                                NumeroMotor: obj5.Motor,
                                NumeroChasis: obj5.Chasis,
                                NumeroTransmision: obj5.Transmision,
  				Kilometraje: obj1.Kilometraje,
                                Marca: obj4.Marca,
                                Modelo: obj5.Modelo,
                                PlacaVehicular: obj4.PlacaVehicular
                            }                        
                            let fallas = [];
                            var falle = []
			    for(let x in obj2){
                                const fn = {
                                    Contador: (x-0)+(1-0),
                                    Codigo: obj2[x].Codigo,
                                    Elemento: obj2[x].Elemento,
                                    Estatus: obj2[x].Estatus,
                                    Detalle: obj2[x].Detalle,
                                    Ubicaciones: obj2[x].Ubicaciones,
                                    Observaciones: obj2[x].Observaciones
                                }
				falle.push(fn)
                                fallas = fallas.concat(fn)
                            }       
                            const imgTest = {                            
                                Foto1: new Buffer( obj6.Foto, 'binary' ).toString('ascii'),                            
                            }
                            let fotosBD = [];
                            let tam = obj3.length                                                    
			    
                            let x = 0
            				console.log("Tam "+ obj3.length)
            				
                            /*
                            for(let a in obj3)
            					console.log(obj3[a].NumeroEconomico)
                            */

                            while(x < obj3.length)
                            {                                                                                  
                                let screen = {}
                				console.log(x)
                				console.log(obj3[x].NumeroEconomico)
                                if((x- 0)+ (1-0) <= tam-1)
                                {
                                    screen = {                                
                                        Foto1: new Buffer( obj3[x].Foto, 'binary' ).toString('ascii'),                                
                                        Codigo1: obj3[x].Codigo,                                               
                                    }
                                    screen["Foto2"] = new Buffer( obj3[(x- 0) + (1 - 0)].Foto, 'binary' ).toString('ascii')                            
                                    screen["Codigo2"] = obj3[(x- 0) + (1 - 0)].Codigo        
                                    fotosBD.push(screen)                                                         	  
                                }
                				else
                				{
                					screen = {                                
                    	                Foto1: new Buffer( obj3[x].Foto, 'binary' ).toString('ascii'),               
            	                        Codigo1: obj3[x].Codigo,                                               
                        	        }
                					fotosBD.push(screen) 
                				}

                                x = (x - 0) + (2 - 0)                                 
        			        }

                            var document = {
                                html: html,
                                data: {                        
                                    datos: obj,
                                    fallos: fallas,
                                    datosCamion: camion,
                                    fotos: fotosBD,
                                    header: imgTest
                                },
                                path: path.join(__dirname, '../Documents/REFFA/REFFA') + req.query.PDF + ".pdf"
                            }    

                            let excelName = path.join(__dirname, '../Documents/REFFA/REFFA') + req.query.PDF + ".xlsx"           
                            pdfName = "REFFA"+ req.query.PDF +".pdf"
                            
                            pdf.create(document,options)
                            .then(pdf => { 
                                var pdfName = "REFFA" + req.query.PDF + ".pdf"
                                console.log(pdfName)                            
                                var aux = path.join(__dirname,'../', 'Documents/REFFA/', pdfName)
                                res.sendFile(aux)                           
                                console.log("Creado.")
                            })
                            .catch(error => {                            
                                console.log(error)
                            })
                            
                        })
                        .catch(error6 => {
                            console.log(error6)
                        })
                    })
                    .catch(error5 => {
                        console.log(error5)
                    })
                })
                .catch(error4 => {
                    console.log(error4)
                })                
            })
            .catch(error3 => {
                console.log(error3)
            })
        })  
        .catch(error2 => {
            console.log(error2)
        })                                
    })
    .catch(error1 => {
        console.log(error1)
    })  
})

fotos.get('/fetchExcel', async (req,res) => {        
    console.log(req)    
    Reffa.findOne({
        where:{
            NumeroEconomico: req.query.PDF
        }
    })
    .then(obj1 =>{        
        Fallos.findAll({
            where:{
                NumeroEconomico: req.query.PDF
            }
        })
        .then(obj2 => {
            Fotos.findAll({
                where:{
                    NumeroEconomico: req.query.PDF
                }                                    
            })
            .then(obj3 => {                               
                CedulaTRA.findOne({
                    where:{
                        NumeroEconomico: req.query.PDF
                    }
                })
                .then(obj4 => {                    
                    RevTecInicial.findOne({
                        where:{
                            Carroceria: obj4.NumeroCarroceria
                        }
                    }).then(obj5 => {
                        Fotos.findOne({
                            where:{
                                NumeroEconomico: "0000"
                            }                                    
                        })
                        .then(async(obj6) => {    
                            //PDF                    
                            console.log("Mi km "+obj1.Kilometraje)
                            const obj = {
                                EmpresaOperadora: obj5.EmpresaOperadora,
                                NumeroEconomico: obj1.NumeroEconomico,
                                FechaMatePreventivo: obj1.FechaMantePreventivo,
				Kilometraje: obj1.Kilometraje,
                                VerificacionVehicular: obj1.VerificacionVehicular,
                                ConsumoPromedioDispCalc: obj1.ConsumoPromedioDispCalc,
                                UltFechaFumigacion: obj1.UltFechaFumigacion,
                                NotaExtra: obj1.NotaExtra
                            }
                            let camion =
                            {
                                NombreEmpresaOperadora: obj5.EmpresaOperadora,
                                Año: obj5.Año,
                                NumeroMotor: obj5.Motor,
                                NumeroChasis: obj5.Chasis,
				Kilometraje: obj1.Kilometraje,
                                NumeroTransmision: obj5.Transmision,
                                Marca: obj4.Marca,
                                Modelo: obj5.Modelo,
                                PlacaVehicular: obj4.PlacaVehicular
                            }                        
                            let fallas = [];
			    var falle = []
                            for(let x in obj2){
                                const fn = {
                                    Contador: (x-0)+(1-0),
                                    Codigo: obj2[x].Codigo,
                                    Elemento: obj2[x].Elemento,
                                    Estatus: obj2[x].Estatus,
                                    Detalle: obj2[x].Detalle,
                                    Ubicaciones: obj2[x].Ubicaciones,
                                    Observaciones: obj2[x].Observaciones
                                }
				falle.push(fn)
                                fallas = fallas.concat(fn)
                            }       
                            const imgTest = {                            
                                Foto1: new Buffer( obj6.Foto, 'binary' ).toString('ascii'),                            
                            }
                            let fotosBD = [];
                            let tam = obj3.length                                                    
                
                            let x = 0
                            console.log("Tam "+ obj3.length)
                            
                            /*
                            for(let a in obj3)
                                console.log(obj3[a].NumeroEconomico)
                            */

                            while(x < obj3.length)
                            {                                                                                  
                                let screen = {}
                                console.log(x)
                                console.log(obj3[x].NumeroEconomico)
                                if((x- 0)+ (1-0) <= tam-1)
                                {
                                    screen = {                                
                                        Foto1: new Buffer( obj3[x].Foto, 'binary' ).toString('ascii'),                                
                                        Codigo1: obj3[x].Codigo,                                               
                                    }
                                    screen["Foto2"] = new Buffer( obj3[(x- 0) + (1 - 0)].Foto, 'binary' ).toString('ascii')                            
                                    screen["Codigo2"] = obj3[(x- 0) + (1 - 0)].Codigo        
                                    fotosBD.push(screen)                                                              
                                }
                                else
                                {
                                    screen = {                                
                                        Foto1: new Buffer( obj3[x].Foto, 'binary' ).toString('ascii'),               
                                        Codigo1: obj3[x].Codigo,                                               
                                    }
                                    fotosBD.push(screen) 
                                }

                                x = (x - 0) + (2 - 0)                                 
                            }

                            let excelName = path.join(__dirname, '../Documents/REFFA/REFFA') + req.query.PDF + ".xlsx"           
				
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

                            //Creacion de Excel
                            const worksheet = workbook.addWorksheet(req.query.PDF, {pageSetup: {paperSize: 9, orientation:'landscape'}}, {headerFooter: {firstHeader: "Hola"}});
                
                            var bufferBase64 = new Buffer(obj6.Foto, 'binary' ).toString('ascii');
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

                            worksheet.columns = [
                              {key: 'No.', width: 18},
                              {key: 'Código', width: 18},
                              {key: 'Elemento', width: 18, outlineLevel: 80},
                              {key: 'Detalle', width: 18, outlineLevel: 80},
                              {key: 'Ubicaciones', width: 18},
                              {key: 'Descripción', width: 18},
                              {key: 'Extra', width: 18},
                              {key: 'Prueba', width: 18},
                              {key: 'Test', width: 18},
                              {key: 'TestT', width: 18}
                            ];

                            worksheet.mergeCells('A5:I5');
                            worksheet.getCell('I5').value = 'REPORTE DEL ESTADO FÍSICO Y DEL FUNCIONAMIENTO DEL AUTOBÚS';

                            worksheet.mergeCells('A7:B7');
                            worksheet.getCell('B7').value = 'EMPRESA OPERADORA: ';

                            worksheet.mergeCells('C7:D7');
                            worksheet.getCell('D7').value = obj.EmpresaOperadora;

                            worksheet.mergeCells('E7:F7');
                            worksheet.getCell('F7').value = 'NO. ECONÓMICO';

                            worksheet.mergeCells('G7:H7');
                            worksheet.getCell('H7').value = obj.NumeroEconomico;

                            worksheet.getCell('A9').value = 'Marca'; 
                            worksheet.getCell('B9').value = 'Año'; 
                            worksheet.getCell('C9').value = 'Modelo'; 
                            worksheet.getCell('D9').value = 'No. Motor'; 
                            worksheet.getCell('E9').value = 'No. Transmisión'; 
                            worksheet.getCell('F9').value = 'No. Chasis'; 
                            worksheet.getCell('G9').value = 'Placas';
                            worksheet.getCell('H9').value = 'Kilometraje';  

                            worksheet.getCell('A10').value = camion.Marca; 
                            worksheet.getCell('B10').value = camion.Año; 
                            worksheet.getCell('C10').value = camion.Modelo; 
                            worksheet.getCell('D10').value = camion.NumeroMotor; 
                            worksheet.getCell('E10').value = camion.NumeroTransmision; 
                            worksheet.getCell('F10').value = camion.NumeroChasis; 
                            worksheet.getCell('G10').value = camion.PlacaVehicular;
                            worksheet.getCell('H10').value = camion.Kilometraje;

                            worksheet.mergeCells('A12:I25');

                            worksheet.getCell('A27').value = 'No.'; 
                            worksheet.getCell('B27').value = 'Código'; 
                            worksheet.getCell('C27').value = 'Elemento'; 
                            worksheet.getCell('D27').value = 'Estatus'; 
                            worksheet.getCell('E27').value = 'Detalle'; 
                            worksheet.getCell('F27').value = 'Localización'; 
                            worksheet.getCell('G27').value = 'Observaciones';  
                            
            			    let contador = 27 - 0
            			    for(a in falle)
                            {
        				        contador++
                                worksheet.getCell('A'+contador).value = (a-0)+1; 
                                worksheet.getCell('B'+contador).value = falle[a].Codigo; 
                                worksheet.getCell('C'+contador).value = falle[a].Elemento; 
                                worksheet.getCell('D'+contador).value = falle[a].Estatus; 
                                worksheet.getCell('E'+contador).value = falle[a].Detalle; 
                                worksheet.getCell('F'+contador).value = falle[a].Ubicaciones; 
                                worksheet.getCell('G'+contador).value = falle[a].Observaciones;
                                        	
            			    }
                            
				            contador+=2
                            worksheet.mergeCells('A'+contador+':I'+contador);
                            worksheet.getCell('I'+contador).value = 'ANEXO DEL REPORTE DEL ESTADO FÍSICO Y DEL FUNCIONAMIENTO DEL AUTOBÚS';
                            contador+=2
                            worksheet.getCell('A'+contador).value = 'No.'; 
                            worksheet.getCell('B'+contador).value = 'Código';
                            worksheet.getCell('C'+contador).value = 'Elemento';
                            worksheet.mergeCells('D'+contador+':E'+contador);  
                            worksheet.getCell('E'+contador).value = 'Detalle';
                            worksheet.mergeCells('F'+contador+':G'+contador);  
                            worksheet.getCell('G'+contador).value = 'Ubicaciones';
                            worksheet.mergeCells('H'+contador+':I'+contador);  
                            worksheet.getCell('I'+contador).value = 'Observaciones';
                            contador++
                            worksheet.getCell('A'+contador).value = ' '; 
                            worksheet.getCell('B'+contador).value = ' ';
                            worksheet.getCell('C'+contador).value = ' ';
                            worksheet.mergeCells('D'+contador+':E'+contador);  
                            worksheet.getCell('E'+contador).value = ' ';
                            worksheet.mergeCells('F'+contador+':G'+contador);  
                            worksheet.getCell('G'+contador).value = ' ';
                            worksheet.mergeCells('H'+contador+':I'+contador);  
                            worksheet.getCell('I'+contador).value = ' ';
                            contador+=2
                            worksheet.mergeCells('B'+contador+':I'+contador); 
                            worksheet.getCell('I'+contador).value = 'Fecha de último mantenimiento preventivo: '+ obj.FechaMatePreventivo;
                            contador++
                            worksheet.mergeCells('B'+contador+':I'+contador); 
                            worksheet.getCell('I'+contador).value = 'Verificación vehicular: '+ obj.VerificacionVehicular;
                            contador++
                            worksheet.mergeCells('B'+contador+':I'+contador); 
                            worksheet.getCell('I'+contador).value = 'Consumo promedio display o calculado: '+ obj.ConsumoPromedioDispCalc;
                            contador++
                            worksheet.mergeCells('B'+contador+':I'+contador); 
                            worksheet.getCell('I'+contador).value = 'Última fecha de fumigación: ' + obj.UltFechaFumigacion;
                            contador++
                            worksheet.mergeCells('B'+contador+':E'+(contador+7));
                            contador+=7
                            worksheet.getCell('E'+contador).value = 'Nota Extra: ' + obj.NotaExtra;

/*                            worksheet.mergeCells('B48:D51');
                            worksheet.getCell('D51').value = 'Acepto; Recepción por Empresa Operadora.';

                            worksheet.mergeCells('E48:E49');
                            worksheet.mergeCells('E50:E51');
                            worksheet.getCell('E49').value = 'Cargo';
                            worksheet.getCell('E51').value = 'Nombre';

                            worksheet.mergeCells('F48:F49');
                            worksheet.mergeCells('F50:F51');
                            worksheet.getCell('F49').value = '{valor}';
                            worksheet.getCell('F51').value = '{valor}';

                            worksheet.mergeCells('G48:G49');
                            worksheet.mergeCells('G50:G51');
                            worksheet.getCell('G49').value = 'Fecha';
                            worksheet.getCell('G51').value = 'Hora';

                            worksheet.mergeCells('H48:H49');
                            worksheet.mergeCells('H50:H51');
                            worksheet.getCell('H49').value = '{valor}';
                            worksheet.getCell('H51').value = '{valor}';

                            worksheet.mergeCells('I48:I51');
                            worksheet.getCell('I51').value = 'Firma de Enterado';  
				*/
                            await workbook.xlsx.writeFile(excelName)
                            .then(excel => { 
                                console.log(excelName)                            
                                var aux = excelName
                                res.sendFile(aux)                           
                                console.log("Creado.")
                            })
                            .catch(error => {                            
                                console.log(error)
                            }) 
                        })
                        .catch(error6 => {
                            console.log(error6)
                        })
                    })
                    .catch(error5 => {
                        console.log(error5)
                    })
                })
                .catch(error4 => {
                    console.log(error4)
                })                
            })
            .catch(error3 => {
                console.log(error3)
            })
        })  
        .catch(error2 => {
            console.log(error2)
        })                                
    })
    .catch(error1 => {
        console.log(error1)
    })  
})

fotos.post('/fotos',async (req, res) => {
	const today = new Date().toJSON()
	const formData = {
		NumeroEconomico: req.body.NumeroEconomico,
		Foto: req.body.Foto,
		Codigo: req.body.Codigo,
		Fecha: req.body.Fecha
	}
	Fotos.findOne({
        where: { 
            NumeroEconomico: req.body.NumeroEconomico,
            Codigo: req.body.Codigo,
            Fecha: req.body.Fecha
        }
    })
    .then(fotos => {
        if (!fotos) {
            Fotos.create(formData)
            .then(fallos => {
                    console.log("Registrado.")
                    let estado = 1
                    Reffa.update({
                        Finalizado: estado
                        }, {
                        where: {
                            NumeroEconomico: req.body.NumeroEconomico
                        }
                    })
                    .then(user => {
                        console.log("Aquí pediremos datos")
                            // Reffa.findAll({
                            //     where:{
                            //         NumeroEconomico: "ECO121"
                            //     }
                            // })
                            // .then(obj1 =>{
                            //     console.log(obj1)
                            //     // Fallos.findAll({
                            //     //     where:{
                            //     //         NumeroEconomico: "ECO121"
                            //     //     }
                            //     // })
                            //     // .then(obj2 => {
                            //     //     Fotos.findAll({
                            //     //         where:{
                            //     //             NumeroEconomico: "ECO121"
                            //     //         }                                    
                            //     //     })
                            //     //     .then(obj4 => {
                            //     //         let objs = obj1.concat(obj2)
                            //     //         console.log("Se logro encontrar toda la información")
                            //     //         console.log(obj)
                            //     //         console.log(obj1)
                            //     //     })
                            //     //     .catch(error2 => {
                            //     //         console.log(error2)
                            //     //     })
                            //     // })                                
                            // }).catch(error1 => {
                            //     console.log(error1)
                            // })  
                            res.send({ status: 'Registrado!'})
                                                    
                    })                        
                    .catch(err => {
                        res.send('error: ' + err)
                    })
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

fotos.post('/header',async (req, res) => {

    Fotos.findOne({
        where: { 
            NumeroEconomico: "0000",
        }
    })
    .then(fotos => {
        res.send({ success: 'true',data:fotos.Foto})
    })
    .catch(err => {
        console.log(err)
      res.send('error: ' + err)
    })
})

fotos.post('/updateheader',async (req, res) => {
    Fotos.findOne({
        where: { 
            NumeroEconomico: "0000",
        }
    })
    .then(fotos => {
        Fotos.update({
                        Foto: req.body.Foto
                        }, {
                        where: {
                            NumeroEconomico: "0000"
                        }
                    })
                    .then(user => {
                            res.send({ status: 'Registrado!'})
                    })
                    .catch(err => {
                        res.send('error: ' + err)
                    })
    })
    .catch(err => {
        console.log(err)
      res.send('error: ' + err)
    })
})


module.exports = fotos
