"use client";

import { cn } from "@/lib/utils";
import {
  AreaType,
  CardType,
  ProductType,
  ReviewType,
  SalonCardType,
} from "../../types";
import CardListWrapper from "./card-list-wrapper";
import { mapSalons, mapProducts, mapAreas, mapReviews } from "@/lib/utils";
import { useState } from "react";

type CardVariants = ProductType[] | SalonCardType[] | AreaType[] | ReviewType[];
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
      className={cn("mb-6 md:mb-8 px-2", className)}
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
      return mapSalons(cards as SalonCardType[]);
    case "area":
      return mapAreas(cards as AreaType[]);
    case "review":
      return mapReviews(cards as ReviewType[]);
    default:
      return [];
  }
};

const Card = ({ card }: { card: CardType }) => {
  const { top, bottom, actionBtn, image, bgColor, border } = card;
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  const handleImageClick = () => {
    setIsImageZoomed(!isImageZoomed);
  };

  return (
    <div
      className={cn(
        "flex-none rounded-lg max-lg:mr-4 max-lg:w-[300px] h-full flex flex-col",
        "transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg",
        "bg-white shadow-sm overflow-hidden"
      )}
    >
      {image && (
        <figure
          className="relative w-full h-[220px] overflow-hidden cursor-pointer"
          onClick={handleImageClick}
        >
          <div
            className={cn(
              "w-full h-full flex items-center justify-center transition-transform duration-500",
              isImageZoomed ? "scale-125" : "scale-100"
            )}
          >
            {image}
          </div>
        </figure>
      )}
      <div className="flex flex-col p-4 flex-grow">
        {(top?.left || top?.right || top?.full) && (
          <div
            className={cn(
              "flex items-center mb-1",
              top?.full && !top?.right && !top?.left && "justify-center",
              top?.left && top?.right && "justify-between",
              top?.left && !top?.full && !top?.right && "justify-start",
              top?.right && !top?.full && !top?.left && "justify-end"
            )}
          >
            {top?.left}
            {top?.right}
            {top?.full}
          </div>
        )}

        {(bottom?.left || bottom?.right || bottom?.full) && (
          <div
            className={cn(
              "flex-grow flex items-start flex-col gap-2 py-2",
              bottom?.full &&
                !bottom?.right &&
                !bottom?.left &&
                "justify-center",
              bottom?.left && bottom?.right && "justify-between",
              bottom?.left &&
                !bottom?.full &&
                !bottom?.right &&
                "justify-start",
              bottom?.right && !bottom?.full && !bottom?.left && "justify-end"
            )}
          >
            {bottom?.left}
            {bottom?.right}
            {bottom?.full}
          </div>
        )}

        {(actionBtn?.left || actionBtn?.right || actionBtn?.full) && (
          <div
            className={cn(
              "flex mt-auto pt-2",
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
        )}
      </div>
    </div>
  );
};
