import React, { useState } from "react";
import { Button, IconButton, ToggleButton, Typography } from "@mui/material";
import { Link, To } from "react-router-dom";
import useWindowDimensions from "../hooks/useWindowDimensions";
import { DarkMode, LightMode, Menu, MenuOpen } from "@mui/icons-material";
import { useThemeStore } from "../state";

type NavButtonProps = {
  name: string | JSX.Element;
  path: To;
};

const NavButton = ({ name, path }: NavButtonProps) => {
  return (
    <Link to={path} className="no-underline">
      <Button
        variant="text"
        className="w-full sm:w-auto py-2 sm:py-0 flex-shrink text-txt-dark dark:text-txt-light"
      >
        <Typography className="text-[20px]">{name}</Typography>
      </Button>
    </Link>
  );
};

const Navbar = () => {
  const { width } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const [theme, toggleTheme] = useThemeStore((s) => [s.theme, s.toggleTheme]);

  return (
    <>
      <nav className="flex flex-col sm:flex-row justify-between pt-4">
        <div className="flex items-center mb-2 sm:mb-0">
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
            "flex flex-col sm:flex-row items-center bg-secondary-light dark:bg-secondary-dark sm:bg-paper-light sm:dark:bg-paper-dark sm:space-x-8 sm:-mb-1 truncate transition-[max-height] duration-300 ease-in-out delay-0 " +
            (width && width < 640 && !open ? "max-h-0" : "max-h-80")
          }
        >
          <NavButton name="About" path="/about" />
          <NavButton name="FAQs" path="/faqs" />
          <NavButton name="Privacy" path="/privacy" />
          <ToggleButton
            value={theme}
            onChange={() => toggleTheme()}
            className="w-full sm:w-auto"
          >
            {theme == "dark" ? <LightMode /> : <DarkMode />}
          </ToggleButton>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
