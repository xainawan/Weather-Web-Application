const apiKey = '2e1713810ef94b55917fa304dca4899b';
const weatherWidget = document.getElementById('weatherWidget');
const forecast = document.getElementById('forecast');
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const chatbotMessages = document.getElementById('chatbotMessages');
const chatbotInput = document.getElementById('chatbotInput');
const chatbotSubmit = document.getElementById('chatbotSubmit');
const tablesLink = document.querySelector('nav ul li:nth-child(2) a');
const contentArea = document.querySelector('.content-area');

let currentWeatherData = null;
let forecastData = null;
let currentPage = 1;
const entriesPerPage = 10;

searchBtn.addEventListener('click', () => {
    const city = cityInput.value;
    if (city) {
        getWeather(city);
        getForecast(city);
    }
});

chatbotSubmit.addEventListener('click', () => {
    const query = chatbotInput.value;
    if (query) {
        addMessageToChatbot('user', query);
        handleChatbotQuery(query);
        chatbotInput.value = '';
    }
});

tablesLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (forecastData) {
        displayWeatherTable(currentPage);
    } else {
        alert('Please search for a city first to view the weather table.');
    }
});

async function getWeather(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        
        if (data.cod === '404') {
            weatherWidget.innerHTML = '<p>City not found. Please try again.</p>';
            return;
        }

        currentWeatherData = data;
        const weather = `
            <h2>${data.name}</h2>
            <p>Temperature: ${data.main.temp}°C</p>
            <p>Humidity: ${data.main.humidity}%</p>
            <p>Wind Speed: ${data.wind.speed} m/s</p>
            <p>Weather: ${data.weather[0].description}</p>
            <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="Weather icon">
        `;
        weatherWidget.innerHTML = weather;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        weatherWidget.innerHTML = '<p>An error occurred. Please try again later.</p>';
    }
}

async function getForecast(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        
        if (data.cod === '404') {
            forecast.innerHTML = '<p>Forecast not available.</p>';
            return;
        }

        forecastData = data.list;
        const dailyData = data.list.filter(reading => reading.dt_txt.includes("12:00:00"));
        let forecastHtml = '';

        dailyData.forEach(day => {
            forecastHtml += `
                <div class="forecast-day">
                    <h3>${new Date(day.dt * 1000).toLocaleDateString()}</h3>
                    <p>Temp: ${day.main.temp}°C</p>
                    <p>${day.weather[0].description}</p>
                    <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="Weather icon">
                </div>
            `;
        });

        forecast.innerHTML = forecastHtml;
    } catch (error) {
        console.error('Error fetching forecast data:', error);
        forecast.innerHTML = '<p>An error occurred while fetching the forecast. Please try again later.</p>';
    }
}


async function getForecast(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        
        if (data.cod === '404') {
            forecast.innerHTML = '<p>Forecast not available.</p>';
            return;
        }

        forecastData = data.list;
        const dailyData = data.list.filter(reading => reading.dt_txt.includes("12:00:00"));
        let forecastHtml = '';

        dailyData.forEach(day => {
            forecastHtml += `
                <div class="forecast-day">
                    <h3>${new Date(day.dt * 1000).toLocaleDateString()}</h3>
                    <p>Temp: ${day.main.temp}°C</p>
                    <p>${day.weather[0].description}</p>
                    <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="Weather icon">
                </div>
            `;
        });

        forecast.innerHTML = forecastHtml;

        // Create charts with error handling
        try {
            createTemperatureBarChart(dailyData);
        } catch (error) {
            console.error('Error creating temperature bar chart:', error);
        }

        try {
            createWeatherConditionsDoughnutChart(dailyData);
        } catch (error) {
            console.error('Error creating weather conditions doughnut chart:', error);
        }

        try {
            createTemperatureLineChart(forecastData);
        } catch (error) {
            console.error('Error creating temperature line chart:', error);
        }

    } catch (error) {
        console.error('Error fetching forecast data:', error);
        forecast.innerHTML = '<p>An error occurred while fetching the forecast. Please try again later.</p>';
    }
}












function addMessageToChatbot(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add(sender);
    messageElement.textContent = message;
    chatbotMessages.appendChild(messageElement);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function handleChatbotQuery(query) {
    query = query.toLowerCase();
    let response = "I'm sorry, I don't have information about that.";

    if (currentWeatherData && forecastData) {
        if (query.includes('temperature') || query.includes('temp')) {
            response = `The current temperature in ${currentWeatherData.name} is ${currentWeatherData.main.temp}°C.`;
        } else if (query.includes('humidity')) {
            response = `The current humidity in ${currentWeatherData.name} is ${currentWeatherData.main.humidity}%.`;
        } else if (query.includes('wind')) {
            response = `The current wind speed in ${currentWeatherData.name} is ${currentWeatherData.wind.speed} m/s.`;
        } else if (query.includes('forecast')) {
            const tomorrowForecast = forecastData.find(item => {
                const date = new Date(item.dt * 1000);
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                return date.getDate() === tomorrow.getDate() && date.getHours() === 12;
            });
            if (tomorrowForecast) {
                response = `Tomorrow's forecast for ${currentWeatherData.name}: ${tomorrowForecast.weather[0].description} with a temperature of ${tomorrowForecast.main.temp}°C.`;
            }
        }
    } else {
        response = "Please search for a city first to get weather information.";
    }

    addMessageToChatbot('bot', response);
}

function displayWeatherTable(page) {
    const startIndex = (page - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    const pageData = forecastData.slice(startIndex, endIndex);

    let tableHtml = `
        <h2>Weather Forecast Table</h2>
        <table class="weather-table">
            <thead>
                <tr>
                    <th>Date & Time</th>
                    <th>Temperature (°C)</th>
                    <th>Description</th>
                    <th>Humidity (%)</th>
                    <th>Wind Speed (m/s)</th>
                </tr>
            </thead>
            <tbody>
    `;

    pageData.forEach(item => {
        tableHtml += `
            <tr>
                <td>${new Date(item.dt * 1000).toLocaleString()}</td>
                <td>${item.main.temp}</td>
                <td>${item.weather[0].description}</td>
                <td>${item.main.humidity}</td>
                <td>${item.wind.speed}</td>
            </tr>
        `;
    });

    tableHtml += `
            </tbody>
        </table>
        <div class="pagination">
            <button onclick="changePage(-1)">Previous</button>
            <span>Page ${currentPage} of ${Math.ceil(forecastData.length / entriesPerPage)}</span>
            <button onclick="changePage(1)">Next</button>
        </div>
    `;

    contentArea.innerHTML = tableHtml;
}

function changePage(direction) {
    currentPage += direction;
    if (currentPage < 1) currentPage = 1;
    if (currentPage > Math.ceil(forecastData.length / entriesPerPage)) {
        currentPage = Math.ceil(forecastData.length / entriesPerPage);
    }
    displayWeatherTable(currentPage);
}

function createTemperatureBarChart(data) {
    const ctx = document.getElementById('temperatureBarChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => new Date(d.dt * 1000).toLocaleDateString()),
            datasets: [{
                label: 'Temperature (°C)',
                data: data.map(d => d.main.temp),
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgb(255, 99, 132)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '5-Day Temperature Forecast'
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

function createWeatherConditionsDoughnutChart(data) {
    const conditions = data.map(d => d.weather[0].main);
    const conditionCounts = conditions.reduce((acc, condition) => {
        acc[condition] = (acc[condition] || 0) + 1;
        return acc;
    }, {});

    const ctx = document.getElementById('weatherConditionsDoughnutChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(conditionCounts),
            datasets: [{
                data: Object.values(conditionCounts),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(153, 102, 255, 0.5)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Weather Conditions Distribution'
                }
            }
        }
    });
}

function createTemperatureLineChart(data) {
    const ctx = document.getElementById('temperatureLineChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => new Date(d.dt * 1000).toLocaleString()),
            datasets: [{
                label: 'Temperature (°C)',
                data: data.map(d => d.main.temp),
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Temperature Changes Over 5 Days'
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    }
                },
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

