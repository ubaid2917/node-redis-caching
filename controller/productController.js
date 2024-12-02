const Book = require("../models/Book");
const Author = require("../models/author");
const Product = require("../models/product");
const Redis = require("ioredis");
const redisClient = new Redis();

const createProduct = async (req, res) => {
  try {
    const { name, price, description } = req.body;

    const user = req.user;
    console.log("user", user);

    // Validate input data
    if (!name || !price || !description) {
      throw new Error("All fields are required");
    }

    // Create product
    const product = new Product({
      name,
      price,
      description,
      userId: user._id,
    });

    await product.save();
    // Respond with success
    res.status(201).json({
      status: 200,
      message: "product created successfully",
      data: product,
    });
    // });
  } catch (error) {
    console.error("Error creating product:", error.message);
    res.status(400).json({
      error: error.message,
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const user = req.user._id;
    console.log("user", user);

    redisClient.get(`user:${user}:products`, async (err, cachedProducts) => {
      if (err) throw err;

      if (cachedProducts && cachedProducts.length > 0) {
        return res.json({
          status: 200,
          message: "Products fetched from cache",
          data: JSON.parse(cachedProducts),
        });
      } else {
        const products = await Product.find({
          userId: user,
        });
        if (!products) {
          throw new Error("Product not found");
        }

        redisClient.setex(
          `user:${user}:products`,
          3600,
          JSON.stringify(products)
        );

        res.json({
          status: 200,
          message: "Product fetched successfully",
          data: products,
        });
      }
    });
  } catch (error) {
    console.error("Error fetching product:", error.message);
    res.status(404).json({
      error: error.message,
    });
  }
};

// const getAuthors = async (req, res) => {
//   try {
//     redisClient.get("authors", async (err, authors) => {
//       if (err) throw err;

//       if (authors) {
//         return res.json({
//           status: 200,
//           message: "Authors fetched from cache",
//           data: JSON.parse(authors),
//         });
//       } else {
//         const authors = await Author.find();
//         if (!authors) {
//           return res.json({
//             status: 200,
//             message: "Authors not found",
//             data: authors,
//           });
//         }

//         redisClient.setex("authors", 120, JSON.stringify(authors));

//         return res.json({
//           status: 200,
//           message: "Authors fetched from database",
//           data: authors,
//         });
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// async function updateAuthor(req, res) {
//   try {
//     const author = await Author.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//     });
//     if (!author) return res.status(404).json({ message: "Author not found" });

//     const key = await redisClient.keys("authors");

//     console.log("keys", key);

//     if (key && key.length > 0) {
//       await redisClient.del(key);
//       console.log("cache clear");
//     }

//     res.json({
//       status: 200,
//       message: "Author updated successfully",
//       data: author,
//     });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// }

// const deleteAuthor = async (req, res) => {
//   try {
//     const id = req.params.id; // Get the author ID from the request params

//     // Check if the author exists in the database
//     const existAuthor = await Author.findById(id);

//     if (!existAuthor) {
//       return res.status(404).json({ message: "Author not found" });
//     }

//     // Delete the author from the database
//     await Author.findByIdAndDelete(id);

//     // Update the Redis cache
//     redisClient.get("authors", async (err, cachedAuthors) => {
//       if (err) {
//         console.error("Error accessing Redis:", err);
//         return res
//           .status(500)
//           .json({ message: "Server error while accessing cache" });
//       }
//       let authorArr = [];
//       if (cachedAuthors) {
//         authorArr = JSON.parse(cachedAuthors);

//         //  filter out the data
//         authorArr = authorArr.filter((author) => author._id !== id);

//         // update
//         await redisClient.setex("authors", 120, JSON.stringify(authorArr));
//         console.log("update cache after delete");
//       }
//     });

//     // Respond with success
//     return res.status(200).json({ message: "Author deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting author:", error.message);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

module.exports = {
  createProduct,
  getProducts,
  //   getAuthors,
  //   updateAuthor,
  //   deleteAuthor,
};
