const mongoose = require("mongoose");

if (process.argv.length < 3) {
    console.log("give password as argument");
    process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://btminhdev_db_user:${password}@cluster0.scejtoc.mongodb.net/phonebook?appName=Cluster0`;

mongoose.set("strictQuery", false);

mongoose.connect(url, { family: 4 });

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
});

const Person = mongoose.model("Person", personSchema);

if (process.argv.length === 5) {
    const name = process.argv[3];
    const number = process.argv[4];

    const person = new Person({
        name,
        number,
    });

    person
        .save()
        .then(() => {
            console.log(`added ${name} number ${number} to phonebook`);
            return mongoose.connection.close();
        })
        .catch((error) => {
            console.error("Error saving person:", error.message);
            mongoose.connection.close();
        });
} else if (process.argv.length === 3) {
    Person.find({})
        .then((result) => {
            console.log("phonebook:");
            result.forEach((person) => {
                console.log(`${person.name} ${person.number}`);
            });
            return mongoose.connection.close();
        })
        .catch((error) => {
            console.error("Error fetching people:", error.message);
            mongoose.connection.close();
        });
}
