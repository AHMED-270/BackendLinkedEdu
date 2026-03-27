import Header from './Header';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F9FAFB' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1, marginTop: '64px' }}>
        <Sidebar />
        <main style={{ flex: 1, marginLeft: '260px', padding: '32px 40px', overflowX: 'hidden' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
