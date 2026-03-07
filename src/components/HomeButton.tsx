import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export function HomeButton() {
  return (
    <Link
      to="/dashboard"
      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors inline-flex items-center justify-center"
      title="Home"
    >
      <Home className="w-5 h-5" />
    </Link>
  );
}
