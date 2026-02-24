"use client";

import * as React from "react";

// If you have shadcn installed, you can swap these for:
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        "h-10 w-full rounded-xl border border-zinc-400 bg-white px-3 text-sm outline-none",
        "focus:border-zinc-500 focus:ring-4 focus:ring-zinc-100",
        props.className,
      ].join(" ")}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={[
        "min-h-[120px] w-full rounded-xl border border-zinc-400 bg-white px-3 py-2 text-sm outline-none",
        "focus:border-zinc-500 focus:ring-4 focus:ring-zinc-100",
        props.className,
      ].join(" ")}
    />
  );
}

function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "ghost";
  }
) {
  const variant = props.variant ?? "primary";
  return (
    <button
      {...props}
      className={[
        "h-10 rounded-lg px-8 text-sm font-semibold transition active:scale-[0.99] disabled:opacity-60",
        variant === "primary"
          ? "bg-sky-500 text-white hover:bg-sky-600"
          : "bg-transparent text-zinc-700 hover:bg-zinc-100",
        props.className,
      ].join(" ")}
    />
  );
}

function Stepper({
  value,
  onChange,
  min = 0,
  max = 99,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
}) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={dec}
        className="grid h-8 w-8 place-items-center rounded-full bg-sky-500 text-white shadow-sm hover:bg-sky-600"
        aria-label="decrease"
      >
        –
      </button>

      <div className="grid h-8 min-w-10 place-items-center rounded-full border-2 border-sky-500 bg-white px-3 text-sm font-semibold text-zinc-800">
        {value}
      </div>

      <button
        type="button"
        onClick={inc}
        className="grid h-8 w-8 place-items-center rounded-full bg-sky-500 text-white shadow-sm hover:bg-sky-600"
        aria-label="increase"
      >
        +
      </button>
    </div>
  );
}

export default function NewListingPage() {
  const [address, setAddress] = React.useState("");
  const [unitNumber, setUnitNumber] = React.useState("");
  const [rent, setRent] = React.useState<string>("");
  const [deposit, setDeposit] = React.useState<string>("");

  const [bedrooms, setBedrooms] = React.useState(4);
  const [bathrooms, setBathrooms] = React.useState(4);
  const [months, setMonths] = React.useState(4);
  const [spots, setSpots] = React.useState(4);

  const [comments, setComments] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Replace with a POST to your API / server action.
    const payload = {
      address,
      unitNumber,
      rent: rent ? Number(rent) : null,
      deposit: deposit ? Number(deposit) : null,
      bedrooms,
      bathrooms,
      leaseMonths: months,
      parkingSpots: spots,
      comments,
    };

    console.log("LISTING SUBMIT:", payload);
    alert("Saved (check console for payload).");
  };

  return (
    <div className="min-h-screen bg-white">
      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-[520px] px-6 pb-20 pt-10"
      >
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-zinc-900">Add your lease</h1>
        </div>

        {/* Address */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-semibold text-zinc-900">
            Address
          </label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>

        {/* Unit number */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold text-zinc-900">
            Unit number
          </label>
          <Input
            value={unitNumber}
            onChange={(e) => setUnitNumber(e.target.value)}
          />
        </div>

        {/* Rent + Deposit (2 columns) */}
        <div className="mb-6 grid grid-cols-2 gap-10">
          <div>
            <label className="mb-2 block text-sm font-semibold text-zinc-900">
              Rent
            </label>
            <Input
              value={rent}
              onChange={(e) => setRent(e.target.value.replace(/[^\d]/g, ""))}
              inputMode="numeric"
              className="w-24"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-zinc-900">
              Deposit
            </label>
            <Input
              value={deposit}
              onChange={(e) => setDeposit(e.target.value.replace(/[^\d]/g, ""))}
              inputMode="numeric"
              className="w-24"
            />
          </div>
        </div>

        {/* Bed and Bath */}
        <div className="mb-6">
          <div className="mb-2 text-sm font-semibold text-zinc-900">
            Bed and Bath
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="text-xs text-zinc-700">Bedrooms</div>
            <Stepper value={bedrooms} onChange={setBedrooms} min={0} max={10} />
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="text-xs text-zinc-700">Bathrooms</div>
            <Stepper
              value={bathrooms}
              onChange={setBathrooms}
              min={0}
              max={10}
            />
          </div>
        </div>

        {/* Lease Length */}
        <div className="mb-6">
          <div className="mb-2 text-sm font-semibold text-zinc-900">
            Lease Length
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="text-xs text-zinc-700">Months</div>
            <Stepper value={months} onChange={setMonths} min={1} max={24} />
          </div>
        </div>

        {/* Parking */}
        <div className="mb-6">
          <div className="mb-2 text-sm font-semibold text-zinc-900">Parking</div>

          <div className="flex items-center justify-between py-2">
            <div className="text-xs text-zinc-700">Spots</div>
            <Stepper value={spots} onChange={setSpots} min={0} max={10} />
          </div>
        </div>

        {/* Additional Comments */}
        <div className="mb-8">
          <label className="mb-2 block text-sm font-semibold text-zinc-900">
            Additional Comments
          </label>
          <Textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </div>

        {/* Save */}
        <div className="flex justify-center">
          <Button type="submit">SAVE</Button>
        </div>
      </form>
    </div>
  );
}