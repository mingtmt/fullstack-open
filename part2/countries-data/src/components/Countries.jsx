import { Country } from "./Country";

export const Countries = ({ countries, showCountry }) => {
    if (countries.length > 10) {
        return <p>Too many matches, specify another filter</p>;
    } else if (countries.length === 1) {
        return <Country country={countries[0]} />;
    } else {
        return countries.map((c) => (
            <div key={c.name.common}>{c.name.common} {" "}
                <button type="button" onClick={() => showCountry(c.name.common)}>show</button>
            </div>
        ));
    }
};
