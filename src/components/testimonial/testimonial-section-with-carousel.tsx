"use client";

import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function TestimonialSectionWithCarousel() {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Regular Customer",
      image: "/placeholder.svg?height=80&width=80",
      rating: 5,
      text: "BuyBox has completely transformed my shopping experience. Their fast delivery and quality products keep me coming back every time!",
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Student",
      image: "/placeholder.svg?height=80&width=80",
      rating: 5,
      text: "As a student, I rely on BuyBox for all my school essentials. Their prices are unbeatable and the service is exceptional.",
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      role: "Parent",
      image: "/placeholder.svg?height=80&width=80",
      rating: 4,
      text: "BuyBox makes shopping for my family so convenient. The variety of products and easy ordering process saves me so much time.",
    },
    {
      id: 4,
      name: "David Wilson",
      role: "Office Manager",
      image: "/placeholder.svg?height=80&width=80",
      rating: 5,
      text: "Our office relies on BuyBox for all our supplies. Their bulk ordering options and reliable delivery have made our procurement process seamless.",
    },
    {
      id: 5,
      name: "Priya Patel",
      role: "Homemaker",
      image: "/placeholder.svg?height=80&width=80",
      rating: 5,
      text: "The pantry staples section on BuyBox is a lifesaver! Great quality products at reasonable prices with doorstep delivery.",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex + 1 >= testimonials.length ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex - 1 < 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  return (
    <section className="w-full py-6 bg-muted">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it - hear from our satisfied customers
            about their BuyBox experience.
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(-${
                  currentIndex * (100 / itemsPerPage.mobile)
                }%)`,
              }}>
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="w-full flex-shrink-0 px-2 md:w-1/2 lg:w-1/3">
                  <div className="bg-card p-6 rounded-lg shadow-sm border border-border h-full flex flex-col">
                    <div className="flex items-center mb-4">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                        <Image
                          src={testimonial.image || "/placeholder.svg"}
                          alt={testimonial.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-card-foreground">
                          {testimonial.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>

                    <div className="flex mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < testimonial.rating
                              ? "text-gray-800 fill-orange-500"
                              : "text-muted stroke-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-foreground flex-grow">
                      {testimonial.text}
                    </p>

                    <div className="mt-4">
                      <a
                        href="#"
                        className="text-gray-800 text-sm font-medium hover:underline">
                        Read full review
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-card p-2 rounded-full shadow-md border border-border hover:bg-accent focus:outline-none md:-translate-x-0"
            aria-label="Previous testimonial">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-card p-2 rounded-full shadow-md border border-border hover:bg-accent focus:outline-none md:translate-x-0"
            aria-label="Next testimonial">
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </div>

        <div className="flex justify-center mt-6">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 mx-1 rounded-full ${
                index === currentIndex
                  ? "bg-gray-800"
                  : "bg-muted-foreground/30"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href="#"
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-800 text-black font-medium rounded-md hover:bg-black transition-colors">
            View All Reviews
          </a>
        </div>
      </div>
    </section>
  );
}
