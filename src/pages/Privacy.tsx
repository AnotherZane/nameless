import React from "react";
import { PageHeader } from "../components";
import { Box, Typography } from "@mui/material";

const Privacy = () => {
  return (
    <>
      <PageHeader>Privacy Policy</PageHeader>
      <Typography variant="h6">Last Updated: 12/12/2023</Typography>
      <Box sx={{ height: "0.8em" }} />
      <Typography variant="body1">
        Welcome to Astral Share! This Privacy Policy outlines how Astral Share
        (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) handles information
        when you use our peer-to-peer sharing service and related applications
        (collectively referred to as &quot;Astral Share&quot; or the
        &quot;Service&quot;).
      </Typography>
      <Box sx={{ height: "0.5em" }} />
      <Typography variant="h5">1. Information Collection and Usage</Typography>
      <Typography variant="body1">
        Astral Share is designed to prioritize user privacy. As such, we do not
        collect, store, or use any personal information about our users. We do
        not maintain user accounts or log any data related to individual user
        activities.
      </Typography>
      <Box sx={{ height: "0.5em" }} />
      <Typography variant="h5">2. User Content</Typography>
      <Typography variant="body1">
        Astral Share operates as a pure peer-to-peer sharing service,
        facilitating direct communication between users. We do not store any
        content shared through the platform. Your data stays on your device and
        is transmitted directly to your intended recipients.
      </Typography>
      <Box sx={{ height: "0.5em" }} />
      <Typography variant="h5">3. Security</Typography>
      <Typography variant="body1">
        While we do not store user information, we understand the importance of
        secure communication. Astral Share employs state-of-the-art encryption
        and security measures to ensure the confidentiality and integrity of
        data transmitted through our platform.
      </Typography>
      <Box sx={{ height: "0.5em" }} />
      <Typography variant="h5">4. Legal Compliance</Typography>
      <Typography variant="body1">
        As we do not collect or store user information, we have minimal data
        subject to legal obligations. In the rare event that we receive a legal
        request, we will always prioritize user privacy and will only comply
        with applicable laws.
      </Typography>
      <Box sx={{ height: "0.5em" }} />
      <Typography variant="h5">5. Changes to the Privacy Policy</Typography>
      <Typography variant="body1">
        Any updates to our privacy practices will be communicated through the
        Astral Share platform. However, since we do not store user information,
        changes will typically relate to the features and functionality of the
        service.
      </Typography>
      <Box sx={{ height: "0.5em" }} />
      <Typography variant="h5">6. User Control and Choices</Typography>
      <Typography variant="body1">
        Given that we do not store user information, there are no account
        settings or preferences to manage within Astral Share. Users have
        complete control over their data as it remains exclusively on their
        devices.
      </Typography>
      <Box sx={{ height: "0.5em" }} />
      <Typography variant="h5">7. Contact Us</Typography>
      <Typography variant="body1">
        If you have any questions or concerns regarding this Privacy Policy or
        Astral Share&apos;s privacy practices, please reach out to us at
        <a href="mailto:contact@astralshare.com"> contact@astralshare.com</a>.
      </Typography>
    </>
  );
};

export { Privacy };
