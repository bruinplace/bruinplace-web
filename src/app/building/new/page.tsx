"use client";

import * as React from "react";

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
  },
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
  max = 999,
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

export default function NewBuildingPage() {
  const [buildingName, setBuildingName] = React.useState("");
  const [address, setAddress] = React.useState("");

  const [website, setWebsite] = React.useState("");
  const [contactEmail, setContactEmail] = React.useState("");
  const [contactPhone, setContactPhone] = React.useState("");

  const [unitsCount, setUnitsCount] = React.useState(20);
  const [parkingSpots, setParkingSpots] = React.useState(0);

  const [amenities, setAmenities] = React.useState("");
  const [comments, setComments] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Replace with a POST to your API / server action.
    const payload = {
      buildingName,
      address,
      website: website || null,
      contactEmail: contactEmail || null,
      contactPhone: contactPhone || null,
      unitsCount,
      parkingSpots,
      amenities: amenities || null,
      comments,
    };

    console.log("BUILDING SUBMIT:", payload);
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
          <h1 className="text-xl font-semibold text-zinc-900">
            Add a building
          </h1>
        </div>

        {/* Building name */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-semibold text-zinc-900">
            Building name
          </label>
          <Input
            value={buildingName}
            onChange={(e) => setBuildingName(e.target.value)}
            placeholder="e.g., The Plaza"
          />
        </div>

        {/* Address */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold text-zinc-900">
            Address
          </label>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street, City, State ZIP"
          />
        </div>

        {/* Website */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold text-zinc-900">
            Website (optional)
          </label>
          <Input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://..."
          />
        </div>

        {/* Contact (2 columns) */}
        <div className="mb-6 grid grid-cols-2 gap-10">
          <div>
            <label className="mb-2 block text-sm font-semibold text-zinc-900">
              Contact email
            </label>
            <Input
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="leasing@..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-zinc-900">
              Contact phone
            </label>
            <Input
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="(###) ###-####"
            />
          </div>
        </div>

        {/* Counts */}
        <div className="mb-6">
          <div className="mb-2 text-sm font-semibold text-zinc-900">
            Building details
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="text-xs text-zinc-700">Total units</div>
            <Stepper
              value={unitsCount}
              onChange={setUnitsCount}
              min={0}
              max={999}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="text-xs text-zinc-700">Parking spots</div>
            <Stepper
              value={parkingSpots}
              onChange={setParkingSpots}
              min={0}
              max={999}
            />
          </div>
        </div>

        {/* Amenities */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold text-zinc-900">
            Amenities (optional)
          </label>
          <Input
            value={amenities}
            onChange={(e) => setAmenities(e.target.value)}
            placeholder="Gym, pool, laundry, AC..."
          />
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
