import { useState, useEffect } from "react";
import { Filter } from "./components/Filter";
import { PersonForm } from "./components/PersonForm";
import { Numbers } from "./components/Numbers";
import { getAll, create, update, remove } from "./services/persons";
import { Notification } from "./components/Notification";

const App = () => {
    const [persons, setPersons] = useState([]);
    const [newName, setNewName] = useState("");
    const [newNumber, setNewNumber] = useState("");
    const [filter, setFilter] = useState("");
    const [notiMessage, setNotiMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        getAll().then((initialData) => {
            setPersons(initialData);
        });
    }, []);

    const addPerson = (event) => {
        event.preventDefault();
        const newPersons = {
            name: newName,
            number: newNumber,
        };

        if (persons.find((p) => p.name === newName)) {
            const updatedPerson = {
                ...persons.find((p) => p.name === newName),
                number: newNumber,
            };

            if (
                window.confirm(
                    `${newName} is already added to phonebook, replace old number with a new one?`
                )
            ) {
                update(updatedPerson.id, updatedPerson)
                    .then((returnedData) => {
                        setNotiMessage(`Updated ${newName}`);
                        setPersons(
                            persons.map((p) =>
                                p.id === returnedData.id ? returnedData : p
                            )
                        );
                        setNewNumber("");
                        setNewName("");
                    })
                    .then(() => {
                        setIsSuccess(true);
                        setNotiMessage(`Updated ${newName}`);
                        setTimeout(() => {
                            setNotiMessage("");
                        }, 5000);
                    })
                    .catch((err) => {
                        setIsSuccess(false);
                        setNotiMessage(
                            `Information of ${
                                updatedPerson.name
                            } has already been removed from server`
                        );
                        setPersons(persons.filter((p) => p.id !== updatedPerson.id));
                        setTimeout(() => {
                            setNotiMessage("");
                        }, 5000);
                    });
            }

            return;
        }

        create(newPersons)
            .then((returnedData) => {
                setPersons([...persons, returnedData]);
                setNewNumber("");
                setNewName("");
            })
            .then(() => {
                setIsSuccess(true);
                setNotiMessage(`Added ${newName}`);
                setTimeout(() => {
                    setNotiMessage("");
                }, 5000);
            })
            .catch(err => {
                setIsSuccess(false);
                setNotiMessage(err.response.data.error);
                setTimeout(() => {
                    setNotiMessage("");
                }, 5000);
            });
    };

    const removePerson = (id) => {
        if (
            window.confirm(`Delete ${persons.find((p) => p.id === id).name}?`)
        ) {
            remove(id).then(() =>
                setPersons(persons.filter((p) => p.id !== id))
            );
        } else {
            return;
        }
    };

    return (
        <div>
            <h2>Phonebook</h2>
            <Notification message={notiMessage} isSuccess={isSuccess} />
            <Filter filter={filter} setFilter={setFilter} />
            <h2>Add a new</h2>
            <PersonForm
                newName={newName}
                setNewName={setNewName}
                newNumber={newNumber}
                setNewNumber={setNewNumber}
                addPerson={addPerson}
            />
            <h2>Numbers</h2>
            <Numbers
                persons={persons}
                filter={filter}
                removePerson={removePerson}
            />
        </div>
    );
};

export default App;
