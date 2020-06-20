const express = require('express');
const app = express();
app.use(express.static('public'));
const cors = require('cors');
app.use(cors());

app.set('port', process.env.PORT || 3000);
app.locals.title = 'Pet Box';

// app.get('/', (request, response) => {
//   response.send('Oh hey Pet Box');
// });

app.locals.pets = [
  { id: 'a1', name: 'Rover', type: 'dog' },
  { id: 'b2', name: 'Marcus Aurelius', type: 'parakeet' },
  { id: 'c3', name: 'Craisins', type: 'cat' }
];

app.get('/api/v1/pets', (request, response) => {
  const pets = app.locals.pets;

  response.send({ pets });
});

app.get('/api/v1/pets/:id', (request, response) => {
  const { id } = request.params;
  const pet = app.locals.pets.find(pet => pet.id === id);
  if (!pet) {
    return response.sendStatus(404);
  }

  response.status(200).json(pet);
});

app.use(express.json());

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on http://localhost:${app.get('port')}.`);
});

app.post('/api/v1/pets', (request, response) => {
  const id =(Date.now()).toString();
  const pet = request.body;
  console.log('request', request)
  for (let requiredParameter of ['name', 'type']) {
    if (!pet[requiredParameter]) {
      return response
        .status(422)
        .send({ error: `Expected format: { name: <String>, type: <String> }. You're missing a "${requiredParameter}" property.` });
    }
  }

  const { name, type } = pet;
  app.locals.pets.push({ name, type, id });
  response.status(201).json({ name, type, id });
});


app.patch('/api/v1/pets/:id', (request, response) => {
  const { id } = request.params;
  const ops = request.body

  const pet = app.locals.pets.find(pet => pet.id === id)

  for(let i = 0; i < ops.length; i++) {
    let operation = ops[i];
    if(operation.op === "replace") {
      let key = operation.path.replace('/','');
      if(!pet[key]){
        return response
        .status(422)
        .send({ error: `Path doesn't exist.` });
      }
      pet[key] = operation.value;
    }
  }
    response.status(201).json(pet);
})

app.delete('/api/v1/pets/:id', (request, response) => {
  const { id } = request.params;
  const pets = app.locals.pets
  const pet = app.locals.pets.find(pet => pet.id === id);
  if (!pet) {
    return response
      .status(422)
      .send({ error: `You done fucked up.` });
  }
  const index = pets.indexOf(pet);
  pets.splice(index, 1);
  response.status(201).json(pet);
})
