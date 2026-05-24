"use client";
import DiscoveryCards from "@/components/DiscoveryCards";
import SearchInput from "@/components/SearchInput";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import { useRef, useState } from "react";

export default function Chat() {
  const [query, setQuery] = useState("");
  const containerRef = useRef();
  useGSAP(() => {
    // 1. Create the split
    // const split = new SplitText(headerTextRef.current, { type: "lines" });

    // 2. Animate the words
    gsap.from(".float-in", {
      opacity: 0,
      y: 20,
      duration: 0.4,
      stagger: 0.1,
      ease: "power4.out",
    });
    {
      scope: containerRef;
    }
  });

  return (
    <div className="flex flex-col w-full px-2" ref={containerRef}>
      {/* 1. SEARCH */}
      <div className="flex justify-between gap-3 items-center backdrop-blur-md px-2 rounded-4xl max-w-[396px] w-full">
        <SearchInput query={query} setQuery={setQuery} />{" "}
      </div>

      {/* 2. TEXT + WAVY UNDERLINE */}
      <div className="mt-4 mb-2">
        <p className="float-in text-zinc-900 font-bold text-lg">Find peeps</p>
      </div>

      {/* 3. THE LIST */}
      <div className="w-full">
        <DiscoveryCards query={query} />
      </div>
    </div>
  );
}
