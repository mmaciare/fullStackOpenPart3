const mongoose = require('mongoose')

//end of process if no have password, number or too much parameters
if (process.argv.length < 3 || process.argv.length === 4 || process.argv.length > 5) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://fullstack:${password}@fullstack.hxkjc2j.mongodb.net/phoneBookApp?retryWrites=true&w=majority&appName=fullstack`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

//new entry
if(process.argv[3] != null ) {
    const person = new Person({
        "name": process.argv[3],
        "number": process.argv[4]
    })

    person.save().then(result => {
        console.log(`added ${person.name} number ${person.number} to the phonebook`)
        mongoose.connection.close()
      })
} else {
    Person.find({}).then(result => {
        console.log('phonebook:')
        result.forEach(person => {
        console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
    })
}