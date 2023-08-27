const express = require('express');
const app = express();
module.exports = app;

app.use(express.json());


const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
const dbPath = path.join(__dirname, 'todoApplication.db');

const format = require('date-fns/format');
const isValid = require('date-fns/isValid');
const toDate = require('date-fns/toDate');

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    app.listen(5050, () => {
      console.log(`Server Running at http://localhost:5050`);
    })
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
}

initializeDBAndServer();



const result = (data) => {
  return {
    id: data.id,
    todo: data.todo,
    priority: data.priority,
    status: data.status,
    category: data.category,
    dueDate: data.due_date
  }
}


const checkRequestQuery = async (request, response, next) => {
  const { search_q, priority, status, category, date } = request.query;
  const { todoId } = request.params;

  if (category !== undefined) {
    const categoryArray = ["WORK", "HOME", "LEARNING"];
    if (categoryArray.includes(category)) {
      request.category = category;
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
      return;
    }
  }

  // #---------------------------

  if (priority !== undefined) {
    const priorityArray = ["HIGH", "MEDIUM", "LOW"];
    if (priorityArray.includes(priority)) {
      request.priority = priority;
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
      return;
    }
  }

  // #---------------------------

  if (status !== undefined) {
    const statusArray = ["TO DO", "IN PROGRESS", "DONE"];
    if (statusArray.includes(status)) {
      request.status = status;
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
      return;
    }
  }

  // #---------------------------

  if (date !== undefined) {
    try {
      const dateObj = new Date(date);
      const formatedDate = format(dateObj, 'yyyy-MM-dd');
      const dateResult = toDate(new Date(formatedDate));
      const isValidDate = await isValid(dateResult);

      if (isValidDate) {
        request.date = formatedDate;
      } else {
        response.status(400);
        response.send("Invalid Due Date");
        return;
      }

    } catch (error) {
      response.status(400);
      response.send("Invalid Due Date");
      return;
    }
  }

  request.todoId = todoId;
  request.search_q = search_q;
  next();
};


const checkBodyQuery = async (request, response, next) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const { todoId } = request.params;
  
  if (category !== undefined) {
    const categoryArray = ["WORK", "HOME", "LEARNING"];
    if (categoryArray.includes(category)) {
      request.category = category;
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
      return;
    }
  }

  // #---------------------------

  if (priority !== undefined) {
    const priorityArray = ["HIGH", "MEDIUM", "LOW"];
    if (priorityArray.includes(priority)) {
      request.priority = priority;
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
      return;
    }
  }

  // #---------------------------

  if (status !== undefined) {
    const statusArray = ["TO DO", "IN PROGRESS", "DONE"];
    if (statusArray.includes(status)) {
      request.status = status;
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
      return;
    }
  }

  // #---------------------------

  if (dueDate !== undefined) {
    try {
      const dateObj = new Date(dueDate);
      const formatedDate = format(dateObj, 'yyyy-MM-dd');
      const dateResult = toDate( new Date(formatedDate));
      const isValidDate = await isValid(dateResult);

      if (isValidDate) {
        request.dueDate = formatedDate;
      } else {
        response.status(400);
        response.send("Invalid Due Date");
        return;
      }
    } catch (error) {
      response.status(400);
      response.send("Invalid Due Date");
      return;
    }
  }

  request.todoId = todoId;
  request.todo = todo;
  request.id = id;
  next();
}



//API 1

// Returns a list of all todos whose status is 'TO DO'

app.get('/todos/', checkRequestQuery, async (request, response) => {
  const { status = "", search_q = "", priority = "", category = ""} = request;
  const getTodosQuery = `SELECT id, todo, priority, status, category, due_date AS dueDate FROM todo WHERE status LIKE '%${status}%' AND priority LIKE '%${priority}%' AND category LIKE '%${category}%' AND todo LIKE '%${search_q}%';`;
  const todosList = await db.all(getTodosQuery);
  // response.send(todosList.map((each) => result(each)));
  response.send(todosList);
});

// --------------------------------------------------------------------------


// API 2

// Returns a specific todo based on the todo ID

app.get("/todos/:todoId/", checkRequestQuery, async (request, response) => {
  const { todoId } = request;
  const getTodoQuery = `SELECT * FROM todo WHERE id = ${todoId};`;
  const todo = await db.get(getTodoQuery);
  response.send(result(todo));
})

// --------------------------------------------------------------------------

// API 3

// Returns a list of all todos with a specific due date in the query parameter /agenda/?date=2021-12-12

app.get("/agenda/", checkRequestQuery, async (request, response) => {
  const { date } = request;
  const getTodoQuery = `SELECT * FROM todo WHERE due_date = '${date}';`;
  const todosList = await db.all(getTodoQuery);

  console.log(todosList);

  if (todosList.length === 0) {
    response.status(400);
    response.send("Invalid Due Date");
  } else {
    // console.log(todosList);
    response.send(todosList.map((each) => result(each)));
  }
});

// --------------------------------------------------------------------------

// API 4

// Create a todo in the todo table,

app.post("/todos/", checkBodyQuery, async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request;
  console.log(todo, priority, status, category, dueDate);
  const postTodoQuery = `INSERT INTO todo (id, todo, priority, status, category, due_date) VALUES ('${id}', '${todo}','${priority}','${status}','${category}','${dueDate}');`;
  await db.run(postTodoQuery);
  response.send("Todo Successfully Added");
});

// --------------------------------------------------------------------------

// API 5

//  Updates the details of a specific todo based on the todo ID


app.put("/todos/:todoId/", checkBodyQuery, async (request, response) => {
  const { todoId } = request;
  const { todo, priority, status, category, dueDate } = request;

  let query = "";
  let queryResponse = "";

  switch (true) {
    case (todo !== undefined):
      query = `UPDATE todo SET todo = '${todo}' WHERE id = ${todoId}`;
      queryResponse = "Todo Updated";
      break;
    case (priority !== undefined):
      query = `UPDATE todo SET priority = '${priority}' WHERE id = ${todoId}`;
      queryResponse = "Priority Updated";
      break;
    case (status !== undefined):
      query = `UPDATE todo SET status = '${status}' WHERE id = ${todoId}`;
      queryResponse = "Status Updated";
      break;
    case (category !== undefined):
      query = `UPDATE todo SET category = '${category}' WHERE id = ${todoId}`;
      queryResponse = "Category Updated";
      break;
    default:
      query = `UPDATE todo SET due_date = '${dueDate}' WHERE id = ${todoId}`;
      queryResponse = "Due Date Updated";
  }

  await db.run(query);
  response.send(queryResponse);
})

// --------------------------------------------------------------------------

// API 6

// Deletes a todo from the todo table based on the todo ID

app.delete("/todos/:todoId",async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `DELETE FROM todo WHERE id = ${todoId}`;
  const mes = await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
})