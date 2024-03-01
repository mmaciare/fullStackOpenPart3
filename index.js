require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const app = express()

app.use(express.static('dist'))
app.use(express.json())
app.use(cors())

//Morgan LOGS
morgan.token('body', function(req, res) {return JSON.stringify(req.body)})
const newMorganFormat = ':method :url :status :res[content-length] - :response-time ms :body'
app.use(morgan(newMorganFormat, { skip: (req, res) => req.method !== 'POST' }))

//Error Handlers
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  if (error.name === 'ValidationError')
    return response.status(400).send({ error: error.message })
  
  next(error)
}


//ENDPOINTS
app.get('/info', (request, response, next) => {
    Person
      .find({})
      .then(persons => {
        response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${time}</p>`)
        const time = new Date().toString()
      })
      .catch(error => next(error))
})

app.get('/api/persons', (request, response, next) => {
  Person
    .find({})
    .then(persons => {
      response.json(persons)})
    .catch(error => next(error))
  })


app.get('/api/persons/:id', (request, response, next) => {
    Person
      .findById(request.params.id)
      .then(fPerson => {
        fPerson ? response.json(fPerson) : response.status(400).send('Person not found').end()
      })
      .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person
    .findByIdAndDelete(request.params.id)
    .then(dPerson => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const person = {
    name: request.body.name,
    number: request.body.number
  }

  Person
    .findByIdAndUpdate(request.params.id, person,  { new: true, runValidators: true, context: 'query' })
    .then(uPerson => {
      response.send(uPerson)
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  const errors = validatePerson(body)

  if(errors.length !== 0) 
    return response.status(400).json(errors).end()
  
  const person = new Person({
    name: body.name,
    number: body.number
  })
  
  person
    .save()
    .then(savedPerson => 
      {response.json(savedPerson)} )
    .catch(error => next(error))

})

//VALIDATIONS

const validatePerson = (newPerson) => {
  let errors = []

      Person.find({name:newPerson.name}).then(fPerson => {
      if(fPerson !== null) 
        errors = errors.concat({error: 'name must be unique'})
    })
  
  return errors
}

app.use(unknownEndpoint)
app.use(errorHandler)

//SET PORT TO LISTEN
const PORT = process.env.PORT
app.listen(PORT)
console.log(`Server running on port ${PORT}`)
