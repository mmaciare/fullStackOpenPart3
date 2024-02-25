const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

morgan.token('body', function(req, res) {return JSON.stringify(req.body)})
const newMorganFormat = ':method :url :status :res[content-length] - :response-time ms :body'
app.use(morgan(newMorganFormat, { skip: (req, res) => req.method !== 'POST' }))

app.get('/info', (request, response) => {
    const infoForPeople = persons.length
    const time = new Date().toString()
    response.send(`<p>Phonebook has info for ${infoForPeople} people</p><p>${time}</p>`)
})

app.get('/api/persons', (request, response) => 
    response.json(persons)
)


app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    person ? response.json(person) : response.status(404).send('Person not found').end()
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.filter(person => person.id === id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const person = request.body
  const errors = validatePerson(person)

  if(errors.length !== 0) 
    return response.status(400).json(errors).end()
  
  person.id = generateId()
  persons = persons.concat(person)
  response.json(person)
})

const generateId = () => Math.floor(Math.random() * 9999999)

const validatePerson = (newPerson) => {
  let errors = []

  if(!newPerson) {
    errors = errors.concat({error: 'content missing'})
  } else {
    if(newPerson.name === null || newPerson.name === undefined || newPerson.name.trim().length === 0)
      errors = errors.concat({error: 'no name'})
    else { 
      if(persons.filter(person => person.name === newPerson.name).length !== 0) 
        errors = errors.concat({error: 'name must be unique'}) 
    }
    if(newPerson.number === null || newPerson.number === undefined || newPerson.number.trim().length === 0)
      errors = errors.concat({error: 'no number'})
  }
  return errors
}


const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)
