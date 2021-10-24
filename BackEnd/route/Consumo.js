const path = require('path')
const express = require("express")
const ExcelJS = require('exceljs')
const consumo = express.Router()
const fotos = express.Router()
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
const Consumo = require('../Models/Consumo.js')
consumo.use(cors())

process.env.SECRET_KEY = 'secret'

consumo.post('/consumo',async (req, res) => {
    const today = new Date().toJSON()
    const formData = {
        NumeroEconomico: req.body.NumeroEconomico,
        Mes: req.body.Mes,
        Año: req.body.Año,
        Consumo: req.body.Consumo,
        Modulo: req.body.Modulo
    }
    Consumo.findOne({
        where: { 
            NumeroEconomico: req.body.NumeroEconomico,
            Mes: req.body.Mes,
            Año: req.body.Año,
            Consumo: req.body.Consumo
        }
    })
    .then(consumo => {
        if (!consumo) {
            Consumo.create(formData)
            .then(consumo => {
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

consumo.post('/getData', (req,res) => {    
    let año = []
    Consumo.findAll()
    .then(obj=>{
            let año = []
            let añoA = 0
            obj.sort(function (a, b) {
            if (a.Año > b.Año) {
                return 1;
            }
            if (a.Año < b.Año) {
                return -1;
            }
            // a must be equal to b
            return 0;
            });            
            for(let valor in obj){
                if(añoA != obj[valor].Año){ 
                    let data = {
                        NombrePDF: "Consumo-de-Combustible" + obj[valor].Año,
                        Ruta: "/Consumo/fetch-pdf",
                        RutaExcel: "/Consumo/fetch-excel"
                    }                   
                    añoA = obj[valor].Año
                    año.push(data)
                }
            }
            res.send({success:true, data:año});
        })
        .catch(err=>{
            res.send({success:false, message:err});
        })
})

consumo.post('/ConsumoExcel', (req,res) => {
    console.log(req.body.Año)
    Consumo.findAll({
        where: {
            Año: req.body.Año
        }
    })
    .then(async(obj)=>{
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
                    Mes: obj[valor].Mes,
                    Año: obj[valor].Año,
                    Consumo: obj[valor].Consumo,
                    Modulo: obj[valor].Año,
                }
                users.push(objeto)
            }
            users.sort(function (a, b) {
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

            let NumeroEconomicoRef = users[0].NumeroEconomico
            let ConsumoEneroRef = 0
            let ConsumoFebreroRef = 0
            let ConsumoMarzoRef = 0
            let ConsumoAbrilRef = 0
            let ConsumoMayoRef = 0
            let ConsumoJunioRef = 0
            let ConsumoJulioRef = 0
            let ConsumoAgostoRef = 0
            let ConsumoSeptiembreRef = 0
            let ConsumoOctubreRef = 0
            let ConsumoNoviembreRef = 0
            let ConsumoDiciembreRef = 0
            let ConsumoTotalRef = 0
            for(const valor in users)
            {
                if(NumeroEconomicoRef != users[valor].NumeroEconomico)
                {
                    var objeto = {
                        NumeroEconomico: NumeroEconomicoRef,
                        ConsumoEnero: ConsumoEneroRef,
                        ConsumoFebrero: ConsumoFebreroRef,
                        ConsumoMarzo: ConsumoMarzoRef,
                        ConsumoAbril: ConsumoAbrilRef,
                        ConsumoMayo: ConsumoMayoRef,
                        ConsumoJunio: ConsumoJunioRef,
                        ConsumoJulio: ConsumoJulioRef,
                        ConsumoAgosto: ConsumoAgostoRef,
                        ConsumoSeptiembre: ConsumoSeptiembreRef,
                        ConsumoOctubre: ConsumoOctubreRef,
                        ConsumoNoviembre: ConsumoNoviembreRef,
                        ConsumoDiciembre: ConsumoDiciembreRef,
                        ConsumoTotal: ConsumoTotalRef,
                        Año: req.body.Año
                    }
                    if(NumeroEconomicoRef != " ")
                        user.push(objeto)
                    
                    NumeroEconomicoRef = users[valor].NumeroEconomico
                    ConsumoEneroRef = 0
                    ConsumoFebreroRef = 0
                    ConsumoMarzoRef = 0
                    ConsumoAbrilRef = 0
                    ConsumoMayoRef = 0
                    ConsumoJunioRef = 0
                    ConsumoJulioRef = 0
                    ConsumoAgostoRef = 0
                    ConsumoSeptiembreRef = 0
                    ConsumoOctubreRef = 0
                    ConsumoNoviembreRef = 0
                    ConsumoDiciembreRef = 0
                    ConsumoTotalRef = 0
                }
                if(users[valor].Mes == "Enero")
                {
                    ConsumoEneroRef = users[valor].Consumo
                    ConsumoTotalRef += users[valor].Consumo
                }
                else if(users[valor].Mes == "Febrero")
                {
                    ConsumoTotalRef += users[valor].Consumo
                    ConsumoFebreroRef = users[valor].Consumo
                }
                else if(users[valor].Mes == "Marzo")
                {
                    ConsumoTotalRef += users[valor].Consumo
                    ConsumoMarzoRef = users[valor].Consumo
                }
                else if(users[valor].Mes == "Abril")
                {
                    ConsumoTotalRef += users[valor].Consumo
                    ConsumoAbrilRef = users[valor].Consumo
                }
                else if(users[valor].Mes == "Mayo")
                {
                    ConsumoTotalRef += users[valor].Consumo
                    ConsumoMayoRef = users[valor].Consumo
                }
                else if(users[valor].Mes == "Junio")
                {
                    ConsumoTotalRef += users[valor].Consumo
                    ConsumoJunioRef = users[valor].Consumo
                }
                else if(users[valor].Mes == "Julio")
                {
                    ConsumoTotalRef += users[valor].Consumo
                    ConsumoJulioRef = users[valor].Consumo
                }
                else if(users[valor].Mes == "Agosto")
                {
                    ConsumoTotalRef += users[valor].Consumo
                    ConsumoAgostoRef = users[valor].Consumo
                }
                else if(users[valor].Mes == "Septiembre")
                {
                    ConsumoTotalRef += users[valor].Consumo
                    ConsumoSeptiembreRef = users[valor].Consumo
                }
                else if(users[valor].Mes == "Octubre")
                {
                    ConsumoTotalRef += users[valor].Consumo
                    ConsumoOctubreRef = users[valor].Consumo
                }
                else if(users[valor].Mes == "Noviembre")
                {
                    ConsumoTotalRef += users[valor].Consumo
                    ConsumoNoviembreRef = users[valor].Consumo
                }
                else if(users[valor].Mes == "Diciembre")
                {
                    ConsumoTotalRef += users[valor].Consumo
                    ConsumoDiciembreRef = users[valor].Consumo
                } 
            }
            if(users[users.length-1].Mes == "Enero")
            {
                ConsumoEneroRef = users[users.length-1].Consumo
                ConsumoTotalRef += users[users.length-1].Consumo
            }
            else if(users[users.length-1].Mes == "Febrero")
            {
                ConsumoTotalRef += users[users.length-1].Consumo
                ConsumoFebreroRef = users[users.length-1].Consumo
            }
            else if(users[users.length-1].Mes == "Marzo")
            {
                ConsumoTotalRef += users[users.length-1].Consumo
                ConsumoMarzoRef = users[users.length-1].Consumo
            }
            else if(users[users.length-1].Mes == "Abril")
            {
                ConsumoTotalRef += users[users.length-1].Consumo
                ConsumoAbrilRef = users[users.length-1].Consumo
            }
            else if(users[users.length-1].Mes == "Mayo")
            {
                ConsumoTotalRef += users[users.length-1].Consumo
                ConsumoMayoRef = users[users.length-1].Consumo
            }
            else if(users[users.length-1].Mes == "Junio")
            {
                ConsumoTotalRef += users[users.length-1].Consumo
                ConsumoJunioRef = users[users.length-1].Consumo
            }
            else if(users[users.length-1].Mes == "Julio")
            {
                ConsumoTotalRef += users[users.length-1].Consumo
                ConsumoJulioRef = users[users.length-1].Consumo
            }
            else if(users[users.length-1].Mes == "Agosto")
            {
                ConsumoTotalRef += users[users.length-1].Consumo
                ConsumoAgostoRef = users[users.length-1].Consumo
            }
            else if(users[users.length-1].Mes == "Septiembre")
            {
                ConsumoTotalRef += users[users.length-1].Consumo
                ConsumoSeptiembreRef = users[users.length-1].Consumo
            }
            else if(users[users.length-1].Mes == "Octubre")
            {
                ConsumoTotalRef += users[users.length-1].Consumo
                ConsumoOctubreRef = users[users.length-1].Consumo
            }
            else if(users[users.length-1].Mes == "Noviembre")
            {
                ConsumoTotalRef += users[users.length-1].Consumo
                ConsumoNoviembreRef = users[users.length-1].Consumo
            }
            else if(users[users.length-1].Mes == "Diciembre")
            {
                ConsumoTotalRef += users[users.length-1].Consumo
                ConsumoDiciembreRef = users[users.length-1].Consumo
            }
    //          console.log("Hola: "+users[users.length-1].Consumo)
            var objeto = {
                NumeroEconomico: NumeroEconomicoRef,
                ConsumoEnero: ConsumoEneroRef,
                ConsumoFebrero: ConsumoFebreroRef,
                ConsumoMarzo: ConsumoMarzoRef,
                ConsumoAbril: ConsumoAbrilRef,
                ConsumoMayo: ConsumoMayoRef,
                ConsumoJunio: ConsumoJunioRef,
                ConsumoJulio: ConsumoJulioRef,
                ConsumoAgosto: ConsumoAgostoRef,
                ConsumoSeptiembre: ConsumoSeptiembreRef,
                ConsumoOctubre: ConsumoOctubreRef,
                ConsumoNoviembre: ConsumoNoviembreRef,
                ConsumoDiciembre: ConsumoDiciembreRef,
                ConsumoTotal: ConsumoTotalRef,
                Año: req.body.Año
            }
            if(NumeroEconomicoRef != " ")
                user.push(objeto)

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

            var imageID = workbook.addImage({
                /*filename: 'Logo_CDMX.png',
                extension: 'png',*/
                base64: bufferBase64,
            	extension: tipo
    	    });
            worksheet.addImage(imageID, 'A1:D3');
            worksheet.mergeCells('A4:N4');
            worksheet.getCell('A4').value = 'Consumo de Diesel '+ req.body.Año;

            worksheet.columns = [
            {key: 'modulo', width: 15},
            {key: 'eco', width: 15},
            {key: 'enero', width: 10, outlineLevel: 1},
            {key: 'febrero', width: 10, outlineLevel: 1},
            {key: 'marzo', width: 10, outlineLevel: 1},
            {key: 'abril', width: 10, outlineLevel: 1},
            {key: 'mayo', width: 10, outlineLevel: 1},
            {key: 'junio', width: 10, outlineLevel: 1},
            {key: 'julio', width: 10, outlineLevel: 1},
            {key: 'agosto', width: 10, outlineLevel: 1},
            {key: 'septiembre', width: 12, outlineLevel: 1},
            {key: 'octubre', width: 12, outlineLevel: 1},
            {key: 'noviembre', width: 12, outlineLevel: 1},
            {key: 'diciembre', width: 12, outlineLevel: 1},
            {key: 'total', width: 10, outlineLevel: 1}
            ];
            worksheet.mergeCells('A5:A6');
            worksheet.mergeCells('B5:B6');
            worksheet.mergeCells('C5:C6');
            worksheet.mergeCells('D5:D6');
            worksheet.mergeCells('E5:E6');
            worksheet.mergeCells('F5:F6');
            worksheet.mergeCells('G5:G6');
            worksheet.mergeCells('H5:H6');
            worksheet.mergeCells('I5:I6');
            worksheet.mergeCells('J5:J6');
            worksheet.mergeCells('K5:K6');
            worksheet.mergeCells('L5:L6');
            worksheet.mergeCells('M5:M6');
            worksheet.mergeCells('N5:N6');
 //           worksheet.mergeCells('O5:O6');

            worksheet.autoFilter = 'A6:N6';


            //worksheet.getCell('A6').value  = 'Módulo';
            worksheet.getCell('A6').value  = 'N° Eco.';
            worksheet.getCell('B6').value  = 'Enero ' + req.body.Año;
            worksheet.getCell('C6').value  = 'Febrero ' + req.body.Año;
            worksheet.getCell('D6').value  = 'Marzo ' + req.body.Año;
            worksheet.getCell('E6').value  = 'Abril ' + req.body.Año;
            worksheet.getCell('F6').value  = 'Mayo ' + req.body.Año;;
            worksheet.getCell('G6').value  = 'Junio ' + req.body.Año;;
            worksheet.getCell('H6').value  = 'Julio ' + req.body.Año;;
            worksheet.getCell('I6').value  = 'Agosto ' + req.body.Año;;
            worksheet.getCell('J6').value  = 'Septiembre ' + req.body.Año;;
            worksheet.getCell('K6').value  = 'Octubre ' + req.body.Año;;
            worksheet.getCell('L6').value  = 'Noviembre ' + req.body.Año;;
            worksheet.getCell('M6').value  = 'Diciembre ' + req.body.Año;;
            worksheet.getCell('N6').value  = 'Total';        
            
            for(const j in user)
            {
                console.log(user[j].NumeroEconomico + ':'+ user[j].ConsumoTotal)
		let total = user[j].NumeroEconomico + user[j].ConsumoEnero + user[j].ConsumoFebrero + user[j].ConsumoMarzo + user[j].ConsumoAbril + user[j].ConsumoMayo + user[j].ConsumoJunio + user[j].ConsumoJulio + user[j].ConsumoAgosto + user[j].ConsumoSeptiembre + user[j].ConsumoOctubre + user[j].ConsumoNoviembre + user[j].ConsumoDiciembre
                worksheet.addRow([user[j].NumeroEconomico,user[j].ConsumoEnero,user[j].ConsumoFebrero,user[j].ConsumoMarzo,user[j].ConsumoAbril,user[j].ConsumoMayo,user[j].ConsumoJunio,user[j].ConsumoJulio,user[j].ConsumoAgosto,user[j].ConsumoSeptiembre,user[j].ConsumoOctubre,user[j].ConsumoNoviembre,user[j].ConsumoDiciembre,user[j].ConsumoTotal])
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

            await workbook.xlsx.writeFile(path.join(__dirname, '../Documents/Consumo/Consumo-de-Combustible') + req.body.Año + ".xslx");
            console.log("Excel creado");
      
            res.send({success:true, data:users});
        })
        .catch(err => {
            console.log(err)
          res.send('error: ' + err)
        })
    })
    .catch(err=>{
        console.log(err)
        res.send({success:false, message:err});
    })
})



consumo.post('/ConsumoPDF', (req,res) => {
	console.log(req.body.Año)
    Consumo.findAll({
        where: {
            Año: req.body.Año
        }
    })
    .then(obj=>{
        //Aqui va la funcion de PDF con los datos del mes correspondiente
        var html = fs.readFileSync(path.join(__dirname, '../')+'/Documents/Templates/Consumo_de_Gasolina.html','utf-8');
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
	var users=[]
        for(const valor in obj){
            var objeto = {
                NumeroEconomico: obj[valor].NumeroEconomico,
                Mes: obj[valor].Mes,
                Año: obj[valor].Año,
                Consumo: obj[valor].Consumo,
                Modulo: obj[valor].Año,
            }
            users.push(objeto)
        }
        users.sort(function (a, b) {
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

        let NumeroEconomicoRef = users[0].NumeroEconomico
        let ConsumoEneroRef = 0
        let ConsumoFebreroRef = 0
        let ConsumoMarzoRef = 0
        let ConsumoAbrilRef = 0
        let ConsumoMayoRef = 0
        let ConsumoJunioRef = 0
        let ConsumoJulioRef = 0
        let ConsumoAgostoRef = 0
        let ConsumoSeptiembreRef = 0
        let ConsumoOctubreRef = 0
        let ConsumoNoviembreRef = 0
        let ConsumoDiciembreRef = 0
        let ConsumoTotalRef = 0
	console.log(users.length)
        for(const valor in users)
        {
//		console.log(users[valor].NumeroEconomico+' '+users[valor].Consumo + ' '+users[valor].Mes)
		if(NumeroEconomicoRef != users[valor].NumeroEconomico)
    		{
    			var objeto = {
		                NumeroEconomico: NumeroEconomicoRef,
			        ConsumoEnero: ConsumoEneroRef,
			        ConsumoFebrero: ConsumoFebreroRef,
			        ConsumoMarzo: ConsumoMarzoRef,
			        ConsumoAbril: ConsumoAbrilRef,
			        ConsumoMayo: ConsumoMayoRef,
			        ConsumoJunio: ConsumoJunioRef,
			        ConsumoJulio: ConsumoJulioRef,
			        ConsumoAgosto: ConsumoAgostoRef,
			        ConsumoSeptiembre: ConsumoSeptiembreRef,
			        ConsumoOctubre: ConsumoOctubreRef,
			        ConsumoNoviembre: ConsumoNoviembreRef,
			        ConsumoDiciembre: ConsumoDiciembreRef,
			        ConsumoTotal: ConsumoTotalRef,
			        Año: req.body.Año
	            	}
	            if(NumeroEconomicoRef != " ")
	            	user.push(objeto)
	            NumeroEconomicoRef = users[valor].NumeroEconomico
		    ConsumoEneroRef = 0
		    ConsumoFebreroRef = 0
		    ConsumoMarzoRef = 0
		    ConsumoAbrilRef = 0
		    ConsumoMayoRef = 0
		    ConsumoJunioRef = 0
		    ConsumoJulioRef = 0
		    ConsumoAgostoRef = 0
		    ConsumoSeptiembreRef = 0
		    ConsumoOctubreRef = 0
		    ConsumoNoviembreRef = 0
		    ConsumoDiciembreRef = 0
		    ConsumoTotalRef = 0
    		}
    			if(users[valor].Mes == "Enero")
    			{
    				ConsumoEneroRef = users[valor].Consumo
    				ConsumoTotalRef += users[valor].Consumo
    			}
    			else if(users[valor].Mes == "Febrero")
    			{
    				ConsumoTotalRef += users[valor].Consumo
    				ConsumoFebreroRef = users[valor].Consumo
    			}
    			else if(users[valor].Mes == "Marzo")
    			{
    				ConsumoTotalRef += users[valor].Consumo
    				ConsumoMarzoRef = users[valor].Consumo
    			}
    			else if(users[valor].Mes == "Abril")
    			{
    				ConsumoTotalRef += users[valor].Consumo
    				ConsumoAbrilRef = users[valor].Consumo
    			}
    			else if(users[valor].Mes == "Mayo")
    			{
    				ConsumoTotalRef += users[valor].Consumo
    				ConsumoMayoRef = users[valor].Consumo
    			}
    			else if(users[valor].Mes == "Junio")
    			{
    				ConsumoTotalRef += users[valor].Consumo
    				ConsumoJunioRef = users[valor].Consumo
    			}
    			else if(users[valor].Mes == "Julio")
    			{
    				ConsumoTotalRef += users[valor].Consumo
    				ConsumoJulioRef = users[valor].Consumo
    			}
    			else if(users[valor].Mes == "Agosto")
    			{
    				ConsumoTotalRef += users[valor].Consumo
    				ConsumoAgostoRef = users[valor].Consumo
    			}
    			else if(users[valor].Mes == "Septiembre")
    			{
    				ConsumoTotalRef += users[valor].Consumo
    				ConsumoSeptiembreRef = users[valor].Consumo
    			}
    			else if(users[valor].Mes == "Octubre")
    			{
    				ConsumoTotalRef += users[valor].Consumo
    				ConsumoOctubreRef = users[valor].Consumo
    			}
    			else if(users[valor].Mes == "Noviembre")
    			{
    				ConsumoTotalRef += users[valor].Consumo
    				ConsumoNoviembreRef = users[valor].Consumo
    			}
    			else if(users[valor].Mes == "Diciembre")
    			{
    				ConsumoTotalRef += users[valor].Consumo
    				ConsumoDiciembreRef = users[valor].Consumo
    			}
    		
        }
			if(users[users.length-1].Mes == "Enero")
    			{
    				ConsumoEneroRef = users[users.length-1].Consumo
    				ConsumoTotalRef += users[users.length-1].Consumo
    			}
    			else if(users[users.length-1].Mes == "Febrero")
    			{
    				ConsumoTotalRef += users[users.length-1].Consumo
    				ConsumoFebreroRef = users[users.length-1].Consumo
    			}
    			else if(users[users.length-1].Mes == "Marzo")
    			{
    				ConsumoTotalRef += users[users.length-1].Consumo
    				ConsumoMarzoRef = users[users.length-1].Consumo
    			}
    			else if(users[users.length-1].Mes == "Abril")
    			{
    				ConsumoTotalRef += users[users.length-1].Consumo
    				ConsumoAbrilRef = users[users.length-1].Consumo
    			}
    			else if(users[users.length-1].Mes == "Mayo")
    			{
    				ConsumoTotalRef += users[users.length-1].Consumo
    				ConsumoMayoRef = users[users.length-1].Consumo
    			}
    			else if(users[users.length-1].Mes == "Junio")
    			{
    				ConsumoTotalRef += users[users.length-1].Consumo
    				ConsumoJunioRef = users[users.length-1].Consumo
    			}
    			else if(users[users.length-1].Mes == "Julio")
    			{
    				ConsumoTotalRef += users[users.length-1].Consumo
    				ConsumoJulioRef = users[users.length-1].Consumo
    			}
    			else if(users[users.length-1].Mes == "Agosto")
    			{
    				ConsumoTotalRef += users[users.length-1].Consumo
    				ConsumoAgostoRef = users[users.length-1].Consumo
    			}
    			else if(users[users.length-1].Mes == "Septiembre")
    			{
    				ConsumoTotalRef += users[users.length-1].Consumo
    				ConsumoSeptiembreRef = users[users.length-1].Consumo
    			}
    			else if(users[users.length-1].Mes == "Octubre")
    			{
    				ConsumoTotalRef += users[users.length-1].Consumo
    				ConsumoOctubreRef = users[users.length-1].Consumo
    			}
    			else if(users[users.length-1].Mes == "Noviembre")
    			{
    				ConsumoTotalRef += users[users.length-1].Consumo
    				ConsumoNoviembreRef = users[users.length-1].Consumo
    			}
    			else if(users[users.length-1].Mes == "Diciembre")
    			{
    				ConsumoTotalRef += users[users.length-1].Consumo
    				ConsumoDiciembreRef = users[users.length-1].Consumo
    			}
//			console.log("Hola: "+users[users.length-1].Consumo)
var objeto = {
                                NumeroEconomico: NumeroEconomicoRef,
                                ConsumoEnero: ConsumoEneroRef,
                                ConsumoFebrero: ConsumoFebreroRef,
                                ConsumoMarzo: ConsumoMarzoRef,
                                ConsumoAbril: ConsumoAbrilRef,
                                ConsumoMayo: ConsumoMayoRef,
                                ConsumoJunio: ConsumoJunioRef,
                                ConsumoJulio: ConsumoJulioRef,
                                ConsumoAgosto: ConsumoAgostoRef,
                                ConsumoSeptiembre: ConsumoSeptiembreRef,
                                ConsumoOctubre: ConsumoOctubreRef,
                                ConsumoNoviembre: ConsumoNoviembreRef,
                                ConsumoDiciembre: ConsumoDiciembreRef,
                                ConsumoTotal: ConsumoTotalRef,
                                Año: req.body.Año
                    }
  //                      console.log(objeto)
                    if(NumeroEconomicoRef != " ")
                        user.push(objeto)

//console.log(user)
		var document = {
            html: html,
            data: {
                users: user,
                Año: req.body.Año
            },
            path:  path.join(__dirname, '../Documents/Consumo/Consumo-de-Combustible') + req.body.Año + ".pdf"
        }
        pdfName = "Consumo"+ req.body.Año
        pdf.create(document,options)
        .then(res => {
            //res.send(Promise.reject());
            console.log("Creado.")
        })
        .catch(error => {
            //res.send(Promise.resolve());
            console.log(error)
        })
        //console.log(user)
        res.send({success:true, data:users});
    })
    .catch(err=>{
    	console.log(err)
        res.send({success:false, message:err});
    })
})

consumo.get('/fetch-excel', async(req,res) => {
    console.log(req.query.PDF)
    var pdfName = req.query.PDF+".xslx"
    console.log(pdfName)
    var aux = path.join(__dirname,'../', 'Documents/Consumo/', pdfName)
    console.log(aux)
    res.sendFile(aux)
})

consumo.get('/fetch-pdf', async(req,res) => {
	console.log(req.query.PDF)
    var pdfName = req.query.PDF+".pdf"
    console.log(pdfName)
    var aux = path.join(__dirname,'../', 'Documents/Consumo/', pdfName)
    console.log(aux)
    res.sendFile(aux)
})

module.exports = consumo

