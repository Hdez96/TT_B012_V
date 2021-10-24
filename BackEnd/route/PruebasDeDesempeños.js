const path = require('path')
const express = require('express')
const ExcelJS = require('exceljs')
const fotos = express.Router()
const pruebasdedesempeños = express.Router()
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
var pdf = require('pdf-creator-node')
var fs = require('fs')
var options = {
	format: 'Letter'
}

const Fotos = require('../Models/Fotos.js')
const Pruebasdedesempeños = require('../Models/PruebasDeDesempeños.js')
const Estatus = require('../Models/Estatus.js')
const DatosI = require('../Models/DatosIniciales.js')
const EstadoLI = require('../Models/EstadoDeLlantasInicial.js')
const DatosF = require('../Models/DatosFinales.js')
const EstadoLF = require('../Models/EstadoDeLlantasFinal.js')
const Fallas = require('../Models/FallasDuranteOperacion.js')

pruebasdedesempeños.use(cors())

process.env.SECRET_KEY = 'secret'

pruebasdedesempeños.post('/pruebasdedesempeno',async (req, res) => {
	const today = new Date().toJSON()
	
	const formData = {
		NumeroEconomico: req.body.NumeroEconomico,
	        Mes: req.body.Mes,
       		Año: req.body.Año,
		Ruta: req.body.Ruta,
		Fecha: req.body.Fecha,
		NombredeEncargado: req.body.NombredeEncargado,
		NombredeRevision: req.body.NombredeRevision,
		NombreVistoBueno: req.body.NombreVistoBueno,
        NombredeEmpresaOperadora: req.body.NombredeEmpresaOperadora
	}
	Pruebasdedesempeños.findOne({
        where: { 
          NumeroEconomico: req.body.NumeroEconomico
        }
    })
    .then(pruebasdedesempeños => {
        console.log(req.body.NombredeEmpresaOperadora)
        if (!pruebasdedesempeños) {
            Pruebasdedesempeños.create(formData)
            .then(pruebasdedesempeños => {
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

pruebasdedesempeños.post('/PruebasPDF', (req,res) => {
    let fec = new Date(req.body.Fecha)
    console.log("\n\n\n"+ fec+"\n\n\n")
    let y = fec.getFullYear()
    let meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
    let m = meses[fec.getMonth()]
    let d = fec.getDate()
    console.log("FECHA:"+ fec +"AÑO: "+ y + " MES: " + m + " Dia: " +d)
    let stra = req.body.NumeroEconomico.substr(16,req.body.NumeroEconomico.length)
	req.body.NumeroEconomico = stra
	console.log(req.body.NumeroEconomico)
    Pruebasdedesempeños.findOne({
        where: {
            NumeroEconomico: req.body.NumeroEconomico,
            Fecha: req.body.Fecha
        }
    })
    .then(obj1 =>{
        Estatus.findOne({
            where: {
                NumeroEconomico: req.body.NumeroEconomico,
                Mes: m,
                Año: y
            }
        })
        .then(obj2 =>{
            DatosI.findOne({
                where: {
                    NumeroEconomico: req.body.NumeroEconomico,
                    Mes: m,
                    Año: y
                }
            })
            .then(obj3 =>{
		 EstadoLI.findAll({
                    where: {
                        NumeroEconomico: req.body.NumeroEconomico,
                        Mes: m,
                        Año: y
                    }
                })
                .then(obj4 =>{
		 DatosF.findOne({
                        where: {
                            NumeroEconomico: req.body.NumeroEconomico,
                            Mes: m,
                            Año: y
                        }
                    })
                    .then(obj5 =>{
                        EstadoLF.findAll({
                            where: {
                                NumeroEconomico: req.body.NumeroEconomico,
                                Mes: m,
                                Año: y
                            }
                        })
                        .then(obj6 =>{
                            Fallas.findAll({
                                where: {
                                    NumeroEconomico: req.body.NumeroEconomico,
                                    Mes: m,
                                    Año: y
                                }
                            })
                            .then(obj7 =>{
                                Fotos.findOne({
                                    where: { 
                                        NumeroEconomico: "0000",
                                    }
                                })
                                .then(async(fotos) => {
                                    //Aqui va el codigo del PDF
                                    var html = fs.readFileSync(path.join(__dirname, '../Documents/Templates/PruebasDesempeño.html'),'utf-8');
                                    var options = {
                                        	    phantomPath: path.resolve(
                                                    process.cwd(),
                                                    "node_modules/phantomjs/bin/phantomjs"
                                                  ),
    				                            format: "A3",
                                                orientation: "landscape",
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
                                    let DataLI = []
                                    for(let valor in obj4)
                                    {
                                        let objeto ={
                                            NumeroEconomico: obj4[valor].NumeroEconomico,
                                            Mes: obj4[valor].Mes,
                                            Año: obj4[valor].Año,
                                            NumerodeLlanta: obj4[valor].NumerodeLlanta,
                                            Eje: obj4[valor].Eje,
                                            Profundidad: obj4[valor].Profundidad,
                                            Presion: obj4[valor].Presion
                                        }
                                        DataLI.push(objeto)
                                    }
    				                DataLI.sort(function (a,b) {
                        				if(a.NumerodeLlanta > b.NumerodeLlanta){
            		                	    return 1;
                        				}
            		                	if(a.NumerodeLlanta < b.NumerodeLlanta){
            		                	    return -1
                    		        	}
            			        	    return 0
                    				})	
                                    let DataLF = []
                                    for(let valor in obj6)
                                    {
                                        let objeto ={
                                            NumeroEconomico: obj6[valor].NumeroEconomico,
                                            Mes: obj6[valor].Mes,
                                            Año: obj6[valor].Año,
                                            NumerodeLlanta: obj6[valor].NumerodeLlanta,
                                            Eje: obj6[valor].Eje,
                                            Profundidad: obj6[valor].Profundidad,
                                            Presion: obj6[valor].Presion
                                        }
                                        DataLF.push(objeto)
                                    }
    				                DataLF.sort(function (a,b) {
                                            if(a.NumerodeLlanta > b.NumerodeLlanta){
                                                return 1;
                                            }
                                            if(a.NumerodeLlanta < b.NumerodeLlanta){
                                                return -1
                                            }
                                                return 0
                                    })      
                                    let DataFa = []
                                    for(let valor in obj7)
                                    {
                                        let objeto ={
                                            NumeroEconomico: obj7[valor].NumeroEconomico,
                                            Mes: obj7[valor].Mes,
                                            Año: obj7[valor].Año,
                                            Falla: obj7[valor].Falla,
                                            Numero: parseInt(valor)+parseInt(1)
                                        }
                                        DataFa.push(objeto)
                                    }
    				//console.log("ADIOS"+obj1.NumeroEconomico)
                                    let datas = obj1.dataValues
                                    let DataP1 = {
                                        NumeroEconomico: obj1.NumeroEconomico,
                                        NombredeEmpresaOperadora: obj1.NombredeEmpresaOperadora,
                                        Mes: obj1.Mes,
                                        Año: obj1.Año,
                                        Ruta: obj1.Ruta,
                                        Fecha: obj1.Fecha,
                                        NombredeEncargado:obj1.NombredeEncargado ,
                                        NombredeRevision: obj1.NombredeRevision,
                                        NombreVistoBueno: obj1.NombreVistoBueno,

                                    }
                                    let DataP = [DataP1]
                    //				console.log(obj2.dataValues)
                                                    datas = obj2.dataValues
                    				console.log(obj2)
                                    let DataE1 = datas
                                    let DataE = [DataE1]
                    				datas = obj3.dataValues
                    				console.log(datas)
                                    let DataI1 = datas
                    				let DataI = [DataI1]
                    				console.log("V: "+DataI[0].Hora)
                                    datas = obj5.dataValues
                                    let DataF1 = datas
    				                let DataF = [DataF1]
                                    console.log(DataF)
                    				console.log("V2: " + DataF[0].Hora)
                    				let NFallas = DataFa.length+1
                                    var document = {
                                        html: html,
                                        data: {
                                            PruebasD: DataP,
                                            Estatus: DataE,
                                            DatosInicial: DataI,
                                            LlantaInicial: DataLI,
                                            DatosFinal: DataF,
                                            LlantaFinal: DataLF,
    					                    NumeroFallas: NFallas,
                                            Fallas: DataFa,
                                            Dia: d,
                                            Mes: m,
                                            Año: y
                                        },
                                        path: path.join(__dirname, '../Documents/PruebasDesempeño/PruebasDesempeño') + req.body.NumeroEconomico + ".pdf"
                                    }

                                    pdfName = "PruebasDesempeño"+req.body.NumeroEconomico +".pdf"
                                    pdf.create(document,options)
                                    .then(res => {
                                        //res.send(Promise.reject());
                                        console.log("Creado.")
    				                    console.log(NFallas)
                                    })
                                    .catch(error => {
                                        //res.send(Promise.resolve());
                                        console.log(error)
                                    })

                                    //Creando Excel
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
                                    worksheet.mergeCells('A1:O1');
                                    worksheet.getCell('O1').value = 'Pruebas de Desempeño';
                                    worksheet.mergeCells('A3:E3');
                                    worksheet.mergeCells('F3:J3');
                                    worksheet.mergeCells('K3:O3');

                                    worksheet.getCell('E3').value = 'Empresa Operadora: ' + DataP1.NombredeEmpresaOperadora;
                                    worksheet.getCell('J3').value = 'Número Económico: ' + DataP1.NumeroEconomico;
                                    worksheet.getCell('O3').value = 'Ruta ' + DataP1.Ruta;

                                    worksheet.mergeCells('C5:M5');
                                    worksheet.getCell('M5').value = 'Datos Iniciales';

                                    worksheet.mergeCells('C6:G6');
                                    worksheet.mergeCells('C7:G7');
                                    worksheet.mergeCells('C8:G8');
                                    worksheet.mergeCells('C9:G9');
                                    worksheet.mergeCells('C10:G10');

                                    worksheet.getCell('G6').value = 'Hora: '+ DataI1.Hora;
                                    worksheet.getCell('G7').value = 'Kilometraje: '+ DataI1.Kilometraje;
                                    worksheet.getCell('G8').value = 'Nivel de Diesel: '+ DataI1.NiveldeDiesel;
                                    worksheet.getCell('G9').value = 'Rendimiento: '+ DataI1.Rendimiento;
                                    worksheet.getCell('G10').value = 'Temperatura: '+ DataI1.Temperatura;

                                    worksheet.mergeCells(6,8,10,13);
                                    worksheet.getCell('M10').value = 'Códigos Activos: '+ DataI1.CodigosActivos;

                                    worksheet.mergeCells('B12:N12');
                                    
                                    let profundidadinicial = ''
                                    let presioninicial = ''
                                    for(a in DataLI)
                                    {
                                      profundidadinicial += ((a-0)+1) +'ª: '+ DataLI[a].Profundidad
                                      presioninicial += ((a-0)+1) +'ª: '+ DataLI[a].Presion
                                      if(a < DataLI.length-1)
                                        {
                                            profundidadinicial += ', '
                                            presioninicial += ', '
                                        }
                                        else
                                        {
                                            profundidadinicial += ' '
                                            presioninicial += ' '
                                        }
                                    }
                                    
                                    worksheet.getCell('N12').value = '01.-Profundidad del dibujo de llantas (mm): '+profundidadinicial+ 'posiciones';

                                    worksheet.mergeCells('B13:N13');
                                    worksheet.getCell('N13').value = '02.-Presión de Neumáticos: '+presioninicial;

                                    worksheet.mergeCells('A15:H15');
                                    worksheet.getCell('H15').value = 'Lugar: ';
                                    worksheet.mergeCells('A16:H16');
                                    worksheet.getCell('H16').value = 'Tiempo real(hr de salida): ';
                                    worksheet.mergeCells('A17:H17');
                                    worksheet.getCell('H17').value = 'Presión de aire: ';
                                    worksheet.mergeCells('A18:H18');
                                    worksheet.getCell('H18').value = 'Presión de aceite de motor: ';
                                    worksheet.mergeCells('A19:H19');
                                    worksheet.getCell('H19').value = 'Temperatura Parcial °C: ';
                                    worksheet.mergeCells('A20:H20');
                                    worksheet.getCell('H20').value = 'Voltaje: ';
                                    worksheet.mergeCells('A21:H21');
                                    worksheet.getCell('H21').value = '1ra - 2da(rpms): ';
                                    worksheet.mergeCells('A22:H22');
                                    worksheet.getCell('H22').value = '2da - 3ra(rpms): ';
                                    worksheet.mergeCells('A23:H23');
                                    worksheet.getCell('H23').value = '3ra - 4ta(rpms): '
                                    worksheet.mergeCells('A24:H24');
                                    worksheet.getCell('H24').value = '4ta - 5ta(rpms): ';
                                    worksheet.mergeCells('A25:H25');
                                    worksheet.getCell('H25').value = '5ta - 6ta(rpms): ';
                                    worksheet.mergeCells('A26:H26');
                                    worksheet.getCell('H26').value = 'Frenado brusco: ';
                                    worksheet.mergeCells('A27:H27');
                                    worksheet.getCell('H27').value = 'No. de activación del pedal de freno: ';
                                    worksheet.mergeCells('A28:H28');
                                    worksheet.getCell('H28').value = '% de pasajeros: ';

                                    worksheet.mergeCells('I15:O15');
                                    worksheet.getCell('O15').value = DataE1.Lugar;
                                    worksheet.mergeCells('I16:O16');
                                    worksheet.getCell('O16').value = DataE1.TiempoReal;
                                    worksheet.mergeCells('I17:O17');
                                    worksheet.getCell('O17').value = DataE1.PresiondeAire;
                                    worksheet.mergeCells('I18:O18');
                                    worksheet.getCell('O18').value = DataE1.PresiondeAceitedeMotor;
                                    worksheet.mergeCells('I19:O19');
                                    worksheet.getCell('O19').value = DataE1.TemperaturaParcial;
                                    worksheet.mergeCells('I20:O20');
                                    worksheet.getCell('O20').value = DataE1.Voltaje;
                                    worksheet.mergeCells('I21:O21');
                                    worksheet.getCell('O21').value = DataE1.Velocidad1a2;
                                    worksheet.mergeCells('I22:O22');
                                    worksheet.getCell('O22').value = DataE1.Velocidad2a3;
                                    worksheet.mergeCells('I23:O23');
                                    worksheet.getCell('O23').value = DataE1.Velocidad3a4;;
                                    worksheet.mergeCells('I24:O24');
                                    worksheet.getCell('O24').value = DataE1.Velocidad4a5;
                                    worksheet.mergeCells('I25:O25');
                                    worksheet.getCell('O25').value = DataE1.Velocidad5a6;
                                    worksheet.mergeCells('I26:O26');
                                    worksheet.getCell('O26').value = DataE1.FrenadoBrusco;
                                    worksheet.mergeCells('I27:O27');
                                    worksheet.getCell('O27').value = DataE1.NumerodeActivacionalPedaldeFreno;
                                    worksheet.mergeCells('I28:O28');
                                    worksheet.getCell('O28').value = DataE1.PorcentajePasajeros;

                                    worksheet.mergeCells('C32:M32');
                                    worksheet.getCell('M32').value = 'Datos Finales';

                                    worksheet.mergeCells('C33:G33');
                                    worksheet.mergeCells('C34:G34');
                                    worksheet.mergeCells('C35:G35');
                                    worksheet.mergeCells('C36:G36');
                                    worksheet.mergeCells('C37:G37');

                                    worksheet.getCell('G33').value = 'Hora: ' + DataF1.Hora;
                                    worksheet.getCell('G34').value = 'Kilometraje: ' + DataF1.Kilometraje;
                                    worksheet.getCell('G35').value = 'Nivel de Diesel: ' + DataF1.NiveldeDiesel;
                                    worksheet.getCell('G36').value = 'Rendimiento: ' + DataF1.Rendimiento;
                                    worksheet.getCell('G37').value = 'Temperatura: ' + DataF1.Temperatura

                                    worksheet.mergeCells(33,8,37,13);
                                    worksheet.getCell('M37').value = 'Códigos Activos: ' + DataF1.CodigosActivos;

                                    let profundidadfinal = ''
                                    let presionfinal = ''
                                    for(a in DataLF)
                                    {
                                        profundidadfinal += ((a-0)+1) +'ª: '+ DataLF[a].Profundidad
                                        presionfinal += ((a-0)+1) +'ª: '+ DataLF[a].Presion
                                        if(a < DataLF.length-1)
                                        {
                                            profundidadfinal += ', '
                                            presionfinal += ', '
                                        }
                                        else
                                        {
                                            profundidadfinal += ' '
                                            presionfinal += ' '
                                        }
                                    }

                                    worksheet.mergeCells('B39:N39');
                                    worksheet.getCell('N39').value = '01.-Profundidad del dibujo de llantas (mm): '+ profundidadfinal+ ' posiciones';
                                    worksheet.mergeCells('B40:N40');
                                    worksheet.getCell('N40').value = '02.-Presión de Neumáticos: '+ presionfinal;

                                    worksheet.mergeCells('B42:E42');
//                                    worksheet.mergeCells('F42:G42');
//                                    worksheet.mergeCells('H42:N42');

                                    worksheet.getCell('E42').value = 'Fallas durante la operación';
                                    
                                    console.log("tengo "+DataFa.length)
                                    for(j in DataFa)
                                    {
					console.log(DataFa[j].Falla)
					worksheet.mergeCells('F'+(41+((j-0)+1))+':G'+(41+((j-0)+1)));
	                                  worksheet.mergeCells('H'+(41+((j-0)+1))+':N'+(41+((j-0)+1)));
                                      worksheet.getCell('G'+(41+((j-0)+1))).value = (j-0)+1;
                                      worksheet.getCell('N'+(41+((j-0)+1))).value = DataFa[j].Falla;
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


                                    worksheet.getCell('G6').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('G7').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('G8').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('G9').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('G10').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('N12').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('N13').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('M10').alignment = { vertical: 'top', horizontal: 'left' };

                                    worksheet.getCell('G33').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('G34').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('G35').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('G36').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('G37').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('N39').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('N40').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('M37').alignment = { vertical: 'top', horizontal: 'left' };

                                    worksheet.getCell('H15').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('H16').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('H17').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('H18').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('H19').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('H20').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('H21').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('H22').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('H23').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('H24').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('H25').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('H26').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('H27').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('H28').alignment = { vertical: 'middle', horizontal: 'left' };

                                    worksheet.getCell('O15').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('O16').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('O17').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('O18').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('O19').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('O20').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('O21').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('O22').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('O23').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('O24').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('O25').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('O26').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('O27').alignment = { vertical: 'middle', horizontal: 'left' };
                                    worksheet.getCell('O28').alignment = { vertical: 'middle', horizontal: 'left' };

                                    worksheet.getCell('E42').alignment = { vertical: 'middle', horizontal: 'left' };
//                                    worksheet.getCell('G42').alignment = { vertical: 'middle', horizontal: 'left' };
//                                    worksheet.getCell('N42').alignment = { vertical: 'middle', horizontal: 'left' };

                                        worksheet.getCell('G6').border ={
                                          top: {style: 'thin'},
                                          left: {style: 'thin'},
                                        }

                                        worksheet.getCell('G7').border ={
                                          left: {style: 'thin'},
                                        }

                                        worksheet.getCell('G8').border ={
                                          left: {style: 'thin'},
                                        }

                                        worksheet.getCell('G9').border ={
                                          left: {style: 'thin'},
                                        }

                                        worksheet.getCell('G10').border ={
                                          left: {style: 'thin'},
                                          bottom: {style: 'thin'},
                                        }

                                        worksheet.getCell('H10').border ={
                                          bottom: {style: 'thin'},
                                        }

                                        worksheet.getCell('M10').border ={
                                          right: {style: 'thin'},
                                          bottom: {style: 'thin'},
                                        }

                                        ///

                                          worksheet.getCell('G33').border ={
                                          top: {style: 'thin'},
                                          left: {style: 'thin'},
                                        }

                                        worksheet.getCell('G34').border ={
                                          left: {style: 'thin'},
                                        }

                                        worksheet.getCell('G35').border ={
                                          left: {style: 'thin'},
                                        }

                                        worksheet.getCell('G36').border ={
                                          left: {style: 'thin'},
                                        }

                                        worksheet.getCell('G37').border ={
                                          left: {style: 'thin'},
                                          bottom: {style: 'thin'},
                                        }

                                        worksheet.getCell('H37').border ={
                                          bottom: {style: 'thin'},
                                        }

                                        worksheet.getCell('M37').border ={
                                          right: {style: 'thin'},
                                          bottom: {style: 'thin'},
                                        }



                                    await workbook.xlsx.writeFile(path.join(__dirname, '../Documents/PruebasDesempeño/PruebasDesempeño') + req.body.NumeroEconomico + ".xlsx");
                                    console.log("Excel creado");


                                    res.send({success:true, data1:obj1, data2:obj2, data3:obj3, data4:obj4, data5:obj5, data6:obj6, data7:obj7});
                                })
                                .catch(err => {
                                    console.log(err)
                                  res.send('error: ' + err)
                                })
                            })  
                            .catch(err7 =>{
				                console.log(err7)
                                res.send({success:false, message:err7});
                            })
                        })  
                        .catch(err6 =>{
				            console.log(err6)
                            res.send({success:false, message:err6});
                        })
                    })  
                    .catch(err5 =>{
                        console.log(err5)
                        res.send({success:false, message:err5});
                    })
                })  
                .catch(err4 =>{
                    console.log(err4)
                    res.send({success:false, message:err4});
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

pruebasdedesempeños.post('/getData', (req,res) => {
    Pruebasdedesempeños.findAll()
    .then(obj=>{
        let datos = []   
        for(let valor in obj){            
                let data = {
                    NombrePDF: "PruebasDesempeño"+obj[valor].NumeroEconomico,
		            Fecha: obj[valor].Fecha,
                    Ruta: "/pruebasdesempeno/fetch-pdf",
                    RutaExcel: "/pruebasdesempeno/fetch-excel"    
                }              
                datos.push(data)            
        }
            res.send({success:true, data:datos});
        })
        .catch(err=>{
            res.send({success:false, message:err});
        })
})

pruebasdedesempeños.get('/fetch-pdf', async(req,res) => {
    console.log(req.query.PDF)
    var pdfName = req.query.PDF+".pdf"
    console.log("HOLA: "+ pdfName)
    var aux = path.join(__dirname,'../', 'Documents/PruebasDesempeño/', pdfName)
    console.log(aux)
    res.sendFile(aux)
})

pruebasdedesempeños.get('/fetch-excel', async(req,res) => {
    console.log(req.query.PDF)
    var pdfName = req.query.PDF+".xlsx"
    console.log("HOLA: "+ pdfName)
    var aux = path.join(__dirname,'../', 'Documents/PruebasDesempeño/', pdfName)
    console.log(aux)
    res.sendFile(aux)
})

module.exports = pruebasdedesempeños
