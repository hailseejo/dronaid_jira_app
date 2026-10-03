export default function AccessDenied({ message = "You don't have access to this page." }) {
  return (
    <main className="page-container">
      <h1 className="page-title">Access Denied</h1>
      <p>{message}</p>
    </main>
  );
}