// types/index.ts


// ✅ API Response
export interface ApiResponse<T = any> {
	success: boolean;
	message: string;
	data?: T;
	token?: string;
}





// ✅ Selfcare Items
export interface SelfcareItemsType {
	_id: string;
	title: string;
	price: number;
	discountPercent?: number;
	rating: number;
	image: string;
}

// ✅ Product Types
export interface ProductType {
	_id?: string;
	title: string;
	description: string;
	image: string;
	howToUse: string;
	maxAllowedInCart: number;
	rating: number;
	price: number;
	discountPercent?: number;
	salonRefId?: string;
	variations: {
		title: string;
		variationList: string[];
	}[];
}

// ✅ Cart Item
export interface CartItem {
	id: string;
	quantity: number;
	title: string;
	image: string;
	netPrice: number;
	maxAllowedInCart: number;
	selectedVariations?: {
		title: string;
		variationListItem: string;
	}[];
}

// ✅ Misc Types
export type SalonType = {
	name: string;
	address: string;
	rating: number;
	image: string;
};

export type CardType = {
	top?: {
		left?: React.ReactNode;
		right?: React.ReactNode;
		full?: React.ReactNode;
	};
	bottom?: {
		left?: React.ReactNode;
		right?: React.ReactNode;
		full?: React.ReactNode;
	};
	actionBtn: {
		left?: React.ReactNode;
		right?: React.ReactNode;
		full?: React.ReactNode;
	};
	image: JSX.Element | null;
	border?: boolean;
	bgColor?:
		| "primary"
		| "secondary"
		| "accent"
		| "black"
		| "white"
		| "neutral"
		| "base-100"
		| "base-200"
		| "base-300";
};

export type ProductCardType = {
	title: string;
	price: number;
	iconCart: React.ReactNode;
	reviewText: string;
	actionBtnText: string;
	image: string;
};

export type ProductCardBudgetFriendlyType = {
	title: string;
	price: number;
	discountedPrice: number;
	iconCart: React.ReactNode;
	flatOff: number;
	actionBtnText: string;
	image: string;
};

export type ReviewType = {
	stars: number;
	title: string;
	description: string;
	image: string;
	name: string;
	city: string;
};

export type AreaType = {
	salons: string[];
	city: string;
};
