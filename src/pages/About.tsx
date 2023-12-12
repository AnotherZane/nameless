import { Box, Typography } from "@mui/material";
import React from "react";
import { PageHeader } from "../components";

const About = () => {
  return (
    <>
      <PageHeader>About</PageHeader>
      <Typography variant="body1">
        Welcome to the future of hassle-free file sharing! Our Peer-to-Peer
        Share Service is a revolutionary platform designed to empower
        individuals and businesses with the ability to seamlessly share files,
        documents , and data, all while enjoying the unique feature of resuming
        shares.
      </Typography>
      <Box sx={{ height: "1em" }} />
      <Typography variant="h5">Why We&apos;re Unique:</Typography>
      <Typography>
        At our core, we believe in the power of convenience, efficiency, and
        collaboration. In a world where information is key, we recognized the
        need for a file-sharing solution that goes above and beyond the
        ordinary. Here&apos;s what sets us apart:
      </Typography>
      <Box sx={{ height: "0.5em" }} />
      <Typography variant="h6">1. Resumable Shares:</Typography>
      <Typography>
        Our flagship feature, resumable shares, makes sure that your files
        always reach their destination, regardless of the challenges that may
        arise during transfer. No more frustration from interrupted transfers
        due to poor connectivity or other unforeseen obstacles. We keep your
        shares intact and readily available for both you and your recipients.
      </Typography>
      <Box sx={{ height: "0.5em" }} />
      <Typography variant="h6">2. Peer-to-Peer (P2P) Technology:</Typography>
      <Typography>
        Our service leverages the power of peer-to-peer technology, ensuring
        that your files are transferred directly between sender and recipient,
        eliminating the need for intermediaries. This means faster, more secure,
        and truly decentralized file sharing.
      </Typography>
      <Box sx={{ height: "0.5em" }} />
      <Typography variant="h6">3. User-Friendly Interface:</Typography>
      <Typography>
        We take pride in our intuitive and user-friendly interface, ensuring
        that everyone, regardless of their technical expertise, can effortlessly
        share and receive files. Simply drag and drop, select your recipient,
        and let us handle the rest.
      </Typography>
      <Box sx={{ height: "0.5em" }} />
      <Typography variant="h6">4. Cross-Platform Compatibility:</Typography>
      <Typography>
        Whether you&apos;re using a Windows PC, a Mac, a Linux machine, or a
        mobile device, our service seamlessly integrates with your preferred
        platform.
      </Typography>
      <Box sx={{ height: "0.5em" }} />
      <Typography variant="h6">5. Robust Security:</Typography>
      <Typography>
        Your data security is our top priority. We employ cutting-edge
        encryption protocols and ensure that your files are safe and private
        during transit.
      </Typography>
      <Box sx={{ height: "0.5em" }} />
      <Typography variant="h6">6. Collaboration Made Easy:</Typography>
      <Typography>
        Collaborate with colleagues, friends, or family members like never
        before. Share project files, family photos, or important documents in an
        instant. With resumable shares, your collaborative efforts will never be
        hindered.
      </Typography>
      <Box sx={{ height: "0.5em" }} />
      <Typography variant="h6">7. Customizable Sharing Options:</Typography>
      <Typography>
        Tailor your file sharing to your specific needs. You can choose to send
        files publicly or keep them private. Set expiration dates and
        permissions for added control.
      </Typography>
    </>
  );
};

export { About };
