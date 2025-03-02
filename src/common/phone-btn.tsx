"use client";
import React from "react";
import toast from "react-hot-toast";
import { BiSupport } from "react-icons/bi";

const PhoneBtn = () => {
	return (
		<button
			className="btn btn-link text-neutral p-0"
			onClick={() => {
				navigator.clipboard.writeText("0319-2590810").then(() => {
					toast.success("Copied to clipboard!");
				});
			}}
		>
			<BiSupport className="size-5" />
			0319-2590810
		</button>
	);
};

export default PhoneBtn;
