import React, { FC, useCallback, useEffect, useState } from "react";
import { Box, Button, ButtonGroup, Input, Typography } from "@mui/material";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Keypair,
  ParsedAccountData,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import SolLogo from "../assets/coin.svg";
import { BalanceRounded, FeedRounded } from "@mui/icons-material";

const styles = {
  container: {
    height: 649,
    width: 521,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    backgroundColor: "white",
    alignItems: "center",
    borderRadius: 20,
    borderColor: "#96979833",
    borderWidth: 1,
    borderStyle: "solid",
    boxShadow: 2,
  },
  infoRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  input: {
    fontSize: 76,
    fontWeight: 500,
    textAlign: "center",
  },
  maxContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "white",
    alignItems: "center",
    borderRadius: 20,
    borderColor: "#96979833",
    borderWidth: 1,
    borderStyle: "solid",
  },
  sendBox: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  maxButton: {
    backgroundColor: "#B884541A",
    display: "flex",
    justifyContent: "center",
    color: "secondary.main",
    height: 22,
    width: 47,
    "&:hover": {
      backgroundColor: "#96979833",
    },
  },
  sendButton: {
    display: "flex",
    justifyContent: "center",
    color: "text.primary",
    width: 144,
    "&:hover": {
      backgroundColor: "#96979833",
    },
  },
  sendButtonDead: {
    backgroundColor: "transparent",
  },
  sendButtonActive: {
    backgroundColor: "white",
  },
  coinLogo: {
    display: "flex",
    flexDirection: "horizontal",
    alignItems: "center",
  },
  switchContainer: {
    display: "flex",
    flexDirection: "horizontal",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
  },
};

const InfoRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => {
  return (
    <Box sx={styles.infoRow}>
      <Typography color="text.secondary" mr={1} variant="subtitle1">
        {label}
      </Typography>
      <Typography color="text.primary" mr={1} variant="subtitle1">
        {value}
      </Typography>
    </Box>
  );
};

const LAMPORTS_PER_SOL = 1000000000;

export const SendSolWidget: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [amount, setAmount] = useState("0");
  const [balance, setBalance] = useState<any>();
  const [isSending, setIsSending] = useState(true);
  const [loading, setLoading] = useState(false);

  //   TODO
  const waitTime = 12;
  const fee = 0.00000001;
  const solConversion = 15.33;
  const amountInUsd = parseFloat(amount) * solConversion;

  useEffect(() => {
    (async () => {
      if (publicKey) {
        let bal = await connection.getBalance(publicKey);
        setBalance(bal / LAMPORTS_PER_SOL);
        // const tokenAccount = await connection.getParsedAccountInfo();
        // const parsedAccountInfo: any = account.account.data;
        // const tokenBalance: number = parsedAccountInfo["parsed"]["info"]["tokenAmount"]["uiAmount"];
      }
    })();
  }, [connection, publicKey, setBalance]);

  const onMaxClick = () => {
    setAmount(balance.toString());
  };

  const onClick = useCallback(async () => {
    if (!publicKey) throw new WalletNotConnectedError();
    console.log(connection);

    // 890880 lamports as of 2022-09-01
    setLoading(true);
    const lamports = await connection.getMinimumBalanceForRentExemption(0);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: Keypair.generate().publicKey,
        lamports: lamports + parseFloat(amount) * LAMPORTS_PER_SOL,
      })
    );

    const {
      context: { slot: minContextSlot },
      value: { blockhash, lastValidBlockHeight },
    } = await connection.getLatestBlockhashAndContext();

    const signature = await sendTransaction(transaction, connection, {
      minContextSlot,
    });
    setLoading(false);

    const res = await connection.confirmTransaction({
      blockhash,
      lastValidBlockHeight,
      signature,
    });
    console.log(res);
  }, [publicKey, sendTransaction, setLoading, connection]);

  return (
    <Box p={3} sx={styles.container}>
      <Box p={1.2} sx={styles.switchContainer}>
        <Button
          onClick={() => {
            setIsSending(true);
          }}
          variant={!isSending ? "text" : "contained"}
          sx={[
            styles.sendButton,
            !isSending ? styles.sendButtonDead : styles.sendButtonActive,
          ]}
        >
          Send
        </Button>
        <Box mx={0.3} />
        <Button
          onClick={() => {
            setIsSending(false);
          }}
          variant={isSending ? "text" : "contained"}
          sx={[
            styles.sendButton,
            isSending ? styles.sendButtonDead : styles.sendButtonActive,
          ]}
        >
          Recieve
        </Button>
      </Box>
      <Box mt={3} sx={styles.coinLogo}>
        <img
          width="30px"
          style={{ opacity: "60%" }}
          src={SolLogo}
          alt="Solana Logo"
        />
        <Typography ml={1.4} color="text.primary" variant="h3">
          SOL
        </Typography>
      </Box>
      <Box mt={3} sx={{ justifyContent: "center" }}>
        <Input
          disableUnderline
          color="primary"
          onChange={(event) => {
            // if (event.target.value) {
            setAmount(event?.target?.value ?? "");
            // }
          }}
          inputProps={{
            style: { textAlign: "center" },
          }}
          sx={styles.input}
          type="tel"
          value={amount}
        />
      </Box>
      <Box p={1.5} mt={1.5} sx={styles.maxContainer}>
        <Typography color="text.primary" mr={1} variant="subtitle1">
          Current Balance: {balance} SOL
        </Typography>
        <Button onClick={onMaxClick} variant="contained" sx={styles.maxButton}>
          Max
        </Button>
      </Box>
      <Box mt={5} sx={styles.sendBox}>
        <Box>
          <Typography color="primary.light" mr={1} variant="subtitle1">
            You will send
          </Typography>
          <Typography color="text.primary" mr={1} variant="h3">
            {amount || "0"} (${amountInUsd || "0"})
          </Typography>
        </Box>
        <Box sx={styles.coinLogo}>
          <img width="20px" src={SolLogo} alt="Solana Logo" />
          <Typography ml={2} color="text.primary" variant="body1">
            Solana
          </Typography>
        </Box>
      </Box>
      <Box mt={2} sx={{ width: "100%" }}>
        {isSending && (
          <Button
            disabled={!publicKey}
            onClick={onClick}
            variant="contained"
            fullWidth
            sx={{ justifyContent: "center" }}
          >
            Send Sol
          </Button>
        )}
        <Box my={1.5} />
        <InfoRow label="1 SOL" value={`~$${solConversion}`} />
        <InfoRow label="Confirmation Time" value={`~$${waitTime} Seconds`} />
        <InfoRow label="Network Fee" value={`${fee} SOL`} />
      </Box>
    </Box>
  );
};
