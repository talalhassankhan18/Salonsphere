"use client";

import { cn } from "@/lib/utils";
import {
  AreaType,
  CardType,
  ProductType,
  ReviewType,
  SalonType,
} from "../../types";
import CardListWrapper from "./card-list-wrapper";
import { mapSalons, mapProducts, mapAreas, mapReviews } from "@/lib/utils";

type CardVariants = ProductType[] | SalonType[] | AreaType[] | ReviewType[];
type TypeOfCardData = "product" | "salon" | "area" | "review";
type Props = {
  cards?: CardVariants;
  dataType: TypeOfCardData;
  shouldAnimate?: boolean;
  className?: string;
};

const CardList = ({
  cards = [],
  dataType,
  shouldAnimate = false,
  className,
}: Props) => {
  const allCards: CardType[] = getMappedCards(cards, dataType);
  return (
    <CardListWrapper
      className={cn("mb-4 md:mb-6", className)}
      shouldAnimate={shouldAnimate}
      cards={allCards.map((cardItem, i) => {
        return <Card key={i} card={cardItem} />;
      })}
    />
  );
};

export default CardList;

const getMappedCards = (
  cards: CardVariants,
  dataType: TypeOfCardData
): CardType[] => {
  switch (dataType) {
    case "product":
      return mapProducts(cards as ProductType[]);
    case "salon":
      return mapSalons(cards as SalonType[]);
    case "area":
      return mapAreas(cards as AreaType[]);
    case "review":
      return mapReviews(cards as ReviewType[]);
    default:
      return [];
  }
};

const Card = ({ card }: { card: CardType }) => {
  const { top, bottom, actionBtn, image, bgColor, border, className } = card;

  return (
    <div
      className={cn(
        // Base styles: compact size, subtle shadow, rounded corners
        "flex-none w-[250px] h-full flex flex-col bg-white rounded-lg shadow-md overflow-hidden",
        // Hover effect: subtle shadow increase
        "hover:shadow-lg transition-shadow duration-200 ease-in-out",
        // Border styling
        border ? "border border-gray-200" : "border-none",
        // Background color override
        bgColor ? `bg-${bgColor}` : "bg-white",
        // Custom className from props
        className
      )}
    >
      {image && (
        <figure className="w-full h-[180px] overflow-hidden bg-gray-100">
          <div className="w-full h-full flex items-center justify-center p-2">
            {image}
          </div>
        </figure>
      )}
      <div
        className={cn(
          "flex flex-col gap-2 p-4 flex-grow",
          border && "border-gray-200 border-t"
        )}
      >
        {/* Top Section */}
        <div
          className={cn(
            "flex items-center min-h-[36px]",
            // Ensure name (left) and rating (right) are on opposite sides
            top?.left && top?.right && "justify-between",
            top?.full && !top?.right && !top?.left && "justify-center",
            top?.left && !top?.full && !top?.right && "justify-start",
            top?.right && !top?.full && !top?.left && "justify-end"
          )}
        >
          <div className="truncate text-base font-medium">{top?.left}</div>
          <div className="flex-shrink-0">
            {top?.right && (
              <div className="flex items-center bg-primary text-white text-sm px-2 py-1 rounded-full">
                {top.right}
              </div>
            )}
          </div>
          <div className="w-full">{top?.full}</div>
        </div>

        {/* Bottom Section */}
        <div
          className={cn(
            "flex-grow flex items-start flex-col gap-1 min-h-[50px]",
            bottom?.full && !bottom?.right && !bottom?.left && "justify-center",
            bottom?.left && bottom?.right && "justify-between",
            bottom?.left && !bottom?.full && !bottom?.right && "justify-start",
            bottom?.right && !bottom?.full && !bottom?.left && "justify-end"
          )}
        >
          <div className="truncate text-sm">{bottom?.left}</div>
          <div className="truncate text-sm">{bottom?.right}</div>
          <div className="w-full">{bottom?.full}</div>
        </div>

        {/* Action Button Section */}
        <div
          className={cn(
            "flex pt-1 min-h-[40px]",
            actionBtn?.full &&
              !actionBtn?.right &&
              !actionBtn?.left &&
              "justify-center",
            actionBtn?.left && actionBtn?.right && "justify-between",
            actionBtn?.left &&
              !actionBtn?.full &&
              !actionBtn?.right &&
              "justify-start",
            actionBtn?.right &&
              !actionBtn?.full &&
              !actionBtn?.left &&
              "justify-end"
          )}
        >
          {actionBtn?.left}
          {actionBtn?.right}
          {actionBtn?.full}
        </div>
      </div>
    </div>
  );
};
