import Cart from "@/common/cart";
// import { verifySession } from "@/lib/session";
// import { redirect } from "next/navigation";
import React from "react";

const Page = async () => {
  // const session = await verifySession();
  // if (!session) {
  //   return redirect("/login");
  // }
  return <Cart />;
};

export default Page;
