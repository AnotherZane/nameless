import { ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components";

type FAQProps = {
  title: React.ReactNode;
  children?: React.ReactNode;
};

const FAQ = ({ title, children }: FAQProps) => {
  return (
    <Accordion className="mb-5">
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography className="text-[18px] font-medium">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>{children}</Typography>
      </AccordionDetails>
    </Accordion>
  );
};

const FAQs = () => {
  return (
    <>
      <PageHeader>FAQs</PageHeader>
      <Typography className="mb-2">
        Welcome to our Frequently Asked Questions FAQs section! Here, we aim to
        provide you with quick and informative answers to some of the most
        common queries and concerns you may have about our services, or other
        topics of interest.
      </Typography>
      <Typography className="mb-4">
        If you don&apos;t find the answers you&apos;re looking for, please feel
        free to <Link to="#">reach out to our support team</Link> for further
        assistance. We are here to help and ensure you have a seamless
        experience with us.
      </Typography>
      <FAQ title="What is Astral Share?">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam non leo non
        elit aliquam vulputate. Curabitur pretium, eros vitae viverra ultrices,
        turpis nisl suscipit eros, et pellentesque diam augue sed nisl. In
        placerat leo at ante mattis, eu tempor nulla scelerisque. Vivamus vel
        erat quis risus pharetra venenatis vitae vitae mauris. Maecenas eleifend
        justo nec volutpat dictum. Proin eu velit a ipsum accumsan elementum
        fringilla vitae eros. Maecenas sodales commodo scelerisque. Pellentesque
        eu ante ut erat placerat tristique sit amet eget nunc.
      </FAQ>
      <FAQ title="Why should I use Astral Share?">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam non leo non
        elit aliquam vulputate. Curabitur pretium, eros vitae viverra ultrices,
        turpis nisl suscipit eros, et pellentesque diam augue sed nisl. In
        placerat leo at ante mattis, eu tempor nulla scelerisque. Vivamus vel
        erat quis risus pharetra venenatis vitae vitae mauris. Maecenas eleifend
        justo nec volutpat dictum. Proin eu velit a ipsum accumsan elementum
        fringilla vitae eros. Maecenas sodales commodo scelerisque. Pellentesque
        eu ante ut erat placerat tristique sit amet eget nunc.
      </FAQ>
      <FAQ title="What is Peer-To-Peer?">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam non leo non
        elit aliquam vulputate. Curabitur pretium, eros vitae viverra ultrices,
        turpis nisl suscipit eros, et pellentesque diam augue sed nisl. In
        placerat leo at ante mattis, eu tempor nulla scelerisque. Vivamus vel
        erat quis risus pharetra venenatis vitae vitae mauris. Maecenas eleifend
        justo nec volutpat dictum. Proin eu velit a ipsum accumsan elementum
        fringilla vitae eros. Maecenas sodales commodo scelerisque. Pellentesque
        eu ante ut erat placerat tristique sit amet eget nunc.
      </FAQ>
      <FAQ title="Why does it feel slower?">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam non leo non
        elit aliquam vulputate. Curabitur pretium, eros vitae viverra ultrices,
        turpis nisl suscipit eros, et pellentesque diam augue sed nisl. In
        placerat leo at ante mattis, eu tempor nulla scelerisque. Vivamus vel
        erat quis risus pharetra venenatis vitae vitae mauris. Maecenas eleifend
        justo nec volutpat dictum. Proin eu velit a ipsum accumsan elementum
        fringilla vitae eros. Maecenas sodales commodo scelerisque. Pellentesque
        eu ante ut erat placerat tristique sit amet eget nunc.
      </FAQ>
      <FAQ title="What is resumability?">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam non leo non
        elit aliquam vulputate. Curabitur pretium, eros vitae viverra ultrices,
        turpis nisl suscipit eros, et pellentesque diam augue sed nisl. In
        placerat leo at ante mattis, eu tempor nulla scelerisque. Vivamus vel
        erat quis risus pharetra venenatis vitae vitae mauris. Maecenas eleifend
        justo nec volutpat dictum. Proin eu velit a ipsum accumsan elementum
        fringilla vitae eros. Maecenas sodales commodo scelerisque. Pellentesque
        eu ante ut erat placerat tristique sit amet eget nunc.
      </FAQ>
    </>
  );
};

export { FAQs };
