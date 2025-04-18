'use client';

import Image from "next/image";
import logo from "../public/news.png"; // Correct import for Next.js
import Marquee from "react-fast-marquee";
import Blog  from "./blog";

export default function Page() {
  const currentDate = new Date().toLocaleString(); // Get the current date and time

  return (
    <div className="">
      <header>
        <ul className="text-center">
          <li>
            <Image
              src={logo} // Use the imported image
              alt="LowCoolVibes"
              width={250}
              height={300}
              className="mx-auto -mt-10"
            />
          </li>
          <li className="font-bold -mt-5">
            {currentDate} {/* Display the current date and time */}
          </li>
        </ul>
      </header>
      <Marquee className="border-t border-b border-black p-5"> {/* Add top and bottom borders */}
        <div className="flex space-x-4">
          <a href="/news">
            <button className="px-4 py-2 bg-orange-200 text-white rounded hover:bg-blue-600">
              News
            </button>
          </a>
          <a href="/health">
            <button className="px-4 py-2 bg-orange-200 text-white rounded hover:bg-green-600">
              Health
            </button>
          </a>
          <a href="/sport">
            <button className="px-4 py-2 bg-orange-200 text-white rounded hover:bg-red-600">
              Sports
            </button>
          </a>
          <a href="/tech">
            <button className="px-4 py-2 bg-orange-200 text-white rounded hover:bg-red-600">
              Technology
            </button>
          </a>
          <a href="/life">
            <button className="px-4 py-2 bg-orange-200 text-white rounded hover:bg-red-600">
              Life
            </button>
          </a>
          <a href="/more">
            <button className="px-4 py-2 bg-orange-200 text-white rounded hover:bg-gray-600">
              More
            </button>
          </a>
        </div>
      </Marquee>

      <Blog />
    </div>
  );
}