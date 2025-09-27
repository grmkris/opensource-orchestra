"use client";
import Link from "next/link";

export default function Header() {
  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          <Link href="/">Home</Link>
        </nav>
      </div>
      <hr />
    </div>
  );
}
