import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, LogOut } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuSeparator,
} from "@radix-ui/react-dropdown-menu";

interface MobileMenuProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

export const MobileMenu = ({ isLoggedIn, onLogout }: MobileMenuProps) => {
  return (
    <div className="lg:hidden py-4 border-t">
      {/* <div className="flex items-center gap-2 mb-4">
        <Input type="search" placeholder="Search BuyBox..." className="w-full pl-4 pr-10" />
        <Button variant="default" size="icon" className="shrink-0">
          <Search className="h-4 w-4" />
        </Button>
      </div> */}
      <div className="flex flex-col gap-4">
        {/* <Link href="/market" className="text-sm font-medium hover:text-gray-800">
          Market
        </Link> */}
        {isLoggedIn ? (
          <>
            {/* <Link href="/cart" className="text-sm font-medium hover:text-gray-800">
              Cart
            </Link> */}
            <Link
              href="/user/profile"
              className="text-sm font-medium hover:text-gray-800">
              Account
            </Link>
            <button
              onClick={onLogout}
              className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </>
        ) : (
          <Link href="/user/login" className="text-sm font-medium ">
            <Button variant="default" size="sm">
              Sign in/Sign up
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
