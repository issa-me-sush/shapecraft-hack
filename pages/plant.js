import { ProtectedRoute } from '../components/auth/ProtectedRoute';

function PlantPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white p-8">
      <h1 className="text-4xl font-bold mb-6">
        Plant Your Seed
      </h1>

    </div>
  );
}

export default ProtectedRoute(PlantPage); 