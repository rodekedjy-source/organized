import React from "react";

export default function LandingPremium() {
  return (
    <div className="font-sans">

      {/* HERO */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-6">
        <h1 className="text-5xl font-bold max-w-3xl">
          Stop losing clients because of missed bookings.
        </h1>
        <p className="mt-6 text-lg max-w-xl">
          Organized helps hairstylists manage bookings, clients, and sales — all in one simple system.
        </p>
        <button className="mt-8 px-8 py-4 text-lg border rounded-xl">
          Start Free
        </button>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6 max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
        <div className="p-6 border rounded-xl">
          <h3 className="text-xl font-semibold mb-2">Smart Booking</h3>
          <p>Clients book automatically without messaging you.</p>
        </div>
        <div className="p-6 border rounded-xl">
          <h3 className="text-xl font-semibold mb-2">Auto Reminders</h3>
          <p>No-shows disappear with automatic confirmations.</p>
        </div>
        <div className="p-6 border rounded-xl">
          <h3 className="text-xl font-semibold mb-2">Client Management</h3>
          <p>All your clients and history in one place.</p>
        </div>
      </section>

      {/* DEMO */}
      <section className="py-20 text-center px-6">
        <h2 className="text-3xl font-bold mb-6">See it in action</h2>
        <div className="border rounded-xl p-20">
          <p>Dashboard preview here</p>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="py-20 text-center px-6">
        <h2 className="text-3xl font-bold mb-6">Trusted by professionals</h2>
        <p className="max-w-xl mx-auto">
          “I stopped losing clients and my business feels finally organized.”
        </p>
      </section>

      {/* PRICING */}
      <section className="py-20 px-6 max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
        <div className="p-6 border rounded-xl">
          <h3 className="text-xl font-bold">Starter</h3>
          <p className="my-4">Free</p>
          <p>Limited bookings</p>
        </div>

        <div className="p-6 border-2 rounded-xl">
          <h3 className="text-xl font-bold">Pro</h3>
          <p className="my-4">$25/mo</p>
          <p>Unlimited bookings</p>
          <p>Auto reminders</p>
        </div>

        <div className="p-6 border rounded-xl">
          <h3 className="text-xl font-bold">Business</h3>
          <p className="my-4">$50/mo</p>
          <p>Full features</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold">Ready to grow your business?</h2>
        <button className="mt-6 px-8 py-4 border rounded-xl">
          Get Started
        </button>
      </section>

      {/* FOOTER */}
      <footer className="py-10 text-center text-sm">
        <p>© 2026 Organized</p>
      </footer>

    </div>
  );
}
