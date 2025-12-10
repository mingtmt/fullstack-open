require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const Person = require("./models/person");

const app = express();

morgan.token("body", (req) => {
    return req.method === "POST" ? JSON.stringify(req.body) : "";
});

app.use(
    morgan(
        ":method :url :status :res[content-length] - :response-time ms :body"
    )
);
app.use(express.static("dist"));
app.use(express.json());

app.get("/api/persons", (request, response) => {
    Person.find({}).then((result) => response.json(result));
});

app.get("/info", (request, response) => {
    const now = new Date();
    Person.countDocuments().then((total) => {
        response.send(
            `<p>Phonebook has info for ${total} persons</p>
            <p>${now}</p>`
        );
    });
});

app.get("/api/persons/:id", (request, response, next) => {
    Person.findById(request.params.id)
        .then((person) => {
            if (person) {
                response.json(person);
            } else {
                response.status(404).end();
            }
        })
        .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
    Person.findByIdAndUpdate(request.params.id, request.body, {
        new: true,
    })
        .then((updatePerson) => {
            if (updatePerson) {
                updatePerson
                    .save()
                    .then((savedPerson) => response.json(savedPerson));
            } else {
                response.status(404).end();
            }
        })
        .catch((error) => next(error));
});

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

    const person = new Person({
        name: body.name,
        number: body.number,
    });

    person.save().then((savedPerson) => response.json(savedPerson));
});

app.delete("/api/persons/:id", (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then((result) => response.status(204).end())
        .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
    console.error(error.message);

    if (error.name === "CastError") {
        return response.status(400).send({ error: "malformatted id" });
    }

    next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
