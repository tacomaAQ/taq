  	var xhReq = new XMLHttpRequest();
        xhReq.open("GET", "Device2189.json", false); // Crescent Heights Elementary School
        xhReq.send(null);
        var obj = JSON.parse(xhReq.responseText);
                
        //make a copy of obj so that I can check if its empty or not in order to continue the logic
	
	//const obj = ["2022-05-10 17:24:13", "2022-05-10 17:04:01", "2022-05-10 16:43:49", "2022-05-10 16:23:37", "2022-05-10 16:03:25"];
	//it is in descending order
	const timeArray = [];
	const yearArray = [];
	const monthArray = [];
	const dayArray = [];
	const hourArray = [];
	const minuteArray = [];
	
	const arrayLength = obj.length;
	

	for (let i = 0; i < arrayLength; i++) {
		timeArray[i] = obj[i].readingDateTimeLocal;
	}
	console.log(arrayLength);
	for (let j = 0; j < arrayLength; j++) {
		tempString = timeArray[j];
		yearArray[j] = tempString.substring(0, 4);
		monthArray[j] = (String) (parseInt(tempString.substring(5, 7)) - 1);
		dayArray[j] = tempString.substring(8, 10);
		hourArray[j] = tempString.substring(11, 13);
		minuteArray[j] = tempString.substring(14, 16);



	}
	/*
	console.log(yearArray);
	console.log(monthArray);
	console.log(dayArray);
	console.log(hourArray);
	console.log(minuteArray);
	*/

	dataPointsArray = [];//array, 2022-05-10 17:24:13

	for (k = 0; k < arrayLength; k++) {
		dataPointsArray[k] = {x: new Date( yearArray[k], monthArray[k], dayArray[k], hourArray[k], minuteArray[k] ), y: obj[k].aqi};
	}

		/*
        {x: new Date( Date.UTC(2022, 05, 10, 07,24) ), y: 26 }, //beginning, try to see if I can make this into a for loop
        {x: new Date( Date.UTC(2022, 05, 10, 08,24) ), y: 38  },
        {x: new Date( Date.UTC(2022, 05, 10, 09,24) ), y: 43 },
        {x: new Date( Date.UTC(2022, 05, 10, 10,24) ), y: 29},
        {x: new Date( Date.UTC(2022, 05, 10, 11,24) ), y: 41},
        {x: new Date( Date.UTC(2022, 05, 10, 12,24) ), y: 54},
        {x: new Date( Date.UTC(2022, 05, 10, 13,24) ), y: 66},
        {x: new Date( Date.UTC(2022, 05, 10, 14,24) ), y: 60},
        {x: new Date( Date.UTC(2022, 05, 10, 15,24) ), y: 53},
        {x: new Date( Date.UTC(yearArray[0], monthArray[0], dayArray[0], hourArray[0], minuteArray[0]) ), y: 60} //end
        ]; 
		*/
window.onload = function () {
    var chart = new CanvasJS.Chart("chartContainer",
    {
      title:{
        text: "Crescent Heights Elementary School"
      },

      axisX:{
        //title: "time",
        //gridThickness: 2,
        interval:6, 
        intervalType: "hour",        
        valueFormatString: "hh TT", 
        //labelAngle: -20
      },
      axisY:{
        title: "Hourly Air Quality Index"
      },
      data: [
      {        
        type: "line",
        dataPoints: dataPointsArray //Array I made
      }
      ]
    });

chart.render();
}