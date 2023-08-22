const express = require('express');
const app = express();
module.exports = app;
app.use(express.json());

const {open} = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');
const { request } = require('http');

const dbPath = path.join(__dirname, 'todoApplication.db');
let db = null;

const initializeDBAndServer = async ()=>{
  try{
    db = await open({filename : dbPath, driver : sqlite3.Database});
    app.listen(5050, ()=> {
      console.log('Server Running at http://localhost:5050');
    });
  }catch(error){
    console.log(`DB Error : ${error.message}`);
    process.exit(1);
  }
}

initializeDBAndServer();



const hasPriorityAndStatusProperties = (requestQuery)=>{
  return (requestQuery.priority !== undefined && requestQuery.status !== undefined);
};

const hasPriority = (requestQuery) => {
  return (requestQuery.priority !== undefined);
};

const hasStatus = (requestQuery) => {
  return (requestQuery.status !== undefined);
};



// API 1 

app.get('/todos/', async (request, response) => {
  const {search_q = "", todo, priority, status, } = request.query;

  let data = null;
  let getTodosQuery = "";

  switch(true){
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND priority = '${priority}' AND status = '${status}';`;
      break;
    case hasPriority(request.query):
      getTodosQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND priority = '${priority}';`;
      break;
    case hasStatus(request.query):
      getTodosQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%'`;
  }

  data = await db.all(getTodosQuery);
  response.send(data);
})

// API 2
app.get('/todos/:todoId', async (request, response) => {
  const {todoId} = request.params;
  const getTodoQuery = `SELECT * FROM todo WHERE id = '${todoId}';`;
  const data = await db.get(getTodoQuery);
  response.send(data);
})

// API 3
app.post('/todos/', async (request, response) => {
  const todoDetails = request.body;
  console.log(todoDetails);
  const {id, todo, priority, status} = todoDetails;
  const postQuery = `INSERT INTO todo (id, todo, priority, status) VALUES (${id}, '${todo}', '${priority}', '${status}');`;
  const dbResponse = await db.run(postQuery);
  response.send('Todo Successfully Added');
})

// API 4

const validatePriorityValue = (value) =>{
  return (value !== undefined);
}

const validateStatusValue = (value) =>{
  return (value !== undefined);
}

// const validateTodoValue = (value)=>{
//   return (value !== undefined);
// }



app.put('/todos/:todoId', async (request, response) => {
  const {todoId} = request.params;
  const todoDetails = request.body;
  const {todo, priority, status} = todoDetails;

  let query = "";
  let dataResponse = "";

  switch (true){
    case validatePriorityValue(priority):
      query = `UPDATE todo SET priority = '${priority}' WHERE id = ${todoId};`;
      dataResponse = "Priority Updated";
      break;
    case validateStatusValue(status):
      query = `UPDATE todo SET status = '${status}' WHERE id = ${todoId};`;
      dataResponse = "Status Updated";
      break;
    // case validateTodoValue(todo):
    //   query = `UPDATE todo SET todo = '${todo}' WHERE id = ${todoId};`;
    //   break;
    default:
      query = `UPDATE todo SET todo = '${todo}' WHERE id = ${todoId};`;
      dataResponse = "Todo Updated";
  };

  const data = await db.run(query);
  response.send(dataResponse);
})

// API 5
app.delete('/todos/:todoId', async (request, response) => {
  const {todoId} = request.params;
  const deleteQuery = `DELETE FROM todo WHERE id = '${todoId}';`;
  const data = await db.run(deleteQuery);
  response.send("Todo Deleted");
})