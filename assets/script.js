const key = "e1014510ebbf942b1f1d07d44fa4f59b";
const now = moment();
let id = 0;
let cityList = JSON.parse(localStorage.getItem("cityList")) || [];
//let cityList = [];

let lat;
let lon;
let queryURL;
let todayDate;
let temperature;
let humidity;
let windSpeed;
let uvIndex;
let cityName;
let stateCode;
let dateString;
let dayOfMonth;
let month;
let year;
let weatherType;
let weatherIcon;
let input;
let nameFixer;
let fixedName;

function populateCurrent(cityName, stateCode) {
    
    queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName},${stateCode},US&appid=${key}`;

            $.ajax({
                url: queryURL,
                method: "GET",
            }).then(function (data) {
                lon = data.coord.lon;
                lat = data.coord.lat;
                queryURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&appid=${key}`
                
                $.ajax({
                    url: queryURL,
                    method: "GET",
                }).then(function (data) {

                    $("#current").empty();
                    $("#fiveday").empty();

                    console.log(data);

                    uvIndex = data.current.uvi;
                    dateString = `(${now.format("M")}/${now.format("D")}/${now.format("YYYY")})`; 

                    if (nameFixer == true) {
                        cityName = fixedName;
                    }

                    console.log(data);
                    weatherType = data.current.weather[0].main;
                    determineIcon(weatherType);

                    $("#current").append($(`
                        <h2>${cityName} ${dateString}</h2>
                        <i class="${weatherIcon}"></i>
                        <p>Temperature: ${data.current.temp} °F</p>
                        <p>Humidity: ${data.current.humidity}%</p>
                        <p>Wind Speed: ${data.current.wind_speed} MPH</p>
                        <p>UV Index: <span id="UVI">${uvIndex}</span></p>
                    `))

                    if (uvIndex <= 2) {
                        $("#UVI").css("background-color", "green");
                    }
                    else if (uvIndex >= 8) {
                        $("#UVI").css("background-color", "red");
                    }
                    else {
                        $("#UVI").css("background-color", "orange");
                    }

                    populateFiveday(data);
                })

            }) 
}

function determineIcon(weatherType) {
    if (weatherType == "Clear") {
        weatherIcon = "fas fa-sun sunny";
    }
    else if (weatherType == "Rain") {
        weatherIcon = "fas fa-cloud-rain rainy";
    }
    else if (weatherType == "Clouds") {
        weatherIcon = "fas fa-cloud-sun cloudy";
    }
    else {
        weatherIcon = "";
    }
}

function populateFiveday(data) {
    
    year = now.format("YYYY");
    month = now.format("M");
    dayOfMonth = now.format("D");

    for (let x = 1; x <= 5; x++) {

        dayOfMonth++;

        if (dayOfMonth > 30) {
            if ((month == 4) || (month == 6) || (month == 9) || (month == 11)) {
                    dayOfMonth = 1;
                    month++;
                    if (month > 12) {
                        month = 1;
                        year++;
                    }
                }
            else if (dayOfMonth > 31) {
                dayofMonth = 1;
                month++;
                if (month > 12) {
                    month = 1;
                    year++;
                }
            }
        }

        dateString = dateString = `${month}/${(dayOfMonth)}/${year}`;
        temperature = data.daily[x].temp.day;
        humidity = data.daily[x].humidity;
        weatherType = data.daily[x].weather[0].main;
        console.log(weatherType);

        determineIcon(weatherType);

        $("#fiveday").append($(`
            <div class="card">
                <h3>${dateString}</h3>
                <i class="${weatherIcon}"></i>
                <p>Temp: ${temperature} °F</p>
                <p>Humidity: ${humidity}%</p>
            </div>
        `))

    }

}

function printCity(city, state) {
    
    if (nameFixer == true) {
        city = fixedName;
    }

    if (state == undefined) {
        $("#cities").prepend($(`<a id="${city}">${city}</a>`))
    }
    else {
        $("#cities").prepend($(`<a id="${city}, ${state}">${city}, ${state}</a>`))
    }

    localStorage.setItem("cityList", JSON.stringify(cityList));
}

function inputTrim(input) {
    console.log("Test goes here");
    console.log(input);
    input = input.split(" ").join();
    console.log(input);
    input = input.split(",");
    console.log(input);
    
    if (input.length > 2) {
        if (input[0].toLowerCase() == "new" ||
            input[0].toLowerCase() == "north" ||
            input[0].toLowerCase() == "east" ||
            input[0].toLowerCase() == "south" ||
            input[0].toLowerCase() == "west") {
                fixedName = `${input[0]} ${input[1]}`
                let newStr = input.shift() + "%20" + input.shift();
                input.unshift(newStr);
                nameFixer = true;
            } 
        else {
            nameFixer = false;
        }
        input.splice(1, 1);
    }
    else {
        nameFixer = false;
    }

    console.log(input);
    return input;
}

function searchByCity(input) {
    input = inputTrim(input);
    console.log(input);
    if (input.length == 2) {
        cityList.unshift({city: input[0], state: input[1]});
        printCity(input[0], input[1]);
        populateCurrent(input[0], input[1]);
    }
    else {
        cityList.unshift({city: input[0]});
        printCity(input[0]);
        populateCurrent(input[0]);
    }
}

$(document).ready(function () {

    for (var x in cityList) {
        if (cityList[x].city.includes("%20") === true) {
            let displayName = cityList[x].city.replace("%20", " ");
            printCity(displayName, cityList[x].state);
        }
        else {
            printCity(cityList[x].city, cityList[x].state);
        }
    }

    $.ajax({
        url: "https://ipapi.co/json/",
        method: "GET"
    }).then(function(json) {
        lon = json.longitude;
        lat = json.latitude;
        cityName = json.city;
        stateCode = json.region_code;
        populateCurrent(cityName, stateCode);
    })

    $("#submit-button").on("click", function(e) {
        e.preventDefault();
        input = $("#city-input").val();
        searchByCity(input);
    })

    $(document).on("keypress", function(e) {
        if (e.which == 13) {
            input = $("#city-input").val();
            searchByCity(input);
        }
    })

    $("#clear").on("click", function(e) {
        localStorage.removeItem("cityList");
        cityList = [];
        $("#cities").empty();
    })

    $("a").on("click", function(e) {
        console.log("Beep!");
        console.log(this);
        console.log(this.id);
        input = (this.id).toString();
        input = inputTrim(input);
        console.log(input);
        populateCurrent(input[0], input[1]);
    })

});