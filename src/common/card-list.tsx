"use client";

import { cn, mapAreas, mapReviews } from "@/lib/utils";
import {
	AreaType,
	CardType,
	ProductType,
	ReviewType,
	SalonType,
} from "../../types";
import CardListWrapper from "./card-list-wrapper";
import { mapSalons, mapProducts } from "@/lib/utils";

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
	dataType: TypeOfCardData,
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
	const { top, bottom, actionBtn, image, bgColor, border } = card;

	return (
		<div
			className={cn(
				"flex-none shadow-md rounded-sm max-lg:mr-4 max-lg:w-[275px]",
				bgColor ? `bg-${bgColor}` : "bg-secondary",
				border ? "border border-gray-300" : "border-none"
			)}
		>
			{image && <figure>{image}</figure>}
			<div
				className={cn(
					"flex flex-col gap-2 p-3",
					border && "border-base-300 border-r border-b border-l",
				)}
			>
				<div
					className={cn(
						"flex items-center",
						top?.full && !top?.right && !top?.left && "justify-center",
						top?.left && top?.right && "justify-between",
						top?.left && !top?.full && !top?.right && "justify-start",
						top?.right && !top?.full && !top?.left && "justify-end",
					)}
				>
					{top?.left}
					{top?.right}
					{top?.full}
				</div>
				<div
					className={cn(
						"flex items-center",
						bottom?.full && !bottom?.right && !bottom?.left && "justify-center",
						bottom?.left && bottom?.right && "justify-between",
						bottom?.left && !bottom?.full && !bottom?.right && "justify-start",
						bottom?.right && !bottom?.full && !bottom?.left && "justify-end",
					)}
				>
					{bottom?.left}
					{bottom?.right}
					{bottom?.full}
				</div>

				<div
					className={cn(
						"flex",
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
							"justify-end",
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
