"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";

interface ProjectCardProps {
  href: string;
  image: string;
  typeBadge: string;
  unitCount: number;
  title: string;
  location: string;
  description: string;
  bedroomRange: string;
  fromPrice: string;
  buttonLabel: string;
}

export default function ProjectCard({
  href,
  image,
  typeBadge,
  unitCount,
  title,
  location,
  description,
  bedroomRange,
  fromPrice,
  buttonLabel,
}: ProjectCardProps) {
  return (
    <div className="bg-white rounded-[10px] border border-gray-200 overflow-hidden flex flex-col shadow-sm">
      {/* Cover image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        <Image src={image} alt={title} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Type badge - top left */}
        <span className="absolute top-3 left-3 text-[10px] font-medium bg-[#F9FAFB] text-black px-[5px] py-[3px] rounded-2xl">
          {typeBadge}
        </span>

        {/* Unit count badge - top right */}
        <span className="absolute top-3 right-3 text-[10px] font-semibold bg-[#FFBE00] text-black px-[5px] py-[3px] rounded-2xl">
          {unitCount} units
        </span>

        {/* Location - bottom left */}
        <div className="absolute bottom-3 left-3">
          <h3 className="text-white text-base font-bold">{title}</h3>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={10} className="text-primary" />
            <span className="text-[11px] text-white/80">{location}</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-sm font-bold text-gray-800 leading-snug line-clamp-2 min-h-10">
          {description}
        </p>

        {/* Stats: Bedrooms & From */}
        <div className="flex items-stretch gap-2 mt-3">
          <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2.5">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Bedrooms</p>
            <p className="text-sm font-bold">{bedroomRange}</p>
          </div>
          <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2.5">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">From</p>
            <p className="text-sm font-bold">{fromPrice}</p>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-gray-200 mt-3" />

        {/* Button */}
        <Link
          href={href}
          className="mt-3 flex items-center justify-center gap-2.5 bg-primary text-black text-sm font-bold h-10 rounded-md hover:bg-primary/90 transition-colors"
        >
          {buttonLabel} &rarr;
        </Link>
      </div>
    </div>
  );
}
