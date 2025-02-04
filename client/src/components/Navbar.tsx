import {
  SignedIn,
  UserButton,
  SignedOut,
  SignInButton,
} from "@clerk/clerk-react";
import { NavLink } from "react-router";
import { Button } from "./ui/button";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center border-gray-200 p-4 border-b-2">
      <h2 className="font-semibold text-lg text-purple-800">Economy Tracker</h2>
      <SignedIn>
        <div className="flex flex-row justify-end items-center gap-4">
          <NavLink to={"/dashboard"}>
            <Button variant={"link"}>Dashboard</Button>
          </NavLink>
          <UserButton />
        </div>
      </SignedIn>
      <SignedOut>
        <SignInButton />
      </SignedOut>
    </nav>
  );
}
