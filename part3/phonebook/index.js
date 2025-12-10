require('dotenv').config()
const express = require("express");
const morgan = require("morgan");
const Person = require("./models/person");

const app = express();

app.use(express.json());

morgan.token("body", (req) => {
    return req.method === "POST" ? JSON.stringify(req.body) : "";
});

app.use(
    morgan(
        ":method :url :status :res[content-length] - :response-time ms :body"
    )
);
app.use(express.static("dist"));

let persons = [
    {
        id: "1",
        name: "Arto Hellas",
        number: "040-123456",
    },
    {
        id: "2",
        name: "Ada Lovelace",
        number: "39-44-5323523",
    },
    {
        id: "3",
        name: "Dan Abramov",
        number: "12-43-234345",
    },
    {
        id: "4",
        name: "Mary Poppendieck",
        number: "39-23-6423122",
    },
];

app.get("/api/persons", (request, response) => {
    Person.find({}).then((result) => response.json(result));
});

app.get("/info", (request, response) => {
    const total = persons.length;
    const now = new Date();
    response.send(
        `<p>Phonebook has info for ${total} persons</p>
        <p>${now}</p>`
    );
});

app.get("/api/persons/:id", (request, response) => {
    const id = request.params.id;
    const person = persons.find((p) => p.id === id);

    if (person) {
        response.json(person);
    } else {
        response.status(404).end();
    }
});

const generateId = () => {
    return Math.floor(Math.random() * 1_000_000_000) + 1;
};

app.post("/api/persons", (request, response) => {
    const body = request.body;

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: "name or number missing",
        });
    } else if (persons.find((p) => p.name === body.name)) {
        return response.status(400).json({
            error: "name must be unique",
        });
    }

    const person = {
        id: generateId(),
        name: body.name,
        number: body.number,
    };

    persons = persons.concat(person);

    response.json(person);
});

app.delete("/api/persons/:id", (request, response) => {
    const id = request.params.id;
    persons = persons.filter((p) => p.id !== id);

    response.status(204).end();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
