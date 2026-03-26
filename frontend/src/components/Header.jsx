import { FiSearch, FiBell, FiUser } from 'react-icons/fi';
import './Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="header-logo">
        <span className="logo-link">Linked</span><span className="logo-edu">U</span>
      </div>
      
      <div className="header-search-wrapper">
        <div className="header-search">
          <FiSearch size={16} className="search-icon" />
          <input type="text" placeholder="Rechercher des documents..." />
        </div>
      </div>
      
      <div className="header-actions">
        <button className="icon-btn"><FiBell size={20} /></button>
        <button className="icon-btn"><FiUser size={20} /></button>
      </div>
    </header>
  );
}
