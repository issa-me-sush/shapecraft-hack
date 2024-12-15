import { ProtectedRoute } from '../components/auth/ProtectedRoute';

function ExplorePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white p-8">
      <h1 className="text-4xl font-bold mb-6">
        Explore the World
      </h1>
 
    </div>
  );
}

export default ProtectedRoute(ExplorePage); 