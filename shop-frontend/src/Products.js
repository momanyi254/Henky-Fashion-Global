import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import "./products.css";

function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [category, setCategory] = useState("");
  const [size, setSize] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [brand, setBrand] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Admin Add Product / Bulk Upload Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    size: "",
    ageRange: "",
    stock: "",
    images: "",
    brand: "",
    isFeatured: false,
  });
  const [excelFile, setExcelFile] = useState(null);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "user";
  const token = localStorage.getItem("token");

  const allowedCategories = ["Kids Clothes", "Maternity Wear", "Men Vests"];

  useEffect(() => {
    if (!user) navigate("/login");
  }, [navigate, user]);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:3000/products");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...products];
    if (category) result = result.filter((p) => p.category === category);
    if (size) result = result.filter((p) => p.size?.includes(size));
    if (ageRange)
      result = result.filter((p) =>
        p.ageRange?.toLowerCase().includes(ageRange.toLowerCase())
      );
    if (brand)
      result = result.filter((p) => p.brand?.toLowerCase() === brand.toLowerCase());
    if (featuredOnly) result = result.filter((p) => p.isFeatured);
    if (minPrice) result = result.filter((p) => p.price >= Number(minPrice));
    if (maxPrice) result = result.filter((p) => p.price <= Number(maxPrice));
    setFilteredProducts(result);
  }, [category, size, ageRange, brand, minPrice, maxPrice, featuredOnly, products]);

  // Add to cart (backend)
  const addToCart = async (product) => {
    if (product.stock <= 0) return alert("Out of stock!");

    try {
      const res = await fetch("http://localhost:3000/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product._id, quantity: 1 }),
      });

      const data = await res.json();

      if (!res.ok) return alert(data.message || "Failed to add to cart");

      // Update local product stock
      const updatedProducts = products.map((p) =>
        p._id === product._id ? { ...p, stock: p.stock - 1 } : p
      );
      setProducts(updatedProducts);

      alert(`${product.name} added to cart! Stock left: ${product.stock - 1}`);
    } catch (err) {
      console.error(err);
      alert("Error adding product to cart");
    }
  };

  // Delete product (admin)
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`http://localhost:3000/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setProducts(products.filter((p) => p._id !== id));
        alert("Product deleted successfully!");
      } else alert("Failed to delete product");
    } catch (err) {
      console.error(err);
      alert("Error deleting product");
    }
  };

  // Admin Add Product
  const handleModalChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const handleAddProductModal = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.category || !newProduct.price) {
      return alert("Name, Category, and Price are required!");
    }
    if (!allowedCategories.includes(newProduct.category)) {
      return alert(`Category must be one of: ${allowedCategories.join(", ")}`);
    }

    const productToAdd = {
      ...newProduct,
      price: Number(newProduct.price),
      stock: Number(newProduct.stock || 0),
      size: newProduct.size ? newProduct.size.split(",").map((s) => s.trim()) : [],
      images: newProduct.images ? newProduct.images.split(",").map((u) => u.trim()) : [],
      isFeatured: newProduct.isFeatured || false,
    };

    try {
      const res = await fetch("http://localhost:3000/products", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(productToAdd),
      });

      if (res.ok) {
        const savedProduct = await res.json();
        setProducts([savedProduct, ...products]);
        setIsModalOpen(false);
        setNewProduct({
          name: "", category: "", price: "", description: "", size: "", ageRange: "",
          stock: "", images: "", brand: "", isFeatured: false
        });
        alert("Product added successfully!");
      } else {
        const errorData = await res.json();
        alert("Failed to add product: " + (errorData.message || res.statusText));
      }
    } catch (err) {
      alert("Failed to add product: " + err.message);
    }
  };

  // Excel Upload
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (file) setExcelFile(file);
  };

  const handleAddExcelProducts = () => {
    if (!excelFile) return alert("Please select an Excel file.");
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);

      try {
        const productsFromExcel = rows.map((row, index) => {
          if (!row.name || !row.category || !row.price) throw new Error(`Row ${index + 2} missing fields`);
          if (!allowedCategories.includes(row.category)) throw new Error(`Row ${index + 2} invalid category`);
          return {
            name: row.name,
            category: row.category,
            price: Number(row.price),
            description: row.description || "",
            size: row.size ? row.size.split(",").map((s) => s.trim()) : [],
            ageRange: row.ageRange || "",
            stock: row.stock ? Number(row.stock) : 0,
            images: row.images ? row.images.split(",").map((u) => u.trim()) : [],
            brand: row.brand || "",
            isFeatured: row.isFeatured === "true" || false
          };
        });

        const res = await fetch("http://localhost:3000/products/bulk-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(productsFromExcel)
        });

        if (res.ok) {
          const savedProducts = await res.json();
          setProducts([...savedProducts, ...products]);
          setIsModalOpen(false);
          setExcelFile(null);
          alert(`${savedProducts.length} products added successfully!`);
        } else {
          const errorData = await res.json();
          alert("Failed to upload products: " + (errorData.message || res.statusText));
        }
      } catch (err) {
        alert("Excel upload failed: " + err.message);
      }
    };
    reader.readAsArrayBuffer(excelFile);
  };

  if (loading) return <p>Loading products...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="products-page">
      <div className="top-buttons-container">
        <div className="filter-section-left">
          <button className="filter-toggle-btn" onClick={() => setIsFilterOpen(!isFilterOpen)}>
            {isFilterOpen ? "Hide Filters" : "Filter Products"}
          </button>
          {isFilterOpen && (
            <div className="filter-panel">
              <label>Category:
                <select value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="">All</option>
                  {allowedCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </label>
              <label>Size:
                <input type="text" placeholder="S,M,L" value={size} onChange={e => setSize(e.target.value)} />
              </label>
              <label>Age Range:
                <input type="text" placeholder="0-3 years" value={ageRange} onChange={e => setAgeRange(e.target.value)} />
              </label>
              <label>Brand:
                <input type="text" value={brand} onChange={e => setBrand(e.target.value)} />
              </label>
              <label>Price Min:
                <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
              </label>
              <label>Price Max:
                <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
              </label>
              <label>
                <input type="checkbox" checked={featuredOnly} onChange={() => setFeaturedOnly(!featuredOnly)} />
                Featured Only
              </label>
            </div>
          )}
        </div>

        {role === "admin" && (
          <div className="add-product-btn-container-top">
            <button className="add-product-btn" onClick={() => setIsModalOpen(true)}>
              ➕ Add Product
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add Product</h3>
            <form onSubmit={handleAddProductModal}>
              <input type="text" name="name" placeholder="Name" value={newProduct.name} onChange={handleModalChange} required />
              <select name="category" value={newProduct.category} onChange={handleModalChange} required>
                <option value="">Select Category</option>
                {allowedCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <input type="number" name="price" placeholder="Price" value={newProduct.price} onChange={handleModalChange} required />
              <textarea name="description" placeholder="Description" value={newProduct.description} onChange={handleModalChange} />
              <input type="text" name="size" placeholder="Sizes (comma separated)" value={newProduct.size} onChange={handleModalChange} />
              <input type="text" name="ageRange" placeholder="Age Range" value={newProduct.ageRange} onChange={handleModalChange} />
              <input type="number" name="stock" placeholder="Stock" value={newProduct.stock} onChange={handleModalChange} />
              <input type="text" name="images" placeholder="Image URLs (comma separated)" value={newProduct.images} onChange={handleModalChange} />
              <input type="text" name="brand" placeholder="Brand" value={newProduct.brand} onChange={handleModalChange} />
              <label>
                <input type="checkbox" name="isFeatured" checked={newProduct.isFeatured} onChange={e => setNewProduct({ ...newProduct, isFeatured: e.target.checked })} />
                Featured
              </label>
              <button type="submit">Add Single Product</button>
            </form>
            <hr />
            <h4>Or Upload Excel</h4>
            <input type="file" accept=".xlsx,.xls" onChange={handleExcelUpload} />
            <button onClick={handleAddExcelProducts}>Upload Excel</button>
            <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="products-container">
        <h2>Our Products</h2>
        <div className="product-grid">
          {filteredProducts.length > 0 ? filteredProducts.map(p => (
            <div className="product-card" key={p._id}>
              <img src={p.images?.[0] || "/placeholder.jpg"} alt={p.name} className="product-image" />
              <h3>{p.name}</h3>
              <p className="category">{p.category}</p>
              <p>{p.description?.slice(0, 60)}...</p>
              <p><strong>Price:</strong> ${p.price.toFixed(2)}</p>
              <p><strong>Stock:</strong> {p.stock > 0 ? p.stock : "Out of stock"}</p>
              <p><strong>Brand:</strong> {p.brand || "N/A"}</p>
              <p><strong>Size:</strong> {p.size?.join(", ") || "N/A"}</p>
              <p><strong>Age Range:</strong> {p.ageRange || "N/A"}</p>

              {role === "admin" ? (
                <div className="admin-buttons">
                  <button onClick={() => navigate(`/edit-product/${p._id}`)}>Edit</button>
                  <button onClick={() => handleDelete(p._id)}>Delete</button>
                </div>
              ) : (
                <button disabled={p.stock === 0} onClick={() => addToCart(p)}>
                  {p.stock > 0 ? "Add to Cart" : "Out of Stock"}
                </button>
              )}
            </div>
          )) : <p>No products match your filters.</p>}
        </div>
      </div>
    </div>
  );
}

export default Products;
