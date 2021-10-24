const path = require('path')
const ExcelJS = require('exceljs')
const express = require("express")
const fotos = express.Router()
const revtecini = express.Router()
const cors = require("cors")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
var pdf = require("pdf-creator-node");
var fs = require('fs');

var pdfName = ""

const Fotos = require('../Models/Fotos.js')
const RevTecIni = require('../Models/RevTecnicaInicial.js')
revtecini.use(cors())

process.env.SECRET_KEY = 'secret'

revtecini.post('/revteci',async (req, res) => {
    const today = new Date()
    let date = today.getFullYear() + "-"+ parseInt(today.getMonth()+1) +"-"+  today.getDate()
    const formData = {
            RevTecInID : req.body.RevTecInID,
            Economico: req.body.Economico,
            EmpresaOperadora : req.body.EmpresaOperadora,
            Año : req.body.Año,
            MotorElectrico : req.body.MotorElectrico,
            Carroceria : req.body.Carroceria,
            LecturaOdometro : req.body.LecturaOdometro,
            Modelo : req.body.Modelo,
            Motor : req.body.Motor,
            Chasis : req.body.Chasis,
            Transmision : req.body.Transmision,
            Tipo : req.body.Tipo,
            Observaciones: req.body.Observaciones,
            Fecha: req.body.Fecha,
            Elabora: req.body.Empleado
    }
    RevTecIni.findOne({
        where: { 
          RevTecInID: req.body.RevTecInID
        }
    })
    .then(revtecini => {
        if (!revtecini) {
            RevTecIni.create(formData)
            .then(revtecini => {
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

revtecini.post('/revtecPDF',async (req, res) => {
	console.log("ALOLOLO" + req.body.Fecha)
    const today = new Date(req.body.Fecha)
    console.log(today + ' ' + req.body.Fecha)
    let date = today.getFullYear() + "-"+ parseInt(today.getMonth()+1) +"-"+  today.getDate()
    let dia = today.getDate()
    let mes = today.getMonth()+1
    let año = today.getFullYear()
    Fotos.findOne({
        where: { 
            NumeroEconomico: "0000",
        }
    })
    .then(async(fotos) => {
        console.log("Recibiendo datos para pdf.. " + date + "\n\n\n" )
        const users = {
            RevTecInID : req.body.RevTecInID,
            NumeroEconomico: req.body.NumeroEconomico,
            EmpresaOperadora : req.body.EmpresaOperadora,
            AñoM : req.body.Año,
            MotorElectrico : req.body.MotorElectrico,
            Carroceria : req.body.Carroceria,
            LecturaOdometro : req.body.LecturaOdometro,
            Modelo : req.body.Modelo,
            Motor : req.body.Motor,
            Chasis : req.body.Chasis,
            Transmision : req.body.Transmision,
            Tipo : req.body.Tipo,
            Observaciones: req.body.Observaciones,
            Fecha: req.body.Fecha,
            Dia: dia,
            Mes: mes,
            Año: año,
            Elabora: req.body.Empleado,      
            NumeroMotor : req.body.NumeroMotor,
            SeñalInteriorExterior: req.body.SeñalInteriorExterior,
            Economico: req.body.Economico,
            LaminacionPinturaExterior: req.body.LaminacionPinturaExterior,
            Defensas: req.body.Defensas,
            ChasisGancho: req.body.ChasisGancho,
            Puertas: req.body.Puertas,
            CristalesParabrisas: req.body.CristalesParabrisas,
            Limpiaparabrisas: req.body.Limpiaparabrisas,
            CristalesVentanillas: req.body.CristalesVentanillas,
            CristalMedallon: req.body.CristalMedallon,
            Espejos: req.body.Espejos,
            Visera: req.body.Visera,
            AsientoConductor: req.body.AsientoConductor,
            AsientosPasajeros: req.body.AsientosPasajeros,
            ElementosSujección: req.body.ElementosSujección,
            Escotillas: req.body.Escotillas,
            Extintores: req.body.Extintores,
            Botiquin: req.body.Botiquin,
            AccesoriosSeguridad: req.body.AccesoriosSeguridad,
            Pisos: req.body.Pisos,
            Articulacion: req.body.Articulacion,
            Motor2: req.body.Motor2,
            AireComprimido: req.body.AireComprimido,
            Hibrido: req.body.Hibrido,
            Transmision2: req.body.Transmision2,
            Enfriamiento: req.body.Enfriamiento,
            Ignicion: req.body.Ignicion,
            Tablero: req.body.Tablero,
            Electrico: req.body.Electrico,
            LetreroRuta: req.body.LetreroRuta,
            Claxon: req.body.Claxon,
            SistemaDesempañante: req.body.SistemaDesempañante,
            SistemaAire: req.body.SistemaAire,
            Extractores: req.body.Extractores,
            AlumbradoEI: req.body.AlumbradoEI,
            Frenos: req.body.Frenos,
            CajaDireccion: req.body.CajaDireccion,
            Suspension: req.body.Suspension,
            TuboEscape: req.body.TuboEscape,
            SistemaRecaudo: req.body.SistemaRecaudo,
            SistemaTelematica: req.body.SistemaTelematica,
            TanqueCombustible: req.body.TanqueCombustible,
            NeumaticoSisControl: req.body.NeumaticoSisControl,
            NumeroMotorValue: req.body.NumeroMotorValue,
            SeñalInteriorExteriorValue: req.body.SeñalInteriorExteriorValue,
            EconomicoValue: req.body.EconomicoValue,
            LaminacionPinturaExteriorValue: req.body.LaminacionPinturaExteriorValue,
            DefensasValue: req.body.DefensasValue,
            ChasisGanchoValue: req.body.ChasisGanchoValue,
            PuertasValue: req.body.PuertasValue,
            CristalesParabrisasValue: req.body.CristalesParabrisasValue,
            LimpiaparabrisasValue: req.body.LimpiaparabrisasValue,
            CristalesVentanillasValue: req.body.CristalesVentanillasValue,
            CristalMedallonValue: req.body.CristalMedallonValue,
            EspejosValue: req.body.EspejosValue,
            ViseraValue: req.body.ViseraValue,
            AsientoConductorValue: req.body.AsientoConductorValue,
            AsientosPasajerosValue: req.body.AsientosPasajerosValue,
            ElementosSujecciónValue: req.body.ElementosSujecciónValue,
            EscotillasValue: req.body.EscotillasValue,
            ExtintoresValue: req.body.ExtintoresValue,
            BotiquinValue: req.body.BotiquinValue,
            AccesoriosSeguridadValue: req.body.AccesoriosSeguridadValue,
            PisosValue: req.body.PisosValue,
            ArticulacionValue: req.body.ArticulacionValue,
            Motor2Value: req.body.Motor2Value,
            AireComprimidoValue: req.body.AireComprimidoValue,
            HibridoValue: req.body.HibridoValue,
            Transmision2Value: req.body.Transmision2Value,
            EnfriamientoValue: req.body.EnfriamientoValue,
            IgnicionValue: req.body.IgnicionValue,
            TableroValue: req.body.TableroValue,
            ElectricoValue: req.body.ElectricoValue,
            LetreroRutaValue: req.body.LetreroRutaValue,
            ClaxonValue: req.body.ClaxonValue,
            SistemaDesempañanteValue: req.body.SistemaDesempañanteValue,
            SistemaAireValue: req.body.SistemaAireValue,
            ExtractoresValue: req.body.ExtractoresValue,
            AlumbradoEIValue: req.body.AlumbradoEIValue,
            FrenosValue: req.body.FrenosValue,
            CajaDireccionValue: req.body.CajaDireccionValue,
            SuspensionValue: req.body.SuspensionValue,
            TuboEscapeValue: req.body.TuboEscapeValue,
            SistemaRecaudoValue: req.body.SistemaRecaudoValue,
            SistemaTelematicaValue: req.body.SistemaTelematicaValue,
            TanqueCombustibleValue: req.body.TanqueCombustibleValue,
            NeumaticoSisControlValue: req.body.NeumaticoSisControlValue
            }
        const user =[]
        user.push(users)
        console.log("Suspension:" + req.body.SuspensionValue)
        console.log("Laminacion: " + req.body.LaminacionPinturaExteriorValue)
        var relp = path.join(__dirname,"../Documents/Templates/CRTIA.html")
        var html = fs.readFileSync(path.join(__dirname,"../")+'/Documents/Templates/CRTIA.html','utf-8');
    /*    var options = {
            format: "A3",
            orientation: "portrait",
            border: "0mm",
            header: {
                height: "0mm",
                contents: '<div></div>'
            },
            "footer": {
                "height": "0mm",
                "contents": {
                    first: '',
                    2: '', // Any page number is working. 1-based index
                    default: '<div></div>', // fallback value
                    last: ''
                }
            }
        };*/
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
        console.log("Generando pdf...\n")
        var document = {
            html: html,
            data: {
                users: user
            },
    //        timeout: 10000,
            path:  path.join(__dirname, '../Documents/Cedularti/') + req.body.Carroceria + ".pdf"
        }
        pdf.create(document,options)
        .then(res => {
            //res.send(Promise.reject());
            console.log("Creado.")
        })
        .catch(error => {
            //res.send(Promise.resolve());
            console.log("No se pudo crear... "+error)
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
    worksheet.mergeCells('A4:H4');
    worksheet.getCell('H4').value = 'CEDULA DE REVISIÓN TÉCNICA INICIAL DEL AUTOBÚS';
    
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

    worksheet.addImage(imageID, 'A1:D3');
    worksheet.columns = [
      {key: 'No.', width: 5},
      {key: 'Descripción', width: 35},
      {key: 'Estado', width: 12, outlineLevel: 1},
      {key: 'Funcionamiento', width: 18, outlineLevel: 1},
      {key: 'No.', width: 5},
      {key: 'Descripción', width: 35},
      {key: 'Estado', width: 12, outlineLevel: 1},
      {key: 'Funcionamiento', width: 18, outlineLevel: 1}
    ];

    worksheet.getCell('A6').value  = 'i';
    worksheet.mergeCells('B6:D6');
    worksheet.getCell('D6').value  = 'Empresa Operadora: ' + users.EmpresaOperadora;
    worksheet.getCell('A7').value  = 'ii';
    worksheet.mergeCells('B7:D7');
    worksheet.getCell('D7').value  = 'Año: ' + users.AñoM ;
    worksheet.getCell('A8').value  = 'iii';
    worksheet.mergeCells('B8:D8');
    worksheet.getCell('D8').value  = 'Motor eléctrico No.: ' + users.MotorElectrico; 
    worksheet.getCell('A9').value  = 'iv';
    worksheet.mergeCells('B9:D9');
    worksheet.getCell('D9').value  = 'Carrocería No.: ' + users.Carroceria;
    worksheet.getCell('A10').value  = 'v';
    worksheet.mergeCells('B10:D10');
    worksheet.getCell('D10').value  = 'Lectura del odómetro.: ' + users.LecturaOdometro;  

    worksheet.getCell('E6').value  = 'vi';
    worksheet.mergeCells('F6:H6');
    worksheet.getCell('H6').value  = 'Modelo: ' + users.Modelo;
    worksheet.getCell('E7').value  = 'vii';
    worksheet.mergeCells('F7:H7');
    worksheet.getCell('H7').value  = 'Motor No.: ' + users.Motor;
    worksheet.getCell('E8').value  = 'viii';
    worksheet.mergeCells('F8:H8');
    worksheet.getCell('H8').value  = 'Chasis No..: ' + users.Chasis; 
    worksheet.getCell('E9').value  = 'ix';
    worksheet.mergeCells('F9:H9');
    worksheet.getCell('H9').value  = 'Transmisión No.: ' + users.Transmision;
    worksheet.getCell('E10').value  = 'x';
    worksheet.mergeCells('F10:H10');
    worksheet.getCell('H10').value  = 'Tipo de Autobús.: ' + users.Tipo;  

    //Header de la tabla
    worksheet.getCell('A12').value  = 'No.';   
    worksheet.getCell('B12').value  = 'Descripción';
    worksheet.getCell('C12').value  = 'Estado';
    worksheet.getCell('D12').value  = 'Funcionamiento';
    worksheet.getCell('E12').value  = 'No.'; 
    worksheet.getCell('F12').value  = 'Descripción';
    worksheet.getCell('G12').value  = 'Estado';
    worksheet.getCell('H12').value  = 'Funcionamiento';

    //Campos del 1 al 43
    worksheet.getCell('A13').value  = '1';   
    worksheet.getCell('B13').value  = 'Señalización interior y exterior';
    worksheet.getCell('C13').value  = users.SeñalInteriorExterior;
    worksheet.getCell('D13').value  = users.SeñalInteriorExteriorValue;
    worksheet.getCell('E13').value  = '23'; 
    worksheet.getCell('F13').value  = 'Sistema de aire comprimido';
    worksheet.getCell('G13').value  = users.AireComprimido;
    worksheet.getCell('H13').value  = users.AireComprimidoValue;  

    worksheet.getCell('A14').value  = '2';   
    worksheet.getCell('B14').value  = 'Número Económico de la Unidad';
    worksheet.getCell('C14').value  = users.Economico;
    worksheet.getCell('D14').value  = users.EconomicoValue;
    worksheet.getCell('E14').value  = '24'; 
    worksheet.getCell('F14').value  = 'Sistema Híbrido';
    worksheet.getCell('G14').value  = users.Hibrido;
    worksheet.getCell('H14').value  = users.HibridoValue;

    worksheet.getCell('A15').value  = '3';   
    worksheet.getCell('B15').value  = 'Laminación y pintura exterior e interior de la Unidad';
    worksheet.getCell('C15').value  = users.LaminacionPinturaExterior;
    worksheet.getCell('D15').value  = users.LaminacionPinturaExteriorValue;
    worksheet.getCell('E15').value  = '25'; 
    worksheet.getCell('F15').value  = 'Transmisión';
    worksheet.getCell('G15').value  = users.Transmision2;
    worksheet.getCell('H15').value  = users.Transmision2Value;  

    worksheet.getCell('A16').value  = '4';   
    worksheet.getCell('B16').value  = 'Defensas';
    worksheet.getCell('C16').value  = users.Defensas;
    worksheet.getCell('D16').value  = users.DefensasValue;
    worksheet.getCell('E16').value  = '26'; 
    worksheet.getCell('F16').value  = 'Sistema de enfriamiento';
    worksheet.getCell('G16').value  = users.Enfriamiento;
    worksheet.getCell('H16').value  = users.EnfriamientoValue;

    worksheet.getCell('A17').value  = '5';   
    worksheet.getCell('B17').value  = 'Chasis y gancho de arrastre';
    worksheet.getCell('C17').value  = users.ChasisGancho;
    worksheet.getCell('D17').value  = users.ChasisGanchoValue;
    worksheet.getCell('E17').value  = '27'; 
    worksheet.getCell('F17').value  = 'Ignición del autobús';
    worksheet.getCell('G17').value  = users.Ignicion;
    worksheet.getCell('H17').value  = users.IgnicionValue;

    worksheet.getCell('A18').value  = '6';   
    worksheet.getCell('B18').value  = 'Puertas';
    worksheet.getCell('C18').value  = users.Puertas;
    worksheet.getCell('D18').value  = users.PuertasValue;
    worksheet.getCell('E18').value  = '28'; 
    worksheet.getCell('F18').value  = 'Panel o Tablero de Instrumentos';
    worksheet.getCell('G18').value  = users.Tablero;
    worksheet.getCell('H18').value  = users.TableroValue;

    worksheet.getCell('A19').value  = '7';   
    worksheet.getCell('B19').value  = 'Cristales del parabrisas';
    worksheet.getCell('C19').value  = users.CristalesParabrisas;
    worksheet.getCell('D19').value  = users.CristalesParabrisasValue;
    worksheet.getCell('E19').value  = '29'; 
    worksheet.getCell('F19').value  = 'Sistema Eléctrico';
    worksheet.getCell('G19').value  = users.Electrico;
    worksheet.getCell('H19').value  = users.ElectricoValue;

    worksheet.getCell('A20').value  = '8';   
    worksheet.getCell('B20').value  = 'Limpiaparabrisas';
    worksheet.getCell('C20').value  = users.Limpiaparabrisas;
    worksheet.getCell('D20').value  = users.LimpiaparabrisasValue;
    worksheet.getCell('E20').value  = '30'; 
    worksheet.getCell('F20').value  = 'Letrero electrónico de ruta';
    worksheet.getCell('G20').value  = users.LetreroRuta;
    worksheet.getCell('H20').value  = users.LetreroRutaValue;

    worksheet.getCell('A21').value  = '9';   
    worksheet.getCell('B21').value  = 'Cristales de ventanillas, ventilas y emergencia';
    worksheet.getCell('C21').value  = users.CristalesVentanillas;
    worksheet.getCell('D21').value  = users.CristalesVentanillasValue;
    worksheet.getCell('E21').value  = '31'; 
    worksheet.getCell('F21').value  = 'Claxon';
    worksheet.getCell('G21').value  = users.Claxon;
    worksheet.getCell('H21').value  = users.ClaxonValue;

    worksheet.getCell('A22').value  = '10';   
    worksheet.getCell('B22').value  = 'Cristal de medallón';
    worksheet.getCell('C22').value  = users.CristalMedallon;
    worksheet.getCell('D22').value  = users.CristalMedallonValue;
    worksheet.getCell('E22').value  = '32'; 
    worksheet.getCell('F22').value  = 'Sistema desempeñante del parabrisas';
    worksheet.getCell('G22').value  = users.SistemaDesempañante;
    worksheet.getCell('H22').value  = users.SistemaDesempañanteValue;

    worksheet.getCell('A23').value  = '11';   
    worksheet.getCell('B23').value  = 'Espejos';
    worksheet.getCell('C23').value  = users.Espejos;
    worksheet.getCell('D23').value  = users.EspejosValue;
    worksheet.getCell('E23').value  = '33'; 
    worksheet.getCell('F23').value  = 'Sistema de aire acondicionado';
    worksheet.getCell('G23').value  = users.SistemaAire;
    worksheet.getCell('H23').value  = users.SistemaAireValue;

    worksheet.getCell('A24').value  = '12';   
    worksheet.getCell('B24').value  = 'Visera o Parasol';
    worksheet.getCell('C24').value  = users.Visera;
    worksheet.getCell('D24').value  = users.ViseraValue;
    worksheet.getCell('E24').value  = '34'; 
    worksheet.getCell('F24').value  = 'Extractores y ventiladores';
    worksheet.getCell('G24').value  =  users.Extractores;
    worksheet.getCell('H24').value  =  users.ExtractoresValue;

    worksheet.getCell('A25').value  = '13';   
    worksheet.getCell('B25').value  = 'Asiento del conductor';
    worksheet.getCell('C25').value  =  users.AsientoConductor;
    worksheet.getCell('D25').value  =  users.AsientoConductorValue;
    worksheet.getCell('E25').value  = '35'; 
    worksheet.getCell('F25').value  = 'Alumbrado exterior e interior';
    worksheet.getCell('G25').value  =  users.AlumbradoEI;
    worksheet.getCell('H25').value  =  users.AlumbradoEIValue;

    worksheet.getCell('A26').value  = '14';   
    worksheet.getCell('B26').value  = 'Asiento de pasajero';
    worksheet.getCell('C26').value  =  users.AsientosPasajeros;
    worksheet.getCell('D26').value  =  users.AsientosPasajerosValue;
    worksheet.getCell('E26').value  = '36'; 
    worksheet.getCell('F26').value  = 'Frenos';
    worksheet.getCell('G26').value  =  users.Frenos;
    worksheet.getCell('H26').value  =  users.FrenosValue;

    worksheet.getCell('A27').value  = '15';   
    worksheet.getCell('B27').value  = 'Elementos de sujeción';
    worksheet.getCell('C27').value  =  users.ElementosSujección;
    worksheet.getCell('D27').value  =  users.ElementosSujecciónValue;
    worksheet.getCell('E27').value  = '37'; 
    worksheet.getCell('F27').value  = 'Caja de Dirección y Soportes';
    worksheet.getCell('G27').value  =  users.CajaDireccion;
    worksheet.getCell('H27').value  =  users.CajaDireccionValue;

    worksheet.getCell('A28').value  = '16';   
    worksheet.getCell('B28').value  = 'Escotillas o fallebas';
    worksheet.getCell('C28').value  =  users.EscotillasValue;
    worksheet.getCell('D28').value  =  users.EscotillasValue;
    worksheet.getCell('E28').value  = '38'; 
    worksheet.getCell('F28').value  = 'Suspensión';
    worksheet.getCell('G28').value  =  users.Suspension;
    worksheet.getCell('H28').value  =  users.SuspensionValue;

    worksheet.getCell('A29').value  = '17';   
    worksheet.getCell('B29').value  = 'Extintores';
    worksheet.getCell('C29').value  =  users.Extintores;
    worksheet.getCell('D29').value  =  users.ExtintoresValue;
    worksheet.getCell('E29').value  = '39'; 
    worksheet.getCell('F29').value  = 'Tubo de escape y silenciador';
    worksheet.getCell('G29').value  =  users.TuboEscape;
    worksheet.getCell('H29').value  =  users.TuboEscapeValue;

    worksheet.getCell('A30').value  = '18';   
    worksheet.getCell('B30').value  = 'Botiquín';
    worksheet.getCell('C30').value  =  users.Botiquin;
    worksheet.getCell('D30').value  =  users.BotiquinValue;
    worksheet.getCell('E30').value  = '40'; 
    worksheet.getCell('F30').value  = 'Sistema de Recaudo';
    worksheet.getCell('G30').value  =  users.SistemaRecaudo;
    worksheet.getCell('H30').value  =  users.SistemaRecaudoValue;

    worksheet.getCell('A31').value  = '19';   
    worksheet.getCell('B31').value  = 'Accesorios de seguridad vial';
    worksheet.getCell('C31').value  =  users.AccesoriosSeguridad;
    worksheet.getCell('D31').value  =  users.AccesoriosSeguridadValue;
    worksheet.getCell('E31').value  = '41'; 
    worksheet.getCell('F31').value  = 'Sistema de Telemática';
    worksheet.getCell('G31').value  =  users.SistemaTelematica;
    worksheet.getCell('H31').value  =  users.SistemaTelematicaValue;

    worksheet.getCell('A32').value  = '20';   
    worksheet.getCell('B32').value  = 'Pisos';
    worksheet.getCell('C32').value  =  users.Pisos;
    worksheet.getCell('D32').value  =  users.PisosValue;
    worksheet.getCell('E32').value  = '42'; 
    worksheet.getCell('F32').value  = 'Tanque de Combustible y Urea';
    worksheet.getCell('G32').value  =  users.TanqueCombustible;
    worksheet.getCell('H32').value  =  users.TanqueCombustibleValue;

    worksheet.getCell('A33').value  = '21';   
    worksheet.getCell('B33').value  = 'Articulación';
    worksheet.getCell('C33').value  =  users.Articulacion;
    worksheet.getCell('D33').value  =  users.ArticulacionValue;
    worksheet.getCell('E33').value  = '43'; 
    worksheet.getCell('F33').value  = 'Neumáticos y sistema de control de presión';
    worksheet.getCell('G33').value  =  users.NeumaticoSisControl;
    worksheet.getCell('H33').value  =  users.NeumaticoSisControlValue;

    worksheet.getCell('A34').value  = '22';   
    worksheet.getCell('B34').value  = 'Motor';
    worksheet.getCell('C34').value  =  users.Motor2;
    worksheet.getCell('D34').value  =  users.Motor2Value;




    worksheet.mergeCells('A36:H36');
    worksheet.getRow(36).height = 200;
    worksheet.getCell('H36').value  = 'Observaciones: ' + users.Observaciones;

    worksheet.mergeCells('C38:E38');
    worksheet.getCell('B38').value  = 'Fecha';
    worksheet.getCell('E38').value  =  users.Dia + ' / ' + users.Mes + ' / ' + users.Año;

    
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

    worksheet.getCell('D6').alignment = { vertical: 'middle', horizontal: 'left' };
    worksheet.getCell('H6').alignment = { vertical: 'middle', horizontal: 'left' };
    worksheet.getCell('D7').alignment = { vertical: 'middle', horizontal: 'left' };
    worksheet.getCell('H7').alignment = { vertical: 'middle', horizontal: 'left' };
    worksheet.getCell('D8').alignment = { vertical: 'middle', horizontal: 'left' };
    worksheet.getCell('H8').alignment = { vertical: 'middle', horizontal: 'left' };
    worksheet.getCell('D9').alignment = { vertical: 'middle', horizontal: 'left' };
    worksheet.getCell('H9').alignment = { vertical: 'middle', horizontal: 'left' };
    worksheet.getCell('D10').alignment = { vertical: 'middle', horizontal: 'left' };
    worksheet.getCell('H10').alignment = { vertical: 'middle', horizontal: 'left' };
    worksheet.getCell('H39').alignment = { vertical: 'top', horizontal: 'left' };

    await workbook.xlsx.writeFile(path.join(__dirname, '../Documents/Cedularti/') + req.body.Carroceria + ".xlsx");
    console.log("Excel creado");

    })
    .catch(err => {
        console.log(err)
      res.send('error: ' + err)
    })

})

revtecini.post('/getData', (req,res) => {    
    RevTecIni.findAll()
    .then(obj=>{
            console.log("Datos...")
//            console.log(obj)
            let obj1 = []
            for(var a in obj)
	    {
		let ru = "../Documents/Cedularti/" + obj[a].Carroceria + ".pdf"
	        let rux = "/revtecinicial/fetch-excel"
		let aux = {
			NombrePDF: obj[a].Carroceria,
			Ruta: ru,
            RutaExcel: rux
		}
                obj1.push(aux)
                console.log("Data: " + obj[a].Carroceria)
            }
            console.log("Datos mostrados...")
            res.send({success:true, data:obj1});
        })
        .catch(err=>{
            res.send({success:false, message:err});
        })
})

revtecini.get('/fetch-pdf', async(req,res) => {
    console.log(req.query.PDF)
    var pdfName = req.query.PDF+".pdf"
    console.log(pdfName)
    var aux = path.join(__dirname,'../', 'Documents/Cedularti/', pdfName)
    //console.log(aux)
    res.sendFile(aux)
})

revtecini.get('/fetch-excel', async(req,res) => {
    console.log(req.query.PDF)
    var pdfName = req.query.PDF+".xlsx"
    console.log(pdfName)
    var aux = path.join(__dirname,'../', 'Documents/Cedularti/', pdfName)
    //console.log(aux)
    res.sendFile(aux)
})

module.exports = revtecini

