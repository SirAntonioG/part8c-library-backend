const { ApolloServer, gql } = require('apollo-server');
const { v1: uuid } = require('uuid');

const typeDefs = gql`
  type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID!
    genres: [String!]!
  }
  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int
  }
  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }
  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book
    editAuthor(name: String!, setBornTo: Int!): Author
  }
`;

const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: (root, args) => {
      if (!args.author && !args.genre) return books;

      const byAuthorOrGenre = books.filter(
        (b) =>
          b.author === args.author || b.genres.find((g) => g === args.genre)
      );
      return byAuthorOrGenre;
    },
    allAuthors: () => {
      const totalAuthors = authors.map((a) => {
        const bookCount = books.reduce(
          (s, b) => (b.author === a.name ? s + 1 : s + 0),
          0
        );
        return { ...a, bookCount };
      });
      return totalAuthors;
    },
  },
  Mutation: {
    addBook: (root, args) => {
      if (!authors.find((a) => a.name === args.author)) {
        const newAuthor = { name: args.author, id: uuid() };
        authors = authors.concat(newAuthor);
      }
      const newBook = { ...args, id: uuid() };
      books = books.concat(newBook);
      return newBook;
    },
    editAuthor: (root, args) => {
      const author = authors.find((a) => a.name === args.name);
      if (!author) return null;

      const updatedAuthor = { ...author, born: args.setBornTo };
      authors = authors.map((a) => (a.name === args.name ? updatedAuthor : a));
      return updatedAuthor;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
