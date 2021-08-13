PFLO_configt=new Date().getTime();
PFLO.addVar({"h.t":{{H_T}},"h.cr":"{{H_CR}}"});
PFLO.init({
	"autorun": false,
	"PageParams": {
		"pageGroups": [
			{
				"type": "Regexp",
				"parameter1": "/pages/",
				"parameter2": "FROMSERVER"
			}
		]
	},
	"LOGN": {
		"storeConfig": true
	}
});
