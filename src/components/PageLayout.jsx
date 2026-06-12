export default function PageLayout({ title, children }) {
  return (
    <div className="page-container">
      <h1>{title}</h1>
      {children}
    </div>
  );
}