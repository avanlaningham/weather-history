var request = require('request');
var parser = require('xml2json');
var moment=require('moment');
var Promise = require('bluebird');

exports.getWeatherHistory = function(lat,lon, timeIn,apiKey){
	var time = moment(timeIn,'YYYY-MM-DD HH:mm');
	var date = time.format('YYYY-MM-DD');
	var hourIn = time.hour();
	var query=lat +',' + lon;
	var url="https://api.apixu.com/v1/history.xml?key=" + apiKey + " &q="+ query +"&dt=" + date;
	return new Promise(function(resolve, reject){
		request(url, function (error, response, body) {
			var jsonStr = parser.toJson(body);
			var json = JSON.parse(jsonStr);
			if (!isObject(json.root)){
				var weather={};
				weather.temp_c=15;
				weather.isValid=false;
				resolve(weather); //set default temp to 15 if unknown
			}else{
				var history = json.root.forecast;
				var hourArray =history.forecastday.hour;
				var final;
				var weather={};
				for(var i in hourArray){
					var obj = hourArray[i];
					var objOut={};
					var time = moment(obj.time,'YYYY-MM-DD HH:mm');//2017-07-20 23:00
					objOut.isValid=true;
					objOut.time =time.toDate();
					objOut.hour = time.hour();
					objOut.temp_c=obj.temp_c;
					objOut.feelslike_c=obj.feelslike_c;
					objOut.humidity = obj.humidity;
					objOut.wind_kph = obj.wind_kph;
					objOut.wind_degree = obj.wind_degree;

					if (objOut.hour==hourIn){
						weather = objOut;
					}
				}

				resolve(weather);
			}
		});

	});//
}

function isObject(obj) {
  return obj === Object(obj);
}



