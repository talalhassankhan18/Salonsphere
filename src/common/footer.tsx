import React from "react";
import Logo from "@/assets/images/logo.png";
import Link from "next/link";
import {
	FaInstagram,
	FaTwitter,
	FaFacebook,
	FaTiktok,
	FaYoutube,
	FaLinkedin,
	FaWhatsapp,
	FaEnvelope,
} from "react-icons/fa";
import img1 from "@/assets/partners/partner 1.png";
import img2 from "@/assets/partners/partner 2.png";
import img3 from "@/assets/partners/partner 3.png";
import img4 from "@/assets/partners/partner 4.png";

const Footer = () => {
	return (
		<footer className="footer bg-neutral p-10 text-neutral-content">
			<aside>
				<div className="col-span-3 text-white md:col-span-1">
					<img src={Logo.src} alt="logo" className="h-[50px]" />
					<p className="max-w-md text-sm md:text-base">
						SalonSphere is a one-stop platform for beauty enthusiasts, offering easy
						salon bookings and a curated selection of self-care products. We
						partner with top beauty brands to bring you quality products and
						services, all in one place. Let your beauty shine with SalonSphere!
					</p>
				</div>
			</aside>
			<nav>
				<h2 className="font-bold text-2xl text-white">Find us</h2>
				<div className="grid grid-cols-2 gap-3">
					<div className="flex flex-row items-center opacity-90 transition-all duration-100 ease-in-out hover:text-white hover:opacity-100">
						<Link
							href="/"
							title="Instagram"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center"
						>
							<FaInstagram aria-hidden="true" className="mr-1 " />
							<p>Instagram</p>
						</Link>
					</div>
					<div className="flex flex-row items-center opacity-90 transition-all duration-100 ease-in-out hover:text-white hover:opacity-100">
						<Link
							href="/"
							title="Twitter"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center "
						>
							<FaTwitter aria-hidden="true" className="mr-1 " />
							<p>Twitter</p>
						</Link>
					</div>
					<div className="flex flex-row items-center opacity-90 transition-all duration-100 ease-in-out hover:text-white hover:opacity-100">
						<Link
							href="/"
							title="Tiktok"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center"
						>
							<FaTiktok
								aria-hidden="true"
								className="mr-1 transition-all duration-100 ease-in-out"
							/>
							<p className="transition-all duration-100 ease-in-out">Tiktok</p>
						</Link>
					</div>
					<div className="flex flex-row items-center">
						<Link
							href="/"
							title="FaceBook"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center opacity-90 transition-all duration-100 ease-in-out hover:text-white hover:opacity-100"
						>
							<FaFacebook aria-hidden="true" className="mr-1 " />
							<p>Facebook</p>
						</Link>
					</div>
					<div className="flex flex-row items-center opacity-90 transition-all duration-100 ease-in-out hover:text-white hover:opacity-100">
						<Link
							href="/"
							title="LinkedIn"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center"
						>
							<FaLinkedin aria-hidden="true" className="mr-1 " />
							<p>LinkedIn</p>
						</Link>
					</div>
					<div className="flex flex-row items-center opacity-90 transition-all duration-100 ease-in-out hover:text-white hover:opacity-100">
						<Link
							href="/"
							title="YouTube"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center"
						>
							<FaYoutube aria-hidden="true" className="mr-1 " />
							<p>YouTube</p>
						</Link>
					</div>
				</div>

				<h2 className="mt-3 font-bold text-2xl text-white">Contact us</h2>
				<div className="flex flex-row items-center opacity-90 transition-all duration-100 ease-in-out hover:text-white hover:opacity-100">
					<Link
						href="https://wa.me/03192590810"
						target="_blank"
						className="flex items-center"
					>
						<FaWhatsapp aria-hidden="true" className="mr-1" />
						<p>0319-2590810</p>
					</Link>
				</div>
				<div className="flex flex-row items-center opacity-90 transition-all duration-100 ease-in-out hover:text-white hover:opacity-100">
					<Link
						href="mailto:info@glimmer.com.pk"
						target="_blank"
						className="flex items-center"
					>
						<FaEnvelope aria-hidden="true" className="mr-1 " />
						<p>info@SalonSphere.com.pk</p>
					</Link>
				</div>
			</nav>
			<nav>
				<h2 className="font-bold text-2xl text-white">Our partners</h2>
				<div className="grid grid-cols-2 gap-3">
					<div>
						<img src={img1.src} alt="logo" className="mb-3 h-[80px]" />
						<img src={img2.src} alt="logo" className="h-[80px]" />
					</div>
					<div>
						<img src={img3.src} alt="logo" className="mb-3 h-[80px]" />
						<img src={img4.src} alt="logo" className="h-[80px]" />
					</div>
				</div>
			</nav>
			{/* <nav>
			<h6 className="footer-title">Company</h6>
			<Link className="link link-hover" href="/">
			About us
			</Link>
			<Link className="link link-hover" href="/">
			Contact
			</Link>
			<Link className="link link-hover" href="/">
			Jobs
			</Link>
			<Link className="link link-hover" href="/">
			Press kit
			</Link>
		</nav> */}
		</footer>
	);
};

export default Footer;
