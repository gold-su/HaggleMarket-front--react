import { Link } from 'react-router-dom';

function ProductList({ products }) {
  return (
    <div className="product-list">
      {products.map((product) => (
        <Link to={`/detail/${product.id}`} key={product.id}>
          <div className="product-card">
            <img src={product.imageUrl} alt={product.title} />
            <h3>{product.title}</h3>
            <p>{product.price}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
