import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./signup.css";
import countries from "./countries";

function Signup() {
  const navigate = useNavigate(); 

  // Form data state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    age: "",
    region: "",
    country: "",
  });

  // Loading state while submitting
  const [loading, setLoading] = useState(false);

  // Message to show success/error
  const [message, setMessage] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Send POST request to backend signup endpoint
      const res = await fetch("http://localhost:3000/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ If backend returns token, save it in localStorage
        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        // ✅ Save basic user info in localStorage
        localStorage.setItem(
          "user",
          JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
          })
        );

        // ✅ Redirect user to products page after successful signup
        navigate("/products");
      } else {
        // Show error message returned from backend
        setMessage(data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Create an Account</h2>

        {message && <p className="message">{message}</p>}

        <div className="row">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
        />

        <input
          type="number"
          name="age"
          placeholder="Age"
          value={formData.age}
          onChange={handleChange}
          min="16"
        />

        <select
          name="region"
          value={formData.region}
          onChange={handleChange}
          required
        >
          <option value="">Select Region</option>
          <option>Africa</option>
          <option>Asia</option>
          <option>Europe</option>
          <option>North America</option>
          <option>South America</option>
          <option>Oceania</option>
          <option>Antarctica</option>
        </select>

        <select
          name="country"
          value={formData.country}
          onChange={handleChange}
          required
        >
          <option value="">Select Country</option>
          {countries.map((c, idx) => (
            <option key={idx} value={c}>
              {c}
            </option>
          ))}
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}

export default Signup;
