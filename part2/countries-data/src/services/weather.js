import axios from 'axios'
const baseUrl = 'https://api.openweathermap.org/data/2.5/weather'

const getWeather = (city) => {
    const request = axios.get(`${baseUrl}?q=${city}&appid=${import.meta.env.VITE_WEATHER_API_KEY}`)
    return request.then(response => response.data)
}

export {
    getWeather,
}