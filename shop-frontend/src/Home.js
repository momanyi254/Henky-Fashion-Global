import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Home.css";

function Home() {
  const settings = {
    dots: true,         
    infinite: true,     
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,     
    autoplaySpeed: 3000 
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <h2>Welcome to Henky Fashion Global</h2>
        <p>Your one-stop shop for maternity wear, baby clothes & men’s essentials.</p>
      </section>

      {/* Image Carousel */}
      <section className="carousel-section">
        <Slider {...settings}>
          <div>
            <img src="/DSC_3013.JPG" alt="Baby Clothes" className="carousel-image" />
          </div>
          <div>
            <img src="/DSC_3055.JPG" alt="Men’s Vest" className="carousel-image" />
          </div>
          <div>
            <img src="/DSC_8511.JPG" alt="Maternity Wear" className="carousel-image" />
          </div>
        </Slider>
      </section>

      {/* Contact Us Section */}
      <section className="contact">
        <h3>Contact Us</h3>
        <p>Email: <a href="mailto:info@henkyfashion.com">info@henkyfashion.com</a></p>
        <p>Phone: +254 799 039 951</p>
        <p>Address: Nairobi, Kenya</p>
      </section>

      {/* Our Partners Section */}
      <section className="partners">
        <h3>Our Partners</h3>
        <div className="partners-logos">
          <img src="/partner1.png" alt="Partner 1" />
          <img src="/partner2.png" alt="Partner 2" />
          <img src="/partner3.png" alt="Partner 3" />
        </div>
      </section>

      {/* Social Media Section */}
      <section className="social-media">
        <h3>Follow Us</h3>
        <div className="social-links">
          <a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer">Twitter</a>
        </div>
      </section>

    
    </div>
  );
}

export default Home;
