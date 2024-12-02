const Book = require("../models/Book");
const Redis = require("ioredis");
const redisClient = new Redis();



const createBook = async (req, res) => {
    try {
      const book = new Book(req.body);
      await book.save();
  
      console.log("book----->",book);
      
      redisClient.get("books", async (err, cachedBooks) => {
     
        if (err) {
          console.error("Redis error:", err);
          throw err;
        }
  
        let booksArr = [];
        if (cachedBooks) {
          try {
            console.log("books----->",cachedBooks);
            booksArr = JSON.parse(cachedBooks);
          } catch (parseError) {
            console.error("Error parsing cached data:", parseError);
            booksArr = []; 
          }
        }
  
        booksArr.push(book);
  
        
        redisClient.setex("books", 120, JSON.stringify(booksArr));
  
        // Respond with success
        res.status(201).json({
          status: 200,
          message: "Book created successfully and added to cache",
          data: book,
        });
      });
    } catch (error) {
      console.error("Error creating book:", error.message);
      res.status(400).json({ error: error.message });
    }
  };
  
  

const getBooks = async (req, res) => {
  try {
    redisClient.get(`books`, async (err, books) => {
      if (err) throw err;

      if (books) {
        res.json({
          status: 200,
          message: "books fetched from cache",
          data: JSON.parse(books),
        });
        return;
      } else {
        const books = await Book.find();

        redisClient.setex(`books`, 120, JSON.stringify(books));
        res.status(200).json({
          status: 200,
          message: "books fetched from db successfully",
          data: books,
        });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

async function updateBook(req, res) {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!book) return res.status(404).json({ message: "Book not found" });

    const key = await redisClient.keys("books:*");

    if (key && key.length > 0) {
      await redisClient.del(key);
      console.log("cache clear")
    }

    res.json({ status: 200, message: "Book updated successfully", data: book });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}  

async function deleteBook(req,res) {
    const id = req.params.id; 

    const existBook = await Book.findById(id);

    if (!existBook) return res.status(404).json({ message: "Book not found" });

    await Book.findByIdAndDelete(id); 
    
    const key = await redisClient.keys("books:*");

    if(key && key.length > 0){
        await redisClient.del(key);
        console.log("cache clear")
    }  


    return res.status(200).json({ message: "Book deleted successfully" });
}

module.exports = {
  createBook,
  getBooks,
  updateBook,
  deleteBook,
};
