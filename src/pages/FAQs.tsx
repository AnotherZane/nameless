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
        Astral Share is a peer-to-peer file sharing web app service that
        utilizes WebRTC technology to enable direct communication between
        users&apos; browsers. This decentralized approach allows users to share
        files directly with each other without the need for a centralized
        server.
      </FAQ>
      <FAQ title="Why should I use Astral Share?">
        Astral Share offers a secure and efficient way to share files directly
        between users without relying on external servers. It provides a
        decentralized and private alternative to traditional file-sharing
        services, ensuring faster transfers and enhanced privacy.
      </FAQ>
      <FAQ title="What is Peer-To-Peer?">
        Peer-to-peer (P2P) refers to a decentralized network architecture where
        participants (peers) share resources, such as files, directly with each
        other. In the case of Astral Share, this means that files are shared
        directly between users&pos; web browsers without the need for a central
        server intermediary.
      </FAQ>
      <FAQ title="Why does it feel slower?">
        The speed of file transfers in Astral Share can be influenced by various
        factors, including the network conditions of the users involved. Since
        Astral Share relies on direct communication between peers, the transfer
        speed may be affected by the internet connection quality of both
        parties. Additionally, larger files or slower network connections may
        result in longer transfer times.
      </FAQ>
      <FAQ title="What is resumability?">
        Resumability in Astral Share refers to the capability of the application
        to resume interrupted file transfers. If a file transfer is paused or
        disrupted due to network issues, users can easily resume the transfer
        from where it left off, thanks to the implementation of file system APIs
        in modern browsers.
      </FAQ>
      <FAQ title="Is my data safe?">
        Astral Share prioritizes user privacy and data security. Since the
        service operates on a peer-to-peer model, files are shared directly
        between users without passing through centralized servers. However,
        it&pos;s essential to be cautious and only share files with trusted
        individuals. Astral Share does not store files permanently, and its
        security relies on the trustworthiness of the peers involved in the
        file-sharing process. Always exercise discretion when sharing sensitive
        information.
      </FAQ>
    </>
  );
};

export { FAQs };
