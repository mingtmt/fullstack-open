const mongoose = require("mongoose");

const url = process.env.MONGODB_URI;
const phoneRegex = /^[0-9]{2,3}-[0-9]+$/;

mongoose.set("strictQuery", false);
mongoose
    .connect(url, { family: 4 })
    .then((result) => {
        console.log("connected to MongoDB");
    })
    .catch((error) => {
        console.log("error connecting to MongoDB:", error.message);
    });

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        require: true,
        unique: true,
    }, 
    number: {
        type: String,
        minLength: 8,
        require: true,
        validate: {
            validator: function (value) {
                if (!phoneRegex.test(value)) {
                    return false;
                }
            }
        },
    }
});

personSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

module.exports = mongoose.model("Person", personSchema);
