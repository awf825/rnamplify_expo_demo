export const AddBook = `    
mutation ($title: String! $author: String) {
  createBook(input: {
    title: $title
  }) {
    id title
  }
}
`;

export const ListBooks = `
query {
  listBooks {
    items {
      id title 
    }
  }
}
`;