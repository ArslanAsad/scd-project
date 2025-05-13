const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const axios = require("axios");
const Book = require("../models/Book");
require("dotenv").config();

const categories = [
  "Fiction",
  "Non-fiction",
  "Sci-Fi",
  "Mystery",
  "Biography",
  "Romance",
  "Self-help",
  "Fantasy",
];

const getBooksFromOpenLibrary = async () => {
  const subject = faker.helpers.arrayElement(categories);
  const res = await axios.get(
    `https://openlibrary.org/search.json?subject=${subject}&limit=200`
  );
  return res.data.docs.filter(
    (book) => book.title && book.author_name && book.cover_i
  );
};

const seedBooks = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    await Book.deleteMany({});
    console.log("Old books cleared.");

    const rawBooks = await getBooksFromOpenLibrary();
    const uniqueBooks = faker.helpers.shuffle(rawBooks).slice(0, 100);

    const books = uniqueBooks.map((book) => ({
      title: book.title,
      author: book.author_name[0],
      category: book.subject?.[0] || faker.helpers.arrayElement(categories),
      description: book.first_sentence?.[0] || faker.lorem.paragraph(),
      imageURL: `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`,
      price: parseFloat(faker.commerce.price({ min: 5, max: 50 })),
      stock: faker.number.int({ min: 0, max: 100 }),
      ratings: parseFloat(
        faker.number.float({ min: 2, max: 5, precision: 0.1 })
      ),
    }));

    await Book.insertMany(books);
    console.log("Books inserted.");
    await mongoose.disconnect();
  } catch (err) {
    console.error("Seeder error: ", err);
  }
};

seedBooks();
