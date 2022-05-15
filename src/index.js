const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
 
  const {username} = request.headers;

  const userAlreadyExists = users.find(user => user.username === username);
  if (!userAlreadyExists) {
    return response.status(404).json({ error: 'Not Found' });
  }

  next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;

  const userAlreadyExists = users.find(user => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: 'User already exists' });
  }

  const user = {
    name,
    username,
    todos: [],
    id: uuidv4(),
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers;
  const correctUser = users.find(user => user.username === username);

  return response.json(correctUser.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const {username} = request.headers;

  const correctUser = users.find(user => user.username === username);

  const todo = { title, deadline: new Date(deadline), id: uuidv4(), done: false, created_at: new Date() };

  correctUser.todos.push(todo);

  return response.status(201).json(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const {username} = request.headers;
  const {id} = request.params;

  const correctUser = users.find(user => user.username === username);

  const todo = correctUser.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: 'Not Found' });
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers;
  const {id} = request.params;

  const correctUser = users.find(user => user.username === username);

  const todo = correctUser.todos.find(todo => todo.id === id);
  
  if (!todo) {
    return response.status(404).json({ error: 'Not Found' });
  }

  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers;
  const {id} = request.params;

  const correctUser = users.find(user => user.username === username);

  const taskExists = correctUser.todos.find(todo => todo.id === id);

  if (!taskExists) {
    return response.status(404).json({ error: 'Not Found' });
  }

  correctUser.todos = correctUser.todos.filter(todo => todo.id !== id);

  return response.status(204).send();

});

module.exports = app;