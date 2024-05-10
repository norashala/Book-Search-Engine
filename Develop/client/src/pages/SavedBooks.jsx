import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { Container, Card, Button, Row, Col } from "react-bootstrap";

import { GET_ME } from "../utils/queries";
import { REMOVE_BOOK } from "../utils/mutations";
import Auth from "../utils/auth";
import { removeBookId } from "../utils/localStorage";

const SavedBooks = () => {
    const { loading, data, refetch } = useQuery(GET_ME);
    const [removeBook] = useMutation(REMOVE_BOOK, {
        onCompleted: (data) => {
            // Refetch the GET_ME query to update the UI
            refetch();
        },
    });

    const userData = data?.me || {};

    const handleDeleteBook = async (bookId) => {
        try {
            await removeBook({
                variables: { bookId },
            });
            // Upon success, remove book's id from localStorage
            removeBookId(bookId);
        } catch (err) {
            console.error(err);
        }
    };

    // if data isn't here yet, say so
    if (loading) {
        return <h2>LOADING...</h2>;
    }

    return (
        <>
            <div fluid className="text-light bg-dark p-5">
                <Container>
                    <h1>Viewing saved books!</h1>
                </Container>
            </div>
            <Container>
                <h2 className="pt-5">
                    {userData.savedBooks?.length
                        ? `Viewing ${userData.savedBooks.length} saved ${
                              userData.savedBooks.length === 1
                                  ? "book"
                                  : "books"
                          }:`
                        : "You have no saved books!"}
                </h2>
                <Row>
                    {userData.savedBooks?.map((book) => (
                        <Col key={book.bookId} md="4">
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
                                    <Button
                                        className="btn-block btn-danger"
                                        onClick={() =>
                                            handleDeleteBook(book.bookId)
                                        }
                                    >
                                        Delete this Book!
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </>
    );
};

export default SavedBooks;
