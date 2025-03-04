// Import useState and useMutation
import { useState } from "react";
import { useMutation } from "@apollo/client";
import { Form, Button, Alert } from "react-bootstrap";

// Import the LOGIN_USER mutation
import { LOGIN_USER } from "../utils/mutations";
import Auth from "../utils/auth";

const LoginForm = () => {
    const [userFormData, setUserFormData] = useState({
        email: "",
        password: "",
    });
    const [validated] = useState(false);
    const [showAlert, setShowAlert] = useState(false);

    // Initialize the useMutation hook
    const [login, { error }] = useMutation(LOGIN_USER);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setUserFormData({ ...userFormData, [name]: value });
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        // check if form has everything (as per react-bootstrap docs)
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        }

        try {
            // Use the LOGIN_USER mutation
            const { data } = await login({
                variables: {
                    email: userFormData.email,
                    password: userFormData.password,
                },
            });

            Auth.login(data.login.token);
        } catch (err) {
            console.error(err);
            setShowAlert(true);
        }

        // Reset form data
        setUserFormData({
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
                        ? `Login failed: ${error.message}`
                        : "Something went wrong with your login credentials!"}
                </Alert>
                <Form.Group className="mb-3">
                    <Form.Label htmlFor="email">Email</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Your email"
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
                    disabled={!(userFormData.email && userFormData.password)}
                    type="submit"
                    variant="success"
                >
                    Submit
                </Button>
            </Form>
        </>
    );
};

export default LoginForm;
