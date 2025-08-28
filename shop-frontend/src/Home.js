import React from "react";
import "./Home.css";

function Home({ activeSection }) {
  const renderSection = () => {
    switch (activeSection) {
      case "about":
        return (
          <div className="section">
            <h2>About Us</h2>
            <p>
              Henky Fashion Global is a baby and maternity shop specializing in 
              baby clothes, breastfeeding supplies, and maternity dresses. 
              We provide high-quality, affordable, and sustainable products 
              to empower mothers and families during a critical life stage.
            </p>
          </div>
        );
      case "vision":
        return (
          <div className="section">
            <h2>Vision & Mission</h2>
            <p><b>Vision:</b> To be the most trusted and supportive brand for mothers and families in Africa.</p>
            <p><b>Mission:</b> To deliver sustainable, stylish, and functional maternity and baby products 
            while fostering a sense of care and community.</p>
          </div>
        );
      case "staff":
        return (
          <div className="section">
            <h2>Our Staff</h2>
            <p>
              We are a team of passionate individuals dedicated to helping 
              mothers and families. From our store manager to our sales associates 
              and e-commerce specialists, everyone is committed to offering 
              excellent customer service.
            </p>
          </div>
        );
      case "careers":
        return (
          <div className="section">
            <h2>Careers</h2>
            <p>
              Interested in joining us? Henky Fashion Global is always 
              looking for passionate individuals to support our mission. 
              Please reach out through our contact page for opportunities.
            </p>
          </div>
        );
      case "contact":
  return (
    <div className="section">
      <h2>Contact Us</h2>
      <p>Email: <a href="mailto:henkygroupltd@gmail.com">henkygroupltd@gmail.com</a></p>
      <p>Phone: +254 799 039 951</p>
      <p>Location: Nairobi West, South C, Kenya</p>
    </div>
  );
      default:
        return <h2>Welcome to Henky Fashion Global</h2>;
    }
  };

  return (
    <div className="home-content">
      <h1>Welcome to Henky Fashion Global</h1>
      <p>Your trusted partner in baby clothes, maternity dresses, and breastfeeding supplies.</p>
      {renderSection()}
    </div>
  );
}

export default Home;
