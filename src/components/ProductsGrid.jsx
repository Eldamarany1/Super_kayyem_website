import ProductCard from './ProductCard';
import { books } from '../data/books';

function ProductsGrid({ onOpenDetails }) {
  return (
    <>
      <h2 style={{ textAlign: 'center', color: 'var(--blue)', margin: '20px 0' }}>
        📚 أحدث إصداراتنا الرقمية
      </h2>
      <div className="products-grid">
        {books.map(book => (
          <ProductCard 
            key={book.id} 
            book={book} 
            onOpenDetails={onOpenDetails} 
          />
        ))}
      </div>
    </>
  );
}

export default ProductsGrid;
