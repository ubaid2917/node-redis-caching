const Book = require("../models/Book");
const Author = require("../models/author");
const Redis = require("ioredis");
const redisClient = new Redis();

const createAuthor = async (req, res) => {
  try {
    const author = new Author(req.body);
    await author.save();

    redisClient.get("authors", (err, cachedAuthors) => {
      if (err) throw err;

      let authorArr = [];
      if (cachedAuthors) {
        try {
          authorArr = JSON.parse(cachedAuthors);
        } catch (error) {
          console.error("Error parsing cached data:", authorArr);
          authorArr = [];
        }
      }

      authorArr.push(author);

      redisClient.setex("authors", 120, JSON.stringify(authorArr));
    });

    // Respond with success
    res.status(201).json({
      status: 200,
      message: "Author created successfully and added to cache",
      data: author,
    });
    // });
  } catch (error) {
    console.error("Error creating author:", error.message);
    res.status(400).json({ error: error.message });
  }
};

const getAuthors = async (req, res) => {
  try {
    redisClient.get("authors", async (err, authors) => {
      if (err) throw err;

      if (authors) {
        return res.json({
          status: 200,
          message: "Authors fetched from cache",
          data: JSON.parse(authors),
        });
      } else {
        const authors = await Author.find();
        if (!authors) {
          return res.json({
            status: 200,
            message: "Authors not found",
            data: authors,
          });
        }

        redisClient.setex("authors", 120, JSON.stringify(authors));

        return res.json({
          status: 200,
          message: "Authors fetched from database",
          data: authors,
        });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

async function updateAuthor(req, res) {
  try {
    const author = await Author.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!author) return res.status(404).json({ message: "Author not found" });

    const key = await redisClient.keys("authors");

    console.log("keys", key);

    if (key && key.length > 0) {
      await redisClient.del(key);
      console.log("cache clear");
    }

    res.json({
      status: 200,
      message: "Author updated successfully",
      data: author,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

const deleteAuthor = async (req, res) => {
  try {
    const id = req.params.id; // Get the author ID from the request params

    // Check if the author exists in the database
    const existAuthor = await Author.findById(id);

    if (!existAuthor) {
      return res.status(404).json({ message: "Author not found" });
    }

    // Delete the author from the database
    await Author.findByIdAndDelete(id);

    // Update the Redis cache
    redisClient.get("authors", async (err, cachedAuthors) => {
      if (err) {
        console.error("Error accessing Redis:", err);
        return res
          .status(500)
          .json({ message: "Server error while accessing cache" });
      }
      let authorArr = [];
      if (cachedAuthors) {
        authorArr = JSON.parse(cachedAuthors);

        //  filter out the data
        authorArr = authorArr.filter((author) => author._id !== id);

        // update
        await redisClient.setex("authors", 120, JSON.stringify(authorArr));
        console.log("update cache after delete");
      }
    });

    // Respond with success
    return res.status(200).json({ message: "Author deleted successfully" });
  } catch (error) {
    console.error("Error deleting author:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createAuthor,
  getAuthors,
  updateAuthor,
  deleteAuthor,
};
