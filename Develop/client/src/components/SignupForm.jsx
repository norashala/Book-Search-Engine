import { useState } from "react";
import { useMutation } from "@apollo/client";
import { Form, Button, Alert } from "react-bootstrap";

// Import the ADD_USER mutation
import { ADD_USER } from "../utils/mutations";
import Auth from "../utils/auth";

const SignupForm = () => {
    const [userFormData, setUserFormData] = useState({
        username: "",
        email: "",
        password: "",
    });
    const [validated, setValidated] = useState(false);
    const [showAlert, setShowAlert] = useState(false);

    // Initialize the useMutation hook for ADD_USER
    const [addUser, { error }] = useMutation(ADD_USER);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setUserFormData({ ...userFormData, [name]: value });
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;

        // Form validation
        if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
            setValidated(true); // Set validated to true to trigger bootstrap validation UI
            return;
        }

        // Perform the mutation to register the user
        try {
            const { data } = await addUser({
                variables: { ...userFormData },
            });

            Auth.login(data.addUser.token); // Login the user with the returned token
        } catch (err) {
            console.error(err);
            setShowAlert(true);
        }

        // Reset form data
        setUserFormData({
            username: "",
            email: "",
            password: "",
        });
    };

    return (
        <>
            <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
                <Alert
                    dismissible
                    onClose={() => setShowAlert(false)}
                    show={showAlert}
                    variant="danger"
                >
                    {error
                        ? `Signup failed: ${error.message}`
                        : "Something went wrong with your signup!"}
                </Alert>

                <Form.Group className="mb-3">
                    <Form.Label htmlFor="username">Username</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Your username"
                        name="username"
                        onChange={handleInputChange}
                        value={userFormData.username}
                        required
                    />
                    <Form.Control.Feedback type="invalid">
                        Username is required!
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label htmlFor="email">Email</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Your email address"
                        name="email"
                        onChange={handleInputChange}
                        value={userFormData.email}
                        required
                    />
                    <Form.Control.Feedback type="invalid">
                        Email is required!
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label htmlFor="password">Password</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Your password"
                        name="password"
                        onChange={handleInputChange}
                        value={userFormData.password}
                        required
                    />
                    <Form.Control.Feedback type="invalid">
                        Password is required!
                    </Form.Control.Feedback>
                </Form.Group>

                <Button
                    disabled={
                        !(
                            userFormData.username &&
                            userFormData.email &&
                            userFormData.password
                        )
                    }
                    type="submit"
                    variant="success"
                >
                    Submit
                </Button>
            </Form>
        </>
    );
};

export default SignupForm;
