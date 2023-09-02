import React, { useState } from "react";
import { Button, IconButton, Typography } from "@mui/material";
import { Link, To } from "react-router-dom";
import useWindowDimensions from "../hooks/useWindowDimensions";
import { ArrowDropDownOutlined, Menu, MenuOpen } from "@mui/icons-material";

type NavButtonProps = {
  name: string | JSX.Element;
  path: To;
};

const NavButton = ({ name, path }: NavButtonProps) => {
  return (
    <Button variant="text" className="w-full sm:w-auto py-2 sm:py-0">
      <Link
        to={path}
        className="no-underline text-txt-dark dark:text-txt-light"
      >
        <Typography className="text-[20px]">{name}</Typography>
      </Link>
    </Button>
  );
};

const Navbar = () => {
  const { width } = useWindowDimensions();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="flex flex-col sm:flex-row justify-between py-4">
        <div className="flex items-center">
          {/* TODO: Adjust based on media query */}
          <Link to="/" className="no-underline">
            <img
              className="w-12 md:w-16 h-12 md:h-16"
              src="/assets/images/astral_share_256.png"
              alt="Astral Share Logo"
              width={width && width < 768 ? 48 : 64}
              height={width && width < 768 ? 48 : 64}
            />
          </Link>
          <Link to="/" className="no-underline">
            <h1 className="ml-4 md:ml-6 font-bold text-[26px] m-0 whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-tr from-primary-base to-accent-base">
              Astral Share
            </h1>
          </Link>
          <IconButton
            className="-mb-1 ml-auto sm:hidden"
            onClick={() => setOpen(!open)}
          >
            {open ? <MenuOpen fontSize="medium" /> : <Menu fontSize="medium" />}
          </IconButton>
        </div>
        <div
          className={
            (width && width < 640 && !open
              ? "hidden max-h-0"
              : "block max-h-80") +
            " flex flex-col sm:flex-row items-center bg-secondary-light dark:bg-secondary-dark sm:bg-paper-light sm:dark:bg-paper-dark mt-2 sm:mt-0 sm:space-x-8 sm:-mb-1 transition-['max-height'] duration-300"
          }
        >
          <NavButton name="About" path="/about" />
          <NavButton name="FAQs" path="/faqs" />
          <NavButton name="Privacy" path="/privacy" />
        </div>
      </nav>
    </>
  );
};

export default Navbar;
