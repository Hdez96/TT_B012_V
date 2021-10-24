const Sequelize = require('sequelize')
const db = require('../database/db')

module.exports = db.sequelize.define(
	'REFFA',
	{
		NumeroEconomico: {
			primaryKey: true,
			type: Sequelize.STRING
		},
		Kilometraje: {
                        type: Sequelize.DOUBLE
                },
		FechaMantePreventivo: {
			type: Sequelize.DATE
		},
		VerificacionVehicular: {
			type: Sequelize.STRING
		},
		ConsumoPromedioDispCalc: {
			type: Sequelize.DOUBLE
		},
		UltFechaFumigacion: {
			type: Sequelize.DATE
		},
		NotaExtra: {
			type: Sequelize.STRING
		},
		PersonaElaboro: {
			type: Sequelize.STRING
		},
		Fecha: {
			primaryKey: true,
			type: Sequelize.DATE
		},
		Finalizado:{
			type: Sequelize.INTEGER
		},
	},
	{
		timestamps: false,
		freezeTableName: true
	}
)
