import { useRef } from "react";
import axios from "axios";
import { useAuthStore } from "~/auth/authStore";
import { getAxiosWithAuthInterceptor } from "~/api/axios";
import Container from "@mui/material/Container";
import NavigationBar from "~/navigation/navigationBar";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";

import { List, type RowComponentProps } from 'react-window';
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";

function renderRow(props: RowComponentProps) {
  const { index, style } = props;

  return (
    <ListItem style={style} key={index} component="div" disablePadding>
      <ListItemButton>
        <ListItemText primary={`Item ${index + 1}`} />
      </ListItemButton>
    </ListItem>
  );
}

export function Welcome() {

  const login = useAuthStore((s: any) => s.login);
  const status = useAuthStore((s: any) => s.status);
  const logout = useAuthStore((s: any) => s.logout);

  const loginTriggered = useRef(false);

  const testSpringFunction = () => {
    console.log("Spring test function triggered");
    const api = getAxiosWithAuthInterceptor("http://localhost:1324");
    api.get("/common/hello")
      .then((response) => {
        console.log("Spring test response:", response.data);
      })
      .catch((error) => {
        console.error("Error calling spring test function:", error);
      });
    api.get("/api/v1/admin/users")
      .then((response) => {
        console.log("Spring test response:", response.data);
      })
      .catch((error) => {
        console.error("Error calling spring test function:", error);
      });
  }

  return (
    <>
      <CssBaseline />

      <NavigationBar title="Dashboard" />
      <Box maxWidth="sm" height={64} />

      <Container maxWidth="sm" sx={{ pb: 4 }}>
        <Box sx={{ bgcolor: "background.paper", borderRadius: 2, overflow: "hidden" }}>
          {status === "authenticated" ?
            <List
              rowHeight={46}
              rowCount={200}
              style={{
                height: 4000,
                width: 360,
              }}
              rowProps={{}}
              overscanCount={5}
              rowComponent={renderRow}
            /> : <></>}
        </Box>
      </Container >
    </>
  );
}
