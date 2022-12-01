import React, { useCallback } from "react";
import { Box, Button, Typography } from "@mui/material";
import Logo from "../assets/logo.svg";
import { WalletMultiButton } from "@solana/wallet-adapter-material-ui";

const styles = {
  container: {
    height: 76,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 20,
    borderColor: "#96979833",
    borderWidth: 1,
    borderStyle: "solid",
  },
  rightContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
};

export const Header: React.FC = () => {
  const goHome = () => {
    const win: Window = window;
    win.location = "/";
  }

  return (
    <Box px={3} py={2} m={2} sx={styles.container}>
      <Box onClick={goHome}>
        <img height="24px" src={Logo} alt="React Logo" />
      </Box>
      <Box sx={styles.rightContainer}>
        <Typography
          onClick={goHome}
          mr={4}
          color="linkColor.main"
          variant="subtitle1"
        >
          Home
        </Typography>
        <WalletMultiButton variant="contained">
          Connect Wallet
        </WalletMultiButton>
      </Box>
    </Box>
  );
};
