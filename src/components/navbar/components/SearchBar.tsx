import { Search } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  className?: string;
}

export const SearchBar = ({ 
  className = ""
}: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`relative w-full ${className}`}
    >
      <div className="relative flex items-center w-full">
        <input
          placeholder="Search Buybox"
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          className="w-full h-10 px-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent pl-10"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <Search className="h-5 w-5 text-gray-800" />
        </div>
      </div>
    </form>
  );
};