import { ImageOff } from "lucide-react";
import SmartImage from "@/components/SmartImage";
import { formatCurrency } from "@/lib/utils/currency";

// Card displays a single product tile on PLP/collections
// UI semantics: show number of finishes, not colors
interface CardProps {
  title: string;
  category: string;
  price: number;
  image?: string;
  finishes?: number; // how many finish variants are available
  badge?: string;
}

function hasImage(src?: string) {
  return !!src && src.trim().length > 0;
}

export default function Card({
  title,
  category,
  price,
  image,
  finishes = 1,
  badge,
}: CardProps) {
  return (
    <div className="group cursor-pointer">
      <div className="relative overflow-hidden rounded-lg">
        {badge && (
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-red-400 text-light-100 px-3 py-1 rounded-full font-jost text-caption font-medium">
              {badge}
            </span>
          </div>
        )}

        <div className="relative h-[390px] w-full rounded-lg overflow-hidden bg-light-200 flex items-center justify-center">
          {hasImage(image) ? (
            <SmartImage src={image!} alt={title} fill className="object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center text-dark-700 gap-2">
              <ImageOff className="h-8 w-8" />
              <span className="font-jost text-caption">No image</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div>
          <h3 className="font-jost text-body-medium font-medium text-dark-900 group-hover:text-dark-700">
            {title}
          </h3>
          <p className="font-jost text-caption text-dark-700">{category}</p>
        </div>

        <div className="flex items-center justify-between">
          <p className="font-jost text-body-medium font-medium text-dark-900">
            {formatCurrency(price)}
          </p>

          {finishes > 1 && (
            <p className="font-jost text-caption text-dark-700">
              {finishes} Finish{finishes !== 1 ? "es" : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
