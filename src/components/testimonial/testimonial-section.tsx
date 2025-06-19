import Image from "next/image"

export default function TestimonialSection() {
  const testimonials = [
    {
      id: 1,
      name: "Ruva",
      text: "Thank you so much, it's such a relief not to worry about getting into town especially with this weather where it can just start raining at any time. I'm so grateful for your service.",
      productImage: "https://i.postimg.cc/WzRR6871/Whats-App-Image-2025-03-05-at-12-27-56-AM.jpg",
      productAlt: "Customer with school supplies from BuyBox",
    },
    // Additional testimonials...
  ]

  return (
    <section className="w-full py-6 bg-muted">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-2">What Our Customers Say</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it - hear from our satisfied customers about their BuyBox experience.
          </p>
        </div>

        {/* Center grid items with justify-items-center */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          {testimonials.map((testimonial) => (
            // Add max-w-md mx-auto so each card doesn't stretch full-width of the grid cell
            <div
              key={testimonial.id}
              className="bg-card p-6 rounded-lg shadow-sm border border-border flex flex-col h-full animate-fadeIn max-w-md mx-auto"
              style={{ animationDelay: `${testimonial.id * 150}ms` }}
            >
              <div className="flex items-center mb-4">
                <div>
                  <h3 className="font-semibold text-card-foreground">{testimonial.name}</h3>
                </div>
              </div>

              <p className="text-foreground mb-4">{testimonial.text}</p>

              <div className="mt-auto">
                <div className="relative w-full h-48 rounded-md overflow-hidden">
                  <Image
                    src={testimonial.productImage || "/placeholder.svg"}
                    alt={testimonial.productAlt}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}