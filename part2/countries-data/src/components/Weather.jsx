import { useEffect, useState } from "react";
import { getWeather } from "../services/weather";

export const Weather = ({ capital }) => {
    const [weather, setWeather] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!capital) return;

        getWeather(capital)
            .then((returnedData) => setWeather(returnedData))
            .catch((err) => setError(err));
    }, [capital]);

    if (error) return <p>{error}</p>;
    if (!weather) return <p>Loading weather...</p>;

    const temp = weather.main.temp;
    const wind = weather.wind.speed;
    const icon = weather.weather[0].icon;
    const description = weather.weather[0].description;

    return (
        <div>
            <h3>Weather in {capital}</h3>
            <p>Temperature: {temp} °C</p>
            <img
                src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
                alt={description}
            />
            <p>Wind: {wind} m/s</p>
        </div>
    );
};
