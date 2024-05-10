import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { Container, Col, Form, Button, Card, Row } from "react-bootstrap";

import Auth from "../utils/auth";
import { saveBookIds, getSavedBookIds } from "../utils/localStorage";
import { SAVE_BOOK } from "../utils/mutations"; // Import the SAVE_BOOK mutation

const SearchBooks = () => {
    const [searchedBooks, setSearchedBooks] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());

    // Setup the SAVE_BOOK mutation with Apollo Client
    const [saveBook, { error }] = useMutation(SAVE_BOOK, {
        update(cache, { data: { saveBook } }) {
            setSavedBookIds([
                ...savedBookIds,
                saveBook.savedBooks.map((book) => book.bookId),
            ]);
        },
    });

    useEffect(() => {
        return () => saveBookIds(savedBookIds);
    }, [savedBookIds]);

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        if (!searchInput) return false;

        try {
            const response = await fetch(
                `https://www.googleapis.com/books/v1/volumes?q=${searchInput}`
            );

            if (!response.ok) throw new Error("Something went wrong!");

            const { items } = await response.json();
            const bookData = items.map((book) => ({
                bookId: book.id,
                authors: book.volumeInfo.authors || ["No author to display"],
                title: book.volumeInfo.title,
                description: book.volumeInfo.description,
                image: book.volumeInfo.imageLinks?.thumbnail || "",
            }));

            setSearchedBooks(bookData);
            setSearchInput("");
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveBook = async (bookId) => {
        const bookToSave = searchedBooks.find((book) => book.bookId === bookId);

        if (!Auth.loggedIn()) return false;

        try {
            await saveBook({
                variables: { bookData: { ...bookToSave } },
            });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <>
            <div className="text-light bg-dark p-5">
                <Container>
                    <h1>Search for Books!</h1>
                    <Form onSubmit={handleFormSubmit}>
                        <Row>
                            <Col xs={12} md={8}>
                                <Form.Control
                                    name="searchInput"
                                    value={searchInput}
                                    onChange={(e) =>
                                        setSearchInput(e.target.value)
                                    }
                                    type="text"
                                    size="lg"
                                    placeholder="Search for a book"
                                />
                            </Col>
                            <Col xs={12} md={4}>
                                <Button
                                    type="submit"
                                    variant="success"
                                    size="lg"
                                >
                                    Submit Search
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Container>
            </div>
            <Container>
                <h2 className="pt-5">
                    {searchedBooks.length
                        ? `Viewing ${searchedBooks.length} results:`
                        : "Search for a book to begin"}
                </h2>
                <Row>
                    {searchedBooks.map((book) => (
                        <Col md="4" key={book.bookId}>
                            <Card border="dark">
                                {book.image && (
                                    <Card.Img
                                        src={book.image}
                                        alt={`The cover for ${book.title}`}
                                        variant="top"
                                    />
                                )}
                                <Card.Body>
                                    <Card.Title>{book.title}</Card.Title>
                                    <p className="small">
                                        Authors: {book.authors.join(", ")}
                                    </p>
                                    <Card.Text>{book.description}</Card.Text>
                                    {Auth.loggedIn() && (
                                        <Button
                                            disabled={savedBookIds.includes(
                                                book.bookId
                                            )}
                                            className="btn-block btn-info"
                                            onClick={() =>
                                                handleSaveBook(book.bookId)
                                            }
                                        >
                                            {savedBookIds.includes(book.bookId)
                                                ? "This book has already been saved!"
                                                : "Save this Book!"}
                                        </Button>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </>
    );
};

export default SearchBooks;
