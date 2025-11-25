export const Numbers = ({ persons, filter, removePerson }) => {

    return (
        <div>
            {persons
                .filter((p) =>
                    p.name.toLowerCase().includes(filter.toLowerCase())
                )
                .map((p) => (
                    <div key={p.id}>
                        {p.name}: {p.number} {""}
                        <button type="button" onClick={() => removePerson(p.id)}>delete</button>
                    </div>
                ))}
        </div>
    );
};
