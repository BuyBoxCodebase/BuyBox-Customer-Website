import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Home, ShoppingBag } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex justify-center items-center p-4 md:min-h-fit md:p-20">
      <div className="flex flex-col-reverse md:flex-row md:items-center md:gap-x-8 max-w-6xl w-full">
        {/* Text and Buttons Section */}
        <div className="flex-1 mt-8 md:mt-0 text-center md:text-left">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold">Oops!</h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-muted-foreground">
              Looks like this page got lost while shopping
            </h2>
            <p className="text-muted-foreground md:max-w-md">
              The page you're looking for has wandered off to find some great
              deals. Let's get you back to shopping!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mt-8">
            <Button asChild variant="orange" size="lg">
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                Back to Home
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>

        {/* Image Section */}
        <div className="flex-1">
          <div className="relative aspect-[4/3] md:aspect-[16/9] rounded-lg overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1576495199011-eb94736d05d6?q=80&w=2048&auto=format&fit=crop"
              alt="Empty shopping cart in a supermarket aisle"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}