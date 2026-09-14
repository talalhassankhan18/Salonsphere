"use client";
import Link from "next/link";
import { CardImageProps } from "../../../../types";

const CardImage = ({ route, src, onClick }: CardImageProps) => {
	return (
		<Link href={route} draggable="false" onClick={onClick}>
			<img src={src} alt={src} draggable="false" className="cursor-pointer" />
		</Link>
	);
};

export default CardImage;
