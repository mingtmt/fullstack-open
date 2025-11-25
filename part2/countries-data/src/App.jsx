import { useEffect, useState } from "react";
import { getAll, getByName } from "./services/country";
import { Countries } from "./components/Countries";

const App = () => {
    const [countries, setCountries] = useState([]);
    const [filteredCountries, setFilteredCountries] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        getAll().then((initialData) => {
            setCountries(initialData);
        });
    }, []);

    useEffect(() => {
        if (search !== "") {
            setFilteredCountries(
                countries.filter((c) =>
                    c.name.common.toLowerCase().includes(search.toLowerCase())
                )
            );
        } else {
            setFilteredCountries(countries);
        }
    }, [search]);

    const showCountry = (name) => {
        getByName(name).then((returnedData) => {
            setFilteredCountries([returnedData]);
        });
    }

    return (
        <div>
            <div>
                find countries {""}
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <Countries countries={filteredCountries} showCountry={showCountry} />
        </div>
    );
};

export default App;
