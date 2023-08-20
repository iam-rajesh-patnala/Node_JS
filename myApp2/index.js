const express = require('express');
const app = express();
app.use(express.json());
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, "goodreads.db"); 

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    app.listen(2020, () => {
      console.log(`Server is running on http://localhost:2020`);
    })
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
}

initializeDBAndServer();

// ######################### Connection Establishment for expressJS ################################


// Get All books API

app.get('/books/', async (request, response) => {
  const SQLQuery = `SELECT * FROM book ORDER BY book_id;`;
  const result = await db.all(SQLQuery);
  response.send(result);
})

// Get Book API
app.get('/books/:bookID/', async (request, response) => {
  const { bookID } = request.params;
  const SQLQuery = `SELECT * FROM book WHERE book_id = ${bookID};`;
  const result = await db.get(SQLQuery);
  response.send(result);
})

// Add Book API
app.post('/books/', async (request, response) => {

  const bookDetails = request.body;
  const {
      title,
      authorId,
      rating,
      ratingCount,
      reviewCount,
      description,
      pages,
      dateOfPublication,
      editionLanguage,
      price,
      onlineStores,
    } = bookDetails;
  const addBookQuery = `
    INSERT INTO
      book (title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
    VALUES
      (
        '${title}',
        ${authorId},
        ${rating},
        ${ratingCount},
        ${reviewCount},
        '${description}',
        ${pages},
        '${dateOfPublication}',
        '${editionLanguage}',
        ${price},
        '${onlineStores}'
      );`;

  const dbResponse = await db.run(addBookQuery);
  const bookId = dbResponse.lastID;
  response.send({bookId : bookId});
})


// Update Book API
app.put('/books/:bookID/', async (request, response) => {
  const { bookID } = request.params;
  const bookDetails = request.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount, 
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  const updateBookQuery = `
    UPDATE
      book
    SET
      title='${title}',
      author_id=${authorId},
      rating=${rating},
      rating_count=${ratingCount},
      review_count=${reviewCount},
      description='${description}',
      pages=${pages},
      date_of_publication='${dateOfPublication}',
      edition_language='${editionLanguage}',
      price= ${price},
      online_stores='${onlineStores}'
    WHERE
      book_id = ${bookID};`; 
  const dbResponse = await db.run(updateBookQuery);
  response.send("Book Updated Successfully");
})

// Delete Book API
app.delete('/books/:bookID/', async (request, response) => {
  const { bookID } = request.params;
  const deleteBookQuery = `DELETE FROM book WHERE book_id = ${bookID};`;
  const dbResponse = await db.run(deleteBookQuery);
  response.send(`${bookID} Book Deleted Successfully`);
})


// Get author books API

app.get('/authors/:authorID/books/', async (request, response) => {
  const { authorID } = request.params;
  const SQLQuery = `SELECT * FROM book WHERE author_id = ${authorID};`;
  const booksArray = await db.all(SQLQuery);
  response.send(booksArray);
})